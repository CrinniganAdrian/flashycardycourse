import type { InferSelectModel, InferInsertModel } from "drizzle-orm";
import { decksTable, cardsTable } from "@/db/schema";

// Database model types (for SELECT queries)
export type Deck = InferSelectModel<typeof decksTable>;
export type Card = InferSelectModel<typeof cardsTable>;

// Insert types (for INSERT operations)
export type NewDeck = InferInsertModel<typeof decksTable>;
export type NewCard = InferInsertModel<typeof cardsTable>;

// Action result types (for Server Actions)
export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

