
import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { SidebarTrigger } from './ui/sidebar-trigger';
import { ThemeToggle } from './theme-toggle';
import { Separator } from './ui/separator';
import {
  Home,
  BookOpen,
  LineChart,
  Settings,
  LogOut,
  User,
  FileText,
  MessageSquare,
  CircleHelp,
  CirclePlus,
  Target,
  Award
} from 'lucide-react';
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export const AppSidebar = ({ isMobile = false }: { isMobile?: boolean }) => {
  const location = useLocation();
  const { user, profile } = useAuth();
  const [isPending, setIsPending] = useState(false);
  
  // Check if path is active
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  // Handle user logout
  const handleLogout = async () => {
    try {
      setIsPending(true);
      await supabase.auth.signOut();
      window.location.href = '/';
    } catch (error) {
      console.error('Error logging out:', error);
    } finally {
      setIsPending(false);
    }
  };
  
  return (
    <div className="flex flex-col h-full p-4">
      <div className="flex items-center mb-10 pl-2">
        {isMobile && <SidebarTrigger />}
        <Link to="/" className="flex items-center text-xl font-semibold">
          <BookOpen className="h-6 w-6 mr-2 text-primary" />
          Bible AI
        </Link>
      </div>
      
      <div className="space-y-1 mb-6">
        <p className="text-xs font-medium text-muted-foreground px-2 mb-2">
          Main Menu
        </p>
        
        <Link
          to="/dashboard"
          className={`flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors ${isActive('/dashboard') ? 'bg-primary text-primary-foreground hover:bg-primary/90' : ''}`}
        >
          <Home size={16} />
          Dashboard
        </Link>
        
        <Link
          to="/study"
          className={`flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors ${isActive('/study') ? 'bg-primary text-primary-foreground hover:bg-primary/90' : ''}`}
        >
          <BookOpen size={16} />
          Study
        </Link>
        
        <Link
          to="/progress"
          className={`flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors ${isActive('/progress') ? 'bg-primary text-primary-foreground hover:bg-primary/90' : ''}`}
        >
          <LineChart size={16} />
          Progress
        </Link>
        
        <Link
          to="/custom-quiz"
          className={`flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors ${isActive('/custom-quiz') ? 'bg-primary text-primary-foreground hover:bg-primary/90' : ''}`}
        >
          <MessageSquare size={16} />
          Custom Quiz
        </Link>
        
        <Link
          to="/goals"
          className={`flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors ${isActive('/goals') ? 'bg-primary text-primary-foreground hover:bg-primary/90' : ''}`}
        >
          <Target size={16} />
          Goals & Rewards
        </Link>
      </div>
      
      <div className="space-y-1 mb-6">
        <p className="text-xs font-medium text-muted-foreground px-2 mb-2">
          Your Account
        </p>
        
        <Link
          to="/profile"
          className={`flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors ${isActive('/profile') ? 'bg-primary text-primary-foreground hover:bg-primary/90' : ''}`}
        >
          <User size={16} />
          Profile
        </Link>
        
        <Link
          to="/settings"
          className={`flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors ${isActive('/settings') ? 'bg-primary text-primary-foreground hover:bg-primary/90' : ''}`}
        >
          <Settings size={16} />
          Settings
        </Link>
      </div>
      
      <div className="space-y-1">
        <p className="text-xs font-medium text-muted-foreground px-2 mb-2">
          Help & More
        </p>
        
        <Link
          to="/help"
          className={`flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors ${isActive('/help') ? 'bg-primary text-primary-foreground hover:bg-primary/90' : ''}`}
        >
          <CircleHelp size={16} />
          Help Center
        </Link>
        
        <a
          href="https://docs.bibleonline.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors"
        >
          <FileText size={16} />
          Documentation
        </a>
      </div>
      
      <div className="mt-auto">
        <Separator className="my-4" />
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            {profile?.avatar_url ? (
              <img 
                src={profile.avatar_url} 
                alt="Avatar" 
                className="h-8 w-8 rounded-full"
              />
            ) : (
              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                <User size={16} />
              </div>
            )}
            <div>
              <div className="text-sm font-medium">
                {profile?.full_name || user?.email?.split('@')[0] || 'User'}
              </div>
              <div className="text-xs text-muted-foreground">
                {user?.email}
              </div>
            </div>
          </div>
          <div>
            <button 
              onClick={handleLogout}
              disabled={isPending}
              className="h-9 w-9 rounded-md flex items-center justify-center hover:bg-muted"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
        <Separator className="my-4" />
        <ThemeToggle />
      </div>
    </div>
  );
};
