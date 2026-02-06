export interface Reading {
  id: string;
  title: string;
  url: string;
  type: 'video' | 'article' | 'pdf' | 'assignment';
}

export interface WeekContent {
  id: string;
  weekNumber: number;
  title: string;
  topics: string[];
  readings: Reading[];
  assignments: Reading[];
  lectures: {
    date: string;
    title: string;
    slidesUrl?: string;
  }[];
}

export interface StudyPlan {
  id: string;
  title: string;
  institution: string;
  term: string;
  description: string;
  weeks: WeekContent[];
  createdAt: Date;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  weekId: string;
  readingId?: string;
  mastered: boolean;
  createdAt: Date;
}

export interface Note {
  id: string;
  content: string;
  weekId: string;
  readingId?: string;
  highlightedText?: string;
  createdAt: Date;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}
