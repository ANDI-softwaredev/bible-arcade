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
export type QuizDifficultyLevel = "easy-to-go" | "minimum-thinking" | "maximum-thinking" | "crack-my-head" | "granite-hard";

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
  difficultyLevel?: QuizDifficultyLevel;
  type: QuestionType;
  points: number;
  timeLimit?: number; // Time limit in seconds
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

// Define time limits and points based on difficulty level
export const difficultySettings = {
  "easy-to-go": { timeLimit: 5, points: 5 },
  "minimum-thinking": { timeLimit: 7, points: 10 },
  "maximum-thinking": { timeLimit: 10, points: 15 },
  "crack-my-head": { timeLimit: 15, points: 20 },
  "granite-hard": { timeLimit: 20, points: 25 }
};

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
    difficultyLevel: "easy-to-go",
    type: "multiple-choice",
    points: 5,
    timeLimit: 5
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
    difficultyLevel: "minimum-thinking",
    type: "multiple-choice",
    points: 10,
    timeLimit: 7
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
    difficultyLevel: "easy-to-go",
    type: "multiple-choice",
    points: 5,
    timeLimit: 5
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
    difficultyLevel: "minimum-thinking",
    type: "multiple-choice",
    points: 10,
    timeLimit: 7
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
    difficultyLevel: "easy-to-go",
    type: "multiple-choice",
    points: 5,
    timeLimit: 5
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
    difficultyLevel: "easy-to-go",
    type: "multiple-choice",
    points: 5,
    timeLimit: 5
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
    difficultyLevel: "minimum-thinking",
    type: "fill-in-blank",
    points: 10,
    timeLimit: 7
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
    difficultyLevel: "minimum-thinking",
    type: "multiple-choice",
    points: 10,
    timeLimit: 7
  },
  // Numbers (Easy to Go)
  {
    id: "num-1-1",
    book: "Numbers",
    chapter: 1,
    verse: 1,
    questionText: "Where was Moses when the Lord spoke to him in Numbers chapter 1?",
    options: ["In the wilderness of Sinai", "On Mount Sinai", "In Egypt", "By the Red Sea"],
    correctAnswer: "In the wilderness of Sinai",
    explanation: "Numbers 1:1 states the Lord spoke to Moses in the wilderness of Sinai.",
    difficulty: "easy",
    difficultyLevel: "easy-to-go",
    type: "multiple-choice",
    points: 5,
    timeLimit: 5
  },
  {
    id: "num-6-1",
    book: "Numbers",
    chapter: 6,
    verse: 3,
    questionText: "What were those under a Nazirite vow forbidden to consume?",
    options: ["Wine and strong drink", "Meat", "Bread", "Olive oil"],
    correctAnswer: "Wine and strong drink",
    explanation: "Numbers 6:3 specifies that Nazirites should abstain from wine and strong drink.",
    difficulty: "easy",
    difficultyLevel: "easy-to-go",
    type: "multiple-choice",
    points: 5,
    timeLimit: 5
  },
  
  // Numbers (Minimum Thinking)
  {
    id: "num-13-1",
    book: "Numbers",
    chapter: 13,
    questionText: "How many spies were sent to explore the land of Canaan?",
    options: ["10", "12", "2", "40"],
    correctAnswer: "12",
    explanation: "In Numbers 13, Moses sent 12 spies (one from each tribe) to explore Canaan.",
    difficulty: "medium",
    difficultyLevel: "minimum-thinking",
    type: "multiple-choice",
    points: 10,
    timeLimit: 7
  },
  {
    id: "num-20-1",
    book: "Numbers",
    chapter: 20,
    verse: 8,
    questionText: "What did God tell Moses to do to provide water from the rock?",
    options: ["Strike it twice", "Strike it once", "Speak to it", "Pour water on it"],
    correctAnswer: "Speak to it",
    explanation: "In Numbers 20:8, God instructed Moses to speak to the rock to bring forth water.",
    difficulty: "medium",
    difficultyLevel: "minimum-thinking",
    type: "multiple-choice",
    points: 10,
    timeLimit: 7
  },
  
  // Numbers (Maximum Thinking)
  {
    id: "num-22-1",
    book: "Numbers",
    chapter: 22,
    questionText: "What was the name of the prophet whose donkey spoke to him?",
    options: ["Balaam", "Balak", "Barak", "Barnabas"],
    correctAnswer: "Balaam",
    explanation: "In Numbers 22, Balaam's donkey spoke to him when it saw the angel of the Lord.",
    difficulty: "medium",
    difficultyLevel: "maximum-thinking",
    type: "multiple-choice",
    points: 15,
    timeLimit: 10
  },
  {
    id: "num-26-1",
    book: "Numbers",
    chapter: 26,
    questionText: "The second census in Numbers showed the Israelites numbered approximately:",
    options: ["600,000", "700,000", "800,000", "900,000"],
    correctAnswer: "600,000",
    explanation: "Numbers 26:51 states there were 601,730 men able to serve in the army.",
    difficulty: "hard",
    difficultyLevel: "maximum-thinking",
    type: "multiple-choice",
    points: 15,
    timeLimit: 10
  },
  
  // Numbers (Crack My Head)
  {
    id: "num-31-1",
    book: "Numbers",
    chapter: 31,
    questionText: "Against which people group did Moses send 12,000 Israelites to war in Numbers 31?",
    options: ["Midianites", "Moabites", "Amalekites", "Hittites"],
    correctAnswer: "Midianites",
    explanation: "In Numbers 31, Moses sent 12,000 men to war against the Midianites.",
    difficulty: "hard",
    difficultyLevel: "crack-my-head",
    type: "multiple-choice",
    points: 20,
    timeLimit: 15
  },
  {
    id: "num-33-1",
    book: "Numbers",
    chapter: 33,
    questionText: "How many camping locations of the Israelites are listed in Numbers 33?",
    options: ["32", "42", "52", "62"],
    correctAnswer: "42",
    explanation: "Numbers 33 contains a list of 42 camping sites during the Israelites' journey.",
    difficulty: "hard",
    difficultyLevel: "crack-my-head",
    type: "multiple-choice",
    points: 20,
    timeLimit: 15
  },

  // Numbers (Granite Hard)
  {
    id: "num-7-1",
    book: "Numbers",
    chapter: 7,
    questionText: "How many days did it take for the tribal leaders to present their offerings for the dedication of the altar?",
    options: ["7 days", "10 days", "12 days", "14 days"],
    correctAnswer: "12 days",
    explanation: "Each tribal leader presented offerings on a different day, taking 12 days in total.",
    difficulty: "hard",
    difficultyLevel: "granite-hard",
    type: "multiple-choice",
    points: 25,
    timeLimit: 20
  },
  
  // Hebrews (Easy to Go)
  {
    id: "heb-1-1",
    book: "Hebrews",
    chapter: 1,
    verse: 1,
    questionText: "According to Hebrews 1, how did God speak in the past?",
    options: ["Through the prophets", "Through angels", "Through dreams", "Through signs"],
    correctAnswer: "Through the prophets",
    explanation: "Hebrews 1:1 states God spoke to our ancestors through the prophets.",
    difficulty: "easy",
    difficultyLevel: "easy-to-go",
    type: "multiple-choice",
    points: 5,
    timeLimit: 5
  },
  {
    id: "heb-11-1",
    book: "Hebrews",
    chapter: 11,
    verse: 1,
    questionText: "What is faith according to Hebrews 11:1?",
    options: [
      "Confidence in what we hope for and assurance about what we do not see",
      "Belief in God",
      "Trust in the Bible",
      "Following God's commands"
    ],
    correctAnswer: "Confidence in what we hope for and assurance about what we do not see",
    explanation: "Hebrews 11:1 defines faith as 'confidence in what we hope for and assurance about what we do not see.'",
    difficulty: "easy",
    difficultyLevel: "easy-to-go",
    type: "multiple-choice",
    points: 5,
    timeLimit: 5
  },
  
  // Hebrews (Minimum Thinking)
  {
    id: "heb-4-1",
    book: "Hebrews",
    chapter: 4,
    questionText: "What is described as 'living and active, sharper than any two-edged sword' in Hebrews?",
    options: ["The word of God", "Faith", "Love", "Prayer"],
    correctAnswer: "The word of God",
    explanation: "Hebrews 4:12 describes the word of God as living and active, sharper than any two-edged sword.",
    difficulty: "medium",
    difficultyLevel: "minimum-thinking",
    type: "multiple-choice",
    points: 10,
    timeLimit: 7
  },
  {
    id: "heb-5-1",
    book: "Hebrews",
    chapter: 5,
    questionText: "According to Hebrews 5, which Old Testament figure is a prototype of Christ's priesthood?",
    options: ["Melchizedek", "Aaron", "Moses", "Abraham"],
    correctAnswer: "Melchizedek",
    explanation: "Hebrews 5:6 references Christ being a priest in the order of Melchizedek.",
    difficulty: "medium",
    difficultyLevel: "minimum-thinking",
    type: "multiple-choice",
    points: 10,
    timeLimit: 7
  },
  
  // Hebrews (Maximum Thinking)
  {
    id: "heb-6-1",
    book: "Hebrews",
    chapter: 6,
    questionText: "What two unchangeable things does Hebrews 6 say give us strong encouragement?",
    options: [
      "God's promise and oath",
      "Faith and hope",
      "Love and mercy",
      "Grace and truth"
    ],
    correctAnswer: "God's promise and oath",
    explanation: "Hebrews 6:17-18 mentions God's promise and oath as two unchangeable things.",
    difficulty: "hard",
    difficultyLevel: "maximum-thinking",
    type: "multiple-choice",
    points: 15,
    timeLimit: 10
  },
  
  // Hebrews (Crack My Head)
  {
    id: "heb-9-1",
    book: "Hebrews",
    chapter: 9,
    questionText: "According to Hebrews 9, what items were contained in the Ark of the Covenant?",
    options: [
      "Golden jar of manna, Aaron's staff, tablets of the covenant",
      "Golden altar, lampstand, showbread",
      "Ephod, breastplate, incense altar",
      "Stone tablets, golden censer, priestly garments"
    ],
    correctAnswer: "Golden jar of manna, Aaron's staff, tablets of the covenant",
    explanation: "Hebrews 9:4 lists the golden jar of manna, Aaron's staff that budded, and the tablets of the covenant.",
    difficulty: "hard",
    difficultyLevel: "crack-my-head",
    type: "multiple-choice",
    points: 20,
    timeLimit: 15
  },
  
  // Hebrews (Granite Hard)
  {
    id: "heb-7-1",
    book: "Hebrews",
    chapter: 7,
    questionText: "What fraction of his spoils did Abraham give to Melchizedek according to Hebrews 7?",
    options: ["A tenth", "A fifth", "Half", "All"],
    correctAnswer: "A tenth",
    explanation: "Hebrews 7:2 states that Abraham gave him a tenth of everything.",
    difficulty: "hard",
    difficultyLevel: "granite-hard",
    type: "multiple-choice",
    points: 25,
    timeLimit: 20
  },
  
  // Ezra (Easy to Go)
  {
    id: "ezr-1-1",
    book: "Ezra",
    chapter: 1,
    questionText: "Which Persian king issued the decree allowing Jews to return to Jerusalem?",
    options: ["Cyrus", "Darius", "Artaxerxes", "Xerxes"],
    correctAnswer: "Cyrus",
    explanation: "Ezra 1:1 states that Cyrus king of Persia issued the decree.",
    difficulty: "easy",
    difficultyLevel: "easy-to-go",
    type: "multiple-choice",
    points: 5,
    timeLimit: 5
  },
  
  // Ezra (Minimum Thinking)
  {
    id: "ezr-3-1",
    book: "Ezra",
    chapter: 3,
    questionText: "What did the returning exiles build first in Jerusalem?",
    options: ["The altar", "The temple walls", "Their houses", "The city gates"],
    correctAnswer: "The altar",
    explanation: "Ezra 3:2 tells us they first built the altar to offer burnt offerings.",
    difficulty: "medium",
    difficultyLevel: "minimum-thinking",
    type: "multiple-choice",
    points: 10,
    timeLimit: 7
  },
  
  // Ezra (Maximum Thinking)
  {
    id: "ezr-6-1",
    book: "Ezra",
    chapter: 6,
    questionText: "How many years did it take to complete the rebuilding of the temple according to Ezra 6?",
    options: ["4 years", "7 years", "10 years", "20 years"],
    correctAnswer: "4 years",
    explanation: "According to Ezra 6:15, the temple was completed in the 6th year of Darius' reign, about 4 years after resuming construction.",
    difficulty: "medium",
    difficultyLevel: "maximum-thinking",
    type: "multiple-choice",
    points: 15,
    timeLimit: 10
  },
  
  // Ezra (Crack My Head)
  {
    id: "ezr-7-1",
    book: "Ezra",
    chapter: 7,
    questionText: "What was Ezra's occupation according to Ezra 7?",
    options: ["Teacher/scribe", "Priest", "Governor", "All of the above"],
    correctAnswer: "All of the above",
    explanation: "Ezra 7 describes him as a priest, skilled scribe, and given authority by the king - essentially all these roles.",
    difficulty: "hard",
    difficultyLevel: "crack-my-head",
    type: "multiple-choice",
    points: 20,
    timeLimit: 15
  },
  
  // Ezra (Granite Hard)
  {
    id: "ezr-10-1",
    book: "Ezra",
    chapter: 10,
    questionText: "Approximately how many foreign wives were divorced in the reforms described in Ezra 10?",
    options: ["About 50", "About 110", "About 400", "About 1000"],
    correctAnswer: "About 110",
    explanation: "Ezra 10:18-44 lists approximately 110 men who had married foreign wives.",
    difficulty: "hard",
    difficultyLevel: "granite-hard",
    type: "multiple-choice",
    points: 25,
    timeLimit: 20
  },
  
  // Mark (Easy to Go)
  {
    id: "mrk-1-1",
    book: "Mark",
    chapter: 1,
    questionText: "What was John the Baptist's main message?",
    options: ["Repent and be baptized", "Follow Jesus", "Love your neighbor", "Keep the commandments"],
    correctAnswer: "Repent and be baptized",
    explanation: "Mark 1:4 states that John preached a baptism of repentance for the forgiveness of sins.",
    difficulty: "easy",
    difficultyLevel: "easy-to-go",
    type: "multiple-choice",
    points: 5,
    timeLimit: 5
  },
  {
    id: "mrk-4-1",
    book: "Mark",
    chapter: 4,
    questionText: "In Mark 4, Jesus compared the kingdom of God to a mustard seed because:",
    options: [
      "It starts small but grows very large",
      "It is round and smooth",
      "It is bitter when eaten",
      "It is difficult to find"
    ],
    correctAnswer: "It starts small but grows very large",
    explanation: "In Mark 4:30-32, Jesus describes how the mustard seed is tiny but grows into the largest garden plant.",
    difficulty: "easy",
    difficultyLevel: "easy-to-go",
    type: "multiple-choice",
    points: 5,
    timeLimit: 5
  },
  
  // Mark (Minimum Thinking)
  {
    id: "mrk-5-1",
    book: "Mark",
    chapter: 5,
    questionText: "What happened to the herd of pigs after Jesus cast the demons out of the man?",
    options: ["They ran into the sea and drowned", "They scattered into the fields", "They became tame", "They attacked the people"],
    correctAnswer: "They ran into the sea and drowned",
    explanation: "Mark 5:13 states that the demons entered the pigs, and the herd rushed down the steep bank into the lake and drowned.",
    difficulty: "medium",
    difficultyLevel: "minimum-thinking",
    type: "multiple-choice",
    points: 10,
    timeLimit: 7
  },
  
  // Mark (Maximum Thinking)
  {
    id: "mrk-14-1",
    book: "Mark",
    chapter: 14,
    questionText: "What did Jesus say would happen to the temple according to Mark 14?",
    options: ["It would be destroyed", "It would be expanded", "It would be renovated", "It would be abandoned"],
    correctAnswer: "It would be destroyed",
    explanation: "In Mark 14:58, witnesses claimed Jesus said he would destroy the temple made with hands and build another in three days.",
    difficulty: "medium",
    difficultyLevel: "maximum-thinking",
    type: "multiple-choice",
    points: 15,
    timeLimit: 10
  },
  
  // Mark (Crack My Head)
  {
    id: "mrk-12-1",
    book: "Mark",
    chapter: 12,
    questionText: "In Mark 12, what did Jesus say about the widow's offering compared to others?",
    options: ["She put in more than all the others", "She gave sacrificially", "She gave with the right attitude", "All of the above"],
    correctAnswer: "All of the above",
    explanation: "In Mark 12:41-44, Jesus said the widow put in more than all others because she gave everything she had to live on, implying all these answers.",
    difficulty: "hard",
    difficultyLevel: "crack-my-head",
    type: "multiple-choice",
    points: 20,
    timeLimit: 15
  },
  
  // Mark (Granite Hard)
  {
    id: "mrk-16-1",
    book: "Mark",
    chapter: 16,
    questionText: "According to the longest version of Mark's gospel, what supernatural abilities did Jesus say would accompany believers?",
    options: [
      "Drive out demons, speak in tongues, handle snakes, heal the sick, be immune to poison",
      "Raise the dead, walk on water, multiply food, calm storms",
      "Prophecy, interpret dreams, see visions, read minds",
      "Fly, become invisible, transform objects, control weather"
    ],
    correctAnswer: "Drive out demons, speak in tongues, handle snakes, heal the sick, be immune to poison",
    explanation: "Mark 16:17-18 lists these signs: driving out demons, speaking in tongues, picking up snakes, immunity to poison, and healing by laying on hands.",
    difficulty: "hard",
    difficultyLevel: "granite-hard",
    type: "multiple-choice",
    points: 25,
    timeLimit: 20
  }
];

// Function to get questions by book
export function getQuestionsByBook(book: string): QuizQuestion[] {
  return quizQuestions.filter(question => question.book === book);
}

// Function to get questions by difficulty
export function getQuestionsByDifficulty(difficulty: QuestionDifficulty): QuizQuestion[] {
  return quizQuestions.filter(question => question.difficulty === difficulty);
}

// Function to get questions by difficulty level
export function getQuestionsByDifficultyLevel(difficultyLevel: QuizDifficultyLevel): QuizQuestion[] {
  return quizQuestions.filter(question => question.difficultyLevel === difficultyLevel);
}

// Function to generate a quiz with specific parameters
export function generateQuiz(options: {
  books?: string[],
  difficulty?: QuestionDifficulty,
  difficultyLevel?: QuizDifficultyLevel,
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
  
  if (options.difficultyLevel) {
    filteredQuestions = filteredQuestions.filter(q => q.difficultyLevel === options.difficultyLevel);
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

// Add a new function to update the reading progress
export function updateReadingProgress(progressIncrement: number) {
  try {
    // Get current weekly progress
    const currentProgress = getCurrentWeekProgress();
    
    // Add the increment, capped at 100%
    const newProgress = Math.min(currentProgress + progressIncrement, 100);
    
    // Store updated progress
    localStorage.setItem("weekly-bible-progress", newProgress.toString());
    
    return newProgress;
  } catch (error) {
    console.error("Error updating reading progress:", error);
    return 0;
  }
}
