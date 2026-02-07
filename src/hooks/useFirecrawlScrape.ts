import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

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
        const { data, error: fnError } = await supabase.functions.invoke('firecrawl-scrape', {
          body: { url },
        });

        if (fnError) {
          throw new Error(fnError.message || 'Failed to scrape content');
        }

        if (!data?.success) {
          throw new Error(data?.error || 'Failed to scrape content');
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
