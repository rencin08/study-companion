import { useState, useEffect } from 'react';
import { Flashcard } from '@/types/study';
import { ArrowLeft, RotateCcw, Check, X, Brain, Shuffle, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface FlashcardStudyProps {
  flashcards: Flashcard[];
  onBack: () => void;
  onMarkMastered: (id: string, mastered: boolean) => void;
  embedded?: boolean;
}

export function FlashcardStudy({ flashcards, onBack, onMarkMastered, embedded = false }: FlashcardStudyProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [studyCards, setStudyCards] = useState<Flashcard[]>([]);
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    // Shuffle cards on mount
    const shuffled = [...flashcards].sort(() => Math.random() - 0.5);
    setStudyCards(shuffled);
  }, [flashcards]);

  const currentCard = studyCards[currentIndex];
  const progress = ((currentIndex) / studyCards.length) * 100;

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleNext = (correct: boolean) => {
    if (correct) {
      setCorrectCount(prev => prev + 1);
      if (currentCard) {
        onMarkMastered(currentCard.id, true);
      }
    } else {
      setIncorrectCount(prev => prev + 1);
    }

    if (currentIndex < studyCards.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsFlipped(false);
    } else {
      setIsComplete(true);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setIsFlipped(false);
    }
  };

  const handleShuffle = () => {
    const shuffled = [...studyCards].sort(() => Math.random() - 0.5);
    setStudyCards(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
    setCorrectCount(0);
    setIncorrectCount(0);
    setIsComplete(false);
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setCorrectCount(0);
    setIncorrectCount(0);
    setIsComplete(false);
  };

  if (studyCards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <Brain className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="font-serif text-2xl font-semibold mb-2">No Flashcards Yet</h2>
        <p className="text-muted-foreground mb-6">Create flashcards while reading to start studying!</p>
        <Button onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Study Plan
        </Button>
      </div>
    );
  }

  if (isComplete) {
    const percentage = Math.round((correctCount / studyCards.length) * 100);
    
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] text-center animate-fade-in-up">
        <div className="w-24 h-24 rounded-full bg-success/20 flex items-center justify-center mb-6">
          <Brain className="h-12 w-12 text-success" />
        </div>
        <h2 className="font-serif text-3xl font-semibold mb-2">Study Session Complete!</h2>
        <p className="text-muted-foreground mb-8">You reviewed {studyCards.length} flashcards</p>
        
        <div className="flex items-center gap-8 mb-8">
          <div className="text-center">
            <div className="text-4xl font-bold text-success">{correctCount}</div>
            <div className="text-sm text-muted-foreground">Correct</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-destructive">{incorrectCount}</div>
            <div className="text-sm text-muted-foreground">Need Review</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-primary">{percentage}%</div>
            <div className="text-sm text-muted-foreground">Mastery</div>
          </div>
        </div>

        <div className="flex gap-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Study Plan
          </Button>
          <Button onClick={handleRestart}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Study Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      {!embedded && (
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={onBack} className="-ml-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {currentIndex + 1} / {studyCards.length}
            </span>
            <Button variant="outline" size="sm" onClick={handleShuffle}>
              <Shuffle className="h-4 w-4 mr-2" />
              Shuffle
            </Button>
          </div>
        </div>
      )}
      {embedded && (
        <div className="flex items-center justify-end mb-6">
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {currentIndex + 1} / {studyCards.length}
            </span>
            <Button variant="outline" size="sm" onClick={handleShuffle}>
              <Shuffle className="h-4 w-4 mr-2" />
              Shuffle
            </Button>
          </div>
        </div>
      )}

      {/* Progress */}
      <div className="mb-6">
        <Progress value={progress} className="h-2" />
        <div className="flex justify-between mt-2 text-sm text-muted-foreground">
          <span className="text-success">{correctCount} correct</span>
          <span className="text-destructive">{incorrectCount} need review</span>
        </div>
      </div>

      {/* Flashcard */}
      <div
        onClick={handleFlip}
        className="relative w-full aspect-[3/2] cursor-pointer perspective-1000"
      >
        <div
          className={`absolute inset-0 transition-transform duration-500 transform-style-3d ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
          style={{
            transformStyle: 'preserve-3d',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
          }}
        >
          {/* Front */}
          <div
            className="absolute inset-0 bg-card rounded-2xl shadow-lg border border-border p-8 flex flex-col items-center justify-center backface-hidden"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <div className="text-xs text-muted-foreground mb-4 flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Click to reveal answer
            </div>
            <p className="font-serif text-xl md:text-2xl text-center font-medium">
              {currentCard?.front}
            </p>
          </div>

          {/* Back */}
          <div
            className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl shadow-lg border border-primary/20 p-8 flex flex-col items-center justify-center"
            style={{ 
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)'
            }}
          >
            <p className="text-center text-lg leading-relaxed">
              {currentCard?.back}
            </p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 mt-8">
        <Button
          variant="outline"
          size="lg"
          onClick={handlePrevious}
          disabled={currentIndex === 0}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        
        {isFlipped && (
          <>
            <Button
              variant="outline"
              size="lg"
              onClick={() => handleNext(false)}
              className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
            >
              <X className="h-5 w-5 mr-2" />
              Need Review
            </Button>
            <Button
              size="lg"
              onClick={() => handleNext(true)}
              className="bg-success hover:bg-success/90"
            >
              <Check className="h-5 w-5 mr-2" />
              Got It!
            </Button>
          </>
        )}

        <Button
          variant="outline"
          size="lg"
          onClick={() => {
            if (currentIndex < studyCards.length - 1) {
              setCurrentIndex(prev => prev + 1);
              setIsFlipped(false);
            }
          }}
          disabled={currentIndex === studyCards.length - 1}
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      <p className="text-center text-sm text-muted-foreground mt-4">
        Click the card to flip it, then mark if you knew the answer
      </p>
    </div>
  );
}
