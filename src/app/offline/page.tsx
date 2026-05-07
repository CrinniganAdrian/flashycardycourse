"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function OfflinePage() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-3xl font-semibold">You are offline</h1>
      <p className="text-muted-foreground">
        FlashyCardyCourse cannot reach the internet right now. Reconnect and try again.
      </p>
      <div className="flex items-center gap-3">
        <Link href="/">
          <Button>Go Home</Button>
        </Link>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    </main>
  );
}
