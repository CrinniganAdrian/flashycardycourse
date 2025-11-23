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
import { createDeck } from "@/app/actions/deck-actions";
import { toast } from "sonner";
import { Plus } from "lucide-react";

export function CreateDeckDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    // Validate that name is not empty (trimmed)
    const trimmedName = name.trim();
    if (!trimmedName) {
      toast.error("Deck name is required");
      return;
    }
    
    setIsLoading(true);

    try {
      const result = await createDeck({ 
        name: trimmedName, 
        description: description.trim() || null 
      });

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      // Success - close dialog and reset form
      toast.success("Deck created successfully!");
      setOpen(false);
      setName("");
      setDescription("");
    } catch (err) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  }

  // Reset form when dialog opens
  function handleOpenChange(newOpen: boolean) {
    setOpen(newOpen);
    if (!newOpen) {
      // Reset form when closing
      setName("");
      setDescription("");
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Create New Deck
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Deck</DialogTitle>
            <DialogDescription>
              Create a new flashcard deck to organize your study materials.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="create-name">Deck Name</Label>
              <Input
                id="create-name"
                placeholder="Enter deck name..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
                required
                maxLength={255}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="create-description">
                Description <span className="text-muted-foreground">(Optional)</span>
              </Label>
              <Textarea
                id="create-description"
                placeholder="Enter a description for this deck..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isLoading}
                rows={4}
                maxLength={1000}
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
              {isLoading ? "Creating..." : "Create Deck"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

