
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Layout } from "@/components/layout";
import { UserRewards } from "@/components/user-rewards";
import { StudyGoals } from "@/components/study-goals";

const GoalsAndRewards = () => {
  return (
    <Layout>
      <div className="pt-8 sm:pt-12">
        <header className="mb-8">
          <div className="pill mb-3 inline-block">Goals & Rewards</div>
          <h1 className="text-3xl font-bold">Your Bible Study Journey</h1>
          <p className="text-muted-foreground mt-2">
            Set personal goals and track your achievements
          </p>
        </header>
        
        <Tabs defaultValue="goals" className="mb-8">
          <TabsList className="mb-6">
            <TabsTrigger value="goals">Study Goals</TabsTrigger>
            <TabsTrigger value="rewards">Achievements</TabsTrigger>
          </TabsList>
          
          <TabsContent value="goals">
            <StudyGoals />
          </TabsContent>
          
          <TabsContent value="rewards">
            <UserRewards />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default GoalsAndRewards;
