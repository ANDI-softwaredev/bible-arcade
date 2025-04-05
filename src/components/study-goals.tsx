
import React, { useState, useEffect } from 'react';
import { useForm } from "react-hook-form";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "./ui/form";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "./ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { CalendarCheck, BookOpen, Award, Clock, BadgeCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { 
  StudyGoal, 
  saveStudyGoal, 
  getStudyGoals,
  updateStudyGoal
} from "@/services/quiz-generator";
import { calculateOverallProgress, getCompletedBooks } from "@/services/bible-api";

export function StudyGoals() {
  const [goals, setGoals] = useState<StudyGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();
  const form = useForm({
    defaultValues: {
      type: "book",
      target: "",
      targetNumber: 5
    }
  });

  // Load user goals on component mount
  useEffect(() => {
    async function loadGoals() {
      try {
        const userGoals = await getStudyGoals();
        setGoals(userGoals);
      } catch (error) {
        console.error("Error loading goals:", error);
        toast({
          title: "Error",
          description: "Could not load your study goals.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    }

    loadGoals();
  }, [toast]);

  // Create a new goal
  const onSubmit = async (data: any) => {
    try {
      setLoading(true);
      
      // Format the goal based on the type
      const targetValue = data.type === 'book' ? data.target : data.targetNumber;
      
      // Create new goal
      const goalData = {
        type: data.type as 'book' | 'quiz-performance' | 'reading-streak' | 'chapters-read',
        target: targetValue,
        progress: 0,
        completed: false
      };
      
      const success = await saveStudyGoal(goalData);
      
      if (success) {
        toast({
          title: "Goal Added",
          description: "Your new study goal has been set!"
        });
        
        // Refresh goals
        const updatedGoals = await getStudyGoals();
        setGoals(updatedGoals);
        
        // Reset form and hide it
        form.reset();
        setShowForm(false);
      } else {
        throw new Error("Failed to save goal");
      }
    } catch (error) {
      console.error("Error saving goal:", error);
      toast({
        title: "Error",
        description: "Could not save your goal. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Update goal progress (for example, mark as completed)
  const handleCompleteGoal = async (goalId: string) => {
    try {
      const success = await updateStudyGoal(goalId, { completed: true });
      
      if (success) {
        toast({
          title: "Goal Completed",
          description: "Congratulations on achieving your goal!"
        });
        
        // Refresh goals
        const updatedGoals = await getStudyGoals();
        setGoals(updatedGoals);
      }
    } catch (error) {
      console.error("Error updating goal:", error);
      toast({
        title: "Error",
        description: "Could not update your goal status.",
        variant: "destructive"
      });
    }
  };

  // Render a goal card based on its type
  const renderGoalCard = (goal: StudyGoal) => {
    // Calculate progress percentage
    let progressPercentage = 0;
    let goalText = '';
    let icon;
    
    switch (goal.type) {
      case 'book':
        icon = <BookOpen className="h-5 w-5 text-primary" />;
        goalText = `Read the book of ${goal.target}`;
        progressPercentage = goal.progress;
        break;
      case 'quiz-performance':
        icon = <Award className="h-5 w-5 text-amber-500" />;
        goalText = `Achieve ${goal.target}% average quiz score`;
        progressPercentage = goal.progress;
        break;
      case 'reading-streak':
        icon = <CalendarCheck className="h-5 w-5 text-green-500" />;
        goalText = `Maintain a ${goal.target}-day reading streak`;
        progressPercentage = (goal.progress / Number(goal.target)) * 100;
        break;
      case 'chapters-read':
        icon = <BookOpen className="h-5 w-5 text-blue-500" />;
        goalText = `Read ${goal.target} chapters`;
        progressPercentage = (goal.progress / Number(goal.target)) * 100;
        break;
      default:
        icon = <BadgeCheck className="h-5 w-5 text-primary" />;
        goalText = `Complete ${goal.target} goal`;
        progressPercentage = goal.progress;
    }

    return (
      <Card key={goal.id} className={goal.completed ? "border-green-200 bg-green-50/30" : ""}>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <CardTitle className="text-base flex items-center gap-2">
              {icon}
              <span>{goalText}</span>
            </CardTitle>
            {goal.completed && (
              <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                Completed
              </Badge>
            )}
          </div>
          <CardDescription>
            {goal.completed 
              ? `Completed on ${new Date(goal.updatedAt).toLocaleDateString()}` 
              : `Set on ${new Date(goal.createdAt).toLocaleDateString()}`
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span className="font-medium">
                {goal.type === 'reading-streak' || goal.type === 'chapters-read' 
                  ? `${goal.progress} / ${goal.target}` 
                  : `${Math.round(progressPercentage)}%`
                }
              </span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        </CardContent>
        {!goal.completed && (
          <CardFooter>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full" 
              onClick={() => handleCompleteGoal(goal.id)}
            >
              Mark as Completed
            </Button>
          </CardFooter>
        )}
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Your Study Goals</h2>
        {!showForm && (
          <Button onClick={() => setShowForm(true)} size="sm">
            Add New Goal
          </Button>
        )}
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Set a New Goal</CardTitle>
            <CardDescription>
              Define a new target for your Bible study journey
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Goal Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a goal type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="book">Focus on a Book</SelectItem>
                          <SelectItem value="quiz-performance">Quiz Performance</SelectItem>
                          <SelectItem value="reading-streak">Reading Streak</SelectItem>
                          <SelectItem value="chapters-read">Chapters Read</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Choose what type of goal you want to set
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {form.watch("type") === "book" ? (
                  <FormField
                    control={form.control}
                    name="target"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Book Name</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a book" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Genesis">Genesis</SelectItem>
                            <SelectItem value="Exodus">Exodus</SelectItem>
                            <SelectItem value="Leviticus">Leviticus</SelectItem>
                            <SelectItem value="Matthew">Matthew</SelectItem>
                            <SelectItem value="Mark">Mark</SelectItem>
                            <SelectItem value="Luke">Luke</SelectItem>
                            <SelectItem value="John">John</SelectItem>
                            <SelectItem value="Romans">Romans</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Choose a book to focus on reading
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ) : (
                  <FormField
                    control={form.control}
                    name="targetNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {form.watch("type") === "quiz-performance" 
                            ? "Target Score Percentage" 
                            : form.watch("type") === "reading-streak"
                              ? "Target Streak Days"
                              : "Target Chapters"}
                        </FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min={1} 
                            max={form.watch("type") === "quiz-performance" ? 100 : 365} 
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                          />
                        </FormControl>
                        <FormDescription>
                          {form.watch("type") === "quiz-performance" 
                            ? "Set your target quiz score (e.g. 80 for 80%)" 
                            : form.watch("type") === "reading-streak"
                              ? "Number of consecutive days you aim to read"
                              : "Number of chapters you aim to read"}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <div className="flex justify-end gap-2 pt-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Set Goal</Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Loading your goals...</p>
        </div>
      ) : goals.length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-muted/20">
          <Clock className="h-8 w-8 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No Goals Set Yet</h3>
          <p className="text-muted-foreground mb-4">
            Set your first Bible study goal to track your progress
          </p>
          {!showForm && (
            <Button onClick={() => setShowForm(true)}>
              Create Your First Goal
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goals.map(goal => renderGoalCard(goal))}
        </div>
      )}
    </div>
  );
}
