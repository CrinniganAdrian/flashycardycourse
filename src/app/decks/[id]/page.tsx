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
import { EditCardDialog } from "@/components/edit-card-dialog";
import { DeleteCardButton } from "@/components/delete-card-button";
import { EditDeckDialog } from "@/components/edit-deck-dialog";
import { DeleteDeckDialog } from "@/components/delete-deck-dialog";

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
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="outline" asChild>
            <Link href="/dashboard">← Back to Decks</Link>
          </Button>
        </div>
        
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-4xl font-bold mb-2">{deck.name}</h1>
            {deck.description && (
              <p className="text-muted-foreground text-lg">
                {deck.description}
              </p>
            )}
            <p className="text-sm text-muted-foreground mt-2">
              {cards.length} {cards.length === 1 ? "card" : "cards"} • 
              Last updated {new Date(deck.updatedAt).toLocaleDateString()}
            </p>
          </div>
          
          <div className="flex gap-2">
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
                <Link href={`/decks/${deckId}/study`}>
                  Study
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
      
      {/* Cards Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">Cards</h2>
          <AddCardDialog deckId={deckId} />
        </div>
        
        {cards.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent className="pt-6">
              <p className="text-muted-foreground text-lg mb-4">
                This deck doesn't have any cards yet.
              </p>
              <AddCardDialog deckId={deckId} />
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


