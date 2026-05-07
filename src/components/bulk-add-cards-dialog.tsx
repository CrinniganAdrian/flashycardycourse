"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createBulkCards } from "@/app/actions/card-actions";
import { parseBulkCards } from "@/lib/parse-bulk-cards";
import { toast } from "sonner";
import { Layers } from "lucide-react";

interface BulkAddCardsDialogProps {
  deckId: number;
}

export function BulkAddCardsDialog({ deckId }: BulkAddCardsDialogProps) {
  const [open, setOpen] = useState(false);
  const [raw, setRaw] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const parsed = useMemo(() => parseBulkCards(raw), [raw]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (parsed.length === 0) {
      toast.error(
        "No cards found. Use blocks like Front: ... then Back: ... for each card.",
      );
      return;
    }

    const cardsToSubmit = parsed.slice(0, 200);

    setIsLoading(true);

    try {
      const result = await createBulkCards({
        deckId,
        cards: cardsToSubmit,
      });

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success(`Added ${result.data.created} cards.`);
      if (parsed.length > 200) {
        toast.info(
          `Only the first 200 cards were imported (${parsed.length} detected).`,
        );
      }
      setRaw("");
      setOpen(false);
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Layers className="mr-2 h-4 w-4 shrink-0" />
          Add multiple cards
        </Button>
      </DialogTrigger>
      <DialogContent className="flex max-h-[min(90dvh,calc(100vh-2rem))] flex-col gap-0 sm:max-w-[640px] min-w-0">
        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col gap-4">
          <DialogHeader className="shrink-0">
            <DialogTitle>Add multiple cards</DialogTitle>
            <DialogDescription>
              Paste text using repeating{" "}
              <span className="font-medium text-foreground">Front:</span> and{" "}
              <span className="font-medium text-foreground">Back:</span> lines.
              Each pair becomes one card (blank lines between cards are optional).
            </DialogDescription>
          </DialogHeader>

          <div className="grid min-h-0 flex-1 gap-2">
            <Label htmlFor="bulk-cards">Card text</Label>
            <Textarea
              id="bulk-cards"
              value={raw}
              onChange={(e) => setRaw(e.target.value)}
              disabled={isLoading}
              placeholder={`Front: Example question?\nBack: Example answer.\n\nFront: Next question?\nBack: Next answer.`}
              className="min-h-[200px] flex-1 resize-y font-mono text-sm sm:min-h-[280px]"
            />
            <p className="text-muted-foreground text-xs">
              Parsed:{" "}
              <span className="font-medium text-foreground">
                {parsed.length}
              </span>{" "}
              card{parsed.length === 1 ? "" : "s"}
              {parsed.length > 200 ? " (only the first 200 will be accepted)" : ""}
            </p>
          </div>

          <DialogFooter className="shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || parsed.length === 0}>
              {isLoading ? "Adding…" : `Add ${parsed.length || 0} cards`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
