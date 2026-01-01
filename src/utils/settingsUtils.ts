import { supabase } from "@/integrations/supabase/client";

export interface UserSettings {
  ai_model: string;
  ai_response_style: string;
  is_pro_enabled?: boolean;
}

export const loadUserSettings = async (userId: string): Promise<UserSettings | null> => {
  try {
    console.log('Loading settings for user:', userId);
    
    // Try to load from database first
    let { data, error } = await supabase
      .from("user_settings")
      .select("ai_model, ai_response_style, is_pro_enabled")
      .eq("user_id", userId)
      .single();

    if (error) {
      console.log('Database load error:', error);
      
      // If database fails, try localStorage as fallback
      console.log('Falling back to localStorage');
      const localSettings = localStorage.getItem(`user_settings_${userId}`);
      if (localSettings) {
        try {
          const parsed = JSON.parse(localSettings);
          return {
            ai_model: parsed.ai_model || "google/gemini-2.5-flash",
            ai_response_style: parsed.ai_response_style || "balanced",
            is_pro_enabled: parsed.is_pro_enabled || false
          };
        } catch (parseError) {
          console.error('Error parsing localStorage settings:', parseError);
        }
      }
      
      // Return defaults if everything fails
      return {
        ai_model: "google/gemini-2.5-flash",
        ai_response_style: "balanced",
        is_pro_enabled: false
      };
    }

    return data ? {
      ai_model: data.ai_model || "google/gemini-2.5-flash",
      ai_response_style: data.ai_response_style || "balanced",
      is_pro_enabled: (data as any).is_pro_enabled || false
    } : null;
  } catch (error) {
    console.error('Unexpected error loading settings:', error);
    // Return defaults on any error
    return {
      ai_model: "google/gemini-2.5-flash",
      ai_response_style: "balanced",
      is_pro_enabled: false
    };
  }
};

export const saveUserSettings = async (
  userId: string, 
  settings: UserSettings
): Promise<{ success: boolean; message?: string }> => {
  try {
    console.log('Attempting to save settings:', { userId, settings });
    
    // Try to save to database first
    const { error } = await supabase
      .from("user_settings")
      .upsert({
        user_id: userId,
        ai_model: settings.ai_model,
        ai_response_style: settings.ai_response_style,
        is_pro_enabled: settings.is_pro_enabled || false,
      }, {
        onConflict: 'user_id'
      });

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