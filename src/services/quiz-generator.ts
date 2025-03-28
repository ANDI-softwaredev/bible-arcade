
import { updateReadingProgress } from "@/data/bible-database";

// Define quiz generation types
export interface QuizGenerationRequest {
  content: string;
  title: string;
  numQuestions: number;
  quizType: "multiple-choice" | "true-false" | "fill-in-blanks";
}

export interface GeneratedQuestion {
  id: string;
  questionText: string;
  options?: string[];
  correctAnswer: string;
  type: string;
  explanation?: string;
}

export interface GeneratedQuiz {
  title: string;
  questions: GeneratedQuestion[];
  timestamp: number;
}

// Timed quiz interface for time-based scoring
export interface TimedQuizResult {
  score: number;
  timeSpent: number; // in seconds
  correctAnswers: number;
  totalQuestions: number;
  timeBonus: number;
}

// Mock AI quiz generation (in a real app, this would call an AI API like OpenAI)
export const generateAIQuiz = async (params: QuizGenerationRequest): Promise<GeneratedQuiz> => {
  // Simulate API call with timeout
  return new Promise((resolve) => {
    setTimeout(() => {
      // Mock generated quiz
      const questions: GeneratedQuestion[] = [];
      
      for (let i = 0; i < params.numQuestions; i++) {
        const questionNumber = i + 1;
        
        if (params.quizType === "multiple-choice") {
          questions.push({
            id: `q${i}`,
            questionText: `Question ${questionNumber} about "${truncateText(params.title)}"?`,
            options: [
              `Answer option A for question ${questionNumber}`,
              `Answer option B for question ${questionNumber}`,
              `Answer option C for question ${questionNumber}`,
              `Answer option D for question ${questionNumber}`
            ],
            correctAnswer: `Answer option ${['A', 'B', 'C', 'D'][Math.floor(Math.random() * 4)]} for question ${questionNumber}`,
            type: "multiple-choice",
            explanation: `This is the explanation for question ${questionNumber}.`
          });
        } else if (params.quizType === "true-false") {
          const isTrue = Math.random() > 0.5;
          questions.push({
            id: `q${i}`,
            questionText: `True or False: Statement ${questionNumber} about "${truncateText(params.title)}"`,
            options: ["True", "False"],
            correctAnswer: isTrue ? "True" : "False",
            type: "true-false",
            explanation: `This statement is ${isTrue ? 'true' : 'false'} because of reasons related to question ${questionNumber}.`
          });
        } else {
          questions.push({
            id: `q${i}`,
            questionText: `Complete this statement ${questionNumber} about "${truncateText(params.title)}": _______`,
            correctAnswer: `Fill in answer for question ${questionNumber}`,
            type: "fill-in-blanks",
            explanation: `The correct answer provides context for question ${questionNumber}.`
          });
        }
      }

      resolve({
        title: params.title,
        questions,
        timestamp: Date.now()
      });
    }, 2000); // Simulate 2 second processing time
  });
};

// Calculate time-based score for timed quizzes
export const calculateTimedQuizScore = (
  correctAnswers: number, 
  totalQuestions: number, 
  timeSpentSeconds: number
): TimedQuizResult => {
  // Base score (each correct answer is worth 100 points)
  const baseScore = correctAnswers * 100;
  
  // Time bonus calculation (faster completion = more bonus points)
  // We'll assume an average of 10 seconds per question is "par"
  const parTime = totalQuestions * 10;
  let timeBonus = 0;
  
  if (timeSpentSeconds < parTime) {
    // If under par time, award bonus points (up to 50% of base score)
    const timeRatio = 1 - (timeSpentSeconds / parTime);
    timeBonus = Math.round(baseScore * timeRatio * 0.5);
  }
  
  return {
    score: baseScore + timeBonus,
    timeSpent: timeSpentSeconds,
    correctAnswers,
    totalQuestions,
    timeBonus
  };
};

// Extract text content from a PDF file
export const extractPdfText = async (file: File): Promise<string> => {
  // This is a mock function that would normally use a PDF library
  // In a real app, you might use PDF.js or a backend service
  return new Promise((resolve) => {
    // Simulate PDF processing
    setTimeout(() => {
      const fileName = file.name.replace('.pdf', '');
      resolve(`Content extracted from ${fileName}. This is simulated content from the PDF that would be used to generate relevant questions based on the document content.`);
    }, 1000);
  });
};

// Helper to truncate text for display
const truncateText = (text: string, maxLength = 30): string => {
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
};

// Save generated quiz to localStorage
export const saveGeneratedQuiz = (quiz: GeneratedQuiz): void => {
  try {
    // Get existing quizzes
    const savedQuizzesStr = localStorage.getItem('generated-quizzes');
    const savedQuizzes: GeneratedQuiz[] = savedQuizzesStr ? JSON.parse(savedQuizzesStr) : [];
    
    // Add new quiz
    savedQuizzes.push(quiz);
    
    // Save back to localStorage
    localStorage.setItem('generated-quizzes', JSON.stringify(savedQuizzes));
    
    // Update progress metrics
    updateReadingProgress(3); // Add some progress for creating a quiz
  } catch (error) {
    console.error('Error saving generated quiz:', error);
  }
};

// Get all saved quizzes
export const getSavedGeneratedQuizzes = (): GeneratedQuiz[] => {
  try {
    const savedQuizzesStr = localStorage.getItem('generated-quizzes');
    return savedQuizzesStr ? JSON.parse(savedQuizzesStr) : [];
  } catch (error) {
    console.error('Error getting saved quizzes:', error);
    return [];
  }
};

// Save timed quiz results
export const saveTimedQuizResult = (result: TimedQuizResult): void => {
  try {
    // Get existing results
    const savedResultsStr = localStorage.getItem('timed-quiz-results');
    const savedResults: TimedQuizResult[] = savedResultsStr ? JSON.parse(savedResultsStr) : [];
    
    // Add new result
    savedResults.push(result);
    
    // Save back to localStorage
    localStorage.setItem('timed-quiz-results', JSON.stringify(savedResults));
    
    // Update progress metrics
    updateReadingProgress(5); // Add more progress for completing a timed quiz
  } catch (error) {
    console.error('Error saving timed quiz result:', error);
  }
};
