import { useState } from 'react';
import { Highlight } from '@/types/study';
import { Highlighter, Palette, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface HighlightToolbarProps {
  selectedText: string;
  onHighlight: (color: Highlight['color']) => void;
  onClear: () => void;
}

const highlightColors: { color: Highlight['color']; label: string; className: string }[] = [
  { color: 'yellow', label: 'Yellow', className: 'bg-yellow-300' },
  { color: 'green', label: 'Green', className: 'bg-green-300' },
  { color: 'blue', label: 'Blue', className: 'bg-blue-300' },
  { color: 'pink', label: 'Pink', className: 'bg-pink-300' },
];

export function HighlightToolbar({ selectedText, onHighlight, onClear }: HighlightToolbarProps) {
  if (!selectedText) return null;

  return (
    <div className="flex items-center gap-2 bg-card border border-border shadow-lg px-3 py-2 rounded-lg animate-fade-in-up">
      <Highlighter className="h-4 w-4 text-muted-foreground" />
      <span className="text-sm text-muted-foreground max-w-[150px] truncate">
        "{selectedText}"
      </span>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="sm" variant="outline" className="gap-2">
            <Palette className="h-4 w-4" />
            Highlight
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {highlightColors.map(({ color, label, className }) => (
            <DropdownMenuItem
              key={color}
              onClick={() => onHighlight(color)}
              className="gap-2"
            >
              <div className={`w-4 h-4 rounded ${className}`} />
              {label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <Button size="sm" variant="ghost" onClick={onClear}>
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
