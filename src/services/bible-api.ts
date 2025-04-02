import { BibleVerse, BibleChapter, getChapter as getLocalChapter } from "@/data/bible-rsv";
import { updateReadingProgress as dbUpdateReadingProgress } from "@/data/bible-database";
import { supabase } from "@/integrations/supabase/client";
import { QuizResult, StudySession } from "@/services/quiz-generator";

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

// Store reading progress in database
export const saveReadingProgress = async (book: string, chapter: number): Promise<void> => {
  try {
    const { data: session } = await supabase.auth.getSession();
    const user = session?.session?.user;

    if (!user) {
      // Fallback to localStorage if not authenticated
      const progressDataStr = localStorage.getItem("bible-reading-progress");
      const progressData: ReadingProgress[] = progressDataStr
        ? JSON.parse(progressDataStr)
        : [];
      
      // Check if this chapter is already in the progress
      const existingProgressIndex = progressData.findIndex(
        (p) => p.book === book && p.chapter === chapter
      );
      
      const now = new Date().toISOString();
      
      if (existingProgressIndex >= 0) {
        // Update existing entry
        progressData[existingProgressIndex] = {
          ...progressData[existingProgressIndex],
          lastRead: now,
          completed: true,
        };
      } else {
        // Add new entry
        progressData.push({
          book,
          chapter,
          lastRead: now,
          completed: true,
        });
      }
      
      // Save updated progress
      localStorage.setItem(
        "bible-reading-progress",
        JSON.stringify(progressData)
      );
      
      // Also update the weekly progress in the bible database
      dbUpdateReadingProgress(5); // Add 5% progress for each chapter read
      return;
    }

    // Check if this chapter is already in the progress
    const { data: existingProgress } = await supabase
      .from('reading_progress')
      .select("*")
      .eq("user_id", user.id)
      .eq("book", book)
      .eq("chapter", chapter)
      .maybeSingle();

    if (existingProgress) {
      // Update existing entry
      await supabase
        .from('reading_progress')
        .update({
          last_read: new Date().toISOString(),
          completed: true
        })
        .eq("id", existingProgress.id);
    } else {
      // Add new entry
      await supabase.from('reading_progress').insert({
        user_id: user.id,
        book,
        chapter,
        last_read: new Date().toISOString(),
        completed: true
      });
    }
    
    // Also update the weekly progress in the bible database
    dbUpdateReadingProgress(5); // Add 5% progress for each chapter read
  } catch (error) {
    console.error("Error saving reading progress:", error);
  }
};

// Get all reading progress
export const getAllReadingProgress = async (): Promise<ReadingProgress[]> => {
  try {
    const { data: session } = await supabase.auth.getSession();
    const user = session?.session?.user;

    if (!user) {
      // Fallback to localStorage if not authenticated
      const progressDataStr = localStorage.getItem("bible-reading-progress");
      return progressDataStr ? JSON.parse(progressDataStr) : [];
    }

    const { data } = await supabase
      .from('reading_progress')
      .select("*")
      .eq("user_id", user.id);

    if (!data) return [];

    // Map to our ReadingProgress interface
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

// Get reading progress for a specific book
export const getBookReadingProgress = async (book: string): Promise<ReadingProgress[]> => {
  try {
    const allProgress = await getAllReadingProgress();
    return allProgress.filter((progress) => progress.book === book);
  } catch (error) {
    console.error("Error getting book reading progress:", error);
    return [];
  }
};

// Calculate overall Bible reading progress percentage
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

// Calculate testament reading progress
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

// Save journal entries for chapters
export const saveChapterJournal = async (book: string, chapter: number, text: string): Promise<void> => {
  try {
    const { data: session } = await supabase.auth.getSession();
    const user = session?.session?.user;

    if (!user) {
      // Fallback to localStorage if not authenticated
      const journalDataStr = localStorage.getItem("bible-chapter-journals");
      const journalData: JournalEntry[] = journalDataStr
        ? JSON.parse(journalDataStr)
        : [];
      
      // Check if this chapter already has a journal
      const existingJournalIndex = journalData.findIndex(
        (j) => j.book === book && j.chapter === chapter
      );
      
      const now = new Date().toISOString();
      
      if (existingJournalIndex >= 0) {
        // Update existing entry
        journalData[existingJournalIndex] = {
          ...journalData[existingJournalIndex],
          text,
          lastUpdated: now,
        };
      } else {
        // Add new entry
        journalData.push({
          book,
          chapter,
          text,
          lastUpdated: now,
        });
      }
      
      // Save updated journals
      localStorage.setItem(
        "bible-chapter-journals",
        JSON.stringify(journalData)
      );
      return;
    }

    // Check if this chapter already has a journal entry
    const { data: existingJournal } = await supabase
      .from('journal_entries')
      .select("*")
      .eq("user_id", user.id)
      .eq("book", book)
      .eq("chapter", chapter)
      .maybeSingle();
    
    if (existingJournal) {
      // Update existing entry
      await supabase
        .from('journal_entries')
        .update({
          text,
          last_updated: new Date().toISOString()
        })
        .eq("id", existingJournal.id);
    } else {
      // Add new entry
      await supabase
        .from('journal_entries')
        .insert({
          user_id: user.id,
          book,
          chapter,
          text,
          last_updated: new Date().toISOString()
        });
    }
  } catch (error) {
    console.error("Error saving chapter journal:", error);
  }
};

// Get journal entry for a specific chapter
export const getChapterJournal = async (book: string, chapter: number): Promise<string> => {
  try {
    const { data: session } = await supabase.auth.getSession();
    const user = session?.session?.user;

    if (!user) {
      // Fallback to localStorage if not authenticated
      const journalDataStr = localStorage.getItem("bible-chapter-journals");
      if (!journalDataStr) return "";
      
      const journalData: JournalEntry[] = JSON.parse(journalDataStr);
      const entry = journalData.find(j => j.book === book && j.chapter === chapter);
      
      return entry ? entry.text : "";
    }

    const { data } = await supabase
      .from('journal_entries')
      .select("text")
      .eq("user_id", user.id)
      .eq("book", book)
      .eq("chapter", chapter)
      .maybeSingle();
    
    return data?.text || "";
  } catch (error) {
    console.error("Error getting chapter journal:", error);
    return "";
  }
};

// Get all journal entries
export const getAllJournalEntries = async (): Promise<JournalEntry[]> => {
  try {
    const { data: session } = await supabase.auth.getSession();
    const user = session?.session?.user;

    if (!user) {
      // Fallback to localStorage if not authenticated
      const journalDataStr = localStorage.getItem("bible-chapter-journals");
      return journalDataStr ? JSON.parse(journalDataStr) : [];
    }

    const { data } = await supabase
      .from('journal_entries')
      .select("*")
      .eq("user_id", user.id);
    
    if (!data) return [];

    // Map to our JournalEntry interface
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

// Get completed books (books with at least one chapter marked as read)
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

// Get quiz results
export const getQuizResults = async (): Promise<QuizResult[]> => {
  try {
    const { data: session } = await supabase.auth.getSession();
    const user = session?.session?.user;

    if (!user) {
      // Return example data if not authenticated
      return [
        {
          quizId: "mock-1",
          score: 85,
          timeSpent: 300,
          correctAnswers: 17,
          totalQuestions: 20,
          timeBonus: 15,
          completedAt: new Date().toISOString(),
          questions: [
            {
              id: "q1",
              questionText: "Who was the first person created according to Genesis?",
              correctAnswer: "Adam",
              book: "Genesis",
              chapter: 1,
              category: "Old Testament History",
              isCorrect: true
            }
          ]
        }
      ];
    }

    // Get quiz results from supabase
    const { data } = await supabase
      .from('quiz_results')
      .select("*")
      .eq("user_id", user.id)
      .order("completed_at", { ascending: false });
    
    if (!data) return [];

    // Map database results to QuizResult interface
    return data.map(item => ({
      quizId: item.quiz_id,
      score: item.score,
      timeSpent: item.time_spent,
      correctAnswers: item.correct_answers,
      totalQuestions: item.total_questions,
      timeBonus: item.time_bonus,
      completedAt: item.completed_at,
      questions: item.questions || [] // Handle potentially missing questions
    }));
  } catch (error) {
    console.error("Error getting quiz results:", error);
    return [];
  }
};

// Get study duration data
export const getStudyDuration = async (): Promise<StudySession[]> => {
  try {
    const { data: session } = await supabase.auth.getSession();
    const user = session?.session?.user;

    if (!user) {
      // Return from localStorage if not authenticated
      const existingSessions = localStorage.getItem('study-sessions');
      return existingSessions ? JSON.parse(existingSessions) : [];
    }

    // For now, return from localStorage (would need a proper table setup)
    const existingSessions = localStorage.getItem('study-sessions');
    const sessions = existingSessions ? JSON.parse(existingSessions) : [];
    
    return sessions.map((session: any) => ({
      duration: session.duration || 0,
      timestamp: session.timestamp || new Date().toISOString(),
      book: session.book,
      chapter: session.chapter,
      score: session.score
    }));
  } catch (error) {
    console.error("Error getting study sessions:", error);
    return [];
  }
};
