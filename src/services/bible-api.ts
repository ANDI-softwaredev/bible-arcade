// Import necessary libraries
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "@/integrations/supabase/client"; // Corrected import path

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
  // Mock implementation to mark reading as completed
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
  try {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.user) return false;
    
    // Save to Supabase
    const { error } = await supabase
      .from('reading_progress')
      .upsert({
        user_id: session.session.user.id,
        book,
        chapter,
        completed: true,
        last_read: new Date().toISOString()
      }, { onConflict: 'user_id, book, chapter' });
      
    if (error) throw error;
    
    // Also track the reading activity
    await trackReadingActivity(book, chapter);
    
    return true;
  } catch (error) {
    console.error(`Error saving reading progress for ${book} ${chapter}:`, error);
    return false;
  }
};

export const getAllReadingProgress = async (): Promise<ReadingProgress[]> => {
  try {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.user) return [];
    
    const { data, error } = await supabase
      .from('reading_progress')
      .select('*')
      .eq('user_id', session.session.user.id)
      .eq('completed', true);
      
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error("Error getting reading progress:", error);
    return [];
  }
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
  try {
    const chaptersRead = await getChaptersReadCount();
    // Assuming 1189 chapters in the Bible (standard count)
    return Math.round((chaptersRead / 1189) * 100);
  } catch (error) {
    console.error("Error calculating overall progress:", error);
    return 0;
  }
};

export const calculateTestamentProgress = async (testament: 'OT' | 'NT'): Promise<number> => {
  try {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.user) return 0;
    
    // Get all Bible books
    const allBooks = await getBibleBooks();
    const testamentBooks = allBooks.filter(book => book.testament === testament);
    const testamentBookNames = testamentBooks.map(book => book.name);
    
    // Get completed chapters for this testament
    const { data, error } = await supabase
      .from('reading_progress')
      .select('book, chapter')
      .eq('user_id', session.session.user.id)
      .eq('completed', true)
      .in('book', testamentBookNames);
      
    if (error) throw error;
    
    const chaptersRead = data?.length || 0;
    
    // Total chapters in OT: 929, NT: 260
    const totalChapters = testament === 'OT' ? 929 : 260;
    
    return Math.round((chaptersRead / totalChapters) * 100);
  } catch (error) {
    console.error(`Error calculating ${testament} progress:`, error);
    return testament === 'OT' ? 35 : 60; // Fallback to mock data
  }
};

export const getCompletedBooks = async (): Promise<string[]> => {
  try {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.user) return [];
    
    // Get all Bible books
    const allBooks = await getBibleBooks();
    const completedBooks: string[] = [];
    
    for (const book of allBooks) {
      // Get completed chapters for this book
      const { data, error } = await supabase
        .from('reading_progress')
        .select('chapter')
        .eq('user_id', session.session.user.id)
        .eq('book', book.name)
        .eq('completed', true);
        
      if (error) throw error;
      
      // If all chapters are completed, mark book as completed
      if (data && data.length === book.chapters.length) {
        completedBooks.push(book.name);
      }
    }
    
    return completedBooks;
  } catch (error) {
    console.error("Error getting completed books:", error);
    return ["John", "Mark", "1 John", "Jude"]; // Fallback to mock data
  }
};

// Function to track reading activity
export async function trackReadingActivity(book: string, chapter: number): Promise<void> {
  try {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.user) return;

    // Record the reading activity
    await supabase
      .from('user_reading_activity')
      .insert({
        user_id: session.session.user.id,
        book,
        chapter,
        read_at: new Date().toISOString()
      });

    // Update/Insert study streak for today
    const today = new Date().toISOString().split('T')[0];
    
    const { data: existingStreak } = await supabase
      .from('user_study_streaks')
      .select('*')
      .eq('user_id', session.session.user.id)
      .eq('streak_date', today)
      .single();
      
    if (existingStreak) {
      // Update streak count
      await supabase
        .from('user_study_streaks')
        .update({ activity_count: existingStreak.activity_count + 1 })
        .eq('id', existingStreak.id);
    } else {
      // Create new streak entry for today
      await supabase
        .from('user_study_streaks')
        .insert({
          user_id: session.session.user.id,
          streak_date: today,
          activity_count: 1
        });
    }

    console.log("Reading activity and streak recorded");
  } catch (error) {
    console.error("Error tracking reading activity:", error);
  }
}

// Get study streak (consecutive days with activity)
export async function getStudyStreak(): Promise<number> {
  try {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.user) return 0;

    // Get all streak data for the user, ordered by date descending
    const { data: streakDays, error } = await supabase
      .from('user_study_streaks')
      .select('streak_date')
      .eq('user_id', session.session.user.id)
      .order('streak_date', { ascending: false });

    if (error) {
      console.error("Error fetching streak days:", error);
      return 0;
    }

    if (!streakDays || streakDays.length === 0) return 0;

    // Convert streak dates to Date objects and sort in descending order
    const dates = streakDays
      .map(day => {
        const date = new Date(day.streak_date);
        date.setHours(0, 0, 0, 0);
        return date;
      })
      .sort((a, b) => b.getTime() - a.getTime());
    
    // Get today's date with time set to midnight
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Check if the most recent activity was today or yesterday
    const mostRecentDate = dates[0];
    const dayDiff = Math.floor((today.getTime() - mostRecentDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // If most recent activity was more than a day ago, streak is broken
    if (dayDiff > 1) return 0;
    
    // Count consecutive days (including today if present)
    let streak = 1; // Start with 1 for the most recent day
    let previousDate = mostRecentDate;
    
    for (let i = 1; i < dates.length; i++) {
      const currentDate = dates[i];
      const diffDays = Math.floor((previousDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
      
      // If dates are consecutive (difference is exactly 1 day)
      if (diffDays === 1) {
        streak++;
        previousDate = currentDate;
      } else {
        break; // Streak is broken
      }
    }
    
    console.log("Calculated streak:", streak, "days");
    return streak;
  } catch (error) {
    console.error("Error calculating study streak:", error);
    return 0;
  }
}

// Get chapters read count
export async function getChaptersReadCount(): Promise<number> {
  try {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.user) return 0;

    const { count } = await supabase
      .from('reading_progress')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', session.session.user.id)
      .eq('completed', true);

    return count || 0;
  } catch (error) {
    console.error("Error counting chapters read:", error);
    return 0;
  }
}

// Get weekly reading data for chart
export async function getWeeklyReadingData(): Promise<{ name: string; completion: number }[]> {
  try {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.user) return generateDefaultWeeklyData();

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const result = [];

    // Get data for the last 7 days
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dayOfWeek = today.getDay();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      // Get activity count for this day
      const { data: activities, error } = await supabase
        .from('user_reading_activity')
        .select('id')
        .eq('user_id', session.session.user.id)
        .gte('read_at', `${dateStr}T00:00:00Z`)
        .lt('read_at', `${dateStr}T23:59:59Z`);
      
      if (error) {
        console.error("Error fetching activities for date", dateStr, error);
        continue;
      }
        
      // Calculate completion percentage (max 100%)
      const activityCount = activities?.length || 0;
      console.log(`Activities for ${dateStr}: ${activityCount}`);
      const completion = Math.min(100, activityCount * 10);
      
      result.push({
        name: days[(dayOfWeek - i + 7) % 7],
        completion: completion
      });
    }
    
    console.log("Weekly reading data:", result);
    return result;
  } catch (error) {
    console.error("Error getting weekly reading data:", error);
    return generateDefaultWeeklyData();
  }
}

// Generate default weekly data for fallback
function generateDefaultWeeklyData(): { name: string; completion: number }[] {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date();
  const dayOfWeek = today.getDay();
  const result = [];
  
  for (let i = 6; i >= 0; i--) {
    result.push({
      name: days[(dayOfWeek - i + 7) % 7],
      completion: 0
    });
  }
  
  return result;
}

// Get reading time for the week
export async function getWeeklyReadingTime(): Promise<number> {
  try {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.user) return 0;

    // Get timeframe for the last 7 days
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    // Get count of chapters read in the last week
    const { data } = await supabase
      .from('user_reading_activity')
      .select('id')
      .eq('user_id', session.session.user.id)
      .gte('read_at', oneWeekAgo.toISOString());
    
    // Approximate reading time based on chapter count
    // Assume average of 10 minutes per chapter
    const chaptersRead = data?.length || 0;
    const readingTimeHours = (chaptersRead * 10) / 60;
    
    return parseFloat(readingTimeHours.toFixed(1));
  } catch (error) {
    console.error("Error calculating weekly reading time:", error);
    return 0;
  }
}
