import { useState, useEffect, useCallback } from "react";
import { API_BASE_URL } from "../api/client";

export function useBackendStatus() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [latency, setLatency] = useState(null);

  const apiUrl = API_BASE_URL;

  const checkStatus = useCallback(async () => {
    setLoading(true);
    setError(null);
    const start = performance.now();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    try {
      const res = await fetch(`${apiUrl}/api/hello`, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const json = await res.json();
      const end = performance.now();
      setLatency(Math.round(end - start));
      setData(json);
    } catch (err) {
      clearTimeout(timeoutId);
      setError(err.message || "Failed to reach backend");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [apiUrl]);

  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  return {
    data,
    loading,
    error,
    latency,
    checkStatus,
    apiUrl,
    isOnline: !loading && !error && !!data,
  };
}
