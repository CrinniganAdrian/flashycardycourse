"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { SignedIn, UserButton } from "@clerk/nextjs";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { InstallAppButton } from "@/components/install-app-button";

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex max-w-[100vw] items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="min-w-0 shrink font-semibold">
          <span className="block truncate text-base lg:text-xl">
            FlashyCardyCourse
          </span>
        </Link>

        <nav className="hidden min-w-0 items-center gap-1 lg:flex">
          <SignedIn>
            <Button variant="ghost" asChild>
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          </SignedIn>
          <Button variant="ghost" asChild>
            <Link href="/pricing">Pricing</Link>
          </Button>
          <InstallAppButton />
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <SignedIn>
            <UserButton />
          </SignedIn>

          <div className="lg:hidden">
            <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" aria-label="Open menu">
                  <Menu className="size-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[min(100vw,20rem)]">
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-2 px-2 pb-4">
                  <SignedIn>
                    <SheetClose asChild>
                      <Link
                        href="/dashboard"
                        className={cn(
                          buttonVariants({ variant: "ghost" }),
                          "justify-start",
                        )}
                      >
                        Dashboard
                      </Link>
                    </SheetClose>
                  </SignedIn>
                  <SheetClose asChild>
                    <Link
                      href="/pricing"
                      className={cn(
                        buttonVariants({ variant: "ghost" }),
                        "justify-start",
                      )}
                    >
                      Pricing
                    </Link>
                  </SheetClose>
                  <div className="flex justify-start pt-2">
                    <InstallAppButton />
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
