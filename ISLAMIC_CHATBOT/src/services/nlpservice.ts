import type { SearchResult, QuranVerse, Hadith } from '../types';

interface HadithRaw {
  category?: string;
  number?: string;
  page_content?: string;
  url?: string;
}

interface QuranRaw {
  surah_no?: string;
  surah_name_en?: string;
  ayah_no_surah?: string;
  ayah_en?: string;
  ayah_ar?: string;
}

interface ProcessedQuery {
  source: 'hadith' | 'quran' | 'both';
  type: 'meaning' | 'search' | 'reference';
  query: string;
  expandedTerms: string[];
  reference?: { surah?: number; verse?: number };
}

class NLPService {
  private hadithData: HadithRaw[] = [];
  private quranData: QuranRaw[] = [];

  private topicMap: { [key: string]: string[] } = {
    'prayer': ['prayer', 'salah', 'salat', 'namaz', 'worship', 'prostration', 'ruku'],
    'charity': ['charity', 'sadaqah', 'zakat', 'giving', 'poor', 'needy', 'alms'],
    'patience': ['patience', 'sabr', 'perseverance', 'endurance', 'steadfast'],
    'forgiveness': ['forgiveness', 'pardon', 'mercy', 'repentance', 'tawbah', 'repent'],
    'paradise': ['paradise', 'jannah', 'heaven', 'garden', 'eternal'],
    'hell': ['hell', 'jahannam', 'hellfire', 'punishment'],
    'fasting': ['fasting', 'sawm', 'ramadan', 'fast'],
    'hajj': ['hajj', 'pilgrimage', 'mecca', 'kaaba', 'umrah'],
    'faith': ['faith', 'iman', 'belief', 'believe', 'believer'],
    'righteousness': ['righteousness', 'righteous', 'good', 'virtue', 'piety'],
    'sin': ['sin', 'evil', 'wrong', 'transgression', 'disobedience'],
    'prophet': ['prophet', 'messenger', 'muhammad', 'prophets'],
    'allah': ['allah', 'god', 'lord', 'creator', 'sustainer'],
    'quran': ['quran', 'book', 'scripture', 'revelation'],
    'family': ['family', 'parents', 'mother', 'father', 'children', 'spouse'],
    'death': ['death', 'die', 'grave', 'hereafter', 'afterlife'],
    'knowledge': ['knowledge', 'learn', 'wisdom', 'understanding', 'scholar'],
    'heart': ['heart', 'soul', 'purification', 'intention', 'sincerity'],
    'gratitude': ['gratitude', 'thankful', 'thanks', 'grateful', 'appreciate'],
    'trust': ['trust', 'tawakkul', 'reliance', 'depend'],
  };

  async loadData(): Promise<void> {
    try {
      console.log('Fetching Hadith dataset from:', import.meta.env.BASE_URL + 'data/hadith.csv');
      const hadithResponse = await fetch(import.meta.env.BASE_URL + 'data/hadith.csv');
      if (!hadithResponse.ok) {
        console.error('Hadith fetch response not ok:', hadithResponse.status, hadithResponse.statusText);
        throw new Error('Failed to load Hadith data');
      }
      const hadithText = await hadithResponse.text();
      this.hadithData = this.parseCSV<HadithRaw>(hadithText);
      console.log(`Loaded ${this.hadithData.length} Hadiths`);

      console.log('Fetching Quran dataset from:', import.meta.env.BASE_URL + 'data/quran.csv');
      const quranResponse = await fetch(import.meta.env.BASE_URL + 'data/quran.csv');
      if (!quranResponse.ok) {
        console.error('Quran fetch response not ok:', quranResponse.status, quranResponse.statusText);
        throw new Error('Failed to load Quran data');
      }
      const quranText = await quranResponse.text();
      this.quranData = this.parseCSV<QuranRaw>(quranText);
      console.log(`Loaded ${this.quranData.length} Quran verses`);
    } catch (error) {
      console.error('Error loading data:', error);
      throw error;
    }
  }

  private parseCSV<T>(csvText: string): T[] {
    const lines = csvText.split('\n').filter(line => line.trim());
    if (lines.length === 0) return [];
    
    const headers = lines[0].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(h => h.trim().replace(/^"|"$/g, ''));
    
    return lines.slice(1).map(line => {
      const values = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(v => v.trim().replace(/^"|"$/g, ''));
      
      return headers.reduce((obj: any, header, index) => {
        obj[header] = values[index] || '';
        return obj;
      }, {} as T);
    }).filter(entry => Object.values(entry).some(val => val));
  }

  private expandQuery(query: string): string[] {
    const lowerQuery = query.toLowerCase();
    const expanded = new Set<string>([query.toLowerCase()]);
    
    for (const synonyms of Object.values(this.topicMap)) {
      if (synonyms.some(syn => lowerQuery.includes(syn))) {
        synonyms.forEach(syn => expanded.add(syn));
      }
    }
    
    return Array.from(expanded);
  }

  private parseReference(query: string): { surah?: number; verse?: number } | null {
    const patterns = [
      /surah?\s*(\d+)(?::|\s+verse\s+|\s+ayah\s+)(\d+)/i,
      /(\d+):(\d+)/,
      /surah?\s*(\d+)/i
    ];
    
    for (const pattern of patterns) {
      const match = query.match(pattern);
      if (match) {
        return {
          surah: parseInt(match[1]),
          verse: match[2] ? parseInt(match[2]) : undefined
        };
      }
    }
    return null;
  }

  private preprocessQuery(query: string): ProcessedQuery {
    const processedQuery = query.toLowerCase().trim();
    const expandedTerms = this.expandQuery(processedQuery);
    const reference = this.parseReference(processedQuery);
    
    if (reference) {
      return { 
        source: 'quran', 
        type: 'reference',
        query: processedQuery,
        expandedTerms,
        reference
      };
    }
    
    if (processedQuery.includes('hadith') || processedQuery.includes('bukhari') || 
        processedQuery.includes('muslim') || processedQuery.includes('tirmidhi') ||
        processedQuery.includes('abu dawood') || processedQuery.includes('narrator')) {
      return { 
        source: 'hadith', 
        ...this.detectQueryType(processedQuery),
        expandedTerms
      };
    }
    
    if (processedQuery.includes('quran') || processedQuery.includes('surah') || 
        processedQuery.includes('verse') || processedQuery.includes('ayah')) {
      return { 
        source: 'quran', 
        ...this.detectQueryType(processedQuery),
        expandedTerms
      };
    }
    
    return { 
      source: 'both', 
      ...this.detectQueryType(processedQuery),
      expandedTerms
    };
  }
  
  private detectQueryType(query: string): { type: 'meaning' | 'search'; query: string } {
    if (query.includes('meaning') || query.includes('explain') || query.includes('what is') || query.includes('about')) {
      return { type: 'meaning', query };
    }
    
    return { type: 'search', query };
  }

  private calculateRelevanceScore(text: string, searchTerms: string[]): number {
    const lowerText = text.toLowerCase();
    let score = 0;
    
    searchTerms.forEach(term => {
      const termLower = term.toLowerCase();
      const regex = new RegExp(`\\b${termLower}\\b`, 'gi');
      const exactMatches = (lowerText.match(regex) || []).length;
      const partialMatches = (lowerText.match(new RegExp(termLower, 'gi')) || []).length - exactMatches;
      
      score += exactMatches * 10;
      score += partialMatches * 3;
    });
    
    return score;
  }

  private searchHadith(query: ProcessedQuery): Hadith[] {
    if (query.type === 'reference') {
      return [];
    }

    const searchTerms = query.expandedTerms.filter(term => term.length > 2);
    
    const results = this.hadithData.map(hadith => {
      const textToSearch = [
        hadith.page_content,
        hadith.category,
      ].filter(Boolean).join(' ');
      
      const score = this.calculateRelevanceScore(textToSearch, searchTerms);
      
      return {
        hadith: {
          book: hadith.category?.split(' Book')[0] || 'Hadith',
          number: hadith.number || '',
          english: hadith.page_content || '',
          category: hadith.category || '',
          reference: hadith.url || ''
        },
        score
      };
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(item => item.hadith);
    
    return results;
  }

  private searchQuran(query: ProcessedQuery): QuranVerse[] {
    if (query.type === 'reference' && query.reference) {
      const results = this.quranData.filter(verse => {
        const surahMatch = verse.surah_no === String(query.reference!.surah);
        if (query.reference!.verse) {
          return surahMatch && verse.ayah_no_surah === String(query.reference!.verse);
        }
        return surahMatch;
      }).map(verse => ({
        Surah: verse.surah_no || '',
        Verse: verse.ayah_no_surah || '',
        English: verse.ayah_en || '',
        Arabic: verse.ayah_ar || ''
      }));
      
      return results.slice(0, 10);
    }

    const searchTerms = query.expandedTerms.filter(term => term.length > 2);
    
    const results = this.quranData.map(verse => {
      const textToSearch = [
        verse.ayah_en,
        verse.surah_name_en,
      ].filter(Boolean).join(' ');
      
      const score = this.calculateRelevanceScore(textToSearch, searchTerms);
      
      return {
        verse: {
          Surah: verse.surah_no || '',
          Verse: verse.ayah_no_surah || '',
          English: verse.ayah_en || '',
          Arabic: verse.ayah_ar || ''
        },
        score
      };
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(item => item.verse);
    
    return results;
  }

  getSuggestions(): string[] {
    return [
      'Tell me about prayer',
      'What does the Quran say about patience?',
      'Hadith about charity',
      'Verses about forgiveness',
      'Surah 2:255',
      'Paradise in Islam',
      'Fasting in Ramadan',
      'Importance of knowledge'
    ];
  }

  async processQuery(query: string): Promise<SearchResult[]> {
    try {
      const processedQuery = this.preprocessQuery(query);
      let results: SearchResult[] = [];
      
      switch(processedQuery.source) {
        case 'hadith':
          results = this.searchHadith(processedQuery);
          break;
        case 'quran':
          results = this.searchQuran(processedQuery);
          break;
        case 'both':
          const quranResults = this.searchQuran(processedQuery);
          const hadithResults = this.searchHadith(processedQuery);
          results = [...quranResults, ...hadithResults];
          break;
      }

      console.log(`Found ${results.length} results for query: ${query}`);
      return results;
    } catch (error) {
      console.error('Error processing query:', error);
      throw error;
    }
  }
}

const nlpService = new NLPService();
export default nlpService;