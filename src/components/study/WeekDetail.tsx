import { WeekContent, Reading } from '@/types/study';
import { ArrowLeft, BookOpen, Video, FileText, ClipboardList, Presentation, ExternalLink, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WeekDetailProps {
  week: WeekContent;
  onBack: () => void;
  onOpenReading: (reading: Reading) => void;
}

const getReadingIcon = (type: string) => {
  switch (type) {
    case 'video':
      return <Video className="h-5 w-5 text-info" />;
    case 'pdf':
      return <FileText className="h-5 w-5 text-destructive" />;
    case 'assignment':
      return <ClipboardList className="h-5 w-5 text-warning" />;
    default:
      return <BookOpen className="h-5 w-5 text-primary" />;
  }
};

const getTypeLabel = (type: string) => {
  switch (type) {
    case 'video':
      return 'Video';
    case 'pdf':
      return 'PDF';
    case 'assignment':
      return 'Assignment';
    default:
      return 'Article';
  }
};

export function WeekDetail({ week, onBack, onOpenReading }: WeekDetailProps) {
  return (
    <div className="animate-fade-in-up">
      {/* Back button */}
      <Button
        variant="ghost"
        onClick={onBack}
        className="mb-6 -ml-2 text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Study Plan
      </Button>

      {/* Week header */}
      <div className="mb-8">
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary mb-3">
          Week {week.weekNumber}
        </span>
        <h1 className="font-serif text-3xl md:text-4xl font-semibold text-foreground mb-4">
          {week.title}
        </h1>
        
        {/* Topics */}
        <div className="flex flex-wrap gap-2">
          {week.topics.map((topic, idx) => (
            <span
              key={idx}
              className="inline-flex items-center px-3 py-1 rounded-lg text-sm bg-secondary text-secondary-foreground"
            >
              {topic}
            </span>
          ))}
        </div>
      </div>

      {/* Lectures */}
      {week.lectures.length > 0 && (
        <div className="mb-8">
          <h2 className="font-serif text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <Presentation className="h-5 w-5 text-primary" />
            Lectures
          </h2>
          <div className="space-y-3">
            {week.lectures.map((lecture, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-4 bg-card rounded-lg border border-border/50 shadow-card"
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                    <Presentation className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{lecture.title}</p>
                    <p className="text-sm text-muted-foreground">{lecture.date}</p>
                  </div>
                </div>
                {lecture.slidesUrl && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(lecture.slidesUrl, '_blank')}
                    className="text-primary"
                  >
                    <span className="mr-2">Slides</span>
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Readings */}
      {week.readings.length > 0 && (
        <div className="mb-8">
          <h2 className="font-serif text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Readings
          </h2>
          <div className="space-y-3 stagger-children">
            {week.readings.map((reading) => (
              <div
                key={reading.id}
                onClick={() => onOpenReading(reading)}
                className="group flex items-center justify-between p-4 bg-card rounded-lg border border-border/50 shadow-card cursor-pointer transition-all hover:shadow-card-hover hover:border-primary/20"
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-secondary">
                    {getReadingIcon(reading.type)}
                  </div>
                  <div>
                    <p className="font-medium text-foreground group-hover:text-primary transition-colors">
                      {reading.title}
                    </p>
                    <p className="text-sm text-muted-foreground">{getTypeLabel(reading.type)}</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Assignments */}
      {week.assignments.length > 0 && (
        <div className="mb-8">
          <h2 className="font-serif text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-warning" />
            Assignments
          </h2>
          <div className="space-y-3">
            {week.assignments.map((assignment) => (
              <div
                key={assignment.id}
                onClick={() => window.open(assignment.url, '_blank')}
                className="group flex items-center justify-between p-4 bg-card rounded-lg border border-border/50 shadow-card cursor-pointer transition-all hover:shadow-card-hover hover:border-warning/30"
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-warning/10">
                    <ClipboardList className="h-5 w-5 text-warning" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground group-hover:text-warning transition-colors">
                      {assignment.title}
                    </p>
                    <p className="text-sm text-muted-foreground">Assignment</p>
                  </div>
                </div>
                <ExternalLink className="h-5 w-5 text-muted-foreground group-hover:text-warning transition-colors" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
