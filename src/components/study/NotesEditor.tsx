import { useRef, useEffect, useCallback, forwardRef } from 'react';
import { 
  Bold, Italic, Undo, Redo, List, ListOrdered, 
  Link, ChevronDown, Trash2
} from 'lucide-react';
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

const BLOCK_FORMATS = [
  { label: 'Normal', value: 'p', tag: 'p' },
  { label: 'Heading 1', value: 'h1', tag: 'h1' },
  { label: 'Heading 2', value: 'h2', tag: 'h2' },
  { label: 'Heading 3', value: 'h3', tag: 'h3' },
];

const TBtn = forwardRef<HTMLButtonElement, { children: React.ReactNode; onClick: () => void; title: string }>(
  ({ children, onClick, title, ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      title={title}
      className="h-8 w-8 inline-flex items-center justify-center rounded hover:bg-accent/60 text-foreground/70 hover:text-foreground transition-colors"
      {...props}
    >
      {children}
    </button>
  )
);
TBtn.displayName = 'TBtn';

export function NotesEditor({ readingId, weekId, initialContent, onContentChange }: NotesEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const storageKey = `notes-${weekId}-${readingId}`;

  useEffect(() => {
    if (!editorRef.current) return;
    const saved = localStorage.getItem(storageKey);
    editorRef.current.innerHTML = saved || initialContent || '';
  }, [storageKey, initialContent]);

  const saveContent = useCallback(() => {
    if (!editorRef.current) return;
    const content = editorRef.current.innerHTML;
    localStorage.setItem(storageKey, content);
    onContentChange?.(content);
  }, [storageKey, onContentChange]);

  useEffect(() => {
    const timer = setInterval(saveContent, 2000);
    return () => clearInterval(timer);
  }, [saveContent]);

  const exec = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    saveContent();
  }, [saveContent]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!(e.metaKey || e.ctrlKey)) return;
    const key = e.key.toLowerCase();
    if (key === 'b') { e.preventDefault(); exec('bold'); }
    else if (key === 'i') { e.preventDefault(); exec('italic'); }
    else if (key === 'u') { e.preventDefault(); exec('underline'); }
    else if (key === 'z' && e.shiftKey) { e.preventDefault(); exec('redo'); }
    else if (key === 'z') { e.preventDefault(); exec('undo'); }
  };

  const clearNotes = () => {
    if (!editorRef.current) return;
    editorRef.current.innerHTML = '';
    saveContent();
    editorRef.current.focus();
  };

  const insertLink = () => {
    const url = prompt('Enter URL:');
    if (url) exec('createLink', url);
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 w-full bg-background">
      {/* Toolbar pinned at top */}
      <div className="flex items-center gap-1 px-3 py-1.5 border-b border-border bg-muted/20 shrink-0">
        <TBtn onClick={() => exec('undo')} title="Undo"><Undo className="h-4 w-4" /></TBtn>
        <TBtn onClick={() => exec('redo')} title="Redo"><Redo className="h-4 w-4" /></TBtn>

        <div className="w-px h-5 bg-border mx-1" />

        {/* Block format dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              className="h-8 px-2 inline-flex items-center gap-1 rounded hover:bg-accent/60 text-sm text-foreground/70 hover:text-foreground transition-colors"
            >
              Normal
              <ChevronDown className="h-3 w-3" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {BLOCK_FORMATS.map((f) => (
              <DropdownMenuItem key={f.value} onSelect={() => exec('formatBlock', f.tag)}>
                {f.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="w-px h-5 bg-border mx-1" />

        <TBtn onClick={() => exec('bold')} title="Bold (Ctrl+B)"><Bold className="h-4 w-4" /></TBtn>
        <TBtn onClick={() => exec('italic')} title="Italic (Ctrl+I)"><Italic className="h-4 w-4" /></TBtn>
        <TBtn onClick={insertLink} title="Insert Link"><Link className="h-4 w-4" /></TBtn>

        <div className="w-px h-5 bg-border mx-1" />

        <TBtn onClick={() => exec('insertOrderedList')} title="Numbered List"><ListOrdered className="h-4 w-4" /></TBtn>
        <TBtn onClick={() => exec('insertUnorderedList')} title="Bullet List"><List className="h-4 w-4" /></TBtn>

        <div className="flex-1" />

        <TBtn onClick={clearNotes} title="Clear notes"><Trash2 className="h-4 w-4" /></TBtn>
      </div>

      {/* Writing surface fills remaining space */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={saveContent}
          onKeyDown={handleKeyDown}
          onBlur={saveContent}
          data-placeholder="Start typing your notes..."
          className={cn(
            "min-h-full w-full px-6 py-4 outline-none",
            "text-[15px] leading-7 text-foreground",
            "[&_h1]:text-2xl [&_h1]:font-semibold [&_h1]:mt-4 [&_h1]:mb-2",
            "[&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mt-3 [&_h2]:mb-1.5",
            "[&_h3]:text-lg [&_h3]:font-medium [&_h3]:mt-2 [&_h3]:mb-1",
            "[&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-2",
            "[&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-2",
            "[&_li]:my-0.5",
            "[&_a]:text-primary [&_a]:underline",
            "[&_blockquote]:border-l-2 [&_blockquote]:border-primary/40 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-muted-foreground",
            "empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/50 empty:before:pointer-events-none",
            "selection:bg-primary/20 caret-primary"
          )}
          style={{ wordWrap: 'break-word', overflowWrap: 'break-word', whiteSpace: 'pre-wrap' }}
        />
      </div>
    </div>
  );
}
