import { supabase } from "@/integrations/supabase/client";

export const testDatabaseTables = async () => {
  console.log("=== Database Table Test ===");
  
  try {
    // Test if user_settings table exists
    const { data: userSettingsData, error: userSettingsError } = await supabase
      .from("user_settings")
      .select("*")
      .limit(1);
    
    console.log("user_settings table test:", {
      exists: !userSettingsError,
      error: userSettingsError?.message,
      data: userSettingsData
    });

    // Test if profiles table exists
    const { data: profilesData, error: profilesError } = await supabase
      .from("profiles")
      .select("*")
      .limit(1);
    
    console.log("profiles table test:", {
      exists: !profilesError,
      error: profilesError?.message,
      data: profilesData
    });

    // Test if conversations table exists
    const { data: conversationsData, error: conversationsError } = await supabase
      .from("conversations")
      .select("*")
      .limit(1);
    
    console.log("conversations table test:", {
      exists: !conversationsError,
      error: conversationsError?.message,
      data: conversationsData
    });

    // Test current user
    const { data: userData, error: userError } = await supabase.auth.getUser();
    console.log("Current user:", {
      user: userData.user?.id,
      error: userError?.message
    });

  } catch (error) {
    console.error("Database test failed:", error);
  }
};