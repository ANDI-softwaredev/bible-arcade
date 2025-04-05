
import React, { useState, useEffect } from 'react';
import { Award, BadgeCheck, Star, Trophy } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { getUserBadges, quizBadges } from "@/services/quiz-generator";
import { useToast } from "@/hooks/use-toast";

interface UserRewardsProps {
  compact?: boolean;
}

export function UserRewards({ compact = false }: UserRewardsProps) {
  const [badges, setBadges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function loadUserBadges() {
      try {
        const userBadges = await getUserBadges();
        setBadges(userBadges || []);
      } catch (error) {
        console.error("Error loading badges:", error);
        toast({
          title: "Error",
          description: "Could not load your badges. Please try again later.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    }

    loadUserBadges();
  }, [toast]);

  // Function to render the appropriate icon
  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'award':
        return <Award className="h-5 w-5 text-yellow-500" />;
      case 'badge':
        return <Badge className="h-5 w-5 text-blue-500" />;
      case 'badge-check':
        return <BadgeCheck className="h-5 w-5 text-green-500" />;
      case 'star':
        return <Star className="h-5 w-5 text-purple-500" />;
      default:
        return <Trophy className="h-5 w-5 text-amber-500" />;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Achievements</CardTitle>
          <CardDescription>Loading your rewards...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // If compact mode, show only the most recent badge
  if (compact && badges.length > 0) {
    const latestBadge = badges[0];
    return (
      <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
        {renderIcon(latestBadge.badge_icon)}
        <div>
          <div className="font-medium text-sm">{latestBadge.badge_title}</div>
          <div className="text-xs text-muted-foreground">{latestBadge.badge_description}</div>
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-amber-500" />
          <span>Your Achievements</span>
        </CardTitle>
        <CardDescription>Badges earned through your Bible study journey</CardDescription>
      </CardHeader>
      <CardContent>
        {badges.length === 0 ? (
          <div className="text-center py-6">
            <div className="text-muted-foreground mb-2">No badges earned yet</div>
            <div className="text-sm">
              Complete quizzes to earn your first badge!
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {badges.map((badge) => (
              <div 
                key={badge.id} 
                className="flex items-center gap-3 p-3 border rounded-lg bg-card"
              >
                <div className="h-10 w-10 flex items-center justify-center rounded-full bg-primary/10">
                  {renderIcon(badge.badge_icon)}
                </div>
                <div>
                  <div className="font-medium">{badge.badge_title}</div>
                  <div className="text-sm text-muted-foreground">{badge.badge_description}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6">
          <h3 className="text-sm font-medium mb-3">Available Badges</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {quizBadges.map((badge) => {
              const isEarned = badges.some(b => b.badge_id === badge.id);
              return (
                <div 
                  key={badge.id}
                  className={`flex items-center gap-2 p-2 border rounded-md ${
                    isEarned ? 'bg-primary/5 border-primary/20' : 'opacity-60'
                  }`}
                >
                  {renderIcon(badge.icon)}
                  <div>
                    <div className="text-sm font-medium">{badge.title}</div>
                    <div className="text-xs text-muted-foreground">{badge.description}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
