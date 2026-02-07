import { FileText } from 'lucide-react';

interface TopicLinkCardProps {
  text: string;
  href: string;
  baseUrl: string;
  onNavigate: (url: string) => void;
}

export function TopicLinkCard({ text, href, baseUrl, onNavigate }: TopicLinkCardProps) {
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

  const handleClick = () => {
    onNavigate(fullUrl);
  };

  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-3 p-4 rounded-lg border border-border bg-card 
        hover:bg-secondary/50 hover:border-primary/20 hover:shadow-md transition-all cursor-pointer
        text-left w-full group"
    >
      <FileText className="h-5 w-5 text-muted-foreground shrink-0 group-hover:text-primary/70" />
      <span className="text-foreground font-medium">{text}</span>
    </button>
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

// Keep old export name for backwards compatibility
export const ExpandableTopicLink = TopicLinkCard;
