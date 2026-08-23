import { useState, useEffect, useCallback } from "react";

export function useBackendStatus() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [latency, setLatency] = useState(null);

  const apiUrl = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

  const checkStatus = useCallback(async () => {
    setLoading(true);
    setError(null);
    const start = performance.now();
    try {
      const res = await fetch(`${apiUrl}/api/hello`);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const json = await res.json();
      const end = performance.now();
      setLatency(Math.round(end - start));
      setData(json);
    } catch (err) {
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
