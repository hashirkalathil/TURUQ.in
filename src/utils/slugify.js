// src/utils/slugify.js

const MALAYALAM_MAP = {
  അ: "a", ആ: "aa", ഇ: "i", ഈ: "ee", ഉ: "u", ഊ: "oo", ഋ: "ru", എ: "e", ഏ: "e", ഐ: "ai",
  ഒ: "o", ഓ: "o", ഔ: "au", ക: "ka", ഖ: "kha", ഗ: "ga", ഘ: "gha", ങ: "nga", ച: "cha",
  ഛ: "chha", ജ: "ja", ഝ: "jha", ഞ: "nja", ട: "ta", ഠ: "tha", ഡ: "da", ഢ: "dha", ണ: "na",
  ത: "ta", ഥ: "tha", ദ: "da", ധ: "dha", ന: "na", പ: "pa", ഫ: "pha", ബ: "ba", ഭ: "bha",
  മ: "ma", യ: "ya", ര: "ra", ല: "la", വ: "va", ശ: "sha", ഷ: "sha", സ: "sa", ഹ: "ha",
  ള: "la", ഴ: "zha", റ: "ra", ൺ: "n", ൻ: "n", ർ: "r", ൽ: "l", ൾ: "l", ൿ: "k",
  "ാ": "aa", "ി": "i", "ീ": "ee", "ു": "u", "ൂ": "oo", "ൃ": "ru", "െ": "e", "േ": "e",
  "ൈ": "ai", "ൊ": "o", "ോ": "o", "ൗ": "au", "ൌ": "au", "ം": "m", "ഃ": "h", "്": "",
  "0": "0", "1": "1", "2": "2", "3": "3", "4": "4", "5": "5", "6": "6", "7": "7", "8": "8", "9": "9"
};

const CONSONANTS = new Set([
  "ക", "ഖ", "ഗ", "ഘ", "ങ", "ച", "ഛ", "ജ", "ഝ", "ഞ", "ട", "ഠ", "ഡ", "ഢ", "ണ",
  "ത", "ഥ", "ദ", "ധ", "ന", "പ", "ഫ", "ബ", "ഭ", "മ", "യ", "ര", "ല", "വ", "ശ",
  "ഷ", "സ", "ഹ", "ള", "ഴ", "റ"
]);

const VOWEL_SIGNS = new Set([
  "ാ", "ി", "ീ", "ു", "ൂ", "ൃ", "െ", "േ", "ൈ", "ൊ", "ോ", "ൗ", "ൌ"
]);

const VIRAMA = "്";

export const slugify = (text) => {
  if (!text) return "";

  const normalized = text.toString().toLowerCase();
  let result = "";

  for (let i = 0; i < normalized.length; i++) {
    const char = normalized[i];
    const nextChar = normalized[i + 1];

    if (CONSONANTS.has(char)) {
      const baseConsonant = MALAYALAM_MAP[char];

      if (nextChar === VIRAMA) {
        result += baseConsonant.slice(0, -1);
        i++; 
        continue;
      }

      if (VOWEL_SIGNS.has(nextChar)) {
        const consonantWithoutA = baseConsonant.slice(0, -1);
        const vowelSound = MALAYALAM_MAP[nextChar];
        result += consonantWithoutA + vowelSound;
        i++;
        continue;
      }

      result += baseConsonant;
    }
    else if (MALAYALAM_MAP[char] !== undefined) {
      result += MALAYALAM_MAP[char];
    } else {
      result += char;
    }
  }
  return result
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+|-+$/g, "");
};