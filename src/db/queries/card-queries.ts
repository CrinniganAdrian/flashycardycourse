import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { cardsTable, decksTable } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import type { Card } from "./types";
import { getDeckById } from "./deck-queries";

/**
 * Get all cards for a specific deck with ownership verification
 * @param deckId - The deck ID to fetch cards for
 * @returns Array of cards for the deck, ordered by updated date (newest first)
 * @throws Error if user is not authenticated or doesn't own the deck
 */
export async function getCardsByDeckId(deckId: number): Promise<Card[]> {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error("Unauthorized");
  }
  
  // Verify deck ownership first
  const deck = await getDeckById(deckId);
  if (!deck) {
    throw new Error("Deck not found");
  }
  
  // Now safe to fetch cards
  const cards = await db
    .select()
    .from(cardsTable)
    .where(eq(cardsTable.deckId, deckId))
    .orderBy(desc(cardsTable.updatedAt));
  
  return cards;
}

/**
 * Get a single card by ID with ownership verification
 * @param cardId - The card ID to fetch
 * @returns Card object or null if not found
 * @throws Error if user is not authenticated or doesn't own the card's deck
 */
export async function getCardById(cardId: number): Promise<Card | null> {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error("Unauthorized");
  }
  
  // Must join with decksTable to verify user owns the deck
  const [result] = await db
    .select({
      card: cardsTable,
      deck: decksTable,
    })
    .from(cardsTable)
    .innerJoin(decksTable, eq(cardsTable.deckId, decksTable.id))
    .where(and(
      eq(cardsTable.id, cardId),
      eq(decksTable.userId, userId)
    ))
    .limit(1);
  
  return result?.card ?? null;
}

