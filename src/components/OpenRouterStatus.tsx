import { useState, useEffect } from "react";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

export const OpenRouterStatus = () => {
  const [status, setStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
        if (!apiKey) {
          setStatus('error');
          setError('API key not configured');
          return;
        }

        // Simple test to check if the API key works
        const response = await fetch('https://openrouter.ai/api/v1/models', {
          headers: {
            'Authorization': `Bearer ${apiKey}`
          }
        });

        if (response.ok) {
          setStatus('connected');
        } else {
          setStatus('error');
          setError(`API Error: ${response.status}`);
        }
      } catch (err) {
        setStatus('error');
        setError('Connection failed');
      }
    };

    checkConnection();
  }, []);

  if (status === 'checking') {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="w-4 h-4 animate-spin" />
        Checking OpenRouter connection...
      </div>
    );
  }

  if (status === 'connected') {
    return (
      <div className="flex items-center gap-2 text-sm text-green-600">
        <CheckCircle className="w-4 h-4" />
        OpenRouter connected
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-sm text-red-600">
      <XCircle className="w-4 h-4" />
      OpenRouter: {error}
    </div>
  );
};