"use client";

import { useEffect } from "react";

export function OfflineNavigationGuard() {
  useEffect(() => {
    const onDocumentClick = (event: MouseEvent) => {
      if (navigator.onLine) return;
      if (event.defaultPrevented) return;

      const target = event.target as HTMLElement | null;
      const anchor = target?.closest("a[href]") as HTMLAnchorElement | null;
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#")) return;
      if (href.startsWith("http://") || href.startsWith("https://")) return;
      if (!href.startsWith("/")) return;
      if (href === "/offline") return;

      event.preventDefault();
      window.location.assign("/offline");
    };

    document.addEventListener("click", onDocumentClick);
    return () => {
      document.removeEventListener("click", onDocumentClick);
    };
  }, []);

  return null;
}
