import { supabase } from "@/integrations/supabase/client";

export interface UserSettings {
  ai_model: string;
  ai_response_style: string;
  is_pro_enabled?: boolean;
  search_mode?: boolean; // Add search mode
  response_speed?: 'fastest' | 'balanced' | 'detailed'; // New speed setting
}

export const loadUserSettings = async (userId: string): Promise<UserSettings | null> => {
  try {
    console.log('Loading settings for user:', userId);
    
    // Return defaults immediately if no userId
    if (!userId) {
      console.log('No userId provided, returning defaults');
      return {
        ai_model: "google/gemini-2.5-flash",
        ai_response_style: "balanced",
        is_pro_enabled: false
      };
    }
    
    // Try to load from database first - only select columns that exist
    let { data, error } = await supabase
      .from("user_settings")
      .select("ai_model, ai_response_style")
      .eq("user_id", userId)
      .single();

    if (error) {
      console.log('Database load error:', error);
      
      // If it's a "not found" error, that's okay - user hasn't saved settings yet
      if (error.code === 'PGRST116') {
        console.log('User settings not found in database, returning defaults');
        return {
          ai_model: "google/gemini-2.5-flash",
          ai_response_style: "balanced",
          is_pro_enabled: false,
          search_mode: false, // Default search mode
          response_speed: "fastest" // Default to fastest
        };
      }
      
      // For other database errors, try localStorage as fallback
      console.log('Falling back to localStorage');
      const localSettings = localStorage.getItem(`user_settings_${userId}`);
      if (localSettings) {
        try {
          const parsed = JSON.parse(localSettings);
          return {
            ai_model: parsed.ai_model || "google/gemini-2.5-flash",
            ai_response_style: parsed.ai_response_style || "balanced",
            is_pro_enabled: parsed.is_pro_enabled || false,
            search_mode: parsed.search_mode || false
          };
        } catch (parseError) {
          console.error('Error parsing localStorage settings:', parseError);
        }
      }
      
      // Return defaults if everything fails
      return {
        ai_model: "google/gemini-2.5-flash",
        ai_response_style: "balanced",
        is_pro_enabled: false,
        search_mode: false
      };
    }

    return data ? {
      ai_model: data.ai_model || "google/gemini-2.5-flash",
      ai_response_style: data.ai_response_style || "balanced",
      is_pro_enabled: false,
      search_mode: false, // Default search mode (column doesn't exist in DB)
      response_speed: "fastest" // Default to fastest for speed
    } : {
      ai_model: "google/gemini-2.5-flash",
      ai_response_style: "balanced",
      is_pro_enabled: false,
      search_mode: false,
      response_speed: "fastest"
    };
  } catch (error) {
    console.error('Unexpected error loading settings:', error);
    // Return defaults on any error
    return {
      ai_model: "google/gemini-2.5-flash",
      ai_response_style: "balanced",
      is_pro_enabled: false,
      search_mode: false
    };
  }
};

export const saveUserSettings = async (
  userId: string, 
  settings: UserSettings
): Promise<{ success: boolean; message?: string }> => {
  try {
    console.log('Attempting to save settings:', { userId, settings });
    
    // First, try to save with all columns including search_mode
    let { error } = await supabase
      .from("user_settings")
      .upsert({
        user_id: userId,
        ai_model: settings.ai_model,
        ai_response_style: settings.ai_response_style,
        is_pro_enabled: settings.is_pro_enabled || false,
        search_mode: settings.search_mode || false,
      }, {
        onConflict: 'user_id'
      });

    // If error is about missing columns, try with minimal columns
    if (error && (error.message.includes('is_pro_enabled') || error.message.includes('search_mode'))) {
      console.log('Some columns not found, trying with basic columns...');
      const { error: fallbackError } = await supabase
        .from("user_settings")
        .upsert({
          user_id: userId,
          ai_model: settings.ai_model,
          ai_response_style: settings.ai_response_style,
        }, {
          onConflict: 'user_id'
        });
      error = fallbackError;
    }

    if (error) {
      console.error('Database save error:', error);
      
      // Fallback to localStorage
      console.log('Falling back to localStorage');
      try {
        localStorage.setItem(`user_settings_${userId}`, JSON.stringify(settings));
        return { 
          success: true, 
          message: "Settings saved locally (database unavailable)" 
        };
      } catch (localError) {
        console.error('localStorage save error:', localError);
        return { 
          success: false, 
          message: "Failed to save settings both to database and locally" 
        };
      }
    }

    console.log('Settings saved to database successfully');
    return { success: true, message: "AI settings saved successfully!" };
  } catch (error) {
    console.error('Unexpected error:', error);
    
    // Try localStorage as final fallback
    try {
      localStorage.setItem(`user_settings_${userId}`, JSON.stringify(settings));
      return { 
        success: true, 
        message: "Settings saved locally (database error)" 
      };
    } catch (localError) {
      return { 
        success: false, 
        message: error instanceof Error ? error.message : "Unexpected error occurred" 
      };
    }
  }
};