import { useState, useRef, useEffect } from 'react';
import { Reading, ChatMessage, Flashcard, Note, Highlight } from '@/types/study';
import { ArrowLeft, Send, Plus, Highlighter, Brain, MessageSquare, StickyNote, X, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { HighlightToolbar } from './HighlightToolbar';
import { useProxyContent } from '@/hooks/useProxyContent';
import { useAIChat } from '@/hooks/useAIChat';

interface ReadingViewProps {
  reading: Reading;
  weekTitle: string;
  onBack: () => void;
  onCreateFlashcard: (flashcard: Omit<Flashcard, 'id' | 'createdAt'>) => void;
  onCreateHighlight: (highlight: Omit<Highlight, 'id' | 'createdAt'>) => void;
  highlights: Highlight[];
}

export function ReadingView({ reading, weekTitle, onBack, onCreateFlashcard, onCreateHighlight, highlights }: ReadingViewProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [currentNote, setCurrentNote] = useState('');
  const [inputMessage, setInputMessage] = useState('');
  const [selectedText, setSelectedText] = useState('');
  const [showFlashcardModal, setShowFlashcardModal] = useState(false);
  const [flashcardFront, setFlashcardFront] = useState('');
  const [flashcardBack, setFlashcardBack] = useState('');
  const contentRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Proxy content from external URL
  const { html: proxiedContent, isLoading: isLoadingContent, error: contentError } = useProxyContent(reading.url);

  // AI Chat hook
  const { messages, isLoading: isTyping, sendMessage, setMessages } = useAIChat({
    readingTitle: reading.title,
    readingContent: proxiedContent ? extractTextContent(proxiedContent) : undefined
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
    if (selection && selection.toString().trim()) {
      setSelectedText(selection.toString().trim());
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

  const handleAddNote = () => {
    if (currentNote.trim()) {
      const newNote: Note = {
        id: Date.now().toString(),
        content: currentNote,
        weekId: reading.id.split('-')[0] + '-' + reading.id.split('-')[1],
        readingId: reading.id,
        highlightedText: selectedText || undefined,
        createdAt: new Date()
      };
      setNotes(prev => [...prev, newNote]);
      setCurrentNote('');
      setSelectedText('');
    }
  };

  const getHighlightColorClass = (color: Highlight['color']) => {
    switch (color) {
      case 'yellow': return 'bg-yellow-200';
      case 'green': return 'bg-green-200';
      case 'blue': return 'bg-blue-200';
      case 'pink': return 'bg-pink-200';
      default: return 'bg-yellow-200';
    }
  };

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-border mb-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack} className="-ml-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <p className="text-sm text-muted-foreground">{weekTitle}</p>
            <h2 className="font-serif text-xl font-semibold">{reading.title}</h2>
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
        </div>
      </div>

      {/* Highlights List */}
      {highlights.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          <span className="text-xs text-muted-foreground">Highlights:</span>
          {highlights.map((h) => (
            <span
              key={h.id}
              className={`text-xs px-2 py-1 rounded ${getHighlightColorClass(h.color)}`}
            >
              "{h.text.substring(0, 30)}{h.text.length > 30 ? '...' : ''}"
            </span>
          ))}
        </div>
      )}

      {/* Dual panel layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
        {/* Left panel - Reading content */}
        <div className="flex flex-col bg-card rounded-lg border border-border shadow-card overflow-hidden">
          <div className="flex items-center gap-2 p-3 border-b border-border bg-muted/30">
            <Highlighter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Reading Content</span>
            <span className="text-xs text-muted-foreground ml-auto">Select text to highlight or create flashcard</span>
          </div>
          <ScrollArea className="flex-1">
            <div 
              ref={contentRef}
              className="p-6" 
              onMouseUp={handleTextSelection}
            >
              {isLoadingContent ? (
                <div className="flex flex-col items-center justify-center h-[400px] text-muted-foreground">
                  <Loader2 className="h-8 w-8 animate-spin mb-4" />
                  <p>Loading content...</p>
                </div>
              ) : contentError ? (
                <div className="flex flex-col items-center justify-center h-[400px]">
                  <p className="text-destructive mb-4">Failed to load content</p>
                  <a 
                    href={reading.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Open in new tab →
                  </a>
                </div>
              ) : proxiedContent ? (
                <div 
                  className="prose prose-sm max-w-none dark:prose-invert"
                  dangerouslySetInnerHTML={{ __html: proxiedContent }}
                />
              ) : (
                <div className="w-full h-full min-h-[500px]">
                  <iframe
                    src={reading.url}
                    className="w-full h-full min-h-[500px] rounded-lg border border-border"
                    title={reading.title}
                    sandbox="allow-same-origin allow-scripts allow-popups"
                  />
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Right panel - Notes & Chat */}
        <div className="flex flex-col bg-card rounded-lg border border-border shadow-card overflow-hidden">
          <Tabs defaultValue="chat" className="flex-1 flex flex-col">
            <TabsList className="w-full justify-start rounded-none border-b border-border bg-muted/30 p-0 h-auto">
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
                Notes ({notes.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="chat" className="flex-1 flex flex-col m-0 data-[state=active]:flex">
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

            <TabsContent value="notes" className="flex-1 flex flex-col m-0 data-[state=active]:flex">
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-3">
                  {notes.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <StickyNote className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No notes yet. Start taking notes below!</p>
                    </div>
                  ) : (
                    notes.map((note) => (
                      <div key={note.id} className="p-3 bg-secondary rounded-lg">
                        {note.highlightedText && (
                          <div className="text-xs text-muted-foreground mb-2 border-l-2 border-accent pl-2">
                            "{note.highlightedText}"
                          </div>
                        )}
                        <p className="text-sm">{note.content}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {note.createdAt.toLocaleTimeString()}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
              
              <div className="p-4 border-t border-border">
                <Textarea
                  value={currentNote}
                  onChange={(e) => setCurrentNote(e.target.value)}
                  placeholder="Write a note..."
                  className="min-h-[80px] resize-none mb-2"
                />
                <Button onClick={handleAddNote} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Note
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

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

// Helper to extract plain text from HTML for AI context
function extractTextContent(html: string): string {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  return tempDiv.textContent || tempDiv.innerText || '';
}
