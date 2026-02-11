import { useState, useRef, useEffect, useMemo, Fragment } from 'react';
import { Reading, ChatMessage, Flashcard, Highlight } from '@/types/study';
import { ArrowLeft, Send, Highlighter, Brain, MessageSquare, StickyNote, X, Sparkles, Loader2, ExternalLink, Play, FileText, Code } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { HighlightToolbar } from './HighlightToolbar';
import { TopicLinkCard, TopicLinksGrid } from './ExpandableTopicLink';
import { NotesEditor } from './NotesEditor';
import { useFirecrawlScrape } from '@/hooks/useFirecrawlScrape';
import { useAIChat } from '@/hooks/useAIChat';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import DOMPurify from 'dompurify';

// Helper to detect and extract YouTube video ID
const getYouTubeVideoId = (url: string): string | null => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/v\/([^&\n?#]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
};
interface ReadingViewProps {
  reading: Reading;
  weekTitle: string;
  onBack: () => void;
  onCreateFlashcard: (flashcard: Omit<Flashcard, 'id' | 'createdAt'>) => void;
  onCreateHighlight: (highlight: Omit<Highlight, 'id' | 'createdAt'>) => void;
  highlights: Highlight[];
}

export function ReadingView({ reading, weekTitle, onBack, onCreateFlashcard, onCreateHighlight, highlights }: ReadingViewProps) {
  const [inputMessage, setInputMessage] = useState('');
  const [selectedText, setSelectedText] = useState('');
  const [showFlashcardModal, setShowFlashcardModal] = useState(false);
  const [flashcardFront, setFlashcardFront] = useState('');
  const [flashcardBack, setFlashcardBack] = useState('');
  const [currentUrl, setCurrentUrl] = useState(reading.url);
  const [urlHistory, setUrlHistory] = useState<string[]>([reading.url]);
  const [viewMode, setViewMode] = useState<'html' | 'markdown'>('html');
  const contentRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Detect if current URL is a YouTube video
  const youtubeVideoId = useMemo(() => getYouTubeVideoId(currentUrl), [currentUrl]);

  // Use Firecrawl for content scraping - only if not a YouTube video
  const { markdown, html, metadata, isLoading: isLoadingContent, error: contentError } = useFirecrawlScrape(
    youtubeVideoId ? '' : currentUrl // Skip scraping for YouTube URLs
  );

  // AI Chat hook with scraped content context
  const { messages, isLoading: isTyping, sendMessage, setMessages } = useAIChat({
    readingTitle: reading.title,
    readingContent: markdown || undefined
  });

  // Initialize welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        id: '1',
        role: 'assistant',
        content: `Hi! I'm here to help you understand "${reading.title}". Feel free to ask me any questions about the content, request summaries, or ask me to explain concepts in simpler terms.`,
        timestamp: new Date()
      }]);
    }
  }, [reading.title, messages.length, setMessages]);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  const handleTextSelection = () => {
    const selection = window.getSelection();
    const selectedString = selection?.toString().trim();
    if (selectedString && selectedString.length > 0) {
      console.log('Text selected:', selectedString.substring(0, 50));
      setSelectedText(selectedString);
    }
  };

  const handleCreateHighlight = (color: Highlight['color']) => {
    if (selectedText) {
      onCreateHighlight({
        text: selectedText,
        color,
        weekId: reading.id.split('-')[0] + '-' + reading.id.split('-')[1],
        readingId: reading.id,
      });
      setSelectedText('');
    }
  };

  const handleCreateFlashcard = () => {
    if (flashcardFront && flashcardBack) {
      onCreateFlashcard({
        front: flashcardFront,
        back: flashcardBack,
        weekId: reading.id.split('-')[0] + '-' + reading.id.split('-')[1],
        readingId: reading.id,
        mastered: false
      });
      setFlashcardFront('');
      setFlashcardBack('');
      setShowFlashcardModal(false);
      setSelectedText('');
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isTyping) return;
    const message = inputMessage;
    setInputMessage('');
    await sendMessage(message);
  };


  const getHighlightColorClass = (color: Highlight['color']) => {
    switch (color) {
      case 'yellow': return 'bg-yellow-200 dark:bg-yellow-900/50';
      case 'green': return 'bg-green-200 dark:bg-green-900/50';
      case 'blue': return 'bg-blue-200 dark:bg-blue-900/50';
      case 'pink': return 'bg-pink-200 dark:bg-pink-900/50';
      default: return 'bg-yellow-200 dark:bg-yellow-900/50';
    }
  };

  // Filter highlights for current reading
  const currentHighlights = useMemo(() => 
    highlights.filter(h => h.readingId === reading.id),
    [highlights, reading.id]
  );

  // Apply highlights to content (works for both markdown and HTML)
  const applyHighlightsToContent = (content: string | null) => {
    if (!content || !currentHighlights.length) return content;
    
    let result = content;
    
    // Sort by length (longest first) to prevent partial replacements
    const sortedHighlights = [...currentHighlights].sort((a, b) => b.text.length - a.text.length);
    
    for (const highlight of sortedHighlights) {
      // Escape special regex characters in the highlight text
      const escapedText = highlight.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      
      // Create color class based on highlight color
      const colorStyle = {
        yellow: 'background-color: #fef08a;',
        green: 'background-color: #bbf7d0;',
        blue: 'background-color: #bfdbfe;',
        pink: 'background-color: #fbcfe8;',
      }[highlight.color] || 'background-color: #fef08a;';
      
      // Replace text with marked version (using HTML mark tags)
      const regex = new RegExp(`(${escapedText})`, 'g');
      result = result.replace(regex, `<mark style="${colorStyle} padding: 0 2px; border-radius: 2px;">$1</mark>`);
    }
    
    return result;
  };

  const highlightedMarkdown = useMemo(() => applyHighlightsToContent(markdown), [markdown, currentHighlights]);
  const highlightedHtml = useMemo(() => applyHighlightsToContent(html), [html, currentHighlights]);

  // Extract topic links from markdown/HTML for grid display
  const { processedMarkdown, processedHtml, topicLinks } = useMemo(() => {
    const topicPattern = /prompting|reasoning|generation|learning|thought|chain|shot|knowledge|engineer|retrieval|react|reflexion|multimodal|graph|consistency|stimulus|aided|active/i;
    const links: Array<{ text: string; href: string }> = [];
    const seenTexts = new Set<string>();
    
    // Extract links from markdown
    if (highlightedMarkdown) {
      const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
      let match;
      while ((match = linkRegex.exec(highlightedMarkdown)) !== null) {
        const [, text, href] = match;
        const normalizedText = text.trim().toLowerCase();
        if (
          text && href &&
          !href.startsWith('#') &&
          !href.includes('twitter') &&
          !href.includes('github') &&
          !href.includes('linkedin') &&
          !href.includes('youtube') &&
          text.length > 3 &&
          text.length < 80 &&
          topicPattern.test(text) &&
          !seenTexts.has(normalizedText)
        ) {
          links.push({ text: text.trim(), href });
          seenTexts.add(normalizedText);
        }
      }
    }
    
    // Also extract links from HTML
    if (highlightedHtml) {
      const htmlLinkRegex = /<a[^>]*href=["']([^"']+)["'][^>]*>([^<]+)<\/a>/gi;
      let match;
      while ((match = htmlLinkRegex.exec(highlightedHtml)) !== null) {
        const [, href, text] = match;
        const normalizedText = text.trim().toLowerCase();
        if (
          text && href &&
          !href.startsWith('#') &&
          !href.includes('twitter') &&
          !href.includes('github') &&
          !href.includes('linkedin') &&
          !href.includes('youtube') &&
          text.length > 3 &&
          text.length < 80 &&
          topicPattern.test(text) &&
          !seenTexts.has(normalizedText)
        ) {
          links.push({ text: text.trim(), href });
          seenTexts.add(normalizedText);
        }
      }
    }
    
    // Remove ALL topic-related links from markdown (be aggressive)
    let processedMd = highlightedMarkdown || '';
    // Remove by matching the topic pattern in link text
    processedMd = processedMd.replace(/\[([^\]]*(?:prompting|reasoning|generation|learning|thought|chain|shot|knowledge|engineer|retrieval|react|reflexion|multimodal|graph|consistency|stimulus|aided|active)[^\]]*)\]\([^)]+\)/gi, '');
    // Also remove any links we specifically captured
    for (const link of links) {
      const escapedText = link.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const pattern = new RegExp(`\\[${escapedText}\\]\\([^)]+\\)`, 'gi');
      processedMd = processedMd.replace(pattern, '');
    }
    // Clean up whitespace
    processedMd = processedMd.replace(/\n{3,}/g, '\n\n').trim();
    
    // Remove ALL topic-related links from HTML (be aggressive)
    let processedH = highlightedHtml || '';
    // Remove anchor tags that contain topic keywords in their text
    processedH = processedH.replace(/<a[^>]*>([^<]*(?:prompting|reasoning|generation|learning|thought|chain|shot|knowledge|engineer|retrieval|react|reflexion|multimodal|graph|consistency|stimulus|aided|active)[^<]*)<\/a>/gi, '');
    // Also remove by specific captured links
    for (const link of links) {
      const escapedText = link.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const pattern = new RegExp(`<a[^>]*>${escapedText}<\\/a>`, 'gi');
      processedH = processedH.replace(pattern, '');
    }
    
    // Sanitize HTML to prevent XSS attacks
    const sanitizedHtml = DOMPurify.sanitize(processedH, {
      ALLOWED_TAGS: ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'a', 'strong', 'em', 'b', 'i', 'code', 'pre', 'blockquote', 'br', 'div', 'span', 'mark', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'img', 'figure', 'figcaption', 'hr', 'sup', 'sub', 'dl', 'dt', 'dd'],
      ALLOWED_ATTR: ['href', 'class', 'style', 'src', 'alt', 'title', 'target', 'rel'],
      ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i
    });
    
    return { processedMarkdown: processedMd, processedHtml: sanitizedHtml, topicLinks: links };
  }, [highlightedMarkdown, highlightedHtml]);

  const handleInternalLink = (href: string) => {
    // Resolve relative URLs to the source domain
    let resolvedUrl = href;
    if (!href.startsWith('http')) {
      try {
        const baseUrl = new URL(currentUrl);
        resolvedUrl = new URL(href, baseUrl.origin).href;
      } catch {
        resolvedUrl = href;
      }
    }
    setUrlHistory(prev => [...prev, resolvedUrl]);
    setCurrentUrl(resolvedUrl);
  };

  // Intercept link clicks in HTML content for internal navigation
  useEffect(() => {
    if (!contentRef.current || viewMode !== 'html' || !highlightedHtml) return;

    const handleLinkClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a');
      if (!anchor) return;

      const href = anchor.getAttribute('href');
      if (!href) return;

      // Allow anchor links to work normally
      if (href.startsWith('#')) return;

      // Prevent default and handle internal navigation
      e.preventDefault();
      handleInternalLink(href);
    };

    const container = contentRef.current;
    container.addEventListener('click', handleLinkClick);

    return () => {
      container.removeEventListener('click', handleLinkClick);
    };
  }, [viewMode, highlightedHtml, currentUrl]);

  const handleBackNavigation = () => {
    if (urlHistory.length > 1) {
      const newHistory = urlHistory.slice(0, -1);
      setUrlHistory(newHistory);
      setCurrentUrl(newHistory[newHistory.length - 1]);
    } else {
      onBack();
    }
  };

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-border mb-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={handleBackNavigation} className="-ml-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {urlHistory.length > 1 ? 'Back' : 'Back'}
          </Button>
          <div>
            <p className="text-sm text-muted-foreground">{weekTitle}</p>
            <h2 className="font-serif text-xl font-semibold">{metadata?.title || reading.title}</h2>
            {urlHistory.length > 1 && (
              <p className="text-xs text-muted-foreground">
                Viewing linked page • {urlHistory.length - 1} page(s) deep
              </p>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {selectedText && (
            <HighlightToolbar
              selectedText={selectedText}
              onHighlight={handleCreateHighlight}
              onClear={() => setSelectedText('')}
            />
          )}
          
          {selectedText && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setFlashcardFront(selectedText);
                setShowFlashcardModal(true);
              }}
              className="gap-2"
            >
              <Brain className="h-4 w-4" />
              Create Flashcard
            </Button>
          )}

          <a
            href={currentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
            <span className="hidden sm:inline">Original</span>
          </a>
        </div>
      </div>


      {/* Dual panel layout with resizable panels */}
      <ResizablePanelGroup direction="horizontal" className="flex-1 min-h-0 rounded-lg">
        {/* Left panel - Reading content */}
        <ResizablePanel defaultSize={55} minSize={30}>
          <div className="flex flex-col h-full bg-card rounded-l-lg border border-border shadow-card overflow-hidden">
            <div className="flex items-center gap-2 p-3 border-b border-border bg-muted/30">
              <Highlighter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Reading Content</span>
              
              {/* View mode toggle */}
              {html && markdown && (
                <div className="flex items-center gap-1 ml-2">
                  <Button
                    variant={viewMode === 'html' ? 'secondary' : 'ghost'}
                    size="sm"
                    className="h-7 px-2 text-xs"
                    onClick={() => setViewMode('html')}
                  >
                    <FileText className="h-3 w-3 mr-1" />
                    Styled
                  </Button>
                  <Button
                    variant={viewMode === 'markdown' ? 'secondary' : 'ghost'}
                    size="sm"
                    className="h-7 px-2 text-xs"
                    onClick={() => setViewMode('markdown')}
                  >
                    <Code className="h-3 w-3 mr-1" />
                    Simple
                  </Button>
                </div>
              )}
              
              <span className="text-xs text-muted-foreground ml-auto">Select text to highlight or create flashcard</span>
            </div>
            <ScrollArea className="flex-1">
              <div 
                ref={contentRef}
                className="p-6" 
                onMouseUp={handleTextSelection}
              >
                {youtubeVideoId ? (
                  <div className="space-y-4">
                    <AspectRatio ratio={16 / 9} className="bg-muted rounded-lg overflow-hidden">
                      <iframe
                        src={`https://www.youtube.com/embed/${youtubeVideoId}`}
                        title={reading.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full"
                      />
                    </AspectRatio>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Play className="h-4 w-4" />
                      <span>YouTube Video</span>
                      <a 
                        href={currentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-auto text-primary hover:underline"
                      >
                        Open on YouTube →
                      </a>
                    </div>
                  </div>
                ) : isLoadingContent ? (
                  <div className="flex flex-col items-center justify-center h-[400px] text-muted-foreground">
                    <Loader2 className="h-8 w-8 animate-spin mb-4" />
                    <p>Extracting content...</p>
                    <p className="text-xs mt-2">This may take a few seconds</p>
                  </div>
                ) : contentError || (!markdown && !html) ? (
                  <div className="flex flex-col items-center justify-center h-[400px] text-center">
                    <div className="bg-muted/50 rounded-full p-4 mb-4">
                      <Highlighter className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">Content Preview Unavailable</h3>
                    <p className="text-muted-foreground mb-4 max-w-md">
                      {contentError || "This content cannot be extracted. Please view the original."}
                    </p>
                    <a 
                      href={reading.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      Open in new tab →
                    </a>
                    <p className="text-xs text-muted-foreground mt-4">
                      Tip: You can still take notes and chat with AI about this reading
                    </p>
                  </div>
                ) : viewMode === 'html' && highlightedHtml ? (
                  // Render HTML with original article styling + topic cards
                  <div 
                    className="selection:bg-accent selection:text-accent-foreground"
                    onMouseUp={handleTextSelection}
                  >
                    {/* Render topic links as a card grid for HTML view too */}
                    {topicLinks.length > 0 && (
                      <TopicLinksGrid>
                        {topicLinks.map((link, index) => (
                          <TopicLinkCard
                            key={index}
                            text={link.text}
                            href={link.href}
                            baseUrl={currentUrl}
                            onNavigate={handleInternalLink}
                          />
                        ))}
                      </TopicLinksGrid>
                    )}
                    
                    <div 
                      className="article-content"
                      onMouseUp={handleTextSelection}
                      dangerouslySetInnerHTML={{ __html: processedHtml }}
                    />
                  </div>
                ) : (
                  // Fallback to markdown rendering with expandable topic links
                  <div className="selection:bg-accent selection:text-accent-foreground">
                    {/* Render topic links as a card grid */}
                    {topicLinks.length > 0 && (
                      <TopicLinksGrid>
                        {topicLinks.map((link, index) => (
                          <TopicLinkCard
                            key={index}
                            text={link.text}
                            href={link.href}
                            baseUrl={currentUrl}
                            onNavigate={handleInternalLink}
                          />
                        ))}
                      </TopicLinksGrid>
                    )}
                    
                    {/* Render remaining markdown content */}
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                      <ReactMarkdown 
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeRaw]}
                        components={{
                          a: ({ href, children }) => {
                            const isAnchorLink = href?.startsWith('#');
                            
                            if (isAnchorLink) {
                              return (
                                <a href={href} className="text-primary underline hover:text-primary/80">
                                  {children}
                                </a>
                              );
                            }
                            
                            return (
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  if (href) handleInternalLink(href);
                                }}
                                className="text-primary underline hover:text-primary/80 cursor-pointer bg-transparent border-none p-0 font-inherit text-left"
                              >
                                {children}
                              </button>
                            );
                          },
                        }}
                      >
                        {processedMarkdown}
                      </ReactMarkdown>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Right panel - Notes & Chat */}
        <ResizablePanel defaultSize={45} minSize={25}>
          <div className="flex flex-col h-full bg-card rounded-r-lg border-y border-r border-border shadow-card overflow-hidden">
            <Tabs defaultValue="chat" className="flex-1 flex flex-col overflow-hidden">
              <TabsList className="w-full justify-start rounded-none border-b border-border bg-muted/30 p-0 h-auto shrink-0">
                <TabsTrigger 
                  value="chat" 
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3 px-4"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  AI Chat
                </TabsTrigger>
                <TabsTrigger 
                  value="notes" 
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3 px-4"
                >
                  <StickyNote className="h-4 w-4 mr-2" />
                  Notes
                </TabsTrigger>
              </TabsList>

              <TabsContent value="chat" className="flex-1 flex flex-col mt-0 data-[state=active]:flex overflow-hidden">
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[85%] rounded-lg px-4 py-3 ${
                            message.role === 'user'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-secondary text-secondary-foreground'
                          }`}
                        >
                          {message.role === 'assistant' && (
                            <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground">
                              <Sparkles className="h-3 w-3" />
                              Study Assistant
                            </div>
                          )}
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        </div>
                      </div>
                    ))}
                    {isTyping && messages[messages.length - 1]?.content === '' && (
                      <div className="flex justify-start">
                        <div className="bg-secondary rounded-lg px-4 py-3">
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>
                
                <div className="p-4 border-t border-border">
                  <div className="flex gap-2">
                    <Textarea
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      placeholder="Ask about this reading..."
                      className="min-h-[80px] resize-none"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      disabled={isTyping}
                    />
                    <Button onClick={handleSendMessage} className="self-end" disabled={isTyping}>
                      {isTyping ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="notes" className="flex-1 flex flex-col mt-0 p-0 overflow-hidden data-[state=inactive]:hidden">
                <NotesEditor
                  readingId={reading.id}
                  weekId={reading.id.split('-')[0] + '-' + reading.id.split('-')[1]}
                />
              </TabsContent>
            </Tabs>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>

      {/* Flashcard Modal */}
      {showFlashcardModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-xl p-6 w-full max-w-md shadow-lg animate-fade-in-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif text-xl font-semibold flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                Create Flashcard
              </h3>
              <Button variant="ghost" size="sm" onClick={() => setShowFlashcardModal(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-1 block">Front (Question)</label>
                <Textarea
                  value={flashcardFront}
                  onChange={(e) => setFlashcardFront(e.target.value)}
                  placeholder="What you want to remember..."
                  className="resize-none"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-1 block">Back (Answer)</label>
                <Textarea
                  value={flashcardBack}
                  onChange={(e) => setFlashcardBack(e.target.value)}
                  placeholder="The answer or explanation..."
                  className="resize-none"
                />
              </div>
              <Button onClick={handleCreateFlashcard} className="w-full">
                Create Flashcard
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
