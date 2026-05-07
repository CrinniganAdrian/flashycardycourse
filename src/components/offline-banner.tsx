"use client";

import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";

declare global {
  interface Window {
    __flashyOfflineBannerMounted?: boolean;
  }
}

export function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(false);
  const [isPrimaryInstance] = useState(() => {
    if (typeof window === "undefined") return true;
    if (window.__flashyOfflineBannerMounted) return false;
    window.__flashyOfflineBannerMounted = true;
    return true;
  });

  useEffect(() => {
    if (!isPrimaryInstance) return;

    const syncStatus = async () => {
      if (!navigator.onLine) {
        setIsOffline(true);
        return;
      }

      try {
        const controller = new AbortController();
        const timeout = window.setTimeout(() => controller.abort(), 3000);
        await fetch(`/manifest.webmanifest?t=${Date.now()}`, {
          cache: "no-store",
          signal: controller.signal,
        });
        window.clearTimeout(timeout);
        setIsOffline(false);
      } catch {
        // If browser reports online but probe fails, keep existing status.
      }
    };

    const handleOnline = () => {
      void syncStatus();
    };
    const handleOffline = () => setIsOffline(true);
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        void syncStatus();
      }
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    document.addEventListener("visibilitychange", handleVisibility);
    const intervalId = window.setInterval(() => {
      void syncStatus();
    }, 10000);
    void syncStatus();

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.clearInterval(intervalId);
      window.__flashyOfflineBannerMounted = false;
    };
  }, [isPrimaryInstance]);

  if (!isPrimaryInstance || !isOffline) return null;

  return (
    <div className="bg-amber-500/20 border-b border-amber-500/40 text-amber-100 px-4 py-2 text-sm flex items-center justify-center gap-2">
      <WifiOff className="h-4 w-4" />
      You are offline. Some features may be unavailable.
    </div>
  );
}
