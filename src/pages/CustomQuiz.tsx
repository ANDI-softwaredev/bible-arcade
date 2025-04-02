
import { useState, useEffect } from "react";
import { Layout } from "@/components/layout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  PenTool,
  Sparkle,
  RefreshCcw
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
  const [generatedQuizzes, setGeneratedQuizzes] = useState<GeneratedQuiz[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();
  
  const loadQuizzes = async () => {
    try {
      setIsRefreshing(true);
      const aiQuizzes = await getSavedGeneratedQuizzes();
      setGeneratedQuizzes(aiQuizzes);
    } catch (error) {
      console.error("Error fetching generated quizzes:", error);
      toast({
        variant: "destructive",
        title: "Failed to load quizzes",
        description: "There was an error loading your saved quizzes."
      });
    } finally {
      setIsRefreshing(false);
    }
  };
  
  useEffect(() => {
    loadQuizzes();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium flex items-center gap-2 text-coral-light">
          <Sparkle className="h-4 w-4" />
          Your Quizzes
        </h3>
        
        <Button 
          variant="outline" 
          size="sm" 
          className="border-teal/20 hover:bg-teal/10"
          onClick={loadQuizzes}
          disabled={isRefreshing}
        >
          <RefreshCcw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>
      
      {generatedQuizzes.length > 0 ? (
        <div className="space-y-4">
          {generatedQuizzes.map((quiz, index) => (
            <Card key={`ai-${index}`} className="overflow-hidden glass-card border-coral/20">
              <div className="flex flex-col sm:flex-row sm:items-center">
                <CardHeader className="flex-1 pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {quiz.title}
                      <Badge variant="outline" className="ml-2 bg-coral/10 text-coral-light border-coral/20">AI Generated</Badge>
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
                  <Button variant="outline" size="sm" className="border-teal/20 hover:bg-teal/10">
                    <Download className="h-4 w-4 mr-1" />
                    Export
                  </Button>
                  <Button size="sm" className="bg-teal hover:bg-teal-dark">
                    <BookOpen className="h-4 w-4 mr-1" />
                    Start
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-8 text-center glass-card border-coral/20">
          <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <CardTitle className="text-lg mb-2">No saved quizzes yet</CardTitle>
          <CardDescription className="mb-4">
            Generate your first quiz in the "Text to Quiz" tab to get started.
          </CardDescription>
        </Card>
      )}
      
      <h3 className="text-lg font-medium mt-8 text-coral-light">Example Quizzes</h3>
      <div className="space-y-4">
        {[
          { id: 1, title: "Romans Study", questions: 10, type: "multiple-choice", created: "2023-05-15" },
          { id: 2, title: "Psalms Overview", questions: 15, type: "true-false", created: "2023-06-02" },
          { id: 3, title: "Genesis Chapter 1", questions: 5, type: "fill-in-blanks", created: "2023-06-10" },
        ].map((quiz) => (
          <Card key={quiz.id} className="overflow-hidden glass-card border-coral/20">
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
                <Button variant="outline" size="sm" className="border-teal/20 hover:bg-teal/10">
                  <Download className="h-4 w-4 mr-1" />
                  Export
                </Button>
                <Button size="sm" className="bg-teal hover:bg-teal-dark">
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
          <h1 className="text-3xl font-bold tracking-tight text-coral-light">Custom Quizzes</h1>
        </div>
        
        <Tabs defaultValue="text-to-quiz" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-card/60 backdrop-blur-sm">
            <TabsTrigger value="text-to-quiz" className="data-[state=active]:bg-coral/80 data-[state=active]:text-white">
              <PenTool className="h-4 w-4 mr-2" />
              Text to Quiz
              <Badge className="ml-2 bg-teal/80 text-white" variant="secondary">New</Badge>
            </TabsTrigger>
            <TabsTrigger value="saved" className="data-[state=active]:bg-teal/80 data-[state=active]:text-white">
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
