import { supabase } from "@/integrations/supabase/client";
import { getUserProfileImage, getUserDisplayName } from "./authUtils";

/**
 * Sync Google profile data to user's profile in database
 */
export const syncGoogleProfileData = async (user: any) => {
  if (!user) {
    console.log('No user provided to syncGoogleProfileData');
    return;
  }

  try {
    const profileImage = getUserProfileImage(user);
    const displayName = getUserDisplayName(user);

    console.log('Syncing Google profile data:', {
      userId: user.id,
      displayName,
      hasProfileImage: !!profileImage
    });

    // Check if profile already exists
    const { data: existingProfile, error: fetchError } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      // If it's not a "not found" error, log it but don't throw
      console.error("Error fetching existing profile:", fetchError);
      return;
    }

    if (existingProfile) {
      // Update existing profile only if it doesn't have an avatar or display name
      const updates: any = {};
      
      if (!existingProfile.avatar_url && profileImage) {
        updates.avatar_url = profileImage;
      }
      
      if (!existingProfile.display_name && displayName && displayName !== user.email?.split('@')[0]) {
        updates.display_name = displayName;
      }

      if (Object.keys(updates).length > 0) {
        const { error: updateError } = await supabase
          .from("profiles")
          .update(updates)
          .eq("user_id", user.id);
        
        if (updateError) {
          console.error("Error updating profile:", updateError);
        } else {
          console.log("Profile updated successfully");
        }
      }
    } else {
      // Create new profile with Google data
      const { error: insertError } = await supabase
        .from("profiles")
        .insert({
          user_id: user.id,
          display_name: displayName,
          avatar_url: profileImage,
        });
      
      if (insertError) {
        console.error("Error creating profile:", insertError);
      } else {
        console.log("Profile created successfully");
      }
    }
  } catch (error) {
    console.error("Error syncing Google profile data:", error);
    // Don't throw the error - just log it
  }
};

/**
 * Get user profile from database
 */
export const getUserProfile = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error getting user profile:", error);
    return null;
  }
};

/**
 * Update user profile
 */
export const updateUserProfile = async (userId: string, updates: {
  display_name?: string;
  avatar_url?: string;
}) => {
  try {
    // Use upsert with the correct conflict resolution
    const { data, error } = await supabase
      .from("profiles")
      .upsert({
        user_id: userId,
        ...updates,
      }, {
        onConflict: 'user_id',
        ignoreDuplicates: false
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase error details:", error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
};

/**
 * Upload and save profile image
 */
export const uploadProfileImage = async (userId: string, file: File): Promise<string> => {
  try {
    // Validate file
    if (!file.type.startsWith("image/")) {
      throw new Error("Please upload an image file");
    }

    if (file.size > 2 * 1024 * 1024) {
      throw new Error("Please upload an image smaller than 2MB");
    }

    // For now, convert to base64 (in production, use Supabase Storage)
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        resolve(base64);
      };
      reader.onerror = () => {
        reject(new Error("Failed to read file"));
      };
      reader.readAsDataURL(file);
    });
  } catch (error) {
    console.error("Error uploading profile image:", error);
    throw error;
  }
};

/**
 * Get effective profile image (from profile or Google OAuth)
 */
export const getEffectiveProfileImage = (user: any, profile: any): string | null => {
  // Priority: 1. Custom profile image, 2. Google OAuth image
  return profile?.avatar_url || getUserProfileImage(user);
};

/**
 * Get effective display name (from profile or Google OAuth)
 */
export const getEffectiveDisplayName = (user: any, profile: any): string => {
  // Priority: 1. Custom display name, 2. Google OAuth name, 3. Email username
  return profile?.display_name || getUserDisplayName(user);
};