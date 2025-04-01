import { BibleVerse, BibleChapter, getChapter as getLocalChapter } from "@/data/bible-rsv";
import { updateReadingProgress as dbUpdateReadingProgress } from "@/data/bible-database";
import { supabase } from "@/integrations/supabase/client";

// API Configuration
const API_KEY = "74ec65c32bccc3be8b1a835fc6f9e77d"; // Public API key for API.Bible
const API_URL = "https://api.scripture.api.bible/v1";
const RSV_BIBLE_ID = "ce61995b6b4d8748"; // RSV Bible ID

// Types
export interface BibleAPIBook {
  id: string;
  name: string;
  testament: "OT" | "NT";
  chapters: number;
}

export interface BibleAPIChapter {
  id: string;
  bibleId: string;
  bookId: string;
  number: string;
  content: string;
  reference: string;
}

export interface ReadingProgress {
  book: string;
  chapter: number;
  lastRead: string;
  completed: boolean;
}

export interface JournalEntry {
  book: string;
  chapter: number;
  text: string;
  lastUpdated: string;
}

// Get all books of the Bible
export const getAllBooks = async (): Promise<BibleAPIBook[]> => {
  try {
    const response = await fetch(`${API_URL}/bibles/${RSV_BIBLE_ID}/books`, {
      headers: {
        "api-key": API_KEY,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch Bible books");
    }

    const data = await response.json();
    
    // Process the data to match our format
    return data.data.map((book: any) => ({
      id: book.id,
      name: book.name,
      testament: book.testament === "OT" ? "OT" : "NT",
      chapters: book.chapters ? book.chapters.length : 0,
    }));
  } catch (error) {
    console.error("Error fetching Bible books:", error);
    
    // Fallback to the local Bible data if API fails
    return getBooksFromLocalData();
  }
};

// Get a specific chapter from the Bible API
export const getChapterFromAPI = async (
  bookId: string,
  chapterNumber: number
): Promise<BibleChapter | undefined> => {
  try {
    const response = await fetch(
      `${API_URL}/bibles/${RSV_BIBLE_ID}/chapters/${bookId}.${chapterNumber}?content-type=text&include-notes=false&include-titles=false&include-chapter-numbers=false&include-verse-numbers=true&include-verse-spans=false`,
      {
        headers: {
          "api-key": API_KEY,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch chapter");
    }

    const data = await response.json();
    const bookName = data.data.reference.split(" ")[0];
    
    // Convert HTML content to our verse format
    const verses: BibleVerse[] = [];
    const content = data.data.content;
    
    // Parse HTML content (simplified for demo)
    const verseRegex = /<span data-number="(\d+)"[^>]*>(.*?)<\/span>/g;
    let match;
    
    while ((match = verseRegex.exec(content)) !== null) {
      const verseNumber = parseInt(match[1]);
      const verseText = match[2].replace(/<[^>]*>/g, "").trim();
      
      verses.push({
        book: bookName,
        chapter: chapterNumber,
        verse: verseNumber,
        text: verseText,
      });
    }
    
    return {
      book: bookName,
      chapter: chapterNumber,
      verses,
    };
  } catch (error) {
    console.error("Error fetching chapter:", error);
    
    // Fallback to local data if API fails
    return getChapterFromLocalData(bookId, chapterNumber);
  }
};

// Fallback to local data if API fails
const getBooksFromLocalData = (): BibleAPIBook[] => {
  const books: BibleAPIBook[] = [];
  
  // Old Testament
  const oldTestament = [
    { name: "Genesis", chapters: 50 },
    { name: "Exodus", chapters: 40 },
    { name: "Leviticus", chapters: 27 },
    { name: "Numbers", chapters: 36 },
    { name: "Deuteronomy", chapters: 34 },
    // Add more Old Testament books as needed
  ];
  
  // New Testament
  const newTestament = [
    { name: "Matthew", chapters: 28 },
    { name: "Mark", chapters: 16 },
    { name: "Luke", chapters: 24 },
    { name: "John", chapters: 21 },
    { name: "Acts", chapters: 28 },
    { name: "Romans", chapters: 16 },
    // Add more New Testament books as needed
  ];
  
  // Create book objects with proper IDs
  oldTestament.forEach((book, index) => {
    books.push({
      id: `OT${index + 1}`,
      name: book.name,
      testament: "OT",
      chapters: book.chapters,
    });
  });
  
  newTestament.forEach((book, index) => {
    books.push({
      id: `NT${index + 1}`,
      name: book.name,
      testament: "NT",
      chapters: book.chapters,
    });
  });
  
  return books;
};

// Get chapter from local data (our limited dataset)
const getChapterFromLocalData = (
  bookId: string,
  chapterNumber: number
): BibleChapter | undefined => {
  // Maps book IDs to names for local fallback
  const bookIdToName: Record<string, string> = {
    "GEN": "Genesis",
    "EXO": "Exodus",
    "MAT": "Matthew",
    "MRK": "Mark",
    "LUK": "Luke",
    "JHN": "John",
    "ACT": "Acts",
    "ROM": "Romans",
    "OT1": "Genesis",
    "OT2": "Exodus",
    "NT1": "Matthew",
    "NT2": "Mark",
    "NT3": "Luke",
    "NT4": "John",
    "NT5": "Acts",
    "NT6": "Romans",
  };
  
  const bookName = bookIdToName[bookId.toUpperCase()] || bookId;
  
  // Use our local data source - use imported function instead of require
  return getLocalChapter(bookName, chapterNumber);
};

// Store reading progress in the database
export const saveReadingProgress = async (book: string, chapter: number): Promise<void> => {
  try {
    // Get user session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session || !session.user) {
      console.error("User not authenticated. Reading progress not saved.");
      return;
    }
    
    const user_id = session.user.id;
    
    // Upsert reading progress to database
    const { error } = await supabase
      .from('reading_progress')
      .upsert({
        user_id,
        book,
        chapter,
        last_read: new Date().toISOString(),
        completed: true
      }, {
        onConflict: 'user_id,book,chapter',
      });
    
    if (error) {
      console.error("Error saving reading progress:", error);
      return;
    }
    
    // Also update the weekly progress in the bible database
    dbUpdateReadingProgress(5); // Add 5% progress for each chapter read
  } catch (error) {
    console.error("Error saving reading progress:", error);
  }
};

// Get all reading progress from database
export const getAllReadingProgress = async (): Promise<ReadingProgress[]> => {
  try {
    // Get user session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session || !session.user) {
      return [];
    }
    
    // Get all reading progress for the current user
    const { data, error } = await supabase
      .from('reading_progress')
      .select('*')
      .order('last_read', { ascending: false });
    
    if (error) {
      console.error("Error fetching reading progress:", error);
      return [];
    }
    
    return data.map(item => ({
      book: item.book,
      chapter: item.chapter,
      lastRead: item.last_read,
      completed: item.completed
    }));
  } catch (error) {
    console.error("Error getting reading progress:", error);
    return [];
  }
};

// Get reading progress for a specific book from database
export const getBookReadingProgress = async (book: string): Promise<ReadingProgress[]> => {
  try {
    // Get user session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session || !session.user) {
      return [];
    }
    
    // Get reading progress for the specified book
    const { data, error } = await supabase
      .from('reading_progress')
      .select('*')
      .eq('book', book)
      .order('chapter', { ascending: true });
    
    if (error) {
      console.error("Error fetching book reading progress:", error);
      return [];
    }
    
    return data.map(item => ({
      book: item.book,
      chapter: item.chapter,
      lastRead: item.last_read,
      completed: item.completed
    }));
  } catch (error) {
    console.error("Error getting book reading progress:", error);
    return [];
  }
};

// Calculate overall Bible reading progress percentage from database
export const calculateOverallProgress = async (): Promise<number> => {
  try {
    const allProgress = await getAllReadingProgress();
    
    // Simplified calculation - in a real app would account for actual number of chapters
    // Assumes approximately 1189 chapters in the Bible (66 books)
    const totalChapters = 1189;
    const completedChapters = allProgress.filter(p => p.completed).length;
    
    return Math.round((completedChapters / totalChapters) * 100);
  } catch (error) {
    console.error("Error calculating overall progress:", error);
    return 0;
  }
};

// Calculate testament reading progress from database
export const calculateTestamentProgress = async (testament: "OT" | "NT"): Promise<number> => {
  try {
    const allProgress = await getAllReadingProgress();
    const oldTestamentBooks = ["Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy"]; // Add all OT books
    
    // Simplified check - in a real app would have complete book lists
    const isOldTestament = (book: string) => oldTestamentBooks.includes(book);
    
    const relevantProgress = allProgress.filter(p => 
      testament === "OT" ? isOldTestament(p.book) : !isOldTestament(p.book)
    );
    
    const totalChapters = testament === "OT" ? 929 : 260; // Approximate counts
    const completedChapters = relevantProgress.filter(p => p.completed).length;
    
    return Math.round((completedChapters / totalChapters) * 100);
  } catch (error) {
    console.error("Error calculating testament progress:", error);
    return 0;
  }
};

// Save journal entries for chapters to database
export const saveChapterJournal = async (book: string, chapter: number, text: string): Promise<void> => {
  try {
    // Get user session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session || !session.user) {
      console.error("User not authenticated. Journal entry not saved.");
      return;
    }
    
    const user_id = session.user.id;
    
    // Upsert journal entry to database
    const { error } = await supabase
      .from('journal_entries')
      .upsert({
        user_id,
        book,
        chapter,
        text,
        last_updated: new Date().toISOString()
      }, {
        onConflict: 'user_id,book,chapter',
      });
    
    if (error) {
      console.error("Error saving journal entry:", error);
    }
  } catch (error) {
    console.error("Error saving chapter journal:", error);
  }
};

// Get journal entry for a specific chapter from database
export const getChapterJournal = async (book: string, chapter: number): Promise<string> => {
  try {
    // Get user session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session || !session.user) {
      return "";
    }
    
    // Get journal entry for the specified chapter
    const { data, error } = await supabase
      .from('journal_entries')
      .select('text')
      .eq('book', book)
      .eq('chapter', chapter)
      .maybeSingle();
    
    if (error) {
      console.error("Error fetching journal entry:", error);
      return "";
    }
    
    return data ? data.text : "";
  } catch (error) {
    console.error("Error getting chapter journal:", error);
    return "";
  }
};

// Get all journal entries from database
export const getAllJournalEntries = async (): Promise<JournalEntry[]> => {
  try {
    // Get user session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session || !session.user) {
      return [];
    }
    
    // Get all journal entries for the current user
    const { data, error } = await supabase
      .from('journal_entries')
      .select('*')
      .order('last_updated', { ascending: false });
    
    if (error) {
      console.error("Error fetching journal entries:", error);
      return [];
    }
    
    return data.map(item => ({
      book: item.book,
      chapter: item.chapter,
      text: item.text,
      lastUpdated: item.last_updated
    }));
  } catch (error) {
    console.error("Error getting journal entries:", error);
    return [];
  }
};

// Get completed books (books with at least one chapter marked as read) from database
export const getCompletedBooks = async (): Promise<string[]> => {
  try {
    const readingProgress = await getAllReadingProgress();
    const completedBooks = new Set(readingProgress.map(progress => progress.book));
    return Array.from(completedBooks);
  } catch (error) {
    console.error("Error getting completed books:", error);
    return [];
  }
};
