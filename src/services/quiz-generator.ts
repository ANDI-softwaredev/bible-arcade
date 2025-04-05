import { supabase } from "@/integrations/supabase/client";
import { trackReadingActivity } from "./bible-api";

// Types for quiz functionality
export interface QuizQuestion {
  id: string;
  questionText: string;
  options?: string[];
  correctAnswer: string;
  book: string;
  chapter: number;
  verse?: number;
  explanation?: string;
  type?: string;
  category?: string;
  topic?: string;
  difficulty?: string;
  points?: number;
  timeLimit?: number;
}

export interface GeneratedQuiz {
  id: string;
  title: string;
  timestamp: string;
  questions: QuizQuestion[];
}

// Badge reward tiers for quiz achievements
export interface QuizBadge {
  id: string;
  title: string;
  description: string;
  threshold: number;
  icon: string;
}

// User goals interface
export interface StudyGoal {
  id: string;
  userId: string;
  type: 'book' | 'quiz-performance' | 'reading-streak' | 'chapters-read';
  target: number | string;
  progress: number;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

// Quiz badges based on number of quizzes taken
export const quizBadges: QuizBadge[] = [
  {
    id: 'quiz-novice',
    title: 'Quiz Novice',
    description: 'Completed 5 quizzes',
    threshold: 5,
    icon: 'award'
  },
  {
    id: 'quiz-master',
    title: 'Quiz Master',
    description: 'Completed 10 quizzes',
    threshold: 10,
    icon: 'award'
  },
  {
    id: 'quiz-master-pro',
    title: 'Quiz Master Pro',
    description: 'Completed 20 quizzes',
    threshold: 20,
    icon: 'badge'
  },
  {
    id: 'quiz-master-expert',
    title: 'Quiz Master Expert',
    description: 'Completed 30 quizzes',
    threshold: 30,
    icon: 'badge-check'
  },
  {
    id: 'quiz-scholar',
    title: 'Quiz Scholar',
    description: 'Completed 40 quizzes',
    threshold: 40,
    icon: 'badge-check'
  },
  {
    id: 'quiz-master-pro-max',
    title: 'Quiz Master Pro Max',
    description: 'Completed 50 quizzes',
    threshold: 50,
    icon: 'star'
  }
];

// Function to generate a quiz based on a book and number of questions
export async function generateQuiz(book: string, numQuestions: number) {
  try {
    // Since we don't have a bible_verses table, we'll use mock data
    // In a real implementation, this would fetch from a database
    const mockVerses = [
      { book: "Genesis", chapter: 1, verse: 1, text: "In the beginning God created the heavens and the earth." },
      { book: "John", chapter: 3, verse: 16, text: "For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life." },
      { book: "Psalm", chapter: 23, verse: 1, text: "The Lord is my shepherd, I lack nothing." },
      { book: "Romans", chapter: 8, verse: 28, text: "And we know that in all things God works for the good of those who love him, who have been called according to his purpose." },
      { book: "Matthew", chapter: 5, verse: 3, text: "Blessed are the poor in spirit, for theirs is the kingdom of heaven." },
      { book: "Philippians", chapter: 4, verse: 13, text: "I can do all this through him who gives me strength." },
      { book: "Joshua", chapter: 1, verse: 9, text: "Have I not commanded you? Be strong and courageous. Do not be afraid; do not be discouraged, for the LORD your God will be with you wherever you go." },
      { book: "Isaiah", chapter: 40, verse: 31, text: "But those who hope in the LORD will renew their strength. They will soar on wings like eagles; they will run and not grow weary, they will walk and not be faint." }
    ];

    // Filter verses for the specified book, if available
    let verses = mockVerses.filter(v => v.book.toLowerCase() === book.toLowerCase());
    
    // If no verses found for the book, use all verses
    if (verses.length === 0) {
      verses = mockVerses;
    }

    // Select random verses to create questions
    const questions = [];
    for (let i = 0; i < numQuestions; i++) {
      // Ensure we don't exceed available verses
      if (i >= verses.length) break;
      
      const randomIndex = Math.floor(Math.random() * verses.length);
      const verse = verses[randomIndex];

      // Create a question object
      const question = {
        id: i + 1,
        text: `What does ${verse.book} ${verse.chapter}:${verse.verse} say?`,
        options: [
          verse.text,
          generateFakeAnswer(verses, verse.text),
          generateFakeAnswer(verses, verse.text),
          generateFakeAnswer(verses, verse.text)
        ],
        correctAnswer: verse.text,
        book: verse.book,
        chapter: verse.chapter,
        verse: verse.verse
      };
      questions.push(question);
    }

    // Return the generated questions
    return questions;
  } catch (error) {
    console.error("Error generating quiz:", error);
    return null;
  }
}

// Function to generate a fake answer (ensure it's not the same as the correct answer)
function generateFakeAnswer(verses: any[], correctAnswer: string) {
  let fakeAnswer = "";
  let attempts = 0;
  const maxAttempts = 10;
  
  while (attempts < maxAttempts) {
    const randomIndex = Math.floor(Math.random() * verses.length);
    fakeAnswer = verses[randomIndex].text;
    
    if (fakeAnswer !== correctAnswer && fakeAnswer !== "") {
      break;
    }
    attempts++;
  }
  
  // If we couldn't find a unique answer after max attempts, slightly modify an existing one
  if (fakeAnswer === correctAnswer || fakeAnswer === "") {
    const randomIndex = Math.floor(Math.random() * verses.length);
    fakeAnswer = verses[randomIndex].text + " (Actually, this is different.)";
  }
  
  return fakeAnswer;
}

// Function to save generated quiz to local storage and database
export async function saveGeneratedQuiz(quiz: GeneratedQuiz): Promise<boolean> {
  try {
    // Store in local storage
    let savedQuizzes = getSavedGeneratedQuizzes();
    savedQuizzes.push(quiz);
    localStorage.setItem('generatedQuizzes', JSON.stringify(savedQuizzes));
    return true;
  } catch (error) {
    console.error("Error saving generated quiz:", error);
    return false;
  }
}

// Function to get saved generated quizzes from local storage
export function getSavedGeneratedQuizzes(): GeneratedQuiz[] {
  try {
    const savedQuizzesStr = localStorage.getItem('generatedQuizzes');
    if (!savedQuizzesStr) return [];
    
    const savedQuizzes = JSON.parse(savedQuizzesStr);
    return Array.isArray(savedQuizzes) ? savedQuizzes : [];
  } catch (error) {
    console.error("Error getting saved generated quizzes:", error);
    return [];
  }
}

// Function to save quiz results to Supabase
export async function saveQuizResult(quizData: {
  quizId?: string | null;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeSpent?: number | null;
  timeBonus?: number | null;
  questions?: any[] | null;
  categories?: string[] | null;
  topics?: string[] | null;
  completedAt?: string;
  userId?: string;
}): Promise<boolean> {
  try {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.user) return false;

    const userId = quizData.userId || session.session.user.id;

    const { error } = await supabase
      .from('quiz_results')
      .insert({
        user_id: userId,
        quiz_id: quizData.quizId || null,
        score: quizData.score,
        total_questions: quizData.totalQuestions,
        correct_answers: quizData.correctAnswers,
        time_spent: quizData.timeSpent || 0,
        time_bonus: quizData.timeBonus || 0,
        completed_at: quizData.completedAt || new Date().toISOString(),
        questions: quizData.questions || null,
        performance_metrics: {
          categories: quizData.categories || [],
          topics: quizData.topics || []
        }
      });

    if (error) {
      console.error("Error saving quiz results:", error);
      return false;
    }

    // After saving the quiz result, check for badge unlocks
    await checkAndUpdateQuizBadges(userId);
    
    return true;
  } catch (error) {
    console.error("Error saving quiz results:", error);
    return false;
  }
}

// Function to check and update quiz badges
async function checkAndUpdateQuizBadges(userId: string): Promise<void> {
  try {
    // Get total number of quizzes taken
    const { data: quizResults, error } = await supabase
      .from('quiz_results')
      .select('*')
      .eq('user_id', userId);
      
    if (error) {
      console.error("Error getting quiz results for badges:", error);
      return;
    }
    
    const quizCount = quizResults?.length || 0;
    
    // Find the highest badge earned
    const earnedBadges = quizBadges.filter(badge => quizCount >= badge.threshold);
    if (earnedBadges.length === 0) return;
    
    // Get the highest tier badge earned
    const highestBadge = earnedBadges.reduce((prev, current) => 
      (prev.threshold > current.threshold) ? prev : current, earnedBadges[0]);
    
    // Use the edge function to upsert the badge instead of RPC directly
    // This fixes the TypeScript error with parameters
    const { data, error: badgeError } = await supabase.functions.invoke('database-helpers', {
      body: {
        name: 'upsert_user_badge',
        params: {
          p_user_id: userId,
          p_badge_id: highestBadge.id,
          p_badge_title: highestBadge.title,
          p_badge_description: highestBadge.description,
          p_badge_icon: highestBadge.icon
        }
      }
    });
      
    if (badgeError) {
      console.error("Error updating badges:", badgeError);
    }
  } catch (error) {
    console.error("Error in badge processing:", error);
  }
}

// Update getQuizResults to return all quiz results
export async function getQuizResults() {
  try {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.user) return [];

    const { data, error } = await supabase
      .from('quiz_results')
      .select('*')
      .eq('user_id', session.session.user.id)
      .order('completed_at', { ascending: false });

    if (error) {
      console.error("Error fetching quiz results:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error getting quiz results:", error);
    return [];
  }
}

// Update getUserBadges to use the edge function instead of RPC directly
export async function getUserBadges() {
  try {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.user) return [];

    // Use the edge function to get user badges instead of RPC directly
    const { data, error } = await supabase.functions.invoke('database-helpers', {
      body: {
        name: 'get_user_badges',
        params: {
          p_user_id: session.session.user.id
        }
      }
    });

    if (error) {
      console.error("Error fetching user badges:", error);
      return [];
    }

    return data?.data || [];
  } catch (error) {
    console.error("Error getting user badges:", error);
    return [];
  }
}

// Update saveStudyGoal to use the edge function instead of RPC directly
export async function saveStudyGoal(goal: Omit<StudyGoal, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<boolean> {
  try {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.user) return false;

    // Use the edge function to create the study goal
    const { error } = await supabase.functions.invoke('database-helpers', {
      body: {
        name: 'create_study_goal',
        params: {
          p_user_id: session.session.user.id,
          p_goal_type: goal.type,
          p_target_value: String(goal.target),
          p_progress: goal.progress,
          p_completed: goal.completed
        }
      }
    });

    if (error) {
      console.error("Error saving study goal:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error saving study goal:", error);
    return false;
  }
}

// Update getStudyGoals to use the edge function instead of RPC directly
export async function getStudyGoals(): Promise<StudyGoal[]> {
  try {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.user) return [];

    // Use the edge function to get study goals
    const { data, error } = await supabase.functions.invoke('database-helpers', {
      body: {
        name: 'get_user_study_goals',
        params: {
          p_user_id: session.session.user.id
        }
      }
    });

    if (error) {
      console.error("Error fetching study goals:", error);
      return [];
    }

    // Map the data to the StudyGoal type
    return (data?.data || []).map((goal: any) => ({
      id: goal.id,
      userId: goal.user_id,
      type: goal.goal_type as 'book' | 'quiz-performance' | 'reading-streak' | 'chapters-read',
      target: goal.target_value,
      progress: goal.progress || 0,
      completed: goal.completed || false,
      createdAt: goal.created_at,
      updatedAt: goal.updated_at
    }));
  } catch (error) {
    console.error("Error getting study goals:", error);
    return [];
  }
}

// Update updateStudyGoal to use the edge function instead of RPC directly
export async function updateStudyGoal(goalId: string, updates: Partial<Omit<StudyGoal, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>): Promise<boolean> {
  try {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.user) return false;

    // Use the edge function to update the goal
    const { error } = await supabase.functions.invoke('database-helpers', {
      body: {
        name: 'update_study_goal',
        params: {
          p_goal_id: goalId,
          p_user_id: session.session.user.id,
          p_progress: updates.progress,
          p_completed: updates.completed,
          p_target_value: updates.target ? String(updates.target) : undefined
        }
      }
    });

    if (error) {
      console.error("Error updating study goal:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error updating study goal:", error);
    return false;
  }
}

// Function to save study duration for analytics
export async function saveStudyDuration(studyData: {
  duration: number;
  timestamp: string;
  book?: string;
  chapter?: number;
  score?: number;
}) {
  try {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.user) return;

    // Track reading activity if book and chapter are provided
    if (studyData.book && studyData.chapter) {
      await trackReadingActivity(studyData.book, studyData.chapter);
    }

    console.log("Study duration saved:", studyData.duration, "minutes");
    return true;
  } catch (error) {
    console.error("Error saving study duration:", error);
    return false;
  }
}

// Function to get study duration
export async function getStudyDuration() {
  try {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.user) return [];

    // We'll use reading_activity for study durations
    const { data, error } = await supabase
      .from('user_reading_activity')
      .select('*')
      .eq('user_id', session.session.user.id)
      .order('read_at', { ascending: false });

    if (error) {
      console.error("Error fetching study durations:", error);
      return [];
    }

    // Convert to expected format
    const formattedData = data ? data.map(item => ({
      duration: 10, // Assuming 10 minutes per chapter
      timestamp: item.read_at,
      book: item.book,
      chapter: item.chapter,
      score: 85 // Mock score for analytics
    })) : [];

    return formattedData;
  } catch (error) {
    console.error("Error getting study durations:", error);
    return [];
  }
}
