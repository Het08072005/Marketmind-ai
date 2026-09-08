import time
import asyncio
import threading
from typing import Optional, List, Dict, Any
from google import genai
from config import settings

DEFAULT_GEMINI_MODELS = [
    "gemini-2.5-flash-lite",
    "gemini-flash-latest",
    "gemini-3.6-flash",
    "gemini-2.5-flash",
    "gemini-flash-lite-latest",
    "gemini-3.1-flash-lite-preview",
    "gemini-pro-latest",
]

def is_quota_or_rate_limit_error(exc: Exception) -> bool:
    """Detect if an exception is caused by HTTP 429, Quota Exceeded, or Rate Limit."""
    err_str = str(exc).lower()
    return any(marker in err_str for marker in [
        "429",
        "resource_exhausted",
        "resourceexhausted",
        "quota",
        "rate limit",
        "too many requests",
        "exceeded your current quota",
    ])

class GeminiKeyPool:
    """
    High-availability Gemini API Key Pool.
    Rotates keys circularly whenever a 429 / Quota / Rate limit error occurs,
    guaranteeing uninterrupted execution for live voice agent demos.
    """

    def __init__(self):
        self._lock = threading.Lock()
        self._current_idx: int = 0
        self._keys: List[str] = list(settings.GEMINI_API_KEYS)
        self._clients: Dict[str, genai.Client] = {}
        self._cooldown: Dict[str, float] = {}
        self._initialize_clients()

    def _initialize_clients(self):
        """Pre-initialize GenAI clients for all configured keys."""
        for key in self._keys:
            if not key:
                continue
            try:
                self._clients[key] = genai.Client(api_key=key)
            except Exception as e:
                print(f"[GeminiPool] Warning: Failed to init client for key {key[:8]}...: {e}")
        
        valid_count = len(self._clients)
        print(f"[GeminiPool] Initialized with {valid_count} active API key(s) in circular pool.")

    @property
    def total_keys(self) -> int:
        return len(self._keys)

    @property
    def active_keys_count(self) -> int:
        return len(self._clients)

    def get_current_key(self) -> Optional[str]:
        if not self._keys:
            return None
        return self._keys[self._current_idx % len(self._keys)]

    def get_client(self) -> Optional[genai.Client]:
        """Get the current active GenAI client."""
        with self._lock:
            if not self._keys:
                return None
            key = self._keys[self._current_idx % len(self._keys)]
            return self._clients.get(key)

    def rotate_key(self, reason: str = "quota_exhausted") -> Optional[genai.Client]:
        """Switch to the next key in the circular pool."""
        with self._lock:
            if not self._keys:
                return None
            old_idx = self._current_idx
            old_key = self._keys[old_idx % len(self._keys)]
            
            # Put old key on cooldown for 60 seconds
            self._cooldown[old_key] = time.time() + 60.0
            
            # Advance to next key circularly
            self._current_idx = (self._current_idx + 1) % len(self._keys)
            new_key = self._keys[self._current_idx]
            
            print(
                f"[GeminiPool] 🔄 Circular Rotation: Key #{old_idx + 1} ({old_key[:8]}...) -> "
                f"Key #{self._current_idx + 1} ({new_key[:8]}...) | Reason: {reason}"
            )
            return self._clients.get(new_key)

    def mark_success(self, key: str):
        """Keep pointer on successfully responding key."""
        with self._lock:
            try:
                idx = self._keys.index(key)
                self._current_idx = idx
                if key in self._cooldown:
                    del self._cooldown[key]
            except ValueError:
                pass

    async def call_fast_gemini(
        self,
        prompt: str,
        system_instruction: Optional[str] = None,
        max_tokens: int = 100,
        temperature: float = 0.2,
        timeout_secs: float = 3.5,
        models: Optional[List[str]] = None
    ) -> Optional[str]:
        """
        Ultra-fast circular Gemini call for Voice Copilot (Alex).
        Iterates across all keys in the pool if quota/rate-limits occur.
        """
        if not self._keys or not self._clients:
            return None

        candidate_models = models or DEFAULT_GEMINI_MODELS
        total_keys = len(self._keys)

        # Allow full circular cycle through all keys
        for key_cycle in range(total_keys):
            with self._lock:
                current_key = self._keys[self._current_idx % total_keys]
                client = self._clients.get(current_key)

            if not client:
                self.rotate_key("missing_client")
                continue

            config = {"temperature": temperature, "max_output_tokens": max_tokens}
            if system_instruction:
                config["system_instruction"] = system_instruction

            key_quota_hit = False

            for model_name in candidate_models:
                try:
                    res = await asyncio.wait_for(
                        asyncio.to_thread(
                            client.models.generate_content,
                            model=model_name,
                            contents=prompt,
                            config=config
                        ),
                        timeout=timeout_secs
                    )
                    if res and res.text:
                        cleaned = res.text.strip()
                        if cleaned:
                            self.mark_success(current_key)
                            return cleaned
                except asyncio.TimeoutError:
                    continue
                except Exception as e:
                    if is_quota_or_rate_limit_error(e):
                        print(f"[GeminiPool] Key #{self._current_idx + 1} hit quota limit on {model_name}: {e}")
                        key_quota_hit = True
                        break  # Break model loop to rotate key immediately
                    continue

            if key_quota_hit:
                self.rotate_key("quota_limit_429")
            else:
                self.rotate_key("model_cycle_exhausted")

        return None

    def generate_content_sync(
        self,
        contents: Any,
        model: Optional[str] = None,
        models: Optional[List[str]] = None,
        config: Optional[Dict[str, Any]] = None,
        timeout_secs: float = 4.0
    ) -> Optional[Any]:
        """
        Synchronous circular Gemini call with failover for reports and deep analysis.
        """
        if not self._keys or not self._clients:
            return None

        import concurrent.futures
        candidate_models = [model] if model else (models or DEFAULT_GEMINI_MODELS)
        total_keys = len(self._keys)

        for key_cycle in range(total_keys):
            with self._lock:
                current_key = self._keys[self._current_idx % total_keys]
                client = self._clients.get(current_key)

            if not client:
                self.rotate_key("missing_client")
                continue

            key_quota_hit = False

            for model_name in candidate_models:
                try:
                    def _do_call():
                        if config:
                            return client.models.generate_content(
                                model=model_name,
                                contents=contents,
                                config=config
                            )
                        return client.models.generate_content(
                            model=model_name,
                            contents=contents
                        )

                    with concurrent.futures.ThreadPoolExecutor(max_workers=1) as executor:
                        future = executor.submit(_do_call)
                        res = future.result(timeout=timeout_secs)

                    if res and (hasattr(res, "text") or hasattr(res, "candidates")):
                        self.mark_success(current_key)
                        return res

                except concurrent.futures.TimeoutError:
                    continue
                except Exception as e:
                    if is_quota_or_rate_limit_error(e):
                        print(f"[GeminiPool Sync] Key #{self._current_idx + 1} hit quota limit: {e}")
                        key_quota_hit = True
                        break
                    continue

            if key_quota_hit:
                self.rotate_key("quota_limit_429")
            else:
                self.rotate_key("sync_cycle_exhausted")

        return None


# Global singleton instance
gemini_pool = GeminiKeyPool()

def get_gemini_client() -> Optional[genai.Client]:
    """Return currently active GenAI client."""
    return gemini_pool.get_client()

async def call_fast_gemini(
    prompt: str,
    system_instruction: Optional[str] = None,
    max_tokens: int = 100,
    temperature: float = 0.2,
    timeout_secs: float = 3.5,
    models: Optional[List[str]] = None
) -> Optional[str]:
    """Execute fast voice response across circular multi-key pool."""
    return await gemini_pool.call_fast_gemini(
        prompt=prompt,
        system_instruction=system_instruction,
        max_tokens=max_tokens,
        temperature=temperature,
        timeout_secs=timeout_secs,
        models=models
    )

def generate_content_sync(
    contents: Any,
    model: Optional[str] = None,
    models: Optional[List[str]] = None,
    config: Optional[Dict[str, Any]] = None,
    timeout_secs: float = 4.0
) -> Optional[Any]:
    """Execute synchronous content generation with circular failover."""
    return gemini_pool.generate_content_sync(
        contents=contents,
        model=model,
        models=models,
        config=config,
        timeout_secs=timeout_secs
    )
