
// Bible books organization
export const bibleBooks = {
  oldTestament: [
    "Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy", 
    "Joshua", "Judges", "Ruth", "1 Samuel", "2 Samuel", 
    "1 Kings", "2 Kings", "1 Chronicles", "2 Chronicles", 
    "Ezra", "Nehemiah", "Esther", "Job", "Psalms", 
    "Proverbs", "Ecclesiastes", "Song of Solomon", "Isaiah", 
    "Jeremiah", "Lamentations", "Ezekiel", "Daniel", "Hosea", 
    "Joel", "Amos", "Obadiah", "Jonah", "Micah", "Nahum", 
    "Habakkuk", "Zephaniah", "Haggai", "Zechariah", "Malachi"
  ],
  newTestament: [
    "Matthew", "Mark", "Luke", "John", "Acts", 
    "Romans", "1 Corinthians", "2 Corinthians", "Galatians", 
    "Ephesians", "Philippians", "Colossians", "1 Thessalonians", 
    "2 Thessalonians", "1 Timothy", "2 Timothy", "Titus", 
    "Philemon", "Hebrews", "James", "1 Peter", "2 Peter", 
    "1 John", "2 John", "3 John", "Jude", "Revelation"
  ]
};

// Question difficulty levels
export type QuestionDifficulty = "easy" | "medium" | "hard";

// Question types
export type QuestionType = "multiple-choice" | "true-false" | "fill-in-blank";

// Quiz question model
export interface QuizQuestion {
  id: string;
  book: string;
  chapter: number;
  verse?: number;
  questionText: string;
  options?: string[];
  correctAnswer: string;
  explanation?: string;
  difficulty: QuestionDifficulty;
  type: QuestionType;
  points: number;
}

// Quiz attempt model
export interface QuizAttempt {
  quizId: string;
  date: Date;
  score: number;
  totalPossible: number;
  percentageScore: number;
  questions: {
    questionId: string;
    userAnswer: string;
    isCorrect: boolean;
    pointsEarned: number;
  }[];
}

// Sample quiz questions database
export const quizQuestions: QuizQuestion[] = [
  // Genesis
  {
    id: "gen-1-1",
    book: "Genesis",
    chapter: 1,
    verse: 1,
    questionText: "What did God create in the beginning?",
    options: ["The heavens and the earth", "Light", "Animals", "Humans"],
    correctAnswer: "The heavens and the earth",
    explanation: "Genesis 1:1 states 'In the beginning God created the heavens and the earth.'",
    difficulty: "easy",
    type: "multiple-choice",
    points: 1
  },
  {
    id: "gen-6-1",
    book: "Genesis",
    chapter: 6,
    questionText: "How many people were saved on Noah's ark?",
    options: ["4", "6", "8", "12"],
    correctAnswer: "8",
    explanation: "Noah, his wife, his three sons, and their wives - a total of 8 people.",
    difficulty: "medium",
    type: "multiple-choice",
    points: 2
  },
  // Exodus
  {
    id: "exo-20-1",
    book: "Exodus",
    chapter: 20,
    questionText: "How many commandments did God give to Moses?",
    options: ["7", "8", "10", "12"],
    correctAnswer: "10",
    explanation: "God gave Moses the Ten Commandments on Mount Sinai.",
    difficulty: "easy",
    type: "multiple-choice",
    points: 1
  },
  // Matthew
  {
    id: "mat-5-1",
    book: "Matthew",
    chapter: 5,
    questionText: "The Beatitudes begin with 'Blessed are the...'",
    options: ["meek", "poor in spirit", "merciful", "peacemakers"],
    correctAnswer: "poor in spirit",
    explanation: "Matthew 5:3 states 'Blessed are the poor in spirit, for theirs is the kingdom of heaven.'",
    difficulty: "medium",
    type: "multiple-choice",
    points: 2
  },
  {
    id: "mat-6-9",
    book: "Matthew",
    chapter: 6,
    verse: 9,
    questionText: "The Lord's Prayer begins with 'Our Father, who art in...'",
    options: ["heaven", "earth", "glory", "majesty"],
    correctAnswer: "heaven",
    explanation: "The Lord's Prayer begins with 'Our Father, who art in heaven'",
    difficulty: "easy",
    type: "multiple-choice",
    points: 1
  },
  // John
  {
    id: "joh-3-16",
    book: "John",
    chapter: 3,
    verse: 16,
    questionText: "According to John 3:16, God so loved the world that He gave His only...",
    options: ["Son", "Spirit", "Word", "Law"],
    correctAnswer: "Son",
    explanation: "John 3:16 states 'For God so loved the world that He gave His only begotten Son...'",
    difficulty: "easy",
    type: "multiple-choice",
    points: 1
  },
  // Romans
  {
    id: "rom-3-23",
    book: "Romans",
    chapter: 3,
    verse: 23,
    questionText: "According to Romans 3:23, 'For all have... and fall short of the glory of God.'",
    correctAnswer: "sinned",
    difficulty: "medium",
    type: "fill-in-blank",
    points: 2
  },
  // Acts
  {
    id: "act-2-1",
    book: "Acts",
    chapter: 2,
    questionText: "The Holy Spirit descended on the disciples during which Jewish feast?",
    options: ["Passover", "Pentecost", "Tabernacles", "Purim"],
    correctAnswer: "Pentecost",
    explanation: "Acts 2 describes the Holy Spirit descending on the disciples during Pentecost.",
    difficulty: "medium",
    type: "multiple-choice",
    points: 2
  },
  // Add more questions as needed...
];

// Function to get questions by book
export function getQuestionsByBook(book: string): QuizQuestion[] {
  return quizQuestions.filter(question => question.book === book);
}

// Function to get questions by difficulty
export function getQuestionsByDifficulty(difficulty: QuestionDifficulty): QuizQuestion[] {
  return quizQuestions.filter(question => question.difficulty === difficulty);
}

// Function to generate a quiz with specific parameters
export function generateQuiz(options: {
  books?: string[],
  difficulty?: QuestionDifficulty,
  questionCount?: number,
  types?: QuestionType[]
}): QuizQuestion[] {
  let filteredQuestions = [...quizQuestions];
  
  if (options.books && options.books.length > 0) {
    filteredQuestions = filteredQuestions.filter(q => options.books?.includes(q.book));
  }
  
  if (options.difficulty) {
    filteredQuestions = filteredQuestions.filter(q => q.difficulty === options.difficulty);
  }
  
  if (options.types && options.types.length > 0) {
    filteredQuestions = filteredQuestions.filter(q => options.types?.includes(q.type));
  }
  
  // Shuffle questions
  filteredQuestions.sort(() => Math.random() - 0.5);
  
  // Limit to requested count if specified
  if (options.questionCount && options.questionCount > 0) {
    filteredQuestions = filteredQuestions.slice(0, options.questionCount);
  }
  
  return filteredQuestions;
}

// Mock storage for quiz attempts
export const userQuizAttempts: QuizAttempt[] = [];

// Function to calculate progress for the current week
export function getCurrentWeekProgress(): number {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday as start of week
  startOfWeek.setHours(0, 0, 0, 0);
  
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 7);
  
  const weekAttempts = userQuizAttempts.filter(
    attempt => attempt.date >= startOfWeek && attempt.date < endOfWeek
  );
  
  if (weekAttempts.length === 0) return 0;
  
  const totalScore = weekAttempts.reduce((sum, attempt) => sum + attempt.score, 0);
  const totalPossible = weekAttempts.reduce((sum, attempt) => sum + attempt.totalPossible, 0);
  
  return Math.round((totalScore / totalPossible) * 100);
}

// Function to save a quiz attempt
export function saveQuizAttempt(attempt: QuizAttempt): void {
  userQuizAttempts.push(attempt);
  // In a real app, this would save to localStorage or a database
  localStorage.setItem('quizAttempts', JSON.stringify(userQuizAttempts));
}

// Load quiz attempts from storage on initialization
export function loadQuizAttempts(): void {
  const storedAttempts = localStorage.getItem('quizAttempts');
  if (storedAttempts) {
    const parsed = JSON.parse(storedAttempts) as QuizAttempt[];
    // Convert string dates to Date objects
    parsed.forEach(attempt => {
      attempt.date = new Date(attempt.date);
    });
    userQuizAttempts.push(...parsed);
  }
}
