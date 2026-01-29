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
          
          // If user just signed in, ensure all user records exist
          if (event === 'SIGNED_IN' && session?.user) {
            try {
              await ensureUserRecordsExist(session.user);
            } catch (error) {
              console.error('Error ensuring user records:', error);
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
    supabase.auth.getSession().then(async ({ data: { session }, error }) => {
      if (!mounted) return;
      
      if (error) {
        console.error('Error getting session:', error);
      }
      
      setSession(session);
      setUser(session?.user ?? null);
      
      // If we have an existing session, ensure user records exist
      if (session?.user) {
        try {
          await ensureUserRecordsExist(session.user);
        } catch (error) {
          console.error('Error ensuring existing user records:', error);
        }
      }
      
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Comprehensive function to ensure all user records exist
  const ensureUserRecordsExist = async (user: any) => {
    try {
      console.log('Ensuring user records exist for:', user.id);
      
      // 1. Ensure profile exists
      const { data: existingProfile, error: profileFetchError } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (profileFetchError && profileFetchError.code === 'PGRST116') {
        // Profile doesn't exist, create it
        const { error: profileInsertError } = await supabase
          .from("profiles")
          .insert({
            user_id: user.id,
            display_name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0],
            avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture,
          });

        if (profileInsertError) {
          console.error('Error creating profile:', profileInsertError);
        } else {
          console.log('Profile created successfully');
        }
      } else if (profileFetchError) {
        console.error('Error checking profile:', profileFetchError);
      }

      // 2. Ensure user_settings exists
      const { data: existingSettings, error: settingsFetchError } = await supabase
        .from("user_settings")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (settingsFetchError && settingsFetchError.code === 'PGRST116') {
        // Settings don't exist, create them
        const { error: settingsInsertError } = await supabase
          .from("user_settings")
          .insert({
            user_id: user.id,
            theme: 'light',
            ai_model: 'google/gemini-2.5-flash',
            ai_response_style: 'balanced',
            is_pro_enabled: false
          });

        if (settingsInsertError) {
          console.error('Error creating user_settings:', settingsInsertError);
        } else {
          console.log('User settings created successfully');
        }
      } else if (settingsFetchError) {
        console.error('Error checking user_settings:', settingsFetchError);
      }

      // 3. Sync Google profile data if available
      if (user.user_metadata) {
        const { syncGoogleProfileData } = await import('@/utils/profileUtils');
        await syncGoogleProfileData(user);
      }

    } catch (error) {
      console.error('Error in ensureUserRecordsExist:', error);
      throw error;
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
