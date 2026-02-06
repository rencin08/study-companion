import { useState, useEffect } from 'react';
import { toast } from 'sonner';

const PROXY_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/proxy-content`;

interface ProxyContentResult {
  html: string | null;
  isLoading: boolean;
  error: string | null;
  title: string | null;
}

export function useProxyContent(url: string): ProxyContentResult {
  const [html, setHtml] = useState<string | null>(null);
  const [title, setTitle] = useState<string | null>(null);
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

        // Check content type before parsing
        const contentType = response.headers.get('content-type');
        if (!contentType?.includes('application/json')) {
          const text = await response.text();
          console.error('Expected JSON but got:', contentType, text.substring(0, 200));
          throw new Error('Invalid response format from proxy');
        }

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `Failed to load content: ${response.status}`);
        }

        const data = await response.json();
        
        // Check if content was actually extracted (not just the fallback message)
        const hasRealContent = data.html && 
          !data.html.includes('Could not extract content') &&
          data.html.length > 500;
        
        if (hasRealContent) {
          setHtml(data.html);
        } else {
          // Content couldn't be extracted - set to null so fallback shows
          setHtml(null);
        }
        
        // Extract title from the HTML if present
        const titleMatch = data.html?.match(/<h1[^>]*>([^<]+)<\/h1>/);
        if (titleMatch) {
          setTitle(titleMatch[1]);
        }
      } catch (err) {
        console.error('Failed to proxy content:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to load content';
        setError(errorMessage);
        // Don't toast for expected failures (JS-rendered sites)
      } finally {
        setIsLoading(false);
      }
    };

    fetchContent();
  }, [url]);

  return { html, isLoading, error, title };
}
