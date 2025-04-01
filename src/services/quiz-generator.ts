import { v4 as uuidv4 } from 'uuid';
import { supabase } from "@/integrations/supabase/client";

export interface QuizQuestion {
  id: string;
  questionText: string;
  options?: string[];
  correctAnswer: string;
  explanation?: string;
}

export interface GeneratedQuiz {
  id: string;
  title: string;
  questions: QuizQuestion[];
  timestamp: string;
}

export interface QuizResult {
  quizId: string;
  score: number;
  timeSpent: number;
  correctAnswers: number;
  totalQuestions: number;
  timeBonus: number;
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
    return {
      id: uuidv4(),
      title: params.title,
      questions: quiz.questions,
      timestamp: new Date().toISOString(),
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

    await supabase
      .from("generated_quizzes")
      .insert({
        user_id: user.id,
        title: quiz.title,
        questions: quiz.questions,
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
      .from("generated_quizzes")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    
    if (!data) return [];

    // Map to our GeneratedQuiz interface
    return data.map(item => ({
      id: item.id,
      title: item.title,
      questions: item.questions,
      timestamp: item.created_at
    }));
  } catch (error) {
    console.error("Error getting saved quizzes:", error);
    return [];
  }
};

export interface QuizResult {
  quizId: string;
  score: number;
  timeSpent: number;
  correctAnswers: number;
  totalQuestions: number;
  timeBonus: number;
}

export const saveQuizResult = async (result: QuizResult): Promise<void> => {
  try {
    const { data: session } = await supabase.auth.getSession();
    const user = session?.session?.user;

    if (!user) {
      // Skip saving quiz results if not authenticated
      return;
    }

    await supabase
      .from("quiz_results")
      .insert({
        user_id: user.id,
        quiz_id: result.quizId,
        score: result.score,
        time_spent: result.timeSpent,
        correct_answers: result.correctAnswers,
        total_questions: result.totalQuestions,
        time_bonus: result.timeBonus
      });
  } catch (error) {
    console.error("Error saving quiz result:", error);
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
