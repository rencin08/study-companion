import { useState, useRef, useEffect, useCallback } from 'react';
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

interface ToolbarButtonProps {
  icon: React.ReactNode;
  onClick: () => void;
  active?: boolean;
  title: string;
}

function ToolbarButton({ icon, onClick, active, title }: ToolbarButtonProps) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      title={title}
      className={cn(
        "h-8 w-8 p-0",
        active && "bg-accent text-accent-foreground"
      )}
    >
      {icon}
    </Button>
  );
}

const FONT_SIZES = [
  { label: 'Small', value: '1' },
  { label: 'Normal', value: '3' },
  { label: 'Large', value: '5' },
  { label: 'Huge', value: '7' },
];

export function NotesEditor({ readingId, weekId, initialContent, onContentChange }: NotesEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isEmpty, setIsEmpty] = useState(true);
  const [currentFontSize, setCurrentFontSize] = useState('Normal');
  const storageKey = `notes-${weekId}-${readingId}`;

  // Auto-focus editor on mount
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.focus();
    }
  }, []);

  // Load saved content on mount
  useEffect(() => {
    const savedContent = localStorage.getItem(storageKey);
    if (editorRef.current) {
      if (savedContent) {
        editorRef.current.innerHTML = savedContent;
        setIsEmpty(false);
      } else if (initialContent) {
        editorRef.current.innerHTML = initialContent;
        setIsEmpty(false);
      }
    }
  }, [storageKey, initialContent]);

  // Auto-save content
  const saveContent = useCallback(() => {
    if (editorRef.current) {
      const content = editorRef.current.innerHTML;
      localStorage.setItem(storageKey, content);
      onContentChange?.(content);
    }
  }, [storageKey, onContentChange]);

  // Debounced auto-save
  useEffect(() => {
    const timer = setInterval(saveContent, 2000);
    return () => clearInterval(timer);
  }, [saveContent]);

  const handleInput = () => {
    if (editorRef.current) {
      const text = editorRef.current.textContent || '';
      setIsEmpty(text.trim().length === 0);
      saveContent();
    }
  };

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

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

  const handleFontSize = (size: { label: string; value: string }) => {
    execCommand('fontSize', size.value);
    setCurrentFontSize(size.label);
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Toolbar at very top */}
      <div className="flex flex-wrap items-center gap-0.5 p-2 border-b border-border bg-muted/30 shrink-0">
        <ToolbarButton
          icon={<Undo className="h-4 w-4" />}
          onClick={() => execCommand('undo')}
          title="Undo (Ctrl+Z)"
        />
        <ToolbarButton
          icon={<Redo className="h-4 w-4" />}
          onClick={() => execCommand('redo')}
          title="Redo (Ctrl+Shift+Z)"
        />
        
        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Font Size Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 px-2 gap-1">
              <span className="text-xs">{currentFontSize}</span>
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {FONT_SIZES.map((size) => (
              <DropdownMenuItem
                key={size.value}
                onClick={() => handleFontSize(size)}
                className={cn(currentFontSize === size.label && "bg-accent")}
              >
                {size.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        
        <Separator orientation="vertical" className="h-6 mx-1" />
        
        <ToolbarButton
          icon={<Heading1 className="h-4 w-4" />}
          onClick={() => execCommand('formatBlock', 'h1')}
          title="Heading 1"
        />
        <ToolbarButton
          icon={<Heading2 className="h-4 w-4" />}
          onClick={() => execCommand('formatBlock', 'h2')}
          title="Heading 2"
        />
        
        <Separator orientation="vertical" className="h-6 mx-1" />
        
        <ToolbarButton
          icon={<Bold className="h-4 w-4" />}
          onClick={() => execCommand('bold')}
          title="Bold (Ctrl+B)"
        />
        <ToolbarButton
          icon={<Italic className="h-4 w-4" />}
          onClick={() => execCommand('italic')}
          title="Italic (Ctrl+I)"
        />
        <ToolbarButton
          icon={<Underline className="h-4 w-4" />}
          onClick={() => execCommand('underline')}
          title="Underline (Ctrl+U)"
        />
        <ToolbarButton
          icon={<Strikethrough className="h-4 w-4" />}
          onClick={() => execCommand('strikeThrough')}
          title="Strikethrough"
        />
        
        <Separator orientation="vertical" className="h-6 mx-1" />
        
        <ToolbarButton
          icon={<List className="h-4 w-4" />}
          onClick={() => execCommand('insertUnorderedList')}
          title="Bullet List"
        />
        <ToolbarButton
          icon={<ListOrdered className="h-4 w-4" />}
          onClick={() => execCommand('insertOrderedList')}
          title="Numbered List"
        />
        
        <Separator orientation="vertical" className="h-6 mx-1" />
        
        <ToolbarButton
          icon={<AlignLeft className="h-4 w-4" />}
          onClick={() => execCommand('justifyLeft')}
          title="Align Left"
        />
        <ToolbarButton
          icon={<AlignCenter className="h-4 w-4" />}
          onClick={() => execCommand('justifyCenter')}
          title="Align Center"
        />
        <ToolbarButton
          icon={<AlignRight className="h-4 w-4" />}
          onClick={() => execCommand('justifyRight')}
          title="Align Right"
        />
        
        <Separator orientation="vertical" className="h-6 mx-1" />
        
        <ToolbarButton
          icon={<Quote className="h-4 w-4" />}
          onClick={() => execCommand('formatBlock', 'blockquote')}
          title="Quote"
        />
        <ToolbarButton
          icon={<Code className="h-4 w-4" />}
          onClick={() => execCommand('formatBlock', 'pre')}
          title="Code Block"
        />
        <ToolbarButton
          icon={<Link className="h-4 w-4" />}
          onClick={insertLink}
          title="Insert Link"
        />
      </div>

      {/* Editor area - fills remaining space, cursor starts here */}
      <div 
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onBlur={saveContent}
        className={cn(
          "flex-1 overflow-auto p-6 outline-none prose prose-sm dark:prose-invert max-w-none",
          "prose-headings:font-serif prose-headings:font-semibold",
          "prose-h1:text-2xl prose-h1:mb-4 prose-h1:mt-6",
          "prose-h2:text-xl prose-h2:mb-3 prose-h2:mt-5",
          "prose-p:my-2 prose-p:leading-relaxed",
          "prose-ul:my-2 prose-ol:my-2",
          "prose-li:my-0.5",
          "prose-blockquote:border-l-primary prose-blockquote:bg-muted/50 prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:rounded-r",
          "prose-pre:bg-muted prose-pre:rounded-lg prose-pre:p-4",
          "prose-a:text-primary prose-a:no-underline hover:prose-a:underline"
        )}
        data-placeholder="Start taking notes..."
        style={{
          minHeight: 0
        }}
      >
        {isEmpty && (
          <span className="text-muted-foreground pointer-events-none">
            Start taking notes...
          </span>
        )}
      </div>

      {/* Status bar at bottom */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-border bg-muted/30 text-xs text-muted-foreground shrink-0">
        <span>Auto-saved to browser</span>
        <span>Press Ctrl+B for bold, Ctrl+I for italic</span>
      </div>
    </div>
  );
}
