import { redirect, notFound } from "next/navigation";
import { getDeckById } from "@/db/queries/deck-queries";
import { getCardsByDeckId } from "@/db/queries/card-queries";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { AddCardDialog } from "@/components/add-card-dialog";
import { BulkAddCardsDialog } from "@/components/bulk-add-cards-dialog";
import { EditCardDialog } from "@/components/edit-card-dialog";
import { DeleteCardButton } from "@/components/delete-card-button";
import { EditDeckDialog } from "@/components/edit-deck-dialog";
import { DeleteDeckDialog } from "@/components/delete-deck-dialog";
import { AIGenerateButton } from "@/components/ai-generate-button";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function DeckPage({ params }: PageProps) {
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
  } catch {
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
  } catch {
    // If there's an error fetching cards, redirect
    redirect("/");
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="outline" asChild>
            <Link href="/dashboard">← Back to Decks</Link>
          </Button>
        </div>
        
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1">
            <h1 className="mb-2 text-3xl font-bold break-words sm:text-4xl">
              {deck.name}
            </h1>
            {deck.description && (
              <p className="text-muted-foreground text-lg break-words">
                {deck.description}
              </p>
            )}
            <p className="text-muted-foreground mt-2 text-sm">
              {cards.length} {cards.length === 1 ? "card" : "cards"} • Last
              updated {new Date(deck.updatedAt).toLocaleDateString()}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 lg:max-w-none lg:justify-end lg:shrink-0">
            <EditDeckDialog
              deckId={deckId}
              initialName={deck.name}
              initialDescription={deck.description}
            />
            <DeleteDeckDialog
              deckId={deckId}
              deckName={deck.name}
              cardCount={cards.length}
            />
            {cards.length > 0 && (
              <Button variant="default" asChild>
                <Link href={`/decks/${deckId}/study`}>Study</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
      
      {/* Cards Section */}
      <div>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-2xl font-semibold">Cards</h2>
          <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-end">
            <AIGenerateButton
              deckId={deckId}
              deckName={deck.name}
              deckDescription={deck.description}
            />
            <BulkAddCardsDialog deckId={deckId} />
            <AddCardDialog deckId={deckId} />
          </div>
        </div>
        
        {cards.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent className="pt-6">
              <p className="text-muted-foreground text-lg mb-4">
                This deck doesn&apos;t have any cards yet.
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                <BulkAddCardsDialog deckId={deckId} />
                <AddCardDialog deckId={deckId} />
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {cards.map((card) => (
              <Card key={card.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">Front</CardTitle>
                  <CardDescription className="whitespace-pre-wrap">
                    {card.front}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm font-semibold text-muted-foreground mb-1">
                    Back
                  </p>
                  <p className="text-sm whitespace-pre-wrap">{card.back}</p>
                  
                  <div className="flex gap-2 mt-4">
                    <EditCardDialog 
                      cardId={card.id}
                      deckId={deckId}
                      initialFront={card.front}
                      initialBack={card.back}
                    />
                    <DeleteCardButton
                      cardId={card.id}
                      deckId={deckId}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


