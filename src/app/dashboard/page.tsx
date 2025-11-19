import { redirect } from "next/navigation";
import { getUserDecks } from "@/db/queries/deck-queries";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { CreateDeckDialog } from "@/components/create-deck-dialog";

export default async function DashboardPage() {
  // Fetch user's decks using query helper - it handles auth & ownership verification
  let decks;
  
  try {
    decks = await getUserDecks();
  } catch (error) {
    // If unauthorized, redirect to home
    redirect("/");
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-4xl font-bold">My Decks</h1>
          <p className="text-muted-foreground mt-2">
            Manage your flashcard decks, or select a deck and start studying
          </p>
        </div>
        <CreateDeckDialog />
      </div>
      
      {decks.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg mb-4">
            You haven't created any decks yet.
          </p>
          <CreateDeckDialog />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 mt-8">
          {decks.map((deck) => (
            <Link key={deck.id} href={`/decks/${deck.id}`}>
              <Card className="hover:shadow-lg transition-shadow flex flex-col min-h-[320px] cursor-pointer">
                <CardHeader className="flex-grow">
                  <CardTitle>{deck.name}</CardTitle>
                  {deck.description && (
                    <CardDescription className="line-clamp-3 mt-2">
                      {deck.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardFooter className="mt-auto pt-6">
                  <p className="text-sm text-muted-foreground">
                    Updated {new Date(deck.updatedAt).toLocaleDateString()}
                  </p>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

