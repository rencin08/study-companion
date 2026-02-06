import { useState, useEffect } from 'react';

const FIRECRAWL_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/firecrawl-scrape`;

interface ScrapeResult {
  markdown: string | null;
  html: string | null;
  metadata: {
    title?: string;
    description?: string;
    sourceURL?: string;
  } | null;
  isLoading: boolean;
  error: string | null;
}

export function useFirecrawlScrape(url: string): ScrapeResult {
  const [markdown, setMarkdown] = useState<string | null>(null);
  const [html, setHtml] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<ScrapeResult['metadata']>(null);
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
      setMarkdown(null);
      setHtml(null);

      try {
        const response = await fetch(FIRECRAWL_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ url }),
        });

        const contentType = response.headers.get('content-type');
        if (!contentType?.includes('application/json')) {
          throw new Error('Invalid response format');
        }

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || `Failed to scrape: ${response.status}`);
        }

        setMarkdown(data.markdown);
        setHtml(data.html);
        setMetadata(data.metadata);
      } catch (err) {
        console.error('Failed to scrape content:', err);
        setError(err instanceof Error ? err.message : 'Failed to load content');
      } finally {
        setIsLoading(false);
      }
    };

    fetchContent();
  }, [url]);

  return { markdown, html, metadata, isLoading, error };
}
