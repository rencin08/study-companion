import { useRef, useEffect, useCallback, useState, forwardRef } from 'react';
import { 
  Bold, Italic, Undo, Redo, List, ListOrdered, 
  Link, ChevronDown, Trash2, Check, Loader2
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

type SaveStatus = 'idle' | 'saving' | 'saved';

export function NotesEditor({ readingId, weekId, initialContent, onContentChange }: NotesEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const storageKey = `notes-${weekId}-${readingId}`;
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  useEffect(() => {
    if (!editorRef.current) return;
    const saved = localStorage.getItem(storageKey);
    editorRef.current.innerHTML = saved || initialContent || '';
    if (saved) {
      setLastSaved(new Date());
      setSaveStatus('saved');
    }
  }, [storageKey, initialContent]);

  // Focus editor on mount so cursor starts at top
  useEffect(() => {
    editorRef.current?.focus();
  }, []);

  const saveContent = useCallback(() => {
    if (!editorRef.current) return;
    setSaveStatus('saving');
    const content = editorRef.current.innerHTML;
    localStorage.setItem(storageKey, content);
    onContentChange?.(content);
    const now = new Date();
    setLastSaved(now);
    // Brief "Saving…" then switch to "Saved"
    setTimeout(() => setSaveStatus('saved'), 300);
  }, [storageKey, onContentChange]);

  const debouncedSave = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setSaveStatus('saving');
    debounceRef.current = setTimeout(() => {
      saveContent();
    }, 500);
  }, [saveContent]);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

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

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="h-full flex flex-col">
      {/* Editor area fills remaining space, cursor starts at top */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={debouncedSave}
          onKeyDown={handleKeyDown}
          onBlur={saveContent}
          data-placeholder="Start typing your notes..."
          className={cn(
            "w-full px-6 py-4 outline-none min-h-[200px] h-full",
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

      {/* Toolbar pinned to bottom */}
      <div className="shrink-0 flex items-center gap-1 px-3 py-1.5 border-t border-border bg-muted/20">
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

        {/* Save status */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mr-2">
          {saveStatus === 'saving' && (
            <>
              <Loader2 className="h-3 w-3 animate-spin" />
              <span>Saving…</span>
            </>
          )}
          {saveStatus === 'saved' && lastSaved && (
            <>
              <Check className="h-3 w-3 text-primary" />
              <span>Saved {formatTime(lastSaved)}</span>
            </>
          )}
        </div>

        <TBtn onClick={clearNotes} title="Clear notes"><Trash2 className="h-4 w-4" /></TBtn>
      </div>
    </div>
  );
}
