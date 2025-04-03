
import { v4 as uuidv4 } from 'uuid';
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";

export interface QuizQuestion {
  id: string;
  questionText: string;
  options?: string[];
  correctAnswer: string;
  explanation?: string;
  timeLimit?: number; // Time limit in seconds
  points?: number; // Points for this question
  difficultyLevel?: string; // Difficulty level
  book?: string; // Bible book this question relates to
  chapter?: number; // Chapter this question relates to
  verse?: number; // Verse this question relates to (optional)
  category?: string; // Question category (e.g., "Old Testament History", "Gospel", "Epistles")
  topic?: string; // Specific topic (e.g., "Creation", "Sermon on the Mount")
  isCorrect?: boolean; // Was this question answered correctly
}

export interface GeneratedQuiz {
  id: string;
  title: string;
  questions: QuizQuestion[];
  timestamp: string;
  categories?: string[]; // Categories covered in this quiz
  topics?: string[]; // Topics covered in this quiz
  difficultyLevels?: string[]; // Difficulty levels in this quiz
}

export interface QuizResult {
  quizId: string;
  score: number;
  timeSpent: number;
  correctAnswers: number;
  totalQuestions: number;
  timeBonus: number;
  questions?: QuizQuestion[]; // Detailed question results including whether they were correct
  categories?: string[]; // Categories covered in this quiz
  topics?: string[]; // Topics covered in this quiz
  completedAt?: string; // When the quiz was completed
}

export interface StudySession {
  duration: number; // in minutes
  timestamp: string;
  book?: string;
  chapter?: number;
  score?: number; // If associated with a quiz
}

// Function to extract text from a PDF file
export const extractPdfText = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async function (event) {
      try {
        // Dynamically import pdfjsLib
        const pdfjsLib = await import('pdfjs-dist');
        pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;
        
        const typedArray = new Uint8Array(event.target?.result as ArrayBuffer);
        const pdf = await pdfjsLib.getDocument(typedArray).promise;
        let text = "";
        
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          const pageText = content.items.map(item => (item as any).str).join(" ");
          text += pageText + "\n";
        }
        
        resolve(text);
      } catch (error) {
        console.error("Error extracting text from PDF:", error);
        reject(error);
      }
    };
    
    reader.onerror = (error) => {
      console.error("Error reading PDF file:", error);
      reject(error);
    };
    
    reader.readAsArrayBuffer(file);
  });
};

// Function to generate a quiz using AI
export const generateAIQuiz = async (params: {
  content: string;
  title: string;
  numQuestions: number;
  quizType: "multiple-choice" | "true-false" | "fill-in-blanks";
  timed?: boolean; // Option for timed quiz
  difficultyDistribution?: boolean; // Option to distribute questions by difficulty
}): Promise<GeneratedQuiz> => {
  try {
    const response = await fetch("/api/generate-quiz", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error(`Failed to generate quiz: ${response.statusText}`);
    }

    const quiz = await response.json();
    
    // If timed option is set, assign time limits and points based on difficulty
    if (params.timed && quiz.questions) {
      quiz.questions = quiz.questions.map((question: QuizQuestion) => {
        const difficultyLevel = question.difficultyLevel || 'easy-to-go';
        
        // Assign time limits and points based on difficulty
        let timeLimit = 5; // default
        let points = 5; // default
        
        switch (difficultyLevel) {
          case 'easy-to-go':
            timeLimit = 5;
            points = 5;
            break;
          case 'minimum-thinking':
            timeLimit = 7;
            points = 10;
            break;
          case 'maximum-thinking':
            timeLimit = 10;
            points = 15;
            break;
          case 'crack-my-head':
            timeLimit = 15;
            points = 20;
            break;
          case 'granite-hard':
            timeLimit = 20;
            points = 25;
            break;
        }
        
        return {
          ...question,
          timeLimit,
          points
        };
      });
    }

    // Extract categories and topics
    const categories = new Set<string>();
    const topics = new Set<string>();
    const difficultyLevels = new Set<string>();
    
    quiz.questions.forEach((q: QuizQuestion) => {
      if (q.category) categories.add(q.category);
      if (q.topic) topics.add(q.topic);
      if (q.difficultyLevel) difficultyLevels.add(q.difficultyLevel);
    });
    
    return {
      id: uuidv4(),
      title: params.title,
      questions: quiz.questions,
      timestamp: new Date().toISOString(),
      categories: Array.from(categories),
      topics: Array.from(topics),
      difficultyLevels: Array.from(difficultyLevels)
    };
  } catch (error) {
    console.error("Error generating quiz:", error);
    throw error;
  }
};

export const saveGeneratedQuiz = async (quiz: GeneratedQuiz): Promise<void> => {
  try {
    const { data: session } = await supabase.auth.getSession();
    const user = session?.session?.user;

    if (!user) {
      // Fallback to localStorage if not authenticated
      const existingQuizzes = localStorage.getItem('generated-quizzes');
      const quizzes: GeneratedQuiz[] = existingQuizzes ? JSON.parse(existingQuizzes) : [];
      quizzes.push(quiz);
      localStorage.setItem('generated-quizzes', JSON.stringify(quizzes));
      return;
    }

    // Convert QuizQuestion[] to Json type by using JSON.stringify and then parsing
    const jsonQuestions = JSON.parse(JSON.stringify(quiz.questions)) as Json;
    
    // Use generated_quizzes table for TypeScript compatibility
    await supabase
      .from('generated_quizzes')
      .insert({
        user_id: user.id,
        title: quiz.title,
        questions: jsonQuestions,
        created_at: quiz.timestamp
      });
  } catch (error) {
    console.error("Error saving generated quiz:", error);
  }
};

export const getSavedGeneratedQuizzes = async (): Promise<GeneratedQuiz[]> => {
  try {
    const { data: session } = await supabase.auth.getSession();
    const user = session?.session?.user;

    if (!user) {
      // Fallback to localStorage if not authenticated
      const existingQuizzes = localStorage.getItem('generated-quizzes');
      return existingQuizzes ? JSON.parse(existingQuizzes) : [];
    }

    const { data } = await supabase
      .from('generated_quizzes')
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    
    if (!data) return [];

    // Safely convert data from Json to QuizQuestion[]
    return data.map(item => ({
      id: item.id,
      title: item.title,
      questions: item.questions as unknown as QuizQuestion[],
      timestamp: item.created_at
    }));
  } catch (error) {
    console.error("Error getting saved quizzes:", error);
    return [];
  }
};

export const saveQuizResult = async (result: QuizResult): Promise<void> => {
  try {
    const { data: session } = await supabase.auth.getSession();
    const user = session?.session?.user;

    if (!user) {
      // Skip saving quiz results if not authenticated
      return;
    }

    // Add timestamp if not provided
    if (!result.completedAt) {
      result.completedAt = new Date().toISOString();
    }
    
    // Convert question results to Json
    const jsonQuestions = result.questions ? 
      JSON.parse(JSON.stringify(result.questions)) as Json : 
      null;

    await supabase
      .from('quiz_results')
      .insert({
        user_id: user.id,
        quiz_id: result.quizId,
        score: result.score,
        time_spent: result.timeSpent,
        correct_answers: result.correctAnswers,
        total_questions: result.totalQuestions,
        time_bonus: result.timeBonus,
        completed_at: result.completedAt,
        questions: jsonQuestions
      });
  } catch (error) {
    console.error("Error saving quiz result:", error);
  }
};

// Get all quiz results for the current user
export const getQuizResults = async (): Promise<QuizResult[]> => {
  try {
    const { data: session } = await supabase.auth.getSession();
    const user = session?.session?.user;

    if (!user) {
      // Return mock data if not authenticated
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
    }

    const { data } = await supabase
      .from('quiz_results')
      .select("*")
      .eq("user_id", user.id)
      .order("completed_at", { ascending: false });
    
    if (!data) return [];

    // Map data to QuizResult, handling potentially missing properties
    return data.map(item => ({
      quizId: item.quiz_id,
      score: item.score,
      timeSpent: item.time_spent,
      correctAnswers: item.correct_answers,
      totalQuestions: item.total_questions,
      timeBonus: item.time_bonus || 0,
      completedAt: item.completed_at,
      questions: [] // Default to empty array if questions property doesn't exist
    }));
  } catch (error) {
    console.error("Error getting quiz results:", error);
    return [];
  }
};

// Save study duration data
export const saveStudyDuration = async (session: StudySession): Promise<void> => {
  try {
    const { data: authSession } = await supabase.auth.getSession();
    const user = authSession?.session?.user;

    if (!user) {
      // Skip saving if not authenticated
      return;
    }

    // Save to local storage for now (would need a new table to store properly)
    const existingSessions = localStorage.getItem('study-sessions');
    const sessions: StudySession[] = existingSessions ? JSON.parse(existingSessions) : [];
    sessions.push({
      ...session,
      timestamp: session.timestamp || new Date().toISOString()
    });
    localStorage.setItem('study-sessions', JSON.stringify(sessions));
  } catch (error) {
    console.error("Error saving study duration:", error);
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
    return existingSessions ? JSON.parse(existingSessions) : [];
  } catch (error) {
    console.error("Error getting study sessions:", error);
    return [];
  }
};

export const analyzeTextForQuiz = async (text: string): Promise<string[]> => {
  try {
    const response = await fetch("/api/analyze-text", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      throw new Error(`Failed to analyze text: ${response.statusText}`);
    }

    const data = await response.json();
    return data.keywords || [];
  } catch (error) {
    console.error("Error analyzing text:", error);
    return [];
  }
};
