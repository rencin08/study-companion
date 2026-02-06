import { useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { StudyPlanHeader } from '@/components/study/StudyPlanHeader';
import { WeekCard } from '@/components/study/WeekCard';
import { WeekDetail } from '@/components/study/WeekDetail';
import { ReadingView } from '@/components/study/ReadingView';
import { FlashcardStudy } from '@/components/study/FlashcardStudy';
import { modernSoftwareCourse, sampleFlashcards } from '@/data/courseData';
import { WeekContent, Reading, Flashcard } from '@/types/study';

type ViewMode = 'dashboard' | 'week' | 'reading' | 'flashcards';

const Index = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
  const [selectedWeek, setSelectedWeek] = useState<WeekContent | null>(null);
  const [selectedReading, setSelectedReading] = useState<Reading | null>(null);
  const [flashcards, setFlashcards] = useState<Flashcard[]>(sampleFlashcards);

  const handleWeekClick = (week: WeekContent) => {
    setSelectedWeek(week);
    setViewMode('week');
  };

  const handleOpenReading = (reading: Reading) => {
    setSelectedReading(reading);
    setViewMode('reading');
  };

  const handleBackToDashboard = () => {
    setViewMode('dashboard');
    setSelectedWeek(null);
    setSelectedReading(null);
  };

  const handleBackToWeek = () => {
    setViewMode('week');
    setSelectedReading(null);
  };

  const handleStudyFlashcards = () => {
    setViewMode('flashcards');
  };

  const handleCreateFlashcard = (flashcard: Omit<Flashcard, 'id' | 'createdAt'>) => {
    const newFlashcard: Flashcard = {
      ...flashcard,
      id: `fc-${Date.now()}`,
      createdAt: new Date()
    };
    setFlashcards(prev => [...prev, newFlashcard]);
  };

  const handleMarkMastered = (id: string, mastered: boolean) => {
    setFlashcards(prev =>
      prev.map(fc => fc.id === id ? { ...fc, mastered } : fc)
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container py-8">
        {viewMode === 'dashboard' && (
          <div className="animate-fade-in-up">
            <StudyPlanHeader
              plan={modernSoftwareCourse}
              onStudyFlashcards={handleStudyFlashcards}
              totalFlashcards={flashcards.length}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 stagger-children">
              {modernSoftwareCourse.weeks.map((week) => (
                <WeekCard
                  key={week.id}
                  week={week}
                  onClick={() => handleWeekClick(week)}
                  progress={Math.floor(Math.random() * 30)} // Demo progress
                />
              ))}
            </div>
          </div>
        )}

        {viewMode === 'week' && selectedWeek && (
          <WeekDetail
            week={selectedWeek}
            onBack={handleBackToDashboard}
            onOpenReading={handleOpenReading}
          />
        )}

        {viewMode === 'reading' && selectedReading && selectedWeek && (
          <ReadingView
            reading={selectedReading}
            weekTitle={`Week ${selectedWeek.weekNumber}: ${selectedWeek.title}`}
            onBack={handleBackToWeek}
            onCreateFlashcard={handleCreateFlashcard}
          />
        )}

        {viewMode === 'flashcards' && (
          <FlashcardStudy
            flashcards={flashcards}
            onBack={handleBackToDashboard}
            onMarkMastered={handleMarkMastered}
          />
        )}
      </main>
    </div>
  );
};

export default Index;
