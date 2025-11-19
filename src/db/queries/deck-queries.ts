import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { decksTable } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import type { Deck } from "./types";

/**
 * Get all decks for the authenticated user
 * @returns Array of decks owned by the user, ordered by creation date (newest first)
 * @throws Error if user is not authenticated
 */
export async function getUserDecks(): Promise<Deck[]> {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error("Unauthorized");
  }
  
  const decks = await db
    .select()
    .from(decksTable)
    .where(eq(decksTable.userId, userId))
    .orderBy(desc(decksTable.createdAt));
  
  return decks;
}

/**
 * Get a single deck by ID with ownership verification
 * @param deckId - The deck ID to fetch
 * @returns Deck object or null if not found
 * @throws Error if user is not authenticated
 */
export async function getDeckById(deckId: number): Promise<Deck | null> {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error("Unauthorized");
  }
  
  const [deck] = await db
    .select()
    .from(decksTable)
    .where(and(
      eq(decksTable.id, deckId),
      eq(decksTable.userId, userId)
    ))
    .limit(1);
  
  return deck ?? null;
}

