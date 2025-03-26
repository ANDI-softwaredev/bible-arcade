
import React, { useState, useEffect } from 'react';
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
import { CheckCircle, XCircle, AlertCircle, BookText } from "lucide-react";
import { 
  bibleBooks, 
  QuizQuestion, 
  QuestionDifficulty, 
  QuestionType,
  generateQuiz,
  saveQuizAttempt
} from "@/data/bible-database";
import { useToast } from "@/hooks/use-toast";

interface BibleQuizProps {
  onComplete?: (score: number, totalPossible: number, percentageScore: number) => void;
}

export function BibleQuiz({ onComplete }: BibleQuizProps) {
  const { toast } = useToast();
  
  // Quiz configuration
  const [selectedBooks, setSelectedBooks] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState<QuestionDifficulty>("medium");
  const [questionCount, setQuestionCount] = useState(5);
  const [quizStarted, setQuizStarted] = useState(false);
  
  // Quiz state
  const [currentQuestions, setCurrentQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [totalPossible, setTotalPossible] = useState(0);
  
  // Update selected books
  const handleBookSelection = (testament: "oldTestament" | "newTestament", selected: boolean) => {
    if (selected) {
      setSelectedBooks(prev => [...prev, ...bibleBooks[testament]]);
    } else {
      setSelectedBooks(prev => prev.filter(book => !bibleBooks[testament].includes(book)));
    }
  };
  
  // Start the quiz
  const startQuiz = () => {
    const questions = generateQuiz({
      books: selectedBooks.length > 0 ? selectedBooks : undefined,
      difficulty,
      questionCount,
    });
    
    if (questions.length === 0) {
      toast({
        title: "No questions available",
        description: "Please select different criteria or try a different difficulty level.",
        variant: "destructive"
      });
      return;
    }
    
    setCurrentQuestions(questions);
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setQuizStarted(true);
    setQuizCompleted(false);
    setScore(0);
    setTotalPossible(questions.reduce((sum, q) => sum + q.points, 0));
  };
  
  // Handle answer selection
  const handleAnswerSelect = (questionId: string, answer: string) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };
  
  // Navigate to next question
  const goToNextQuestion = () => {
    if (currentQuestionIndex < currentQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      finishQuiz();
    }
  };
  
  // Navigate to previous question
  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };
  
  // Finish the quiz and calculate score
  const finishQuiz = () => {
    let calculatedScore = 0;
    
    const questionResults = currentQuestions.map(question => {
      const userAnswer = userAnswers[question.id] || "";
      const isCorrect = userAnswer === question.correctAnswer;
      const pointsEarned = isCorrect ? question.points : 0;
      
      calculatedScore += pointsEarned;
      
      return {
        questionId: question.id,
        userAnswer,
        isCorrect,
        pointsEarned
      };
    });
    
    setScore(calculatedScore);
    setQuizCompleted(true);
    
    // Save quiz attempt
    const percentageScore = Math.round((calculatedScore / totalPossible) * 100);
    
    saveQuizAttempt({
      quizId: `quiz-${Date.now()}`,
      date: new Date(),
      score: calculatedScore,
      totalPossible,
      percentageScore,
      questions: questionResults
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
    setQuizStarted(false);
    setQuizCompleted(false);
  };
  
  // Render the current question
  const renderQuestion = () => {
    if (currentQuestions.length === 0) return null;
    
    const question = currentQuestions[currentQuestionIndex];
    const userAnswer = userAnswers[question.id] || "";
    const isShowingResults = quizCompleted;
    
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
            Question {currentQuestionIndex + 1} of {currentQuestions.length}
          </div>
          <div className="text-sm text-muted-foreground">
            {question.book} {question.chapter}{question.verse ? `:${question.verse}` : ""}
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
                <div key={idx} className="flex items-center space-x-2">
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
                      "flex items-center gap-2",
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
        
        <div className="flex justify-between pt-4">
          <Button
            variant="outline"
            onClick={goToPreviousQuestion}
            disabled={currentQuestionIndex === 0}
          >
            Previous
          </Button>
          
          {!quizCompleted && userAnswer && (
            <Button
              onClick={goToNextQuestion}
            >
              {currentQuestionIndex === currentQuestions.length - 1 ? "Finish Quiz" : "Next Question"}
            </Button>
          )}
          
          {quizCompleted && (
            <Button onClick={restartQuiz}>
              Start New Quiz
            </Button>
          )}
        </div>
      </div>
    );
  };
  
  // Render quiz results
  const renderResults = () => {
    if (!quizCompleted) return null;
    
    const percentageScore = Math.round((score / totalPossible) * 100);
    
    return (
      <div className="space-y-4">
        <div className="text-center py-4">
          <div className="text-2xl font-bold mb-2">Quiz Results</div>
          <div className="text-4xl font-bold text-primary mb-2">{percentageScore}%</div>
          <div className="text-lg">
            You scored {score} out of {totalPossible} points
          </div>
        </div>
        
        <Progress 
          value={percentageScore} 
          className="h-3" 
        />
        
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
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Select Books</h3>
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
            <Label htmlFor="difficulty">Difficulty</Label>
            <Select 
              value={difficulty} 
              onValueChange={(value: QuestionDifficulty) => setDifficulty(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
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
            Start Quiz
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
          Test your knowledge of the Bible with interactive quizzes
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {quizStarted ? (
          quizCompleted ? renderResults() : renderQuestion()
        ) : (
          renderQuizSetup()
        )}
      </CardContent>
    </Card>
  );
}
