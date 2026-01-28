import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        console.log('Auth state changed:', event, session?.user?.id);
        
        try {
          setSession(session);
          setUser(session?.user ?? null);
          
          // If user just signed in, sync their profile data and ensure user records exist
          if (event === 'SIGNED_IN' && session?.user) {
            try {
              // Import here to avoid circular dependency
              const { syncGoogleProfileData } = await import('@/utils/profileUtils');
              await syncGoogleProfileData(session.user);
              
              // Ensure user_settings record exists
              await ensureUserSettingsExist(session.user.id);
            } catch (error) {
              console.error('Error syncing user data:', error);
              // Don't throw - just log the error
            }
          }
        } catch (error) {
          console.error('Error handling auth state change:', error);
        } finally {
          setLoading(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (!mounted) return;
      
      if (error) {
        console.error('Error getting session:', error);
      }
      
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Helper function to ensure user_settings record exists
  const ensureUserSettingsExist = async (userId: string) => {
    try {
      // Check if user_settings exists
      const { data, error } = await supabase
        .from("user_settings")
        .select("id")
        .eq("user_id", userId)
        .single();

      if (error && error.code === 'PGRST116') {
        // User settings don't exist, create them
        const { error: insertError } = await supabase
          .from("user_settings")
          .insert({
            user_id: userId,
            theme: 'light',
            ai_model: 'google/gemini-2.5-flash',
            ai_response_style: 'balanced',
            is_pro_enabled: false
          });

        if (insertError) {
          console.error('Error creating user_settings:', insertError);
        } else {
          console.log('User settings created successfully');
        }
      } else if (error) {
        console.error('Error checking user_settings:', error);
      }
    } catch (error) {
      console.error('Error ensuring user_settings exist:', error);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
