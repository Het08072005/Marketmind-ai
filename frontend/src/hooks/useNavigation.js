import { useState, useEffect } from "react";
import { pageMeta } from "../data/mockData";

const PAGE_ALIASES = {
  breaker: "thesis",
  thesisbreaker: "thesis",
  candlestick: "candles",
  time_machine: "timemachine",
  stock_autopsy: "autopsy",
  hidden_dependency: "dependency",
  ghost_portfolio: "ghost",
};

export function useNavigation() {
  const resolvePageKey = (rawKey) => {
    if (!rawKey) return "dashboard";
    const cleaned = rawKey.replace("#", "").toLowerCase().trim();
    const resolved = PAGE_ALIASES[cleaned] || cleaned;
    return pageMeta[resolved] ? resolved : "dashboard";
  };

  const getInitialPage = () => {
    return resolvePageKey(window.location.hash);
  };

  const [currentPage, setCurrentPage] = useState(getInitialPage);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const handleHashChange = () => {
      const target = resolvePageKey(window.location.hash);
      if (pageMeta[target]) {
        setCurrentPage(target);
      }
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const goPage = (key) => {
    const target = resolvePageKey(key);
    if (pageMeta[target]) {
      setCurrentPage(target);
      window.location.hash = target;
      setSidebarOpen(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const currentMeta = pageMeta[currentPage] || pageMeta.dashboard;

  return {
    currentPage,
    currentMeta,
    goPage,
    sidebarOpen,
    setSidebarOpen,
  };
}
