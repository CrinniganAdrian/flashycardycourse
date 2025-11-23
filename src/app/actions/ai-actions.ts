"use server";

import { auth } from "@clerk/nextjs/server";
import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { getDeckById } from "@/db/queries/deck-queries";
import { db } from "@/db";
import { cardsTable } from "@/db/schema";

// Input validation schema
const generateFlashcardsInputSchema = z.object({
  deckId: z.number().int().positive(),
  topic: z.string().min(1).max(500).trim(),
  description: z.string().max(1000).trim().optional(),
});

type GenerateFlashcardsInput = z.infer<typeof generateFlashcardsInputSchema>;

// AI response schema
const flashcardsResponseSchema = z.object({
  cards: z.array(
    z.object({
      front: z.string().min(1).max(5000),
      back: z.string().min(1).max(5000),
    })
  ),
});

// Result type
type GenerateFlashcardsResult =
  | {
      success: true;
      data: {
        cardsGenerated: number;
      };
    }
  | { success: false; error: string };

/**
 * Detect if a deck is for language learning based on topic and description
 * Only returns true for explicit language learning/translation intent
 */
function detectLanguageLearning(topic: string, description?: string): boolean {
  const combinedText = `${topic} ${description || ""}`.toLowerCase();
  
  // EXPLICIT language learning indicators (must be very specific)
  const languageLearningPatterns = [
    // Learning patterns
    "learning irish",
    "learning spanish",
    "learning french",
    "learning german",
    "learning italian",
    "learning portuguese",
    "learning russian",
    "learning chinese",
    "learning japanese",
    "learning korean",
    "learning arabic",
    "learning hindi",
    "learning english",
    "learn irish",
    "learn spanish",
    "learn french",
    "learn german",
    "learn italian",
    // Translation patterns
    "translate",
    "translation",
    "english to",
    "to english",
    "spanish to",
    "to spanish",
    "french to",
    "to french",
    "into irish",
    "into spanish",
    "into french",
    // Vocabulary patterns
    "vocabulary",
    "vocab",
    // Explicit language learning terms
    "language learning",
    "language practice",
    "language course",
  ];
  
  return languageLearningPatterns.some((pattern) => combinedText.includes(pattern));
}

/**
 * Build prompt for language learning flashcards
 */
function buildLanguageLearningPrompt(topic: string, description?: string): string {
  return `Generate 20 flashcards for "${topic}"${
    description ? `. Context: ${description}` : ""
  }.

FORMAT REQUIREMENTS:
- front: The term, word, phrase, or sentence to be learned
- back: The direct translation, definition, or answer ONLY (no explanations, descriptions, or additional context)

Examples of CORRECT format:
Front: "Hello"
Back: "Dia dhuit"

Front: "Cat"
Back: "Gato"

Front: "How are you?"
Back: "¿Cómo estás?"

DO NOT include explanations, pronunciation guides, usage notes, or extra context on the back of cards.
Keep answers simple and direct - just the translation or definition itself.

Generate exactly 20 flashcards based on the topic and context provided above.`;
}

/**
 * Build prompt for educational/academic flashcards
 */
function buildEducationalPrompt(topic: string, description?: string): string {
  return `Generate 20 flashcards for "${topic}"${
    description ? `. Context: ${description}` : ""
  }.

FORMAT REQUIREMENTS:
- front: A clear, concise question, term, or prompt
- back: A direct, concise answer - DO NOT repeat the question or add unnecessary context

IMPORTANT: Keep answers brief and to the point. Do not include full sentences that repeat information from the front.

Examples:
Front: "France"
Back: "Paris"

Front: "What is the capital of France"
Back: "Paris"

Front: "Photosynthesis"
Back: "Process by which plants convert light energy into chemical energy"

Make the flashcards educational, accurate, and appropriate for self-study.

Generate exactly 20 flashcards based on the topic and context provided above.`;
}

export async function generateFlashcardsWithAI(
  input: GenerateFlashcardsInput
): Promise<GenerateFlashcardsResult> {
  try {
    // 1. Authenticate
    const { userId, has } = await auth();

    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    // 2. Check for AI feature access (Pro plan required)
    const hasAIAccess = has({ feature: "ai_flashcard_generation" });

    if (!hasAIAccess) {
      return {
        success: false,
        error: "AI flashcard generation is a Pro feature. Upgrade to access.",
      };
    }

    // 3. Validate input
    const validationResult = generateFlashcardsInputSchema.safeParse(input);

    if (!validationResult.success) {
      return {
        success: false,
        error: validationResult.error.issues[0].message,
      };
    }

    const { deckId, topic, description } = validationResult.data;

    // 4. Verify deck ownership
    const deck = await getDeckById(deckId);

    if (!deck) {
      return { success: false, error: "Deck not found" };
    }

    // 5. Verify deck has a description (required for quality AI generation)
    if (!description || description.trim().length === 0) {
      return {
        success: false,
        error: "Please add a deck description before using AI generation.",
      };
    }

    // 6. Detect if this is a language learning deck
    const isLanguageLearning = detectLanguageLearning(topic, description);

    // 7. Generate flashcards with AI using appropriate prompt
    const prompt = isLanguageLearning 
      ? buildLanguageLearningPrompt(topic, description)
      : buildEducationalPrompt(topic, description);

    const { object } = await generateObject({
      model: openai("gpt-4o-mini"), // Using mini model for cost efficiency
      schema: flashcardsResponseSchema,
      prompt,
    });

    // 8. Validate AI response
    if (!object.cards || object.cards.length === 0) {
      return {
        success: false,
        error: "Failed to generate flashcards. Please try again.",
      };
    }

    // 9. Save cards to deck
    const cardsToInsert = object.cards.map((card) => ({
      deckId,
      front: card.front.trim(),
      back: card.back.trim(),
    }));

    await db.insert(cardsTable).values(cardsToInsert);

    // 10. Revalidate paths
    revalidatePath(`/decks/${deckId}`);
    revalidatePath("/dashboard");

    // 11. Return success
    return {
      success: true,
      data: { cardsGenerated: object.cards.length },
    };
  } catch (error) {
    console.error("Error generating flashcards with AI:", error);

    // Handle specific errors
    if (error instanceof Error) {
      if (error.message === "Unauthorized") {
        return { success: false, error: "Unauthorized" };
      }

      if (error.message.includes("API key")) {
        return {
          success: false,
          error: "AI service configuration error. Please contact support.",
        };
      }

      if (
        error.message.includes("quota") ||
        error.message.includes("insufficient_quota")
      ) {
        return {
          success: false,
          error:
            "OpenAI API quota exceeded. Please check your OpenAI billing settings.",
        };
      }

      if (error.message.includes("rate limit")) {
        return {
          success: false,
          error: "Too many requests. Please try again in a moment.",
        };
      }

      if (error.message.includes("timeout")) {
        return {
          success: false,
          error: "Request timed out. Please try again.",
        };
      }
    }

    return {
      success: false,
      error: "Failed to generate flashcards. Please try again.",
    };
  }
}

