import { useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Bold, Italic, Underline, List, ListOrdered, 
  Heading1, Heading2, Quote, Undo, Redo, 
  AlignLeft, AlignCenter, AlignRight, Code, Link,
  Strikethrough, ChevronDown
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface NotesEditorProps {
  readingId: string;
  weekId: string;
  initialContent?: string;
  onContentChange?: (content: string) => void;
}

const FONT_SIZES = [
  { label: 'Small', value: '1' },
  { label: 'Normal', value: '3' },
  { label: 'Large', value: '5' },
  { label: 'Huge', value: '7' },
];

export function NotesEditor({ readingId, weekId, initialContent, onContentChange }: NotesEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const storageKey = `notes-${weekId}-${readingId}`;

  // Load saved content on mount and set up the editor
  useEffect(() => {
    if (editorRef.current) {
      const savedContent = localStorage.getItem(storageKey);
      if (savedContent) {
        editorRef.current.innerHTML = savedContent;
      } else if (initialContent) {
        editorRef.current.innerHTML = initialContent;
      }
      
      // Focus at the end of content
      editorRef.current.focus();
      
      // Move cursor to end
      const selection = window.getSelection();
      if (selection && editorRef.current.childNodes.length > 0) {
        const range = document.createRange();
        range.selectNodeContents(editorRef.current);
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
      }
    }
  }, [storageKey, initialContent]);

  // Auto-save content with debounce
  const saveContent = useCallback(() => {
    if (editorRef.current) {
      const content = editorRef.current.innerHTML;
      localStorage.setItem(storageKey, content);
      onContentChange?.(content);
    }
  }, [storageKey, onContentChange]);

  // Debounced auto-save every 2 seconds
  useEffect(() => {
    const timer = setInterval(saveContent, 2000);
    return () => clearInterval(timer);
  }, [saveContent]);

  // Execute formatting command while preserving cursor position
  const execCommand = useCallback((command: string, value?: string) => {
    // Save current selection
    const selection = window.getSelection();
    const range = selection?.rangeCount ? selection.getRangeAt(0).cloneRange() : null;
    
    document.execCommand(command, false, value);
    
    // Restore focus without jumping
    if (editorRef.current) {
      editorRef.current.focus();
      
      // Restore selection if it was inside our editor
      if (range && editorRef.current.contains(range.commonAncestorContainer)) {
        selection?.removeAllRanges();
        selection?.addRange(range);
      }
    }
    
    saveContent();
  }, [saveContent]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.metaKey || e.ctrlKey) {
      switch (e.key.toLowerCase()) {
        case 'b':
          e.preventDefault();
          execCommand('bold');
          break;
        case 'i':
          e.preventDefault();
          execCommand('italic');
          break;
        case 'u':
          e.preventDefault();
          execCommand('underline');
          break;
        case 'z':
          if (e.shiftKey) {
            e.preventDefault();
            execCommand('redo');
          } else {
            e.preventDefault();
            execCommand('undo');
          }
          break;
      }
    }
  };

  const insertLink = () => {
    const url = prompt('Enter URL:');
    if (url) {
      execCommand('createLink', url);
    }
  };

  // Toolbar button component - inline to avoid ref issues
  const ToolbarBtn = ({ icon, onClick, title }: { icon: React.ReactNode; onClick: () => void; title: string }) => (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        onClick();
      }}
      title={title}
      className="h-8 w-8 p-0 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
    >
      {icon}
    </button>
  );

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">
      {/* Sticky toolbar at top */}
      <div className="flex flex-wrap items-center gap-0.5 p-2 border-b border-border bg-muted/30 shrink-0">
        <ToolbarBtn
          icon={<Undo className="h-4 w-4" />}
          onClick={() => execCommand('undo')}
          title="Undo (Ctrl+Z)"
        />
        <ToolbarBtn
          icon={<Redo className="h-4 w-4" />}
          onClick={() => execCommand('redo')}
          title="Redo (Ctrl+Shift+Z)"
        />
        
        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Font Size Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 px-2 gap-1"
              onMouseDown={(e) => e.preventDefault()}
            >
              <span className="text-xs">Size</span>
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {FONT_SIZES.map((size) => (
              <DropdownMenuItem
                key={size.value}
                onSelect={() => execCommand('fontSize', size.value)}
              >
                {size.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        
        <Separator orientation="vertical" className="h-6 mx-1" />
        
        <ToolbarBtn
          icon={<Heading1 className="h-4 w-4" />}
          onClick={() => execCommand('formatBlock', 'h1')}
          title="Heading 1"
        />
        <ToolbarBtn
          icon={<Heading2 className="h-4 w-4" />}
          onClick={() => execCommand('formatBlock', 'h2')}
          title="Heading 2"
        />
        
        <Separator orientation="vertical" className="h-6 mx-1" />
        
        <ToolbarBtn
          icon={<Bold className="h-4 w-4" />}
          onClick={() => execCommand('bold')}
          title="Bold (Ctrl+B)"
        />
        <ToolbarBtn
          icon={<Italic className="h-4 w-4" />}
          onClick={() => execCommand('italic')}
          title="Italic (Ctrl+I)"
        />
        <ToolbarBtn
          icon={<Underline className="h-4 w-4" />}
          onClick={() => execCommand('underline')}
          title="Underline (Ctrl+U)"
        />
        <ToolbarBtn
          icon={<Strikethrough className="h-4 w-4" />}
          onClick={() => execCommand('strikeThrough')}
          title="Strikethrough"
        />
        
        <Separator orientation="vertical" className="h-6 mx-1" />
        
        <ToolbarBtn
          icon={<List className="h-4 w-4" />}
          onClick={() => execCommand('insertUnorderedList')}
          title="Bullet List"
        />
        <ToolbarBtn
          icon={<ListOrdered className="h-4 w-4" />}
          onClick={() => execCommand('insertOrderedList')}
          title="Numbered List"
        />
        
        <Separator orientation="vertical" className="h-6 mx-1" />
        
        <ToolbarBtn
          icon={<AlignLeft className="h-4 w-4" />}
          onClick={() => execCommand('justifyLeft')}
          title="Align Left"
        />
        <ToolbarBtn
          icon={<AlignCenter className="h-4 w-4" />}
          onClick={() => execCommand('justifyCenter')}
          title="Align Center"
        />
        <ToolbarBtn
          icon={<AlignRight className="h-4 w-4" />}
          onClick={() => execCommand('justifyRight')}
          title="Align Right"
        />
        
        <Separator orientation="vertical" className="h-6 mx-1" />
        
        <ToolbarBtn
          icon={<Quote className="h-4 w-4" />}
          onClick={() => execCommand('formatBlock', 'blockquote')}
          title="Quote"
        />
        <ToolbarBtn
          icon={<Code className="h-4 w-4" />}
          onClick={() => execCommand('formatBlock', 'pre')}
          title="Code Block"
        />
        <ToolbarBtn
          icon={<Link className="h-4 w-4" />}
          onClick={insertLink}
          title="Insert Link"
        />
      </div>

      {/* Scrollable document container */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        {/* Document editor - single continuous writing surface */}
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={saveContent}
          onKeyDown={handleKeyDown}
          onBlur={saveContent}
          data-placeholder="Start taking notes..."
          className={cn(
            // Document sizing - comfortable reading width with generous padding
            "min-h-full w-full max-w-4xl mx-auto px-8 py-6",
            // Typography and outline
            "outline-none text-base leading-relaxed",
            // Prose styling for rich content
            "prose prose-sm dark:prose-invert max-w-none",
            "prose-headings:font-semibold prose-headings:tracking-tight",
            "prose-h1:text-2xl prose-h1:mb-4 prose-h1:mt-6 prose-h1:pb-2 prose-h1:border-b prose-h1:border-border",
            "prose-h2:text-xl prose-h2:mb-3 prose-h2:mt-5",
            "prose-p:my-3 prose-p:leading-7",
            "prose-ul:my-3 prose-ol:my-3",
            "prose-li:my-1",
            "prose-blockquote:border-l-4 prose-blockquote:border-primary/50 prose-blockquote:bg-muted/30 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r prose-blockquote:italic",
            "prose-pre:bg-muted prose-pre:rounded-lg prose-pre:p-4 prose-pre:overflow-x-auto",
            "prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm",
            "prose-a:text-primary prose-a:underline prose-a:underline-offset-2",
            // Placeholder styling when empty
            "empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/60 empty:before:pointer-events-none empty:before:absolute",
            // Cursor and selection styling
            "selection:bg-primary/20",
            // Smooth caret movement
            "caret-primary"
          )}
          style={{
            // Ensure continuous vertical writing space
            minHeight: 'calc(100% - 1px)',
            // Natural word wrapping
            wordWrap: 'break-word',
            overflowWrap: 'break-word',
            // Prevent horizontal overflow
            whiteSpace: 'pre-wrap',
          }}
        />
      </div>

      {/* Minimal status bar */}
      <div className="flex items-center justify-between px-4 py-1.5 border-t border-border bg-muted/20 text-xs text-muted-foreground shrink-0">
        <span>Auto-saved</span>
        <span className="hidden sm:inline">Ctrl+B bold · Ctrl+I italic · Ctrl+U underline</span>
      </div>
    </div>
  );
}
