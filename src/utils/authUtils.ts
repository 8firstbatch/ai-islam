import { supabase } from "@/integrations/supabase/client";

/**
 * Utility functions for authentication
 */

/**
 * Check if user is authenticated
 */
export const isAuthenticated = async (): Promise<boolean> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return !!session;
  } catch (error) {
    console.error("Error checking authentication status:", error);
    return false;
  }
};

/**
 * Get current user profile with enhanced data
 */
export const getCurrentUser = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
};

/**
 * Get user profile image URL from Google OAuth data
 */
export const getUserProfileImage = (user: any): string | null => {
  if (!user) return null;
  
  // Try different possible locations for the profile image
  const profileImage = 
    user.user_metadata?.avatar_url ||
    user.user_metadata?.picture ||
    user.identities?.[0]?.identity_data?.avatar_url ||
    user.identities?.[0]?.identity_data?.picture ||
    null;
    
  console.log("Profile image URL:", profileImage); // Debug log
  return profileImage;
};

/**
 * Get user display name from Google OAuth data
 */
export const getUserDisplayName = (user: any): string => {
  if (!user) return "User";
  
  return (
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.identities?.[0]?.identity_data?.full_name ||
    user.identities?.[0]?.identity_data?.name ||
    user.email?.split('@')[0] ||
    "User"
  );
};

/**
 * Get comprehensive user profile data
 */
export const getUserProfile = (user: any) => {
  if (!user) return null;
  
  return {
    id: user.id,
    email: user.email,
    displayName: getUserDisplayName(user),
    profileImage: getUserProfileImage(user),
    isEmailVerified: user.email_confirmed_at !== null,
    provider: user.app_metadata?.provider || 'email',
    createdAt: user.created_at,
    lastSignIn: user.last_sign_in_at,
    metadata: user.user_metadata,
    identities: user.identities
  };
};

/**
 * Sign out user
 */
export const signOutUser = async (): Promise<boolean> => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error signing out:", error);
    return false;
  }
};

/**
 * Test Google OAuth configuration
 */
export const testGoogleAuthConfig = async (): Promise<{
  isConfigured: boolean;
  message: string;
}> => {
  try {
    // Check if Supabase is properly configured
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      return {
        isConfigured: false,
        message: "Supabase configuration missing in environment variables"
      };
    }

    // Test if we can reach Supabase
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      return {
        isConfigured: false,
        message: `Supabase connection error: ${error.message}`
      };
    }

    return {
      isConfigured: true,
      message: "Google OAuth is properly configured"
    };
  } catch (error) {
    return {
      isConfigured: false,
      message: `Configuration test failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
};