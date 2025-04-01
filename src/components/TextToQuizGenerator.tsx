
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, PenTool, CheckSquare, List, Save, Loader2, Sparkles, FileCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  generateAIQuiz, 
  saveGeneratedQuiz, 
  GeneratedQuiz, 
  QuizQuestion 
} from "@/services/quiz-generator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const QuizTypeOptions = [
  { value: "multiple-choice", label: "Multiple Choice", icon: CheckSquare },
  { value: "true-false", label: "True/False", icon: List },
  { value: "fill-in-blanks", label: "Fill in the Blanks", icon: FileText },
];

export function TextToQuizGenerator() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [numQuestions, setNumQuestions] = useState("10");
  const [quizType, setQuizType] = useState("multiple-choice");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [previewQuiz, setPreviewQuiz] = useState<GeneratedQuiz | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const { toast } = useToast();

  const handleCreateQuiz = async () => {
    if (!content.trim()) {
      toast({
        variant: "destructive",
        title: "Missing content",
        description: "Please provide text content for your quiz"
      });
      return;
    }

    if (!title.trim()) {
      toast({
        variant: "destructive",
        title: "Missing title",
        description: "Please provide a title for your quiz"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const generatedQuiz = await generateAIQuiz({
        content: content,
        title: title,
        numQuestions: parseInt(numQuestions),
        quizType: quizType as "multiple-choice" | "true-false" | "fill-in-blanks"
      });
      
      setPreviewQuiz(generatedQuiz);
      setShowPreview(true);
      
      toast({
        title: "Quiz generated successfully",
        description: `Your "${title}" quiz is ready to preview`
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error generating quiz",
        description: "There was a problem generating your quiz"
      });
      console.error("Quiz generation error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveQuiz = () => {
    if (!previewQuiz) {
      toast({
        variant: "destructive",
        title: "No quiz to save",
        description: "Please generate a quiz first"
      });
      return;
    }

    setIsSaving(true);
    
    saveGeneratedQuiz(previewQuiz);
    
    setTimeout(() => {
      setIsSaving(false);
      setShowPreview(false);
      
      toast({
        title: "Quiz saved successfully",
        description: `"${title}" has been saved to your database`
      });
    }, 1000);
  };

  const renderQuizPreview = () => {
    if (!previewQuiz) return null;
    
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{previewQuiz.title}</h3>
          <Badge variant="outline">{previewQuiz.questions.length} questions</Badge>
        </div>
        
        <div className="max-h-[400px] overflow-y-auto space-y-4 border rounded-md p-4">
          {previewQuiz.questions.map((question, idx) => (
            <div key={question.id} className="p-3 border rounded-md bg-secondary/10">
              <p className="font-medium mb-2">{idx + 1}. {question.questionText}</p>
              
              {question.options && (
                <div className="ml-4 space-y-1">
                  {question.options.map((option, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-primary/20" />
                      <p className={option === question.correctAnswer ? "text-primary font-medium" : ""}>{option}</p>
                      {option === question.correctAnswer && <Badge variant="outline" className="text-xs">Correct</Badge>}
                    </div>
                  ))}
                </div>
              )}
              
              {!question.options && (
                <div className="ml-4">
                  <p className="text-primary font-medium">Answer: {question.correctAnswer}</p>
                </div>
              )}
              
              {question.explanation && (
                <div className="mt-2 text-sm text-muted-foreground border-t pt-2">
                  <span className="font-medium">Explanation:</span> {question.explanation}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Text to Quiz</CardTitle>
        <CardDescription>
          Enter text content to create a custom quiz based on it
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title">Quiz Title</Label>
          <Input
            id="title"
            placeholder="Enter a title for your quiz"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="content">Text Content</Label>
          <Textarea
            id="content"
            placeholder="Paste or type the text content for your quiz..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[200px]"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="num-questions">Number of Questions</Label>
            <Select value={numQuestions} onValueChange={setNumQuestions}>
              <SelectTrigger id="num-questions">
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
          
          <div className="space-y-2">
            <Label htmlFor="quiz-type">Question Type</Label>
            <Select value={quizType} onValueChange={setQuizType}>
              <SelectTrigger id="quiz-type">
                <SelectValue placeholder="Select question type" />
              </SelectTrigger>
              <SelectContent>
                {QuizTypeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      <option.icon className="h-4 w-4" />
                      <span>{option.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button 
          onClick={handleCreateQuiz} 
          disabled={isLoading || !content.trim() || !title.trim()}
          className="gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Generate with AI
            </>
          )}
        </Button>
      </CardFooter>

      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileCheck className="h-5 w-5 text-primary" />
              AI Generated Quiz Preview
            </DialogTitle>
            <DialogDescription>
              Review your AI-generated quiz before saving it
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            {renderQuizPreview()}
          </div>
          
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setShowPreview(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSaveQuiz} 
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Quiz
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
