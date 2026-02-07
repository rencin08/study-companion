import { useState } from 'react';
import { Flashcard, SelfLectureSession, WeekContent } from '@/types/study';
import { ArrowLeft, Brain, Mic, PenTool } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FlashcardStudy } from './FlashcardStudy';
import { SelfLecture } from './SelfLecture';
import { Whiteboard } from './Whiteboard';

interface ReviewHubProps {
  flashcards: Flashcard[];
  weeks: WeekContent[];
  onBack: () => void;
  onMarkMastered: (id: string, mastered: boolean) => void;
}

export function ReviewHub({ flashcards, weeks, onBack, onMarkMastered }: ReviewHubProps) {
  const [sessions, setSessions] = useState<SelfLectureSession[]>([]);

  const handleSessionComplete = (session: SelfLectureSession) => {
    setSessions(prev => [...prev, session]);
  };

  return (
    <div className="animate-fade-in-up">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={onBack} className="-ml-2">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
        <div>
          <h2 className="font-serif text-2xl font-semibold">Review Center</h2>
          <p className="text-muted-foreground">Master your knowledge with flashcards, self-lectures, and visual notes</p>
        </div>
      </div>

      <Tabs defaultValue="flashcards" className="space-y-6">
        <TabsList className="grid w-full max-w-lg grid-cols-3">
          <TabsTrigger value="flashcards" className="gap-2">
            <Brain className="h-4 w-4" />
            Flashcards ({flashcards.length})
          </TabsTrigger>
          <TabsTrigger value="self-lecture" className="gap-2">
            <Mic className="h-4 w-4" />
            Self-Lecture
          </TabsTrigger>
          <TabsTrigger value="whiteboard" className="gap-2">
            <PenTool className="h-4 w-4" />
            Visual Notes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="flashcards">
          <FlashcardStudy
            flashcards={flashcards}
            onBack={() => {}}
            onMarkMastered={onMarkMastered}
            embedded
          />
        </TabsContent>

        <TabsContent value="self-lecture">
          <SelfLecture
            weeks={weeks}
            onComplete={handleSessionComplete}
          />
        </TabsContent>

        <TabsContent value="whiteboard">
          <Whiteboard />
        </TabsContent>
      </Tabs>
    </div>
  );
}
