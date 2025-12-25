import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { getUserDisplayName, getUserProfileImage } from "@/utils/authUtils";
import { syncGoogleProfileData } from "@/utils/profileUtils";
import { Loader2 } from "lucide-react";

const AuthCallback = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Check for error parameters in URL
        const error = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');
        
        if (error) {
          console.error("OAuth error:", error, errorDescription);
          toast({
            title: "Authentication Error",
            description: errorDescription || error,
            variant: "destructive",
          });
          navigate("/auth");
          return;
        }

        // Handle the OAuth callback
        const { data, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Auth callback error:", sessionError);
          toast({
            title: "Authentication Error",
            description: sessionError.message,
            variant: "destructive",
          });
          navigate("/auth");
          return;
        }

        if (data.session) {
          const user = data.session.user;
          const userName = getUserDisplayName(user);
          const profileImage = getUserProfileImage(user);
          
          // Log user data for debugging
          console.log("User authenticated:", {
            id: user.id,
            email: user.email,
            name: userName,
            profileImage,
            metadata: user.user_metadata,
            identities: user.identities
          });

          // Sync Google profile data to database
          await syncGoogleProfileData(user);
          
          toast({
            title: "Welcome!",
            description: `Successfully signed in as ${userName}. Assalamu Alaikum!`,
          });
          navigate("/");
        } else {
          // No session found, redirect to auth
          toast({
            title: "Authentication Required",
            description: "Please sign in to continue",
          });
          navigate("/auth");
        }
      } catch (error) {
        console.error("Unexpected error during auth callback:", error);
        toast({
          title: "Error",
          description: "An unexpected error occurred during authentication",
          variant: "destructive",
        });
        navigate("/auth");
      }
    };

    handleAuthCallback();
  }, [navigate, toast, searchParams]);

  return (
    <div className="min-h-screen bg-gradient-hero flex flex-col items-center justify-center p-4">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
        <h2 className="text-xl font-semibold text-foreground mb-2">
          Completing Authentication
        </h2>
        <p className="text-muted-foreground">
          Please wait while we sign you in...
        </p>
      </div>
    </div>
  );
};

export default AuthCallback;