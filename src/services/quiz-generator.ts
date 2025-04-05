import { supabase } from "@/integrations/supabase/client";
import { trackReadingActivity } from "./bible-api";

// Function to generate a quiz based on a book and number of questions
export async function generateQuiz(book: string, numQuestions: number) {
  try {
    // Fetch the verses for the specified book
    const { data: verses, error } = await supabase
      .from('bible_verses')
      .select('*')
      .eq('book', book);

    if (error) {
      console.error("Error fetching verses:", error);
      return null;
    }

    if (!verses || verses.length === 0) {
      console.warn("No verses found for book:", book);
      return null;
    }

    // Select random verses to create questions
    const questions = [];
    for (let i = 0; i < numQuestions; i++) {
      const randomIndex = Math.floor(Math.random() * verses.length);
      const verse = verses[randomIndex];

      // Create a question object
      const question = {
        id: i + 1,
        text: `What does ${verse.book} ${verse.chapter}:${verse.verse} say?`,
        options: [
          verse.text,
          generateFakeAnswer(verses),
          generateFakeAnswer(verses),
          generateFakeAnswer(verses)
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
function generateFakeAnswer(verses: any[]) {
  let fakeAnswer = "";
  while (true) {
    const randomIndex = Math.floor(Math.random() * verses.length);
    fakeAnswer = verses[randomIndex].text;
    if (fakeAnswer !== "") {
      break;
    }
  }
  return fakeAnswer;
}

// Function to save quiz results to Supabase
export async function saveQuizResult(
  userId: string,
  quizId: string | null,
  score: number,
  totalQuestions: number,
  correctAnswers: number,
  timeSpent: number | null = 0,
  timeBonus: number | null = 0,
  questions: any[] | null = null,
  performance_metrics: any | null = null
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('quiz_results')
      .insert({
        user_id: userId,
        quiz_id: quizId,
        score: score,
        total_questions: totalQuestions,
        correct_answers: correctAnswers,
        time_spent: timeSpent,
        time_bonus: timeBonus,
        completed_at: new Date().toISOString(),
        questions: questions,
        performance_metrics: performance_metrics
      });

    if (error) {
      console.error("Error saving quiz results:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error saving quiz results:", error);
    return false;
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

    // Get the user's study durations
    const { data, error } = await supabase
      .from('study_durations')
      .select('*')
      .eq('user_id', session.session.user.id)
      .order('timestamp', { ascending: false });

    if (error) {
      console.error("Error fetching study durations:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error getting study durations:", error);
    return [];
  }
}
