import { WeekContent } from '@/types/study';
import { ChevronRight, BookOpen, Video, FileText, ClipboardList, Presentation } from 'lucide-react';

interface WeekCardProps {
  week: WeekContent;
  onClick: () => void;
  progress?: number;
}

const getReadingIcon = (type: string) => {
  switch (type) {
    case 'video':
      return <Video className="h-4 w-4" />;
    case 'pdf':
      return <FileText className="h-4 w-4" />;
    case 'assignment':
      return <ClipboardList className="h-4 w-4" />;
    default:
      return <BookOpen className="h-4 w-4" />;
  }
};

export function WeekCard({ week, onClick, progress = 0 }: WeekCardProps) {
  const totalItems = week.readings.length + week.assignments.length;

  return (
    <div
      onClick={onClick}
      className="group relative bg-card rounded-lg shadow-card cursor-pointer transition-all duration-300 hover:shadow-card-hover border border-border/50 overflow-hidden"
    >
      {/* Progress bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-secondary">
        <div 
          className="h-full bg-primary transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="p-6">
        {/* Week header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary mb-2">
              Week {week.weekNumber}
            </span>
            <h3 className="font-serif text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
              {week.title}
            </h3>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
        </div>

        {/* Topics */}
        <div className="mb-4">
          <ul className="space-y-1.5">
            {week.topics.map((topic, idx) => (
              <li key={idx} className="flex items-center text-sm text-muted-foreground">
                <span className="w-1.5 h-1.5 rounded-full bg-accent mr-2" />
                {topic}
              </li>
            ))}
          </ul>
        </div>

        {/* Resources summary */}
        <div className="flex items-center gap-4 pt-4 border-t border-border/50">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <BookOpen className="h-3.5 w-3.5" />
            <span>{week.readings.length} readings</span>
          </div>
          {week.assignments.length > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <ClipboardList className="h-3.5 w-3.5" />
              <span>{week.assignments.length} assignment{week.assignments.length > 1 ? 's' : ''}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Presentation className="h-3.5 w-3.5" />
            <span>{week.lectures.length} lectures</span>
          </div>
        </div>

        {/* Resource icons preview - show mix of readings, assignments, and lectures */}
        {(week.readings.length > 0 || week.assignments.length > 0 || week.lectures.length > 0) && (
          <div className="flex items-center gap-2 mt-3">
            {/* Combine all resources with their types */}
            {[
              ...week.readings.slice(0, 2).map(r => ({ id: r.id, title: r.title, type: r.type })),
              ...week.assignments.slice(0, 2).map(a => ({ id: a.id, title: a.title, type: 'assignment' as const })),
              ...week.lectures.slice(0, 2).map((l, i) => ({ id: `lecture-${i}`, title: l.title, type: 'lecture' as const })),
            ].slice(0, 5).map((resource) => (
              <div
                key={resource.id}
                className="flex items-center justify-center w-7 h-7 rounded-md bg-secondary text-secondary-foreground"
                title={resource.title}
              >
                {resource.type === 'lecture' ? <Presentation className="h-4 w-4" /> : getReadingIcon(resource.type)}
              </div>
            ))}
            {(week.readings.length + week.assignments.length + week.lectures.length) > 5 && (
              <span className="text-xs text-muted-foreground">
                +{(week.readings.length + week.assignments.length + week.lectures.length) - 5} more
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
