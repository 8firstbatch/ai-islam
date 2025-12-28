import { supabase } from "@/integrations/supabase/client";

export interface UserSettings {
  ai_model: string;
  ai_response_style: string;
  is_pro_enabled?: boolean;
}

export const loadUserSettings = async (userId: string): Promise<UserSettings | null> => {
  try {
    // First try to load with is_pro_enabled column
    let { data, error } = await supabase
      .from("user_settings")
      .select("ai_model, ai_response_style, is_pro_enabled")
      .eq("user_id", userId)
      .single();

    // If is_pro_enabled column doesn't exist, try without it
    if (error && error.message?.includes('is_pro_enabled')) {
      console.log('is_pro_enabled column not found, loading without it');
      const { data: fallbackData, error: fallbackError } = await supabase
        .from("user_settings")
        .select("ai_model, ai_response_style")
        .eq("user_id", userId)
        .single();
      
      if (fallbackError && fallbackError.code !== 'PGRST116') {
        console.error('Error loading settings:', fallbackError);
        return null;
      }
      
      return fallbackData ? {
        ai_model: (fallbackData as any).ai_model || "google/gemini-2.5-flash",
        ai_response_style: (fallbackData as any).ai_response_style || "balanced",
        is_pro_enabled: false // Default value when column doesn't exist
      } : null;
    } else if (error && error.code !== 'PGRST116') {
      console.error('Error loading settings:', error);
      return null;
    }

    return data ? {
      ai_model: data.ai_model || "google/gemini-2.5-flash",
      ai_response_style: data.ai_response_style || "balanced",
      is_pro_enabled: (data as any).is_pro_enabled || false
    } : null;
  } catch (error) {
    console.error('Error loading settings:', error);
    return null;
  }
};

export const saveUserSettings = async (
  userId: string, 
  settings: UserSettings
): Promise<{ success: boolean; message?: string }> => {
  try {
    // First, try to save with is_pro_enabled
    let { error } = await supabase
      .from("user_settings")
      .upsert({
        user_id: userId,
        ai_model: settings.ai_model,
        ai_response_style: settings.ai_response_style,
        is_pro_enabled: settings.is_pro_enabled || false,
      }, {
        onConflict: 'user_id'
      });

    // If column doesn't exist, try without is_pro_enabled
    if (error && error.message?.includes('is_pro_enabled')) {
      console.log('is_pro_enabled column not found, saving without it');
      const { error: fallbackError } = await supabase
        .from("user_settings")
        .upsert({
          user_id: userId,
          ai_model: settings.ai_model,
          ai_response_style: settings.ai_response_style,
        }, {
          onConflict: 'user_id'
        });
      
      if (fallbackError) throw fallbackError;
      
      return { 
        success: true, 
        message: "AI settings saved successfully! Pro settings will be available after database update" 
      };
    } else if (error) {
      throw error;
    }

    return { success: true, message: "AI settings saved successfully!" };
  } catch (error) {
    console.error('AI settings save error:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : "Failed to save settings" 
    };
  }
};