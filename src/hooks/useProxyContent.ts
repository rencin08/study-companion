import { useState, useEffect } from 'react';
import { toast } from 'sonner';

const PROXY_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/proxy-content`;

interface ProxyContentResult {
  html: string | null;
  isLoading: boolean;
  error: string | null;
}

export function useProxyContent(url: string): ProxyContentResult {
  const [html, setHtml] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!url) {
      setIsLoading(false);
      return;
    }

    const fetchContent = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(PROXY_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ url }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `Failed to load content: ${response.status}`);
        }

        const data = await response.json();
        setHtml(data.html);
      } catch (err) {
        console.error('Failed to proxy content:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to load content';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContent();
  }, [url]);

  return { html, isLoading, error };
}
