// types.ts - Updated with suggestions property

export interface QuranVerse {
  Surah: string;
  Verse: string;
  English: string;
  Arabic: string;
}

export interface Hadith {
  book: string;
  number: string;
  english: string;
  category: string;
  reference: string;
}

export type SearchResult = QuranVerse | Hadith;

export interface Message {
  text?: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  results?: SearchResult[];
  isError?: boolean;
  suggestions?: string[];  // Added this line
}

export function isQuranVerse(result: SearchResult): result is QuranVerse {
  return 'Surah' in result && 'Verse' in result && 'Arabic' in result;
}