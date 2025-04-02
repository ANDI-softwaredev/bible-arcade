
// Import necessary libraries
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

// API configuration
const API_BASE_URL = 'https://api.scripture.api.bible/v1';
const API_KEY = 'your-api-key-here'; // Replace with your actual API key

// Bible version IDs
export const BIBLE_VERSIONS = {
  KJV: '9879dbb7cfe39e4d-01',
  ESV: '9879dbb7cfe39e4d-02',
  NIV: '9879dbb7cfe39e4d-03',
  NLT: '9879dbb7cfe39e4d-04',
  NASB: '9879dbb7cfe39e4d-05',
};

// Default headers for API requests
const headers = {
  'api-key': API_KEY,
  'Content-Type': 'application/json',
};

// Types
export interface BibleBook {
  id: string;
  name: string;
  nameLong: string;
  chapters: number[];
  testament: 'OT' | 'NT';
}

export interface BibleChapter {
  id: string;
  bibleId: string;
  number: string;
  bookId: string;
  content: string;
  reference: string;
  verseCount: number;
  next: { id: string; bookId: string; number: string } | null;
  previous: { id: string; bookId: string; number: string } | null;
}

export interface BibleVerse {
  id: string;
  bibleId: string;
  bookId: string;
  chapterId: string;
  content: string;
  reference: string;
  verseNumber: string;
}

// Additional types needed by other components
export type BibleAPIBook = BibleBook;

export interface ReadingProgress {
  book: string;
  chapter: number;
  lastRead: string;
  completed: boolean;
}

export interface JournalEntry {
  id: string;
  book: string;
  chapter: number;
  content: string;
  lastModified: string;
}

// Get all books of the Bible
export const getBibleBooks = async (bibleId = BIBLE_VERSIONS.KJV): Promise<BibleBook[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/bibles/${bibleId}/books`, { headers });
    
    // Map the response to our BibleBook interface
    return response.data.data.map((book: any) => ({
      id: book.id,
      name: book.name,
      nameLong: book.nameLong,
      chapters: Array.from({ length: book.chapters.length }, (_, i) => i + 1),
      testament: book.id.startsWith('MAT') || 
                parseInt(book.id.replace(/[^0-9]/g, '')) >= 40 ? 'NT' : 'OT',
    }));
  } catch (error) {
    console.error('Error fetching Bible books:', error);
    throw error;
  }
};

// Get a specific chapter
export const getBibleChapter = async (
  bibleId = BIBLE_VERSIONS.KJV,
  bookId: string,
  chapterNumber: number
): Promise<BibleChapter> => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/bibles/${bibleId}/chapters/${bookId}.${chapterNumber}?content-type=text&include-notes=false&include-titles=false&include-chapter-numbers=false&include-verse-numbers=true&include-verse-spans=false`,
      { headers }
    );
    
    return {
      id: response.data.data.id,
      bibleId: response.data.data.bibleId,
      number: response.data.data.number,
      bookId: response.data.data.bookId,
      content: response.data.data.content,
      reference: response.data.data.reference,
      verseCount: response.data.data.verseCount,
      next: response.data.data.next,
      previous: response.data.data.previous,
    };
  } catch (error) {
    console.error('Error fetching Bible chapter:', error);
    throw error;
  }
};

// Get a specific verse
export const getBibleVerse = async (
  bibleId = BIBLE_VERSIONS.KJV,
  verseId: string
): Promise<BibleVerse> => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/bibles/${bibleId}/verses/${verseId}?content-type=text&include-notes=false&include-titles=false&include-chapter-numbers=false&include-verse-numbers=true&include-verse-spans=false`,
      { headers }
    );
    
    return {
      id: response.data.data.id,
      bibleId: response.data.data.bibleId,
      bookId: response.data.data.bookId,
      chapterId: response.data.data.chapterId,
      content: response.data.data.content,
      reference: response.data.data.reference,
      verseNumber: response.data.data.verseNumber,
    };
  } catch (error) {
    console.error('Error fetching Bible verse:', error);
    throw error;
  }
};

// Search the Bible
export const searchBible = async (
  bibleId = BIBLE_VERSIONS.KJV,
  query: string,
  limit = 20
): Promise<any> => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/bibles/${bibleId}/search?query=${encodeURIComponent(query)}&limit=${limit}`,
      { headers }
    );
    
    return response.data.data;
  } catch (error) {
    console.error('Error searching Bible:', error);
    throw error;
  }
};

// Get random verse
export const getRandomVerse = async (bibleId = BIBLE_VERSIONS.KJV): Promise<BibleVerse> => {
  try {
    // Get a random book
    const books = await getBibleBooks(bibleId);
    const randomBook = books[Math.floor(Math.random() * books.length)];
    
    // Get a random chapter
    const randomChapterNumber = randomBook.chapters[Math.floor(Math.random() * randomBook.chapters.length)];
    const chapter = await getBibleChapter(bibleId, randomBook.id, randomChapterNumber);
    
    // Get a random verse
    const randomVerseNumber = Math.floor(Math.random() * chapter.verseCount) + 1;
    const verseId = `${randomBook.id}.${randomChapterNumber}.${randomVerseNumber}`;
    
    return await getBibleVerse(bibleId, verseId);
  } catch (error) {
    console.error('Error getting random verse:', error);
    throw error;
  }
};

// Get daily verse (could be implemented with a more sophisticated algorithm)
export const getDailyVerse = async (bibleId = BIBLE_VERSIONS.KJV): Promise<BibleVerse> => {
  // For now, this just returns a random verse
  // In a real app, you might want to have a predefined list of verses for each day
  return await getRandomVerse(bibleId);
};

// Get verses by topic
export const getVersesByTopic = async (
  topic: string,
  bibleId = BIBLE_VERSIONS.KJV,
  limit = 10
): Promise<any> => {
  // This is a simplified implementation
  // In a real app, you might want to have a predefined list of verses for common topics
  return await searchBible(bibleId, topic, limit);
};

// Mock data for quiz results
export const getQuizResults = async () => {
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
          questionText: "Mock Question 1",
          correctAnswer: "Answer",
          book: "Genesis",
          chapter: 1,
          category: "Old Testament History",
          isCorrect: true
        }
      ]
    }
  ];
};

// Mock data for study duration
export const getStudyDuration = async () => {
  return [
    {
      duration: 30,
      timestamp: new Date().toISOString(),
      book: "Genesis",
      chapter: 1,
      score: 85 // Added for analytics
    }
  ];
};

// Get reading plan
export const getReadingPlan = async (planId: string): Promise<any> => {
  // Mock implementation
  return {
    id: planId,
    title: "Through the Bible in a Year",
    description: "Read through the entire Bible in 365 days",
    days: 365,
    readings: Array.from({ length: 365 }, (_, i) => ({
      day: i + 1,
      passages: ["GEN.1", "PSA.1", "MAT.1"].map(p => `Day ${i + 1}: ${p}`),
      completed: i < 30 // First 30 days completed
    }))
  };
};

// Mark reading as completed
export const markReadingCompleted = async (planId: string, day: number): Promise<boolean> => {
  // Mock implementation
  console.log(`Marked day ${day} of plan ${planId} as completed`);
  return true;
};

// Get user reading progress
export const getUserReadingProgress = async (): Promise<any> => {
  // Mock implementation
  return {
    currentPlan: "through-the-bible-in-a-year",
    currentDay: 30,
    streakDays: 15,
    lastReadDate: new Date().toISOString(),
    completedPlans: ["new-testament-in-90-days"]
  };
};

// Get popular passages
export const getPopularPassages = async (): Promise<any[]> => {
  // Mock implementation
  return [
    { reference: "John 3:16", count: 1240 },
    { reference: "Psalm 23", count: 890 },
    { reference: "Romans 8:28", count: 750 },
    { reference: "Philippians 4:13", count: 720 },
    { reference: "Jeremiah 29:11", count: 680 }
  ];
};

// Additional functions needed by components
export const getAllBooks = async (): Promise<BibleAPIBook[]> => {
  // Use the existing getBibleBooks function and just rename output
  return await getBibleBooks();
};

export const saveReadingProgress = async (book: string, chapter: number): Promise<boolean> => {
  // Mock implementation to save reading progress
  console.log(`Saved reading progress for ${book} ${chapter}`);
  return true;
};

export const getAllReadingProgress = async (): Promise<ReadingProgress[]> => {
  // Mock implementation
  return [
    {
      book: "Genesis",
      chapter: 1,
      lastRead: new Date().toISOString(),
      completed: true
    },
    {
      book: "Genesis",
      chapter: 2,
      lastRead: new Date().toISOString(),
      completed: true
    },
    {
      book: "Exodus",
      chapter: 1,
      lastRead: new Date().toISOString(),
      completed: true
    }
  ];
};

export const getChapterJournal = async (book: string, chapter: number): Promise<string> => {
  // Mock implementation
  return `My notes on ${book} ${chapter}. This is a great passage about...`;
};

export const saveChapterJournal = async (book: string, chapter: number, content: string): Promise<boolean> => {
  // Mock implementation
  console.log(`Saved journal for ${book} ${chapter}: ${content.substring(0, 20)}...`);
  return true;
};

export const getAllJournalEntries = async (): Promise<JournalEntry[]> => {
  // Mock implementation
  return [
    {
      id: uuidv4(),
      book: "John",
      chapter: 3,
      content: "This chapter includes the famous John 3:16 verse.",
      lastModified: new Date().toISOString()
    },
    {
      id: uuidv4(),
      book: "Psalms",
      chapter: 23,
      content: "The Lord is my shepherd...",
      lastModified: new Date().toISOString()
    }
  ];
};

export const calculateOverallProgress = async (): Promise<number> => {
  // Mock implementation - return percentage between 0-100
  return 45;
};

export const calculateTestamentProgress = async (testament: 'OT' | 'NT'): Promise<number> => {
  // Mock implementation - return percentage between 0-100
  return testament === 'OT' ? 35 : 60;
};

export const getCompletedBooks = async (): Promise<string[]> => {
  // Mock implementation
  return ["John", "Mark", "1 John", "Jude"];
};
