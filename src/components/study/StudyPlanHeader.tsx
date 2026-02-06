import { StudyPlan } from '@/types/study';
import { GraduationCap, Calendar, BookOpen, GraduationCap as ReviewIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface StudyPlanHeaderProps {
  plan: StudyPlan;
  onOpenReview: () => void;
  totalFlashcards: number;
}

export function StudyPlanHeader({ plan, onOpenReview, totalFlashcards }: StudyPlanHeaderProps) {
  const totalReadings = plan.weeks.reduce((acc, week) => acc + week.readings.length, 0);

  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground p-8 mb-8">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/20 -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white/20 translate-y-1/2 -translate-x-1/2" />
      </div>

      <div className="relative">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2 opacity-90">
              <GraduationCap className="h-5 w-5" />
              <span className="text-sm font-medium">{plan.institution}</span>
              <span className="text-white/50">•</span>
              <span className="text-sm">{plan.term}</span>
            </div>
            <h1 className="font-serif text-3xl md:text-4xl font-semibold mb-3">
              {plan.title}
            </h1>
            <p className="text-primary-foreground/80 max-w-2xl text-sm md:text-base leading-relaxed">
              {plan.description}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap items-center gap-6 mt-6 pt-6 border-t border-white/20">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 opacity-80" />
            <div>
              <div className="text-2xl font-semibold">{plan.weeks.length}</div>
              <div className="text-xs opacity-80">Weeks</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 opacity-80" />
            <div>
              <div className="text-2xl font-semibold">{totalReadings}</div>
              <div className="text-xs opacity-80">Readings</div>
            </div>
          </div>
          <div className="ml-auto">
            <Button
              onClick={onOpenReview}
              variant="secondary"
              size="lg"
              className="bg-white/20 hover:bg-white/30 text-white border-0"
            >
              <ReviewIcon className="h-5 w-5 mr-2" />
              Review ({totalFlashcards})
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
