import { useState, useEffect } from "react";
import { Layout } from "@/components/layout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  FileUp, 
  Plus, 
  FileText, 
  BookOpen, 
  List, 
  CheckSquare, 
  Download, 
  Calendar, 
  Save,
  Scan,
  Sparkles,
  Smartphone,
  QrCode,
  Loader2,
  FileCheck,
  Zap,
  PenTool
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  extractPdfText, 
  generateAIQuiz, 
  saveGeneratedQuiz, 
  getSavedGeneratedQuizzes,
  GeneratedQuiz
} from "@/services/quiz-generator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TextToQuizGenerator } from "@/components/TextToQuizGenerator";

const QuizTypeOptions = [
  { value: "multiple-choice", label: "Multiple Choice", icon: CheckSquare },
  { value: "true-false", label: "True/False", icon: List },
  { value: "fill-in-blanks", label: "Fill in the Blanks", icon: FileText },
];

function QuizCreator() {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [numQuestions, setNumQuestions] = useState("10");
  const [quizType, setQuizType] = useState("multiple-choice");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewQuiz, setPreviewQuiz] = useState<GeneratedQuiz | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type === "application/pdf" || selectedFile.type === "text/plain") {
        setFile(selectedFile);
      } else {
        toast({
          variant: "destructive",
          title: "Invalid file type",
          description: "Please upload a PDF or TXT file"
        });
      }
    }
  };

  const handleCreateQuiz = async () => {
    if (!file) {
      toast({
        variant: "destructive",
        title: "No file selected",
        description: "Please upload a PDF or text file"
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
      setIsProcessing(true);
      const extractedText = await extractPdfText(file);
      
      const generatedQuiz = await generateAIQuiz({
        content: extractedText,
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
        description: "There was a problem processing your file"
      });
      console.error("Quiz generation error:", error);
    } finally {
      setIsLoading(false);
      setIsProcessing(false);
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
        <CardTitle>Create Custom Quiz</CardTitle>
        <CardDescription>
          Upload a PDF or text file to create a custom quiz based on its content
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
          <Label htmlFor="file-upload">Upload Content</Label>
          <div className="flex items-center gap-2">
            <Input
              id="file-upload"
              type="file"
              accept=".pdf,.txt"
              onChange={handleFileChange}
              className="flex-1"
            />
          </div>
          {file && (
            <div className="flex items-center gap-2 p-2 bg-secondary/20 rounded">
              <FileText className="h-4 w-4" />
              <span className="text-sm">{file.name}</span>
              <Badge variant="outline" className="ml-auto text-xs">
                {(file.size / 1024).toFixed(1)} KB
              </Badge>
            </div>
          )}
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
      <CardFooter className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={() => {}}
          disabled={true}
        >
          <Save className="h-4 w-4 mr-2" />
          Save Template
        </Button>
        
        <Button 
          onClick={handleCreateQuiz} 
          disabled={isLoading || !file || !title.trim()}
          className="gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {isProcessing ? "Processing..." : "Creating..."}
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

function SavedQuizzes() {
  const [savedQuizzes, setSavedQuizzes] = useState<GeneratedQuiz[]>([]);
  const [generatedQuizzes, setGeneratedQuizzes] = useState<GeneratedQuiz[]>([]);
  
  useEffect(() => {
    const existingQuizzes = [
      { id: 1, title: "Romans Study", questions: 10, type: "multiple-choice", created: "2023-05-15" },
      { id: 2, title: "Psalms Overview", questions: 15, type: "true-false", created: "2023-06-02" },
      { id: 3, title: "Genesis Chapter 1", questions: 5, type: "fill-in-blanks", created: "2023-06-10" },
    ];
    
    const fetchQuizzes = async () => {
      const aiQuizzes = await getSavedGeneratedQuizzes();
      setGeneratedQuizzes(aiQuizzes);
    };
    
    fetchQuizzes();
  }, []);

  return (
    <div className="space-y-6">
      {generatedQuizzes.length > 0 && (
        <>
          <h3 className="text-lg font-medium flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            AI Generated Quizzes
          </h3>
          
          <div className="space-y-4">
            {generatedQuizzes.map((quiz, index) => (
              <Card key={`ai-${index}`} className="overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center">
                  <CardHeader className="flex-1 pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        {quiz.title}
                        <Badge variant="outline" className="ml-2">AI Generated</Badge>
                      </CardTitle>
                    </div>
                    <CardDescription className="flex items-center gap-4 mt-1">
                      <span className="flex items-center gap-1">
                        <FileText className="h-3.5 w-3.5" />
                        {quiz.questions.length} questions
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(quiz.timestamp).toLocaleDateString()}
                      </span>
                    </CardDescription>
                  </CardHeader>
                  <div className="flex items-center gap-2 p-4 sm:pr-4">
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-1" />
                      Export
                    </Button>
                    <Button size="sm">
                      <BookOpen className="h-4 w-4 mr-1" />
                      Start
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
      
      <h3 className="text-lg font-medium">Saved Quizzes</h3>
      <div className="space-y-4">
        {[
          { id: 1, title: "Romans Study", questions: 10, type: "multiple-choice", created: "2023-05-15" },
          { id: 2, title: "Psalms Overview", questions: 15, type: "true-false", created: "2023-06-02" },
          { id: 3, title: "Genesis Chapter 1", questions: 5, type: "fill-in-blanks", created: "2023-06-10" },
        ].map((quiz) => (
          <Card key={quiz.id} className="overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center">
              <CardHeader className="flex-1 pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{quiz.title}</CardTitle>
                </div>
                <CardDescription className="flex items-center gap-4 mt-1">
                  <span className="flex items-center gap-1">
                    <FileText className="h-3.5 w-3.5" />
                    {quiz.questions} questions
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {quiz.created}
                  </span>
                </CardDescription>
              </CardHeader>
              <div className="flex items-center gap-2 p-4 sm:pr-4">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-1" />
                  Export
                </Button>
                <Button size="sm">
                  <BookOpen className="h-4 w-4 mr-1" />
                  Start
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function MobileAR() {
  const arExperiences = [
    { 
      id: 1, 
      title: "3D Bible Scenes", 
      description: "Experience biblical scenes in augmented reality",
      icon: Scan 
    },
    { 
      id: 2, 
      title: "Scripture Places", 
      description: "Visit historical biblical locations in AR",
      icon: Scan 
    },
    { 
      id: 3, 
      title: "Characters AR", 
      description: "Interact with biblical figures in your space",
      icon: Sparkles 
    },
  ];

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-lg bg-gradient-to-br from-indigo-900/60 to-purple-800/60 backdrop-blur-sm border border-indigo-500/30 shadow-lg">
        <h3 className="text-xl font-bold text-white mb-2 flex items-center">
          <Smartphone className="h-5 w-5 mr-2 text-indigo-300" />
          Mobile AR Experience
        </h3>
        <p className="text-indigo-100">
          Access powerful augmented reality features directly from your mobile device.
          Point your camera at study materials to bring them to life.
        </p>
        <div className="mt-4 flex items-center gap-2">
          <QrCode className="h-10 w-10 text-white" />
          <div>
            <Badge className="bg-indigo-600 hover:bg-indigo-700">New Feature</Badge>
            <p className="text-xs text-indigo-200 mt-1">Scan this QR code with your mobile device to access AR features</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {arExperiences.map((exp) => (
          <Card key={exp.id} className="overflow-hidden border border-purple-500/20 bg-background/80 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center">
                  <exp.icon className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-md">{exp.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{exp.description}</p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" size="sm" className="w-full">
                <Sparkles className="h-4 w-4 mr-2" />
                Launch Experience
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}

function CustomQuiz() {
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Custom Quizzes</h1>
        </div>
        
        <Tabs defaultValue="create" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="create">
              <Plus className="h-4 w-4 mr-2" />
              Create New
            </TabsTrigger>
            <TabsTrigger value="text-to-quiz">
              <PenTool className="h-4 w-4 mr-2" />
              Text to Quiz
              <Badge className="ml-2 bg-primary" variant="secondary">New</Badge>
            </TabsTrigger>
            <TabsTrigger value="saved">
              <FileText className="h-4 w-4 mr-2" />
              Saved Quizzes
            </TabsTrigger>
            <TabsTrigger value="ar" className="relative">
              <Scan className="h-4 w-4 mr-2" />
              Mobile AR
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/60 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
              </span>
            </TabsTrigger>
          </TabsList>
          <TabsContent value="create" className="mt-6">
            <QuizCreator />
          </TabsContent>
          <TabsContent value="text-to-quiz" className="mt-6">
            <TextToQuizGenerator />
          </TabsContent>
          <TabsContent value="saved" className="mt-6">
            <SavedQuizzes />
          </TabsContent>
          <TabsContent value="ar" className="mt-6">
            <MobileAR />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}

export default CustomQuiz;
