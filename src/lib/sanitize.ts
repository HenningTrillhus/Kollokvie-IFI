// Cleaning for text people type into forms, before it is stored.
//
// React already escapes everything it renders, so "<script>" typed into a name
// is just text. What is worth removing is invisible or misleading characters:
// control characters, zero-width characters and the right-to-left overrides
// used to make a name or link look like something else ("spoofing"). The
// database refuses the same characters (migration 0033, `clean_text`).

// Zero-width space, left/right marks, bidi embedding/override/isolate, word
// joiner and byte-order mark. (ZWNJ/ZWJ are kept: emoji and some scripts need them.)
const INVISIBLE = /[\u200b\u200e\u200f\u202a-\u202e\u2060-\u2069\ufeff]/g;
const CONTROL_LINE = /[\u0000-\u001f\u007f]/g;
const CONTROL_TEXT = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g;

// One line (names, titles, rooms): no line breaks, single spaces, trimmed.
export function cleanLine(value: string): string {
  return value.replace(INVISIBLE, "").replace(CONTROL_LINE, " ").replace(/\s+/g, " ").trim();
}

// Several lines (bio, descriptions): line breaks stay, other control characters go.
export function cleanText(value: string): string {
  return value
    .replace(/\r\n?/g, "\n")
    .replace(INVISIBLE, "")
    .replace(CONTROL_TEXT, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
