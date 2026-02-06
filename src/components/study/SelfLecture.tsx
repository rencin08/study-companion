import { useState } from 'react';
import { SelfLectureSession, WeekContent } from '@/types/study';
import { Mic, MicOff, Send, Brain, CheckCircle, XCircle, Lightbulb, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

const ANALYZE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-lecture`;

interface SelfLectureProps {
  weeks: WeekContent[];
  onComplete: (session: SelfLectureSession) => void;
}

export function SelfLecture({ weeks, onComplete }: SelfLectureProps) {
  const [selectedWeek, setSelectedWeek] = useState<string | null>(null);
  const [userInput, setUserInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentSession, setCurrentSession] = useState<SelfLectureSession | null>(null);

  const handleStartRecording = () => {
    setIsRecording(true);
    // In a real implementation, this would use Web Speech API
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    // Mock transcription
    setUserInput(prev => prev + (prev ? ' ' : '') + 'This is a mock transcription of your verbal explanation.');
  };

  const handleAnalyze = async () => {
    if (!userInput.trim() || !selectedWeek) return;

    const week = weeks.find(w => w.id === selectedWeek);
    if (!week) return;

    setIsAnalyzing(true);
    
    try {
      const response = await fetch(ANALYZE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          transcript: userInput,
          weekTitle: `Week ${week.weekNumber}: ${week.title}`,
          topics: week.topics,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Analysis failed: ${response.status}`);
      }

      const aiAnalysis = await response.json();

      const session: SelfLectureSession = {
        id: `sl-${Date.now()}`,
        weekId: selectedWeek,
        userTranscript: userInput,
        aiAnalysis,
        createdAt: new Date(),
      };

      setCurrentSession(session);
      onComplete(session);
    } catch (error) {
      console.error('Analysis error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to analyze';
      
      if (errorMessage.includes('Rate limit')) {
        toast.error('Too many requests. Please wait a moment and try again.');
      } else if (errorMessage.includes('credits')) {
        toast.error('AI credits exhausted. Please add funds to continue.');
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setCurrentSession(null);
    setUserInput('');
    setSelectedWeek(null);
  };

  if (currentSession?.aiAnalysis) {
    const { aiAnalysis } = currentSession;
    
    return (
      <div className="space-y-6 animate-fade-in-up">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent mb-4">
            <span className="text-4xl font-bold text-primary-foreground">{aiAnalysis.score}%</span>
          </div>
          <h3 className="font-serif text-2xl font-semibold">Your Retention Score</h3>
          <p className="text-muted-foreground mt-1">Based on your explanation of the material</p>
        </div>

        <Progress value={aiAnalysis.score} className="h-3" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* What you retained */}
          <div className="bg-card rounded-xl border border-border p-5 shadow-card">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="h-5 w-5 text-primary" />
              <h4 className="font-semibold">What You Retained</h4>
            </div>
            <ul className="space-y-3">
              {aiAnalysis.retained.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* What you forgot */}
          <div className="bg-card rounded-xl border border-border p-5 shadow-card">
            <div className="flex items-center gap-2 mb-4">
              <XCircle className="h-5 w-5 text-destructive" />
              <h4 className="font-semibold">Areas to Review</h4>
            </div>
            <ul className="space-y-3">
              {aiAnalysis.forgotten.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-destructive mt-2 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Suggestions */}
        <div className="bg-accent/10 rounded-xl border border-accent/30 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="h-5 w-5 text-accent" />
            <h4 className="font-semibold">Study Suggestions</h4>
          </div>
          <ul className="space-y-2">
            {aiAnalysis.suggestions.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm">
                <span className="text-accent">→</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex justify-center">
          <Button onClick={handleReset} variant="outline" size="lg">
            <RotateCcw className="h-4 w-4 mr-2" />
            Try Another Topic
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center max-w-2xl mx-auto">
        <Brain className="h-12 w-12 mx-auto mb-4 text-primary" />
        <h3 className="font-serif text-2xl font-semibold mb-2">Self-Lecture Mode</h3>
        <p className="text-muted-foreground">
          Explain what you've learned in your own words. The AI will analyze your understanding
          and show you what you've retained vs. what needs more review.
        </p>
      </div>

      {/* Week Selection */}
      <div className="bg-card rounded-xl border border-border p-5 shadow-card">
        <label className="text-sm font-medium text-muted-foreground mb-3 block">
          Select a topic to review:
        </label>
        <ScrollArea className="h-48">
          <div className="space-y-2">
            {weeks.map((week) => (
              <button
                key={week.id}
                onClick={() => setSelectedWeek(week.id)}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  selectedWeek === week.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary hover:bg-secondary/80'
                }`}
              >
                <span className="font-medium">Week {week.weekNumber}:</span> {week.title}
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {selectedWeek && (
        <div className="bg-card rounded-xl border border-border p-5 shadow-card animate-fade-in-up">
          <label className="text-sm font-medium text-muted-foreground mb-3 block">
            Explain everything you remember about this topic:
          </label>
          
          <Textarea
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Start typing or use the microphone to record your explanation..."
            className="min-h-[200px] resize-none mb-4"
          />

          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={isRecording ? handleStopRecording : handleStartRecording}
              className={isRecording ? 'text-destructive border-destructive' : ''}
            >
              {isRecording ? (
                <>
                  <MicOff className="h-4 w-4 mr-2" />
                  Stop Recording
                </>
              ) : (
                <>
                  <Mic className="h-4 w-4 mr-2" />
                  Record Voice
                </>
              )}
            </Button>

            <Button
              onClick={handleAnalyze}
              disabled={!userInput.trim() || isAnalyzing}
              size="lg"
            >
              {isAnalyzing ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Analyze My Understanding
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
