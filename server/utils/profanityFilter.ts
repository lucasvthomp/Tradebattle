const PROFANITY_LIST = [
  "ass", "asshole", "bastard", "bitch", "bullshit", "cock", "crap", "cunt",
  "damn", "dick", "douchebag", "fag", "faggot", "fuck", "goddamn", "hell",
  "jackass", "motherfucker", "nigger", "nigga", "piss", "pussy", "retard",
  "shit", "slut", "twat", "whore", "wanker", "chink", "gook", "kike",
  "spic", "wetback", "tranny", "dyke"
];

const SUBSTITUTION_MAP: Record<string, string> = {
  "@": "a",
  "0": "o",
  "$": "s",
  "1": "i",
  "3": "e",
  "!": "i",
};

function normalize(text: string): string {
  let normalized = text.toLowerCase();
  for (const [char, replacement] of Object.entries(SUBSTITUTION_MAP)) {
    normalized = normalized.split(char).join(replacement);
  }
  return normalized;
}

export function containsProfanity(text: string): boolean {
  const normalized = normalize(text);
  const words = normalized.split(/\s+/);
  for (const word of words) {
    const cleaned = word.replace(/[^a-z]/g, "");
    if (PROFANITY_LIST.includes(cleaned)) {
      return true;
    }
  }
  return false;
}
