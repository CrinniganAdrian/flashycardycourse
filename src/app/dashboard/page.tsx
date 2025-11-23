import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getUserDecks } from "@/db/queries/deck-queries";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { CreateDeckDialog } from "@/components/create-deck-dialog";
import { UpgradePrompt } from "@/components/upgrade-prompt";
import { Crown, Package } from "lucide-react";

export default async function DashboardPage() {
  // Get auth and feature access
  const { userId, has } = await auth();
  
  if (!userId) {
    redirect("/");
  }
  
  // Check if user has unlimited decks feature (Pro plan)
  const hasUnlimitedDecks = has({ feature: 'unlimited_decks' });
  
  // Fetch user's decks using query helper - it handles auth & ownership verification
  let decks;
  
  try {
    decks = await getUserDecks();
  } catch (error) {
    // If unauthorized, redirect to home
    redirect("/");
  }
  
  // Check if user can create more decks
  const canCreateMoreDecks = hasUnlimitedDecks || decks.length < 3;
  const isApproachingLimit = !hasUnlimitedDecks && decks.length >= 2;
  const isAtLimit = !hasUnlimitedDecks && decks.length >= 3;
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-4xl font-bold">My Decks</h1>
          <p className="text-muted-foreground mt-2">
            Manage your flashcard decks, or select a deck and start studying
          </p>
        </div>
        
        {/* Plan details in top-right */}
        <div className="flex flex-col items-end gap-2">
          {hasUnlimitedDecks ? (
            <>
              <Badge variant="default" className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
                <Crown className="w-3 h-3 mr-1" />
                Pro Plan
              </Badge>
              <p className="text-sm text-muted-foreground">
                {decks.length} {decks.length === 1 ? 'deck' : 'decks'}
              </p>
            </>
          ) : (
            <>
              <Badge variant="secondary">
                <Package className="w-3 h-3 mr-1" />
                Free Plan
              </Badge>
              <p className="text-sm text-muted-foreground">
                {decks.length}/3 decks
              </p>
            </>
          )}
        </div>
      </div>
      
      {/* Create New Deck button - centered below description */}
      {canCreateMoreDecks && (
        <div className="flex justify-center mt-6">
          <CreateDeckDialog />
        </div>
      )}
      
      {/* Show upgrade prompt when approaching or at limit */}
      {isAtLimit && (
        <div className="mt-6">
          <UpgradePrompt
            message={`You've reached the 3 deck limit on the free plan. Upgrade to Pro for unlimited decks.`}
            ctaText="Upgrade to Pro"
          />
        </div>
      )}
      
      {isApproachingLimit && !isAtLimit && (
        <div className="mt-6">
          <UpgradePrompt
            message={`You're using ${decks.length}/3 decks on the free plan. Upgrade to Pro for unlimited decks.`}
            ctaText="Upgrade to Pro"
          />
        </div>
      )}
      
      {decks.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg mb-4">
            You haven't created any decks yet.
          </p>
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

