import { redirect, notFound } from "next/navigation";
import { getDeckById } from "@/db/queries/deck-queries";
import { getCardsByDeckId } from "@/db/queries/card-queries";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FlashcardStudy } from "@/components/flashcard-study";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function StudyPage({ params }: PageProps) {
  const { id } = await params;
  const deckId = parseInt(id);
  
  // Validate deck ID
  if (isNaN(deckId)) {
    notFound();
  }
  
  // Fetch deck using query helper - handles auth & ownership
  let deck;
  try {
    deck = await getDeckById(deckId);
  } catch (error) {
    // If unauthorized, redirect to home
    redirect("/");
  }
  
  // If deck not found or user doesn't own it
  if (!deck) {
    notFound();
  }
  
  // Fetch cards for this deck
  let cards;
  try {
    cards = await getCardsByDeckId(deckId);
  } catch (error) {
    // If there's an error fetching cards, redirect
    redirect("/");
  }
  
  // If no cards, redirect back to deck page
  if (cards.length === 0) {
    redirect(`/decks/${deckId}`);
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="outline" asChild>
            <Link href={`/decks/${deckId}`}>← Back to Deck</Link>
          </Button>
        </div>
        
        <div>
          <h1 className="text-4xl font-bold mb-2">Study Mode</h1>
          <p className="text-muted-foreground text-lg">{deck.name}</p>
          <p className="text-sm text-muted-foreground mt-1">
            {cards.length} {cards.length === 1 ? "card" : "cards"}
          </p>
        </div>
      </div>
      
      {/* Flashcard Study Component */}
      <FlashcardStudy cards={cards} deckId={deckId} />
    </div>
  );
}

