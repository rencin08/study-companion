import { useState } from 'react';
import { ChevronDown, ChevronRight, Loader2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { supabase } from '@/integrations/supabase/client';

interface ExpandableTopicLinkProps {
  text: string;
  href: string;
  baseUrl: string;
}

export function ExpandableTopicLink({ text, href, baseUrl }: ExpandableTopicLinkProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Resolve relative URL
  const resolveUrl = (url: string): string => {
    if (url.startsWith('http')) return url;
    try {
      const base = new URL(baseUrl);
      return new URL(url, base.origin).href;
    } catch {
      return url;
    }
  };

  const fullUrl = resolveUrl(href);

  const fetchContent = async () => {
    if (content) return; // Already fetched
    
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error: fetchError } = await supabase.functions.invoke('firecrawl-scrape', {
        body: { url: fullUrl }
      });

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      if (data?.success && data?.markdown) {
        setContent(data.markdown);
      } else {
        throw new Error(data?.error || 'Failed to fetch content');
      }
    } catch (err) {
      console.error('Error fetching topic content:', err);
      setError(err instanceof Error ? err.message : 'Failed to load content');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = () => {
    const newOpen = !isOpen;
    setIsOpen(newOpen);
    if (newOpen && !content && !isLoading) {
      fetchContent();
    }
  };

  return (
    <Collapsible open={isOpen} onOpenChange={handleToggle} className="mb-3">
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 h-auto py-2 px-3 text-left hover:bg-secondary/50 group"
        >
          {isOpen ? (
            <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
          )}
          <span className="text-primary underline underline-offset-2 group-hover:text-primary/80 font-medium">
            {text}
          </span>
          <a
            href={fullUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ExternalLink className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
          </a>
        </Button>
      </CollapsibleTrigger>
      
      <CollapsibleContent className="pl-9 pr-3 pb-4">
        {isLoading ? (
          <div className="flex items-center gap-2 text-muted-foreground py-4">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Loading content...</span>
          </div>
        ) : error ? (
          <div className="text-sm text-destructive py-2">
            {error}
            <Button
              variant="link"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                fetchContent();
              }}
              className="ml-2 h-auto p-0"
            >
              Retry
            </Button>
          </div>
        ) : content ? (
          <div className="prose prose-sm max-w-none dark:prose-invert border-l-2 border-primary/20 pl-4 mt-2">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {content}
            </ReactMarkdown>
          </div>
        ) : null}
      </CollapsibleContent>
    </Collapsible>
  );
}
