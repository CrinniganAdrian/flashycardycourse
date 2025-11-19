"use client";

import { useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateCard } from "@/app/actions/card-actions";
import { toast } from "sonner";
import { Edit } from "lucide-react";

interface EditCardDialogProps {
  cardId: number;
  deckId: number;
  initialFront: string;
  initialBack: string;
}

export function EditCardDialog({ 
  cardId, 
  deckId, 
  initialFront, 
  initialBack 
}: EditCardDialogProps) {
  const [open, setOpen] = useState(false);
  const [front, setFront] = useState(initialFront);
  const [back, setBack] = useState(initialBack);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await updateCard({ cardId, deckId, front, back });

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      // Success - close dialog
      toast.success("Card updated successfully!");
      setOpen(false);
    } catch (err) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  }

  // Reset form when dialog opens
  function handleOpenChange(newOpen: boolean) {
    setOpen(newOpen);
    if (newOpen) {
      setFront(initialFront);
      setBack(initialBack);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex-1">
          <Edit className="w-4 h-4 mr-2" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Card</DialogTitle>
            <DialogDescription>
              Update the content of this flashcard.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-front">Front of Card</Label>
              <Textarea
                id="edit-front"
                placeholder="Enter the question or prompt..."
                value={front}
                onChange={(e) => setFront(e.target.value)}
                disabled={isLoading}
                required
                rows={4}
                className="resize-none"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="edit-back">Back of Card</Label>
              <Textarea
                id="edit-back"
                placeholder="Enter the answer or information..."
                value={back}
                onChange={(e) => setBack(e.target.value)}
                disabled={isLoading}
                required
                rows={4}
                className="resize-none"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

