import { AlertTriangle, ExternalLink } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export const SupabaseConfigWarning = () => {
  const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  const isPlaceholder = supabaseKey === 'YOUR_ACTUAL_ANON_KEY_HERE' || supabaseKey?.includes('PLACEHOLDER');
  
  if (!isPlaceholder) return null;

  return (
    <Alert className="mb-4 border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
      <AlertTriangle className="h-4 w-4 text-amber-600" />
      <AlertTitle className="text-amber-800 dark:text-amber-200">
        Supabase Configuration Needed
      </AlertTitle>
      <AlertDescription className="text-amber-700 dark:text-amber-300">
        <p className="mb-3">
          Authentication is currently disabled because the Supabase API key needs to be configured.
        </p>
        <div className="space-y-2">
          <p className="text-sm font-medium">To enable login/signup:</p>
          <ol className="text-sm list-decimal list-inside space-y-1 ml-2">
            <li>Go to your <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="underline hover:no-underline">Supabase Dashboard</a></li>
            <li>Select your project: <code className="bg-amber-100 dark:bg-amber-900 px-1 rounded">ukejlnfdyztwdbqkgwrw</code></li>
            <li>Go to Settings → API</li>
            <li>Copy the "anon public" key</li>
            <li>Update your .env file with the real key</li>
          </ol>
        </div>
        <div className="mt-3 pt-3 border-t border-amber-200 dark:border-amber-800">
          <p className="text-sm">
            <strong>Good news:</strong> You can still use the AI chat as a guest! 
            The OpenRouter integration is working perfectly.
          </p>
        </div>
      </AlertDescription>
    </Alert>
  );
};