
import { useState } from "react";
import { Layout } from "@/components/layout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileUpload, Plus, FileText, BookOpen, List, CheckSquare, Download, Calendar } from "lucide-react";
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
      <CardFooter className="flex justify-end">
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
  // This would typically come from an API or database
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

function CustomQuiz() {
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Custom Quizzes</h1>
        </div>
        
        <Tabs defaultValue="create" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="create">
              <Plus className="h-4 w-4 mr-2" />
              Create New
            </TabsTrigger>
            <TabsTrigger value="saved">
              <FileText className="h-4 w-4 mr-2" />
              Saved Quizzes
            </TabsTrigger>
          </TabsList>
          <TabsContent value="create" className="mt-6">
            <QuizCreator />
          </TabsContent>
          <TabsContent value="saved" className="mt-6">
            <SavedQuizzes />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}

export default CustomQuiz;
