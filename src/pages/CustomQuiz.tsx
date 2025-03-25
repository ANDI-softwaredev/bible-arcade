import { useState } from "react";
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
  QrCode
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

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

  const handleCreateQuiz = () => {
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
    
    // Simulate quiz creation
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Quiz created successfully",
        description: `Your "${title}" quiz is ready to use`
      });
    }, 2000);
  };

  const handleSaveQuiz = () => {
    if (!title.trim()) {
      toast({
        variant: "destructive",
        title: "Missing title",
        description: "Please provide a title for your quiz"
      });
      return;
    }

    setIsSaving(true);
    
    // Simulate saving to database
    setTimeout(() => {
      setIsSaving(false);
      toast({
        title: "Quiz saved successfully",
        description: `"${title}" has been saved to your database`
      });
    }, 1500);
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
          onClick={handleSaveQuiz} 
          disabled={isSaving || !title.trim()}
        >
          {isSaving ? (
            <>Saving</>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save to Database
            </>
          )}
        </Button>
        
        <Button 
          onClick={handleCreateQuiz} 
          disabled={isLoading || !file || !title.trim()}
        >
          {isLoading ? "Creating..." : "Create Quiz"}
        </Button>
      </CardFooter>
    </Card>
  );
}

function SavedQuizzes() {
  const savedQuizzes = [
    { id: 1, title: "Romans Study", questions: 10, type: "multiple-choice", created: "2023-05-15" },
    { id: 2, title: "Psalms Overview", questions: 15, type: "true-false", created: "2023-06-02" },
    { id: 3, title: "Genesis Chapter 1", questions: 5, type: "fill-in-blanks", created: "2023-06-10" },
  ];

  return (
    <div className="space-y-4">
      {savedQuizzes.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">
          You haven't created any quizzes yet
        </div>
      ) : (
        savedQuizzes.map((quiz) => (
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
        ))
      )}
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
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="create">
              <Plus className="h-4 w-4 mr-2" />
              Create New
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
