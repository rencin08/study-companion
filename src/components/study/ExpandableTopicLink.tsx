import { useState } from 'react';
import { FileText, Loader2, ChevronDown } from 'lucide-react';
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
    if (content) return;
    
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
    <Collapsible open={isOpen} onOpenChange={handleToggle} className="w-full">
      <CollapsibleTrigger className="w-full">
        <div className={`
          flex items-center gap-3 p-4 rounded-lg border border-border bg-card 
          hover:bg-secondary/50 hover:border-primary/20 transition-all cursor-pointer
          ${isOpen ? 'border-primary/30 bg-secondary/30' : ''}
        `}>
          <FileText className="h-5 w-5 text-muted-foreground shrink-0" />
          <span className="text-foreground font-medium text-left flex-1">{text}</span>
          {isOpen && (
            <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
          )}
        </div>
      </CollapsibleTrigger>
      
      <CollapsibleContent>
        <div className="mt-2 p-4 rounded-lg border border-border bg-muted/30">
          {isLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground py-4 justify-center">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Loading content...</span>
            </div>
          ) : error ? (
            <div className="text-sm text-destructive py-2 text-center">
              {error}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  fetchContent();
                }}
                className="ml-2 text-primary underline hover:no-underline"
              >
                Retry
              </button>
            </div>
          ) : content ? (
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {content}
              </ReactMarkdown>
            </div>
          ) : null}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

// Grid wrapper component for multiple topic links
interface TopicLinksGridProps {
  children: React.ReactNode;
}

export function TopicLinksGrid({ children }: TopicLinksGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 my-6 not-prose">
      {children}
    </div>
  );
}
