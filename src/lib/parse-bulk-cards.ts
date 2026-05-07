/**
 * Parses flashcards from pasted text. Each card uses:
 *   Front: ...content...
 *   Back: ...content...
 * Blank lines between cards are optional. Matching is case-insensitive for the keywords.
 */
export function parseBulkCards(raw: string): { front: string; back: string }[] {
  const text = raw.replace(/\r\n/g, "\n").trim();
  if (!text) return [];

  const cards: { front: string; back: string }[] = [];
  const re =
    /Front:\s*([\s\S]*?)Back:\s*([\s\S]*?)(?=\n\s*Front:\s|$)/gi;
  let match: RegExpExecArray | null;
  while ((match = re.exec(text)) !== null) {
    const front = match[1].trim();
    const back = match[2].trim();
    if (front.length > 0 && back.length > 0) {
      cards.push({ front, back });
    }
  }

  return cards;
}
