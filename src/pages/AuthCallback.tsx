
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

const AuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Exchange the auth code for a session
        const { error } = await supabase.auth.getSessionFromUrl();

        if (error) {
          toast({
            title: "Authentication error",
            description: error.message,
            variant: "destructive",
          });
          navigate("/login");
          return;
        }

        // Redirect to dashboard on successful authentication
        toast({
          title: "Authentication successful",
          description: "You are now signed in!",
        });
        navigate("/dashboard");
      } catch (error: any) {
        console.error("Error in auth callback:", error);
        toast({
          title: "Authentication error",
          description: error.message,
          variant: "destructive",
        });
        navigate("/login");
      }
    };

    handleAuthCallback();
  }, [navigate, location]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Completing authentication...</h2>
        <div className="animate-spin h-8 w-8 border-4 border-primary/50 border-t-primary rounded-full mx-auto"></div>
      </div>
    </div>
  );
};

export default AuthCallback;
