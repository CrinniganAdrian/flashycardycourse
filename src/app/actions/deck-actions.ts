"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { decksTable } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getUserDeckCount } from "@/db/queries/deck-queries";

// ============================================================================
// ZOD SCHEMAS
// ============================================================================

const createDeckSchema = z.object({
  name: z
    .string()
    .min(1, "Deck name is required")
    .max(255, "Deck name must be 255 characters or less")
    .trim(),
  description: z
    .string()
    .max(1000, "Description must be 1000 characters or less")
    .trim()
    .nullable()
    .optional(),
});

const updateDeckSchema = z.object({
  deckId: z.number().int().positive(),
  name: z
    .string()
    .min(1, "Deck name is required")
    .max(255, "Deck name must be 255 characters or less")
    .trim(),
  description: z
    .string()
    .max(1000, "Description must be 1000 characters or less")
    .trim()
    .nullable()
    .optional(),
});

const deleteDeckSchema = z.object({
  deckId: z.number().int().positive(),
});

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

type CreateDeckInput = z.infer<typeof createDeckSchema>;

type CreateDeckResult =
  | { success: true; data: { id: number; name: string } }
  | { success: false; error: string };

type UpdateDeckInput = z.infer<typeof updateDeckSchema>;

type UpdateDeckResult =
  | { success: true; data: { id: number; name: string } }
  | { success: false; error: string };

type DeleteDeckInput = z.infer<typeof deleteDeckSchema>;

type DeleteDeckResult =
  | { success: true }
  | { success: false; error: string };

// ============================================================================
// SERVER ACTIONS
// ============================================================================

/**
 * Create a new deck
 * Automatically assigns to the authenticated user
 */
export async function createDeck(
  input: CreateDeckInput
): Promise<CreateDeckResult> {
  try {
    // Authenticate
    const { userId, has } = await auth();
    
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }
    
    // Check plan/feature access
    const hasUnlimitedDecks = has({ feature: 'unlimited_decks' });
    
    if (!hasUnlimitedDecks) {
      // User is on free plan - check deck limit
      const deckCount = await getUserDeckCount();
      
      if (deckCount >= 3) {
        return {
          success: false,
          error: "Free plan limited to 3 decks. Upgrade to Pro for unlimited decks.",
        };
      }
    }
    
    // Validate input
    const validationResult = createDeckSchema.safeParse(input);
    
    if (!validationResult.success) {
      return {
        success: false,
        error: validationResult.error.issues[0].message,
      };
    }
    
    const { name, description } = validationResult.data;
    
    // Create deck with userId
    const [deck] = await db
      .insert(decksTable)
      .values({
        userId,
        name,
        description,
      })
      .returning();
    
    // Revalidate dashboard
    revalidatePath("/dashboard");
    
    return {
      success: true,
      data: { id: deck.id, name: deck.name },
    };
  } catch (error) {
    console.error("Error creating deck:", error);
    
    if (error instanceof Error && error.message === "Unauthorized") {
      return { success: false, error: "Unauthorized" };
    }
    
    return {
      success: false,
      error: "Failed to create deck. Please try again.",
    };
  }
}

/**
 * Update an existing deck
 * Verifies user owns the deck before updating
 */
export async function updateDeck(
  input: UpdateDeckInput
): Promise<UpdateDeckResult> {
  try {
    // Authenticate
    const { userId } = await auth();
    
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }
    
    // Validate input
    const validationResult = updateDeckSchema.safeParse(input);
    
    if (!validationResult.success) {
      return {
        success: false,
        error: validationResult.error.issues[0].message,
      };
    }
    
    const { deckId, name, description } = validationResult.data;
    
    // Update with ownership verification
    const [updated] = await db
      .update(decksTable)
      .set({
        name,
        description,
        updatedAt: new Date(),
      })
      .where(and(
        eq(decksTable.id, deckId),
        eq(decksTable.userId, userId)
      ))
      .returning();
    
    if (!updated) {
      return { success: false, error: "Deck not found" };
    }
    
    // Revalidate paths
    revalidatePath("/dashboard");
    revalidatePath(`/decks/${deckId}`);
    
    return {
      success: true,
      data: { id: updated.id, name: updated.name },
    };
  } catch (error) {
    console.error("Error updating deck:", error);
    
    if (error instanceof Error && error.message === "Unauthorized") {
      return { success: false, error: "Unauthorized" };
    }
    
    return {
      success: false,
      error: "Failed to update deck. Please try again.",
    };
  }
}

/**
 * Delete a deck
 * Verifies user owns the deck before deleting
 * Cascade deletes all associated cards automatically
 */
export async function deleteDeck(
  input: DeleteDeckInput
): Promise<DeleteDeckResult> {
  try {
    // Authenticate
    const { userId } = await auth();
    
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }
    
    // Validate input
    const validationResult = deleteDeckSchema.safeParse(input);
    
    if (!validationResult.success) {
      return {
        success: false,
        error: "Invalid deck ID",
      };
    }
    
    const { deckId } = validationResult.data;
    
    // Delete with ownership verification
    // This will CASCADE delete all cards in the deck
    const [deleted] = await db
      .delete(decksTable)
      .where(and(
        eq(decksTable.id, deckId),
        eq(decksTable.userId, userId)
      ))
      .returning();
    
    if (!deleted) {
      return { success: false, error: "Deck not found" };
    }
    
    // Revalidate dashboard
    revalidatePath("/dashboard");
    
    return { success: true };
  } catch (error) {
    console.error("Error deleting deck:", error);
    
    if (error instanceof Error && error.message === "Unauthorized") {
      return { success: false, error: "Unauthorized" };
    }
    
    return {
      success: false,
      error: "Failed to delete deck. Please try again.",
    };
  }
}

