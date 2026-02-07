import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Link, FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface AddCourseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddCourseDialog({ open, onOpenChange }: AddCourseDialogProps) {
  const [courseUrl, setCourseUrl] = useState('');
  const [courseName, setCourseName] = useState('');
  const [courseDescription, setCourseDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!courseName.trim()) {
      toast.error('Please enter a course name');
      return;
    }

    setIsLoading(true);
    
    // Simulate adding course - in the future this would save to database
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast.success(`Course "${courseName}" added successfully!`, {
      description: 'Your course has been created. You can now add weeks and content.'
    });
    
    // Reset form
    setCourseUrl('');
    setCourseName('');
    setCourseDescription('');
    setIsLoading(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-primary" />
            Add New Course
          </DialogTitle>
          <DialogDescription>
            Create a new study plan by entering course details or importing from a syllabus URL.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="courseName">Course Name *</Label>
            <Input
              id="courseName"
              placeholder="e.g., CS101: Introduction to Computer Science"
              value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="courseDescription">Description</Label>
            <Textarea
              id="courseDescription"
              placeholder="Brief description of the course..."
              value={courseDescription}
              onChange={(e) => setCourseDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="courseUrl" className="flex items-center gap-2">
              <Link className="h-4 w-4" />
              Syllabus URL (optional)
            </Label>
            <Input
              id="courseUrl"
              type="url"
              placeholder="https://example.edu/syllabus.pdf"
              value={courseUrl}
              onChange={(e) => setCourseUrl(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Paste a syllabus URL to automatically generate your study plan
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4 mr-2" />
                  Create Course
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
