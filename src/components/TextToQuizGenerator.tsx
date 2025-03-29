
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, FileText, Sparkles, Save, FileUp } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { generateQAPairsFromText, generateQAPairsFromPDF, QAPair } from "@/services/qa-generator";
import { saveGeneratedQuiz } from "@/services/quiz-generator";

const QUESTION_TYPE_OPTIONS = [
  { value: "all", label: "All Types" },
  { value: "what", label: "What Questions" },
  { value: "who", label: "Who Questions" },
  { value: "where", label: "Where Questions" },
  { value: "when", label: "When Questions" },
  { value: "why", label: "Why Questions" },
  { value: "how", label: "How Questions" },
];

export function TextToQuizGenerator() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [numQuestions, setNumQuestions] = useState("5");
  const [questionType, setQuestionType] = useState("all");
  const [isLoading, setIsLoading] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<QAPair[]>([]);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type === "application/pdf") {
        setFile(selectedFile);
        // Clear the text content when a file is selected
        setContent("");
      } else {
        toast({
          variant: "destructive",
          title: "Invalid file type",
          description: "Please upload a PDF file"
        });
      }
    }
  };
  
  const handleGenerateQuestions = async () => {
    if (!title) {
      toast({
        variant: "destructive",
        title: "Title required",
        description: "Please provide a title for your quiz"
      });
      return;
    }
    
    if (!file && !content.trim()) {
      toast({
        variant: "destructive",
        title: "Content required",
        description: "Please provide text or upload a PDF file"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      let questions: QAPair[] = [];
      const questionTypes = questionType === "all" 
        ? ["what", "who", "where", "when", "why", "how"] 
        : [questionType];
      
      if (file) {
        // Generate from PDF
        questions = await generateQAPairsFromPDF(file, {
          numQuestions: parseInt(numQuestions),
          questionTypes
        });
      } else {
        // Generate from text
        questions = await generateQAPairsFromText(content, {
          numQuestions: parseInt(numQuestions),
          questionTypes
        });
      }
      
      setGeneratedQuestions(questions);
      
      toast({
        title: "Questions generated",
        description: `Successfully generated ${questions.length} questions`
      });
    } catch (error) {
      console.error("Error generating questions:", error);
      toast({
        variant: "destructive",
        title: "Generation failed",
        description: error instanceof Error ? error.message : "Failed to generate questions"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSaveAsQuiz = () => {
    if (generatedQuestions.length === 0) {
      toast({
        variant: "destructive",
        title: "No questions",
        description: "Please generate questions first"
      });
      return;
    }
    
    try {
      // Convert QA pairs to quiz format
      const quizQuestions = generatedQuestions.map((qa, index) => ({
        id: `ai-${Date.now()}-${index}`,
        questionText: qa.question,
        correctAnswer: qa.answer,
        options: undefined,
        type: "free-response",
        explanation: "",
      }));
      
      // Save the quiz
      saveGeneratedQuiz({
        title,
        questions: quizQuestions,
        timestamp: Date.now()
      });
      
      toast({
        title: "Quiz saved",
        description: "The generated quiz has been saved"
      });
      
      // Reset form
      setGeneratedQuestions([]);
      setTitle("");
      setContent("");
      setFile(null);
    } catch (error) {
      console.error("Error saving quiz:", error);
      toast({
        variant: "destructive",
        title: "Save failed",
        description: "Failed to save the quiz"
      });
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>AI Question Generator</CardTitle>
        <CardDescription>
          Generate questions from text or PDF using AI
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="num-questions">Number of Questions</Label>
            <Select value={numQuestions} onValueChange={setNumQuestions}>
              <SelectTrigger id="num-questions">
                <SelectValue placeholder="Select number of questions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">3 questions</SelectItem>
                <SelectItem value="5">5 questions</SelectItem>
                <SelectItem value="10">10 questions</SelectItem>
                <SelectItem value="15">15 questions</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="question-type">Question Type</Label>
            <Select value={questionType} onValueChange={setQuestionType}>
              <SelectTrigger id="question-type">
                <SelectValue placeholder="Select question type" />
              </SelectTrigger>
              <SelectContent>
                {QUESTION_TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label>Content Source</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center">
                <FileUp className="h-4 w-4 mr-2" />
                <Label htmlFor="pdf-upload">Upload PDF</Label>
              </div>
              <Input
                id="pdf-upload"
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                disabled={content.trim().length > 0}
                className="flex-1"
              />
              {file && (
                <div className="flex items-center gap-2 p-2 bg-secondary/20 rounded">
                  <FileText className="h-4 w-4" />
                  <span className="text-sm">{file.name}</span>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center">
                <FileText className="h-4 w-4 mr-2" />
                <Label htmlFor="text-input">Or Enter Text</Label>
              </div>
              <Textarea
                id="text-input"
                placeholder="Enter text content here..."
                rows={5}
                value={content}
                onChange={(e) => {
                  setContent(e.target.value);
                  if (e.target.value.trim().length > 0) {
                    setFile(null);
                  }
                }}
                disabled={!!file}
                className="resize-none"
              />
            </div>
          </div>
        </div>
        
        {generatedQuestions.length > 0 && (
          <div className="space-y-4 border rounded-md p-4">
            <h3 className="text-lg font-semibold">Generated Questions</h3>
            <div className="max-h-[400px] overflow-y-auto space-y-4">
              {generatedQuestions.map((qa, idx) => (
                <div key={idx} className="p-3 border rounded-md bg-secondary/10">
                  <p className="font-medium mb-2">{idx + 1}. {qa.question}</p>
                  <p className="text-sm ml-4 text-muted-foreground">{qa.answer}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={handleSaveAsQuiz}
          disabled={generatedQuestions.length === 0}
        >
          <Save className="h-4 w-4 mr-2" />
          Save as Quiz
        </Button>
        
        <Button 
          onClick={handleGenerateQuestions} 
          disabled={isLoading || (!file && !content.trim()) || !title}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Generate Questions
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
