const PROFANITY_LIST = [
  "ass", "asshole", "bastard", "bitch", "bullshit", "cock", "crap", "cunt",
  "damn", "dick", "douchebag", "fag", "faggot", "fuck", "goddamn", "hell",
  "jackass", "motherfucker", "nigger", "nigga", "piss", "pussy", "retard",
  "shit", "slut", "twat", "whore", "wanker", "chink", "gook", "kike",
  "spic", "wetback", "tranny", "dyke"
];

// Short words that cause too many false positives in collapsed full-string checks (layer 3)
const SHORT_WORDS_SKIP_COLLAPSED = new Set([
  "ass", "damn", "hell", "crap", "cock", "dick", "fag", "piss"
]);

// Words used for aggressive layer 3 collapsed check (longer/distinctive words only)
const COLLAPSED_CHECK_LIST = PROFANITY_LIST.filter(w => !SHORT_WORDS_SKIP_COLLAPSED.has(w));

const SUBSTITUTION_MAP: Record<string, string> = {
  "@": "a",
  "0": "o",
  "$": "s",
  "1": "i",
  "3": "e",
  "!": "i",
  "#": "h",
  "5": "s",
  "7": "t",
  "4": "a",
  "9": "g",
  "8": "b",
};

function normalize(text: string): string {
  let normalized = text.toLowerCase();
  for (const [char, replacement] of Object.entries(SUBSTITUTION_MAP)) {
    normalized = normalized.split(char).join(replacement);
  }
  // Collapse repeated characters (2+ of the same char → 1): fuuuck → fuck, shiiit → shit
  normalized = normalized.replace(/(.)\1+/g, "$1");
  return normalized;
}

export function censorProfanity(text: string): string {
  // Split preserving whitespace tokens
  const tokens = text.split(/(\s+)/);
  return tokens.map(token => {
    // Skip whitespace tokens
    if (/^\s+$/.test(token)) return token;

    const normalized = normalize(token);
    const cleaned = normalized.replace(/[^a-z]/g, "");
    if (!cleaned) return token;

    // Layer 1: Exact word match
    if (PROFANITY_LIST.includes(cleaned)) {
      return "####";
    }

    // Layer 2: Substring match (e.g., "fuckyou" contains "fuck")
    for (const profanity of PROFANITY_LIST) {
      if (cleaned.includes(profanity)) {
        return "####";
      }
    }

    return token;
  }).join("");
}

export function containsProfanity(text: string): boolean {
  const normalized = normalize(text);
  const words = normalized.split(/\s+/);

  for (const word of words) {
    const cleaned = word.replace(/[^a-z]/g, "");
    if (!cleaned) continue;

    // Layer 1: Exact word match
    if (PROFANITY_LIST.includes(cleaned)) {
      return true;
    }

    // Layer 2: Substring match per word (e.g., "fuckyou" contains "fuck")
    for (const profanity of PROFANITY_LIST) {
      if (cleaned.includes(profanity)) {
        return true;
      }
    }
  }

  // Layer 3: Collapse entire message (strip all non-alpha), check for profanity substrings
  // This catches spaced-out or special-char-separated attempts like "f u c k", "f*u*c*k"
  const collapsed = normalized.replace(/[^a-z]/g, "");
  for (const profanity of COLLAPSED_CHECK_LIST) {
    if (collapsed.includes(profanity)) {
      return true;
    }
  }

  return false;
}
