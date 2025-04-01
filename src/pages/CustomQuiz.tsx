import { useState, useEffect } from "react";
import { Layout } from "@/components/layout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  FileText, 
  BookOpen, 
  List, 
  CheckSquare, 
  Download, 
  Calendar,
  FileCheck,
  PenTool
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  getSavedGeneratedQuizzes,
  GeneratedQuiz
} from "@/services/quiz-generator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TextToQuizGenerator } from "@/components/TextToQuizGenerator";

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
      try {
        const aiQuizzes = await getSavedGeneratedQuizzes();
        setGeneratedQuizzes(aiQuizzes);
      } catch (error) {
        console.error("Error fetching generated quizzes:", error);
      }
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

function CustomQuiz() {
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Custom Quizzes</h1>
        </div>
        
        <Tabs defaultValue="text-to-quiz" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="text-to-quiz">
              <PenTool className="h-4 w-4 mr-2" />
              Text to Quiz
              <Badge className="ml-2 bg-primary" variant="secondary">New</Badge>
            </TabsTrigger>
            <TabsTrigger value="saved">
              <FileText className="h-4 w-4 mr-2" />
              Saved Quizzes
            </TabsTrigger>
          </TabsList>
          <TabsContent value="text-to-quiz" className="mt-6">
            <TextToQuizGenerator />
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
