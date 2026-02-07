import { GraduationCap, Plus, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NavbarProps {
  onAddCourse?: () => void;
}

export function Navbar({ onAddCourse }: NavbarProps) {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary text-primary-foreground">
            <Brain className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-serif text-xl font-semibold text-foreground">TakeNotes</h1>
            <p className="text-xs text-muted-foreground">AI-Powered Study Assistant</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={onAddCourse}>
            <Plus className="h-4 w-4 mr-2" />
            Add Course
          </Button>
        </div>
      </div>
    </nav>
  );
}
