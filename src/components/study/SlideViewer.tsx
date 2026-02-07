import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, MessageCircle, Presentation, X, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAIChat } from '@/hooks/useAIChat';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface SlideViewerProps {
  lectureTitle: string;
  lectureDate: string;
  slidesUrl: string;
  weekTitle: string;
  onBack: () => void;
}

function convertToEmbedUrl(url: string): string {
  // Convert Google Slides URL to embed format
  // Example: https://docs.google.com/presentation/d/1zT2Ofy88cajLTLkd7TcuSM4BCELvF9qQdHmlz33i4t0
  // To: https://docs.google.com/presentation/d/1zT2Ofy88cajLTLkd7TcuSM4BCELvF9qQdHmlz33i4t0/embed
  
  if (url.includes('docs.google.com/presentation')) {
    // Remove any trailing paths like /edit, /view, etc.
    const baseUrl = url.replace(/\/(edit|view|preview|pub).*$/, '');
    return `${baseUrl}/embed?start=false&loop=false&delayms=3000`;
  }
  
  // Return as-is for other embed-friendly URLs
  return url;
}

export function SlideViewer({
  lectureTitle,
  lectureDate,
  slidesUrl,
  weekTitle,
  onBack,
}: SlideViewerProps) {
  const [showChat, setShowChat] = useState(true);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const embedUrl = convertToEmbedUrl(slidesUrl);
  
  const { messages, isLoading, sendMessage } = useAIChat({
    readingTitle: lectureTitle,
    readingContent: `Lecture slides for "${lectureTitle}" from ${weekTitle}. This is an embedded presentation.`
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;
    const message = inputValue;
    setInputValue('');
    await sendMessage(message);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="animate-fade-in-up h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={onBack}
            className="-ml-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          
          <div className="hidden sm:block h-6 w-px bg-border" />
          
          <div className="hidden sm:flex items-center gap-2">
            <Presentation className="h-4 w-4 text-primary" />
            <span className="text-sm text-muted-foreground">{weekTitle}</span>
          </div>
        </div>

        <Button
          variant={showChat ? "default" : "outline"}
          size="sm"
          onClick={() => setShowChat(!showChat)}
          className="gap-2"
        >
          <MessageCircle className="h-4 w-4" />
          <span className="hidden sm:inline">{showChat ? 'Hide Chat' : 'Show Chat'}</span>
        </Button>
      </div>

      {/* Lecture Info */}
      <div className="mb-4">
        <h1 className="font-serif text-2xl font-semibold text-foreground mb-1">
          {lectureTitle}
        </h1>
        <p className="text-sm text-muted-foreground">{lectureDate}</p>
      </div>

      {/* Main Content */}
      <div className="h-[calc(100%-6rem)] rounded-lg overflow-hidden border border-border shadow-card">
        {showChat ? (
          <ResizablePanelGroup direction="horizontal">
            {/* Slides Panel */}
            <ResizablePanel defaultSize={65} minSize={40}>
              <div className="h-full bg-secondary/30">
                <iframe
                  src={embedUrl}
                  className="w-full h-full border-0"
                  allowFullScreen
                  title={lectureTitle}
                />
              </div>
            </ResizablePanel>

            <ResizableHandle withHandle />

            {/* Chat Panel */}
            <ResizablePanel defaultSize={35} minSize={25}>
              <div className="h-full flex flex-col bg-card">
                {/* Chat Header */}
                <div className="flex items-center justify-between p-3 border-b border-border">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="h-4 w-4 text-primary" />
                    <span className="font-medium text-sm">Study Assistant</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => setShowChat(false)}
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 p-3">
                  {messages.length === 0 ? (
                    <div className="text-center text-muted-foreground text-sm py-8">
                      <MessageCircle className="h-8 w-8 mx-auto mb-3 opacity-50" />
                      <p className="mb-2">Ask questions about the lecture</p>
                      <p className="text-xs opacity-75">
                        Get explanations, summaries, or discuss concepts from the slides
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[90%] rounded-lg px-3 py-2 text-sm ${
                              message.role === 'user'
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-secondary text-secondary-foreground'
                            }`}
                          >
                            {message.role === 'assistant' ? (
                              <div className="prose prose-sm dark:prose-invert max-w-none">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                  {message.content}
                                </ReactMarkdown>
                              </div>
                            ) : (
                              message.content
                            )}
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </ScrollArea>

                {/* Input */}
                <div className="p-3 border-t border-border">
                  <div className="flex gap-2">
                    <Input
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Ask about the lecture..."
                      disabled={isLoading}
                      className="flex-1 text-sm"
                    />
                    <Button
                      size="icon"
                      onClick={handleSendMessage}
                      disabled={isLoading || !inputValue.trim()}
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        ) : (
          <div className="h-full bg-secondary/30">
            <iframe
              src={embedUrl}
              className="w-full h-full border-0"
              allowFullScreen
              title={lectureTitle}
            />
          </div>
        )}
      </div>
    </div>
  );
}
