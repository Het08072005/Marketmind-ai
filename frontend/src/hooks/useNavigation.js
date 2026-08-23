import { useState, useEffect } from "react";
import { pageMeta } from "../data/mockData";

export function useNavigation() {
  const getInitialPage = () => {
    const hash = window.location.hash.replace("#", "");
    return pageMeta[hash] ? hash : "dashboard";
  };

  const [currentPage, setCurrentPage] = useState(getInitialPage);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace("#", "");
      if (pageMeta[hash]) {
        setCurrentPage(hash);
      }
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const goPage = (key) => {
    if (pageMeta[key]) {
      setCurrentPage(key);
      window.location.hash = key;
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
