export enum AppState {
  LANDING,
  LOADING,
  STORY,
  QUIZ,
  EXPLORE,
  VIEW_STORY,
}

export interface WordTimestamp {
  word: string;
  start: number;
  end: number;
}

export interface VocabularyData {
  word: string;
  definition: string;
  funFact: string;
  definitionAudio: string;
  funFactAudio: string;
}

export interface PageQuizData {
  question: string;
  options: string[];
  correctAnswerIndex: number;
}

export interface PageData {
  text: string;
  timedText?: WordTimestamp[];
  imagePrompt: string;
  image: string; // base64
  audio: string; // base64
  vocabulary?: VocabularyData;
  pageQuiz?: PageQuizData;
}

export interface QuizData {
  question: string;
  options: string[];
  correctAnswerIndex: number;
}

export interface StoryData {
  id: string;
  title: string;
  category: string;
  loves: number;
  pages: PageData[];
  quiz: QuizData;
}