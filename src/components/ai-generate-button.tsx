"use client";

import { useState, useTransition } from "react";
import { Protect } from "@clerk/nextjs";
import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { generateFlashcardsWithAI } from "@/app/actions/ai-actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface AIGenerateButtonProps {
  deckId: number;
  deckName: string;
  deckDescription: string | null;
}

// Free user component with tooltip
function FreeUserButton() {
  const router = useRouter();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            onClick={() => router.push("/pricing")}
            className="gap-2"
          >
            <Sparkles className="h-4 w-4" />
            Generate with AI
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>AI flashcard generation is a Pro feature</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Pro user component with AI generation
function ProUserButton({ deckId, deckName, deckDescription }: AIGenerateButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [isGenerating, setIsGenerating] = useState(false);

  async function handleGenerate() {
    // Check if description is missing
    if (!deckDescription || deckDescription.trim().length === 0) {
      toast.error(
        "Please add a deck description first to use AI generation. Click 'Edit Deck' to add one.",
        {
          duration: 5000,
        }
      );
      return;
    }

    setIsGenerating(true);

    startTransition(async () => {
      try {
        const result = await generateFlashcardsWithAI({
          deckId,
          topic: deckName,
          description: deckDescription || undefined,
        });

        if (!result.success) {
          toast.error(result.error);
          return;
        }

        toast.success(
          `Successfully generated ${result.data.cardsGenerated} flashcards!`
        );
      } catch (error) {
        toast.error("An unexpected error occurred");
      } finally {
        setIsGenerating(false);
      }
    });
  }

  const isLoading = isPending || isGenerating;

  return (
    <Button
      variant="default"
      onClick={handleGenerate}
      disabled={isLoading}
      className="gap-2"
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <Sparkles className="h-4 w-4" />
          Generate with AI
        </>
      )}
    </Button>
  );
}

export function AIGenerateButton({
  deckId,
  deckName,
  deckDescription,
}: AIGenerateButtonProps) {
  return (
    <Protect
      feature="ai_flashcard_generation"
      fallback={<FreeUserButton />}
    >
      <ProUserButton
        deckId={deckId}
        deckName={deckName}
        deckDescription={deckDescription}
      />
    </Protect>
  );
}

