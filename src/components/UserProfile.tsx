
import { useNavigate } from "react-router-dom";
import { LogOut, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

export const UserProfile = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };
  
  if (!user) return null;
  
  return (
    <div className="flex flex-col space-y-4 p-4">
      <div className="flex items-center space-x-4 rounded-lg bg-sidebar-accent/50 p-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20">
          {profile?.avatar_url ? (
            <img 
              src={profile.avatar_url} 
              alt={profile?.full_name || user.email || "User"} 
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <UserIcon className="h-5 w-5 text-primary" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="truncate font-medium">{profile?.full_name || user.email?.split('@')[0]}</p>
          <p className="truncate text-xs text-muted-foreground">{user.email}</p>
        </div>
      </div>
      
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleLogout}
        className="w-full justify-start"
      >
        <LogOut className="mr-2 h-4 w-4" />
        Sign out
      </Button>
    </div>
  );
};
