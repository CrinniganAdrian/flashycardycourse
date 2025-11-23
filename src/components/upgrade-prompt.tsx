import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Crown } from "lucide-react";

interface UpgradePromptProps {
  message: string;
  ctaText?: string;
}

export function UpgradePrompt({ message, ctaText = "Upgrade to Pro" }: UpgradePromptProps) {
  return (
    <Alert className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
      <Crown className="h-4 w-4 text-yellow-600" />
      <AlertDescription className="flex items-center justify-between">
        <span className="text-yellow-800 dark:text-yellow-200">{message}</span>
        <Button asChild variant="default" size="sm" className="ml-4">
          <Link href="/pricing">{ctaText}</Link>
        </Button>
      </AlertDescription>
    </Alert>
  );
}

