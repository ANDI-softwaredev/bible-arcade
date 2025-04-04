import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { CheckCircle, XCircle, AlertCircle, BookText, Clock, Trophy } from "lucide-react";
import { GrowingSeedAnimation } from "@/components/ui/growing-seed-animation";
import { 
  bibleBooks, 
  QuizQuestion, 
  QuestionDifficulty, 
  QuestionType,
  QuizDifficultyLevel,
  generateQuiz,
  saveQuizAttempt,
  difficultySettings
} from "@/data/bible-database";
import { useToast } from "@/hooks/use-toast";
import { saveQuizResult } from "@/services/quiz-generator";

interface BibleQuizProps {
  onComplete?: (score: number, totalPossible: number, percentageScore: number) => void;
}

export function BibleQuiz({ onComplete }: BibleQuizProps) {
  const { toast } = useToast();
  
  // Quiz configuration
  const [selectedBooks, setSelectedBooks] = useState<string[]>([]);
  const [difficultyLevel, setDifficultyLevel] = useState<QuizDifficultyLevel>("easy-to-go");
  const [questionCount, setQuestionCount] = useState(5);
  const [quizStarted, setQuizStarted] = useState(false);
  
  // Quiz state
  const [currentQuestions, setCurrentQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [totalPossible, setTotalPossible] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Timer state
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isTimeUp, setIsTimeUp] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Clear timer when component unmounts
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);
  
  // Start timer for current question
  useEffect(() => {
    if (quizStarted && !quizCompleted && currentQuestions.length > 0 && !isTimeUp) {
      const currentQuestion = currentQuestions[currentQuestionIndex];
      const timeLimit = currentQuestion.timeLimit || difficultySettings[difficultyLevel].timeLimit;
      
      setTimeRemaining(timeLimit);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            // Time's up - clear interval and move to next question
            clearInterval(timerRef.current as NodeJS.Timeout);
            setIsTimeUp(true);
            
            // Auto move to next question after 2 seconds
            setTimeout(() => {
              setIsTimeUp(false);
              goToNextQuestion();
            }, 2000);
            
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [currentQuestionIndex, quizStarted, quizCompleted, currentQuestions]);
  
  // Update selected books
  const handleBookSelection = (testament: "oldTestament" | "newTestament", selected: boolean) => {
    if (selected) {
      setSelectedBooks(prev => [...prev, ...bibleBooks[testament]]);
    } else {
      setSelectedBooks(prev => prev.filter(book => !bibleBooks[testament].includes(book)));
    }
  };
  
  // Filter for specific books
  const handleSpecificBooks = () => {
    const specificBooks = ["Numbers", "Hebrews", "Ezra", "Mark"];
    setSelectedBooks(specificBooks);
  };
  
  // Start the quiz
  const startQuiz = () => {
    setIsGenerating(true);
    
    // Default to Numbers, Hebrews, Ezra, Mark if no books selected
    const booksForQuiz = selectedBooks.length > 0 
      ? selectedBooks 
      : ["Numbers", "Hebrews", "Ezra", "Mark"];
    
    setTimeout(() => {
      const questions = generateQuiz({
        books: booksForQuiz,
        difficultyLevel: difficultyLevel,
        questionCount,
      });
      
      if (questions.length === 0) {
        toast({
          title: "No questions available",
          description: "Please select different criteria or try a different difficulty level.",
          variant: "destructive"
        });
        setIsGenerating(false);
        return;
      }
      
      setCurrentQuestions(questions);
      setCurrentQuestionIndex(0);
      setUserAnswers({});
      setQuizStarted(true);
      setQuizCompleted(false);
      setScore(0);
      setIsTimeUp(false);
      setTotalPossible(questions.reduce((sum, q) => sum + q.points, 0));
      
      // Initialize timer for first question
      const firstQuestionTimeLimit = questions[0].timeLimit || difficultySettings[difficultyLevel].timeLimit;
      setTimeRemaining(firstQuestionTimeLimit);
      setIsGenerating(false);
    }, 1500); // Simulate generation time
  };
  
  // Handle answer selection
  const handleAnswerSelect = (questionId: string, answer: string) => {
    // Only allow answer if time is not up
    if (isTimeUp) return;
    
    const isCorrect = answer === currentQuestions[currentQuestionIndex].correctAnswer;
    
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
    
    // If correct answer, proceed to next question automatically
    if (isCorrect && !isTimeUp) {
      // Clear current timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      // Short delay to show feedback before moving on
      setTimeout(() => {
        goToNextQuestion();
      }, 500);
    }
  };
  
  // Navigate to next question
  const goToNextQuestion = () => {
    // Clear current timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    if (currentQuestionIndex < currentQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setIsTimeUp(false);
    } else {
      finishQuiz();
    }
  };
  
  // Navigate to previous question (disabled in timed mode)
  const goToPreviousQuestion = () => {
    // Previous navigation is disabled in timed quiz
    return;
  };
  
  // Finish the quiz and calculate score
  const finishQuiz = () => {
    // Clear any active timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    let calculatedScore = 0;
    let totalPointsPossible = 0;
    
    const questionResults = currentQuestions.map(question => {
      const userAnswer = userAnswers[question.id] || "";
      const isCorrect = userAnswer === question.correctAnswer;
      const pointsEarned = isCorrect ? question.points : 0;
      
      calculatedScore += pointsEarned;
      totalPointsPossible += question.points || 0;
      
      return {
        questionId: question.id,
        userAnswer,
        isCorrect,
        pointsEarned
      };
    });
    
    setScore(calculatedScore);
    setQuizCompleted(true);
    
    // Save quiz result with detailed question performance
    const percentageScore = Math.round((calculatedScore / totalPossible) * 100);
    
    // Record individual question performance for analysis
    const questionResultsWithDetails = currentQuestions.map(question => {
      const userAnswer = userAnswers[question.id] || "";
      const isCorrect = userAnswer === question.correctAnswer;
      
      return {
        ...question,
        isCorrect,
        userAnswer,
        answeredCorrectly: isCorrect,
        timeSpent: question.timeLimit ? (question.timeLimit - timeRemaining) : null
      };
    });
    
    // Extract categories, topics, and books from questions
    const categories = [...new Set(currentQuestions.filter(q => q.category).map(q => q.category))];
    const topics = [...new Set(currentQuestions.filter(q => q.topic).map(q => q.topic))];
    
    // Calculate time spent (actual time or estimated from question timers)
    const quizStartTime = new Date().getTime() - getQuizDuration() * 1000;
    const timeSpent = Math.round((new Date().getTime() - quizStartTime) / 1000);
    
    // Save comprehensive quiz result for analytics
    saveQuizResult({
      quizId: `quiz-${Date.now()}`,
      score: calculatedScore,
      timeSpent: timeSpent,
      correctAnswers: questionResultsWithDetails.filter(q => q.isCorrect).length,
      totalQuestions: questionResultsWithDetails.length,
      timeBonus: 0, // If implemented
      questions: questionResultsWithDetails,
      categories: categories,
      topics: topics,
      completedAt: new Date().toISOString()
    });
    
    // Notify parent component
    if (onComplete) {
      onComplete(calculatedScore, totalPossible, percentageScore);
    }
    
    // Show toast notification
    toast({
      title: "Quiz Completed!",
      description: `You scored ${calculatedScore} out of ${totalPossible} points (${percentageScore}%)`,
    });
  };
  
  // Restart the quiz
  const restartQuiz = () => {
    // Clear timer if active
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    setQuizStarted(false);
    setQuizCompleted(false);
    setIsTimeUp(false);
  };
  
  // Get the timer color based on remaining time percentage
  const getTimerColor = () => {
    const currentQuestion = currentQuestions[currentQuestionIndex];
    if (!currentQuestion) return "bg-primary";
    
    const timeLimit = currentQuestion.timeLimit || difficultySettings[difficultyLevel].timeLimit;
    const percentage = (timeRemaining / timeLimit) * 100;
    
    if (percentage > 60) return "bg-green-500";
    if (percentage > 30) return "bg-yellow-500";
    return "bg-red-500";
  };
  
  // Calculate quiz duration (this would be properly implemented with start/end time tracking)
  const getQuizDuration = () => {
    // Fallback calculation based on question times
    return currentQuestions.reduce((total, question) => 
      total + (question.timeLimit || difficultySettings[difficultyLevel].timeLimit), 0);
  };
  
  // Render the current question
  const renderQuestion = () => {
    if (currentQuestions.length === 0) return null;
    
    const question = currentQuestions[currentQuestionIndex];
    const userAnswer = userAnswers[question.id] || "";
    const isShowingResults = isTimeUp || quizCompleted;
    
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex gap-2 items-center">
            <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
              Question {currentQuestionIndex + 1} of {currentQuestions.length}
            </div>
            <div className="text-sm text-muted-foreground">
              {question.book} {question.chapter}{question.verse ? `:${question.verse}` : ""}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Clock className={cn(
              "h-4 w-4",
              timeRemaining <= 5 ? "text-red-500" : "text-primary"
            )} />
            <span className={cn(
              "font-bold",
              timeRemaining <= 5 ? "text-red-500" : "text-primary"
            )}>
              {timeRemaining}s
            </span>
          </div>
        </div>
        
        <div className="w-full h-2 rounded-full bg-gray-200 overflow-hidden">
          <div 
            className={cn(
              "h-full transition-all duration-1000", 
              getTimerColor()
            )} 
            style={{ 
              width: `${(timeRemaining / (question.timeLimit || difficultySettings[difficultyLevel].timeLimit)) * 100}%` 
            }}
          />
        </div>
        
        <div className="flex items-center gap-2 mb-2">
          <div className={cn(
            "px-3 py-1 rounded text-sm text-white",
            difficultyLevel === "easy-to-go" && "bg-green-500",
            difficultyLevel === "minimum-thinking" && "bg-blue-500",
            difficultyLevel === "maximum-thinking" && "bg-yellow-600",
            difficultyLevel === "crack-my-head" && "bg-orange-500",
            difficultyLevel === "granite-hard" && "bg-red-600",
          )}>
            {difficultyLevel.split("-").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")}
          </div>
          <div className="text-sm flex items-center gap-1">
            <Trophy className="h-4 w-4 text-amber-500" />
            <span>{question.points} points</span>
          </div>
        </div>
        
        <div className="text-lg font-semibold">{question.questionText}</div>
        
        {question.type === "multiple-choice" && question.options && (
          <RadioGroup 
            value={userAnswer} 
            onValueChange={(value) => handleAnswerSelect(question.id, value)}
            className="space-y-2"
            disabled={isShowingResults}
          >
            {question.options.map((option, idx) => {
              const isCorrect = option === question.correctAnswer;
              const isSelected = userAnswer === option;
              
              return (
                <div key={idx} className={cn(
                  "flex items-center space-x-2 p-3 rounded-md transition-all",
                  isShowingResults && isCorrect && "bg-green-50",
                  isShowingResults && isSelected && !isCorrect && "bg-red-50"
                )}>
                  <RadioGroupItem 
                    value={option} 
                    id={`option-${idx}`} 
                    className={cn(
                      isShowingResults && isCorrect && "border-green-500 text-green-500",
                      isShowingResults && isSelected && !isCorrect && "border-red-500 text-red-500"
                    )}
                  />
                  <Label 
                    htmlFor={`option-${idx}`}
                    className={cn(
                      "flex items-center gap-2 w-full cursor-pointer",
                      isShowingResults && isCorrect && "text-green-600 font-medium",
                      isShowingResults && isSelected && !isCorrect && "text-red-600"
                    )}
                  >
                    {option}
                    {isShowingResults && isCorrect && <CheckCircle className="h-4 w-4 text-green-500" />}
                    {isShowingResults && isSelected && !isCorrect && <XCircle className="h-4 w-4 text-red-500" />}
                  </Label>
                </div>
              );
            })}
          </RadioGroup>
        )}
        
        {question.type === "fill-in-blank" && (
          <div className="space-y-2">
            <Input 
              value={userAnswer} 
              onChange={(e) => handleAnswerSelect(question.id, e.target.value)}
              placeholder="Type your answer..."
              disabled={isShowingResults}
              className={cn(
                isShowingResults && userAnswer === question.correctAnswer && "border-green-500",
                isShowingResults && userAnswer !== question.correctAnswer && "border-red-500"
              )}
            />
            
            {isShowingResults && (
              <div className={cn(
                "text-sm mt-1",
                userAnswer === question.correctAnswer ? "text-green-600" : "text-red-600"
              )}>
                {userAnswer === question.correctAnswer ? (
                  <div className="flex items-center gap-1">
                    <CheckCircle className="h-4 w-4" />
                    <span>Correct!</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1">
                    <XCircle className="h-4 w-4" />
                    <span>Correct answer: {question.correctAnswer}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        
        {isShowingResults && question.explanation && (
          <div className="bg-muted/50 p-3 rounded-md mt-3">
            <div className="flex items-center gap-1 font-medium mb-1">
              <AlertCircle className="h-4 w-4 text-primary" />
              <span>Explanation</span>
            </div>
            <div className="text-sm">{question.explanation}</div>
          </div>
        )}
      </div>
    );
  };
  
  // Render quiz results
  const renderResults = () => {
    if (!quizCompleted) return null;
    
    const percentageScore = Math.round((score / totalPossible) * 100);
    const correctAnswers = currentQuestions.filter((q, idx) => 
      userAnswers[q.id] === q.correctAnswer
    ).length;
    
    return (
      <div className="space-y-6">
        <div className="text-center py-4">
          <div className="text-2xl font-bold mb-2">Quiz Results</div>
          <div className="text-4xl font-bold text-primary mb-2">{percentageScore}%</div>
          <div className="text-lg mb-2">
            You scored {score} out of {totalPossible} points
          </div>
          <div>
            {correctAnswers} of {currentQuestions.length} questions correct
          </div>
        </div>
        
        <Progress 
          value={percentageScore} 
          className="h-3" 
        />
        
        <div className="space-y-4">
          <h3 className="font-medium text-lg">Question Review</h3>
          {currentQuestions.map((question, idx) => {
            const userAnswer = userAnswers[question.id] || "";
            const isCorrect = userAnswer === question.correctAnswer;
            
            return (
              <div key={idx} className={cn(
                "p-4 rounded-lg border",
                isCorrect ? "border-green-200 bg-green-50/50" : "border-red-200 bg-red-50/50"
              )}>
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium">Question {idx + 1}</div>
                  <div className="text-sm text-muted-foreground">
                    {question.book} {question.chapter}{question.verse ? `:${question.verse}` : ""}
                  </div>
                </div>
                <div className="mb-2">{question.questionText}</div>
                <div className={cn(
                  "text-sm flex items-start gap-2",
                  isCorrect ? "text-green-600" : "text-red-600"
                )}>
                  {isCorrect ? (
                    <CheckCircle className="h-4 w-4 mt-0.5" />
                  ) : (
                    <XCircle className="h-4 w-4 mt-0.5" />
                  )}
                  <div>
                    <div>
                      {isCorrect ? "Correct" : `Your answer: ${userAnswer || "(No answer)"}`}
                    </div>
                    {!isCorrect && (
                      <div className="text-green-600">
                        Correct answer: {question.correctAnswer}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="pt-4 flex justify-center">
          <Button onClick={restartQuiz}>
            Try Another Quiz
          </Button>
        </div>
      </div>
    );
  };
  
  // Render quiz configuration
  const renderQuizSetup = () => {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Select Books</h3>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleSpecificBooks}
            >
              Use Numbers, Hebrews, Ezra & Mark
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="font-medium">Old Testament</div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleBookSelection("oldTestament", true)}
                  >
                    Select All
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleBookSelection("oldTestament", false)}
                  >
                    Clear
                  </Button>
                </div>
              </div>
              <div className="h-[150px] overflow-y-auto border rounded-md p-2">
                {bibleBooks.oldTestament.map((book) => (
                  <div key={book} className="flex items-center mb-1">
                    <input
                      type="checkbox"
                      id={`book-${book}`}
                      checked={selectedBooks.includes(book)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedBooks(prev => [...prev, book]);
                        } else {
                          setSelectedBooks(prev => prev.filter(b => b !== book));
                        }
                      }}
                      className="mr-2"
                    />
                    <label htmlFor={`book-${book}`} className="text-sm">{book}</label>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="font-medium">New Testament</div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleBookSelection("newTestament", true)}
                  >
                    Select All
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleBookSelection("newTestament", false)}
                  >
                    Clear
                  </Button>
                </div>
              </div>
              <div className="h-[150px] overflow-y-auto border rounded-md p-2">
                {bibleBooks.newTestament.map((book) => (
                  <div key={book} className="flex items-center mb-1">
                    <input
                      type="checkbox"
                      id={`book-${book}`}
                      checked={selectedBooks.includes(book)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedBooks(prev => [...prev, book]);
                        } else {
                          setSelectedBooks(prev => prev.filter(b => b !== book));
                        }
                      }}
                      className="mr-2"
                    />
                    <label htmlFor={`book-${book}`} className="text-sm">{book}</label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="difficultyLevel">Difficulty Level</Label>
            <Select 
              value={difficultyLevel} 
              onValueChange={(value: QuizDifficultyLevel) => setDifficultyLevel(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select difficulty level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy-to-go">Easy to Go (5s, 5pts)</SelectItem>
                <SelectItem value="minimum-thinking">Minimum Thinking (7s, 10pts)</SelectItem>
                <SelectItem value="maximum-thinking">Maximum Thinking (10s, 15pts)</SelectItem>
                <SelectItem value="crack-my-head">Crack My Head (15s, 20pts)</SelectItem>
                <SelectItem value="granite-hard">Granite Hard (20s, 25pts)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="questionCount">Number of Questions</Label>
            <Select 
              value={questionCount.toString()} 
              onValueChange={(value) => setQuestionCount(parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select number of questions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 questions</SelectItem>
                <SelectItem value="10">10 questions</SelectItem>
                <SelectItem value="15">15 questions</SelectItem>
                <SelectItem value="20">20 questions</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="pt-4">
          <Button onClick={startQuiz} className="w-full">
            Start Timed Quiz
          </Button>
        </div>
      </div>
    );
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookText className="h-5 w-5 text-primary" />
          <span>Bible Quiz Assessment</span>
        </CardTitle>
        <CardDescription>
          Test your knowledge of the Bible with timed interactive quizzes
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {isGenerating ? (
          <GrowingSeedAnimation message="Growing your quiz questions..." />
        ) : quizStarted ? (
          quizCompleted ? renderResults() : renderQuestion()
        ) : (
          renderQuizSetup()
        )}
      </CardContent>
    </Card>
  );
}
