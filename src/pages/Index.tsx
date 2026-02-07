import { useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { StudyPlanHeader } from '@/components/study/StudyPlanHeader';
import { WeekCard } from '@/components/study/WeekCard';
import { WeekDetail } from '@/components/study/WeekDetail';
import { ReadingView } from '@/components/study/ReadingView';
import { ReviewHub } from '@/components/study/ReviewHub';
import { SlideViewer } from '@/components/study/SlideViewer';
import { AddCourseDialog } from '@/components/study/AddCourseDialog';
import { modernSoftwareCourse, sampleFlashcards } from '@/data/courseData';
import { WeekContent, Reading, Flashcard, Highlight } from '@/types/study';

interface LectureInfo {
  title: string;
  date: string;
  slidesUrl: string;
}

type ViewMode = 'dashboard' | 'week' | 'reading' | 'review' | 'slides';

const Index = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
  const [selectedWeek, setSelectedWeek] = useState<WeekContent | null>(null);
  const [selectedReading, setSelectedReading] = useState<Reading | null>(null);
  const [selectedLecture, setSelectedLecture] = useState<LectureInfo | null>(null);
  const [flashcards, setFlashcards] = useState<Flashcard[]>(sampleFlashcards);
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [addCourseOpen, setAddCourseOpen] = useState(false);
  
  // Track completed items per week (in a real app this would be persisted)
  const [completedItems, setCompletedItems] = useState<Record<string, Set<string>>>({});
  
  // Calculate progress for a week based on completed items
  const calculateWeekProgress = (week: WeekContent): number => {
    const totalItems = week.readings.length + week.assignments.length + week.lectures.length;
    if (totalItems === 0) return 0;
    
    const completed = completedItems[week.id]?.size || 0;
    return Math.round((completed / totalItems) * 100);
  };

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
    setSelectedLecture(null);
  };

  const handleOpenSlides = (lecture: LectureInfo) => {
    setSelectedLecture(lecture);
    setViewMode('slides');
  };

  const handleBackFromSlides = () => {
    setViewMode('week');
    setSelectedLecture(null);
  };

  const handleBackToWeek = () => {
    setViewMode('week');
    setSelectedReading(null);
  };

  const handleOpenReview = () => {
    setViewMode('review');
  };

  const handleCreateHighlight = (highlight: Omit<Highlight, 'id' | 'createdAt'>) => {
    const newHighlight: Highlight = {
      ...highlight,
      id: `hl-${Date.now()}`,
      createdAt: new Date()
    };
    setHighlights(prev => [...prev, newHighlight]);
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
      <Navbar onAddCourse={() => setAddCourseOpen(true)} />
      
      <main className="container py-8">
        {viewMode === 'dashboard' && (
          <div className="animate-fade-in-up">
            <StudyPlanHeader
              plan={modernSoftwareCourse}
              onOpenReview={handleOpenReview}
              totalFlashcards={flashcards.length}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 stagger-children">
              {modernSoftwareCourse.weeks.map((week) => (
                <WeekCard
                  key={week.id}
                  week={week}
                  onClick={() => handleWeekClick(week)}
                  progress={calculateWeekProgress(week)}
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
            onOpenSlides={handleOpenSlides}
          />
        )}

        {viewMode === 'reading' && selectedReading && selectedWeek && (
          <ReadingView
            reading={selectedReading}
            weekTitle={`Week ${selectedWeek.weekNumber}: ${selectedWeek.title}`}
            onBack={handleBackToWeek}
            onCreateFlashcard={handleCreateFlashcard}
            onCreateHighlight={handleCreateHighlight}
            highlights={highlights.filter(h => h.readingId === selectedReading.id)}
          />
        )}

        {viewMode === 'review' && (
          <ReviewHub
            flashcards={flashcards}
            weeks={modernSoftwareCourse.weeks}
            onBack={handleBackToDashboard}
            onMarkMastered={handleMarkMastered}
          />
        )}

        {viewMode === 'slides' && selectedLecture && selectedWeek && (
          <SlideViewer
            lectureTitle={selectedLecture.title}
            lectureDate={selectedLecture.date}
            slidesUrl={selectedLecture.slidesUrl}
            weekTitle={`Week ${selectedWeek.weekNumber}: ${selectedWeek.title}`}
            onBack={handleBackFromSlides}
          />
        )}
      </main>
      
      <AddCourseDialog open={addCourseOpen} onOpenChange={setAddCourseOpen} />
    </div>
  );
};

export default Index;
