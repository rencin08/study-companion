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

    const fetchContent = async (retries = 3) => {
      setIsLoading(true);
      setError(null);
      setMarkdown(null);
      setHtml(null);

      for (let attempt = 0; attempt < retries; attempt++) {
        try {
          const { data, error: fnError } = await supabase.functions.invoke('firecrawl-scrape', {
            body: { url },
          });

          if (fnError) {
            // Check if it's a resource limit error - retry
            const errMsg = fnError.message || '';
            if ((errMsg.includes('WORKER_LIMIT') || errMsg.includes('compute resources')) && attempt < retries - 1) {
              console.log(`Retry ${attempt + 1}/${retries} after WORKER_LIMIT...`);
              await new Promise(r => setTimeout(r, 2000 * (attempt + 1)));
              continue;
            }
            throw new Error(fnError.message || 'Failed to scrape content');
          }

          if (!data?.success) {
            throw new Error(data?.error || 'Failed to scrape content');
          }

          setMarkdown(data.markdown);
          setHtml(data.html);
          setMetadata(data.metadata);
          setIsLoading(false);
          return;
        } catch (err) {
          if (attempt < retries - 1) {
            const errMsg = err instanceof Error ? err.message : '';
            if (errMsg.includes('WORKER_LIMIT') || errMsg.includes('compute resources') || errMsg.includes('non-2xx')) {
              console.log(`Retry ${attempt + 1}/${retries}...`);
              await new Promise(r => setTimeout(r, 2000 * (attempt + 1)));
              continue;
            }
          }
          console.error('Failed to scrape content:', err);
          setError(err instanceof Error ? err.message : 'Failed to load content');
          setIsLoading(false);
          return;
        }
      }
      setIsLoading(false);
    };

    fetchContent();
  }, [url]);

  return { markdown, html, metadata, isLoading, error };
}
