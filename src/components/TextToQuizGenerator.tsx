
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
  saveGeneratedQuiz, 
  GeneratedQuiz, 
  QuizQuestion 
} from "@/services/quiz-generator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";

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
      // Check authentication
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) {
        toast({
          variant: "destructive",
          title: "Authentication required",
          description: "Please log in to generate quizzes"
        });
        setIsLoading(false);
        return;
      }

      // Call our Supabase edge function to generate questions
      const response = await fetch("/api/generate-quiz", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.session.access_token}`
        },
        body: JSON.stringify({
          content,
          title,
          numQuestions: parseInt(numQuestions),
          quizType
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate quiz");
      }

      const data = await response.json();
      
      const generatedQuiz: GeneratedQuiz = {
        id: crypto.randomUUID(),
        title: title,
        timestamp: new Date().toISOString(),
        questions: data.questions
      };
      
      setPreviewQuiz(generatedQuiz);
      setShowPreview(true);
      
      toast({
        title: "Quiz generated successfully",
        description: `Your "${title}" quiz is ready to preview`
      });
    } catch (error) {
      console.error("Quiz generation error:", error);
      toast({
        variant: "destructive",
        title: "Error generating quiz",
        description: error instanceof Error ? error.message : "There was a problem generating your quiz"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveQuiz = async () => {
    if (!previewQuiz) {
      toast({
        variant: "destructive",
        title: "No quiz to save",
        description: "Please generate a quiz first"
      });
      return;
    }

    setIsSaving(true);
    
    try {
      // Check authentication
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) {
        toast({
          variant: "destructive",
          title: "Authentication required",
          description: "Please log in to save quizzes"
        });
        setIsSaving(false);
        return;
      }

      // Use generated_quizzes instead of ai_quizzes for TypeScript compatibility
      // Convert questions to Json type
      const jsonQuestions = JSON.parse(JSON.stringify(previewQuiz.questions)) as Json;
      
      // Save quiz to database
      const { error } = await supabase
        .from("generated_quizzes")
        .insert({
          title: previewQuiz.title,
          questions: jsonQuestions,
          user_id: session.session.user.id
        });
        
      if (error) throw error;
      
      // Also save to localStorage using existing function
      await saveGeneratedQuiz(previewQuiz);
      
      toast({
        title: "Quiz saved successfully",
        description: `"${title}" has been saved to your database`
      });
      
      // Reset form after successful save
      setTitle("");
      setContent("");
      setPreviewQuiz(null);
      setShowPreview(false);
    } catch (error) {
      console.error("Quiz save error:", error);
      toast({
        variant: "destructive",
        title: "Error saving quiz",
        description: "There was a problem saving your quiz"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const renderQuizPreview = () => {
    if (!previewQuiz) return null;
    
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{previewQuiz.title}</h3>
          <Badge variant="outline" className="bg-coral/10 text-coral-light border-coral/20">
            {previewQuiz.questions.length} questions
          </Badge>
        </div>
        
        <div className="max-h-[400px] overflow-y-auto space-y-4 border rounded-md p-4 glass-card">
          {previewQuiz.questions.map((question, idx) => (
            <div key={question.id} className="p-3 border rounded-md bg-card/80">
              <p className="font-medium mb-2">{idx + 1}. {question.questionText}</p>
              
              {question.options && (
                <div className="ml-4 space-y-1">
                  {question.options.map((option, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-teal/20" />
                      <p className={option === question.correctAnswer ? "text-teal-light font-medium" : ""}>{option}</p>
                      {option === question.correctAnswer && <Badge variant="outline" className="text-xs bg-teal/10 border-teal/20 text-teal-light">Correct</Badge>}
                    </div>
                  ))}
                </div>
              )}
              
              {!question.options && (
                <div className="ml-4">
                  <p className="text-teal-light font-medium">Answer: {question.correctAnswer}</p>
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
    <Card className="w-full border-coral/20 glass-card">
      <CardHeader>
        <CardTitle className="text-coral-light">Text to Quiz</CardTitle>
        <CardDescription>
          Enter text content to create a custom quiz based on it using AI
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
            className="border-teal/20 focus:border-teal/50 focus-visible:ring-teal/20"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="content">Text Content</Label>
          <Textarea
            id="content"
            placeholder="Paste or type the text content for your quiz..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[200px] border-teal/20 focus:border-teal/50 focus-visible:ring-teal/20"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="num-questions">Number of Questions</Label>
            <Select value={numQuestions} onValueChange={setNumQuestions}>
              <SelectTrigger id="num-questions" className="border-teal/20 focus:border-teal/50 focus-visible:ring-teal/20">
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
              <SelectTrigger id="quiz-type" className="border-teal/20 focus:border-teal/50 focus-visible:ring-teal/20">
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
          className="gap-2 bg-coral hover:bg-coral-dark"
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
        <DialogContent className="sm:max-w-[700px] glass-card border-coral/20">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-coral-light">
              <FileCheck className="h-5 w-5" />
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
            <Button variant="outline" onClick={() => setShowPreview(false)} className="border-teal/20 hover:bg-teal/10">
              Cancel
            </Button>
            <Button 
              onClick={handleSaveQuiz} 
              disabled={isSaving}
              className="bg-coral hover:bg-coral-dark"
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
