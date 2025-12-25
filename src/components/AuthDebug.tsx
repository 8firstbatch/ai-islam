import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { testGoogleAuthConfig, getUserProfile, getUserProfileImage, getUserDisplayName } from "@/utils/authUtils";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";

const AuthDebug = () => {
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const runDebugTest = async () => {
    setLoading(true);
    try {
      const config = await testGoogleAuthConfig();
      const currentUrl = window.location.origin;
      const callbackUrl = `${currentUrl}/auth/callback`;
      
      const userProfile = user ? getUserProfile(user) : null;
      
      const debugData = {
        environment: {
          currentUrl,
          callbackUrl,
          supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
          hasSupabaseKey: !!import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        config,
        userProfile,
        expectedUrls: {
          javascriptOrigins: [
            currentUrl,
            "https://mclcpoyegjudkzdfqkof.supabase.co"
          ],
          redirectUris: [
            "https://mclcpoyegjudkzdfqkof.supabase.co/auth/v1/callback",
            callbackUrl
          ]
        }
      };
      
      setDebugInfo(debugData);
    } catch (error) {
      setDebugInfo({ error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setLoading(false);
    }
  };

  const testGoogleOAuth = async () => {
    try {
      const redirectTo = `${window.location.origin}/auth/callback`;
      console.log("Testing Google OAuth with redirect:", redirectTo);
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectTo,
          scopes: 'openid email profile',
        },
      });
      
      if (error) {
        console.error("OAuth test error:", error);
        alert(`OAuth Error: ${error.message}`);
      }
    } catch (error) {
      console.error("OAuth test failed:", error);
      alert(`OAuth Test Failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto mt-8">
      <CardHeader>
        <CardTitle>Google Auth Debug Tool</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {user && (
          <div className="p-4 bg-green-50 rounded-lg">
            <h4 className="font-semibold mb-2 text-green-800">Current User Profile:</h4>
            <div className="flex items-center gap-3 mb-2">
              <Avatar className="w-12 h-12">
                <AvatarImage 
                  src={getUserProfileImage(user) || undefined} 
                  alt={getUserDisplayName(user)}
                  referrerPolicy="no-referrer"
                />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {getUserDisplayName(user)[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{getUserDisplayName(user)}</p>
                <p className="text-sm text-gray-600">{user.email}</p>
                <p className="text-xs text-gray-500">
                  Profile Image: {getUserProfileImage(user) ? "✅ Available" : "❌ Not found"}
                </p>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex gap-2">
          <Button onClick={runDebugTest} disabled={loading}>
            {loading ? "Running..." : "Run Debug Test"}
          </Button>
          <Button onClick={testGoogleOAuth} variant="outline">
            Test Google OAuth
          </Button>
        </div>
        
        {debugInfo && (
          <div className="mt-4">
            <h3 className="font-semibold mb-2">Debug Information:</h3>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-96">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>
        )}
        
        <div className="mt-4 p-4 bg-blue-50 rounded">
          <h4 className="font-semibold mb-2">Quick Setup Check:</h4>
          <p className="text-sm">
            1. Current URL: <code>{window.location.origin}</code><br/>
            2. Callback URL: <code>{window.location.origin}/auth/callback</code><br/>
            3. Make sure these URLs are in your Google Cloud Console OAuth settings<br/>
            4. Ensure scopes include: <code>openid email profile</code>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AuthDebug;