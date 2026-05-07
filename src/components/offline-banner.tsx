"use client";

import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";

export function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(() => {
    if (typeof navigator === "undefined") return false;
    return !navigator.onLine;
  });

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="bg-amber-500/20 border-b border-amber-500/40 text-amber-100 px-4 py-2 text-sm flex items-center justify-center gap-2">
      <WifiOff className="h-4 w-4" />
      You are offline. Some features may be unavailable.
    </div>
  );
}
