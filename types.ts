export enum AppState {
  LANDING,
  LOADING,
  STORY,
  QUIZ,
  SEQUENCING_GAME,
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

export interface ImageHotspot {
  word: string;
  x: number; // Percentage from left (0-100)
  y: number; // Percentage from top (0-100)
}

export interface PageData {
  text: string;
  timedText?: WordTimestamp[];
  imagePrompt: string;
  image: string; // base64
  audio: string; // base64
  vocabulary?: VocabularyData;
  pageQuiz?: PageQuizData;
  imageHotspots?: ImageHotspot[];
}

export interface QuizData {
  question: string;
  options: string[];
  correctAnswerIndex: number;
}

export interface SequencingGameData {
  events: string[];
}

export interface StoryData {
  id: string;
  title: string;
  category: string;
  loves: number;
  pages: PageData[];
  quiz: QuizData;
  sequencingGame: SequencingGameData;
  characterSheet: string; // A detailed visual description of the character for consistent image generation.
  targetAudience?: string; // e.g., "Preschoolers (4-5 years)"
  voiceName?: string; // e.g., "Nova (Bright & Cheerful)"
  artStyle?: string;
  theme?: string;
}