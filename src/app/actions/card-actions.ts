"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { cardsTable, decksTable } from "@/db/schema";
import { eq, and } from "drizzle-orm";

// ============================================================================
// ZOD SCHEMAS
// ============================================================================

const createCardSchema = z.object({
  deckId: z.number().int().positive(),
  front: z
    .string()
    .min(1, "Front of card is required")
    .max(5000, "Front must be 5000 characters or less")
    .trim(),
  back: z
    .string()
    .min(1, "Back of card is required")
    .max(5000, "Back must be 5000 characters or less")
    .trim(),
});

const updateCardSchema = z.object({
  cardId: z.number().int().positive(),
  deckId: z.number().int().positive(),
  front: z
    .string()
    .min(1, "Front of card is required")
    .max(5000, "Front must be 5000 characters or less")
    .trim(),
  back: z
    .string()
    .min(1, "Back of card is required")
    .max(5000, "Back must be 5000 characters or less")
    .trim(),
});

const deleteCardSchema = z.object({
  cardId: z.number().int().positive(),
  deckId: z.number().int().positive(),
});

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

type CreateCardInput = z.infer<typeof createCardSchema>;
type UpdateCardInput = z.infer<typeof updateCardSchema>;
type DeleteCardInput = z.infer<typeof deleteCardSchema>;

type CreateCardResult =
  | { success: true; data: { id: number } }
  | { success: false; error: string };

type UpdateCardResult =
  | { success: true; data: { id: number } }
  | { success: false; error: string };

type DeleteCardResult = 
  | { success: true }
  | { success: false; error: string };

// ============================================================================
// SERVER ACTIONS
// ============================================================================

/**
 * Create a new card in a deck
 * Verifies user owns the deck before creating the card
 */
export async function createCard(
  input: CreateCardInput
): Promise<CreateCardResult> {
  try {
    // Authenticate
    const { userId } = await auth();
    
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }
    
    // Validate input
    const validationResult = createCardSchema.safeParse(input);
    
    if (!validationResult.success) {
      return {
        success: false,
        error: validationResult.error.errors[0].message,
      };
    }
    
    const { deckId, front, back } = validationResult.data;
    
    // CRITICAL: Verify user owns the deck before creating card
    const [deck] = await db
      .select()
      .from(decksTable)
      .where(and(
        eq(decksTable.id, deckId),
        eq(decksTable.userId, userId)
      ))
      .limit(1);
    
    if (!deck) {
      return { success: false, error: "Deck not found" };
    }
    
    // Create card
    const [card] = await db
      .insert(cardsTable)
      .values({
        deckId,
        front,
        back,
      })
      .returning();
    
    // Revalidate paths
    revalidatePath(`/decks/${deckId}`);
    revalidatePath("/dashboard");
    
    return {
      success: true,
      data: { id: card.id },
    };
  } catch (error) {
    console.error("Error creating card:", error);
    
    if (error instanceof Error && error.message === "Unauthorized") {
      return { success: false, error: "Unauthorized" };
    }
    
    return {
      success: false,
      error: "Failed to create card. Please try again.",
    };
  }
}

/**
 * Update an existing card
 * Verifies user owns the deck that contains the card
 */
export async function updateCard(
  input: UpdateCardInput
): Promise<UpdateCardResult> {
  try {
    // Authenticate
    const { userId } = await auth();
    
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }
    
    // Validate input
    const validationResult = updateCardSchema.safeParse(input);
    
    if (!validationResult.success) {
      return {
        success: false,
        error: validationResult.error.errors[0].message,
      };
    }
    
    const { cardId, deckId, front, back } = validationResult.data;
    
    // CRITICAL: Verify user owns the deck that contains this card
    const [cardWithDeck] = await db
      .select({
        cardId: cardsTable.id,
        deckId: cardsTable.deckId,
        deckUserId: decksTable.userId,
      })
      .from(cardsTable)
      .innerJoin(decksTable, eq(cardsTable.deckId, decksTable.id))
      .where(and(
        eq(cardsTable.id, cardId),
        eq(decksTable.userId, userId)
      ))
      .limit(1);
    
    if (!cardWithDeck) {
      return { success: false, error: "Card not found" };
    }
    
    // Update card
    const [updated] = await db
      .update(cardsTable)
      .set({
        front,
        back,
        updatedAt: new Date(),
      })
      .where(eq(cardsTable.id, cardId))
      .returning();
    
    // Revalidate paths
    revalidatePath(`/decks/${deckId}`);
    revalidatePath("/dashboard");
    
    return {
      success: true,
      data: { id: updated.id },
    };
  } catch (error) {
    console.error("Error updating card:", error);
    
    if (error instanceof Error && error.message === "Unauthorized") {
      return { success: false, error: "Unauthorized" };
    }
    
    return {
      success: false,
      error: "Failed to update card. Please try again.",
    };
  }
}

/**
 * Delete a card
 * Verifies user owns the deck that contains the card
 */
export async function deleteCard(
  input: DeleteCardInput
): Promise<DeleteCardResult> {
  try {
    // Authenticate
    const { userId } = await auth();
    
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }
    
    // Validate input
    const validationResult = deleteCardSchema.safeParse(input);
    
    if (!validationResult.success) {
      return {
        success: false,
        error: "Invalid card ID",
      };
    }
    
    const { cardId, deckId } = validationResult.data;
    
    // CRITICAL: Verify user owns the deck that contains this card
    const [cardWithDeck] = await db
      .select({
        cardId: cardsTable.id,
        deckId: cardsTable.deckId,
      })
      .from(cardsTable)
      .innerJoin(decksTable, eq(cardsTable.deckId, decksTable.id))
      .where(and(
        eq(cardsTable.id, cardId),
        eq(decksTable.userId, userId)
      ))
      .limit(1);
    
    if (!cardWithDeck) {
      return { success: false, error: "Card not found" };
    }
    
    // Delete card
    await db
      .delete(cardsTable)
      .where(eq(cardsTable.id, cardId));
    
    // Revalidate paths
    revalidatePath(`/decks/${deckId}`);
    revalidatePath("/dashboard");
    
    return { success: true };
  } catch (error) {
    console.error("Error deleting card:", error);
    
    if (error instanceof Error && error.message === "Unauthorized") {
      return { success: false, error: "Unauthorized" };
    }
    
    return {
      success: false,
      error: "Failed to delete card. Please try again.",
    };
  }
}

