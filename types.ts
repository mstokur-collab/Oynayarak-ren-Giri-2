export type ScreenId = 
  | 'auth'
  | 'subject-select'
  | 'start' 
  | 'grade-select' 
  | 'learning-area-select'
  | 'kazanim-select'
  | 'competition-mode' 
  | 'difficulty-select' 
  | 'game-mode' 
  | 'quiz-mode'
  | 'game' 
  | 'end' 
  | 'high-scores' 
  | 'teacher-panel'
  | 'kapisma-setup'
  | 'kapisma-game';

export type Difficulty = 'kolay' | 'orta' | 'zor';
export type CompetitionMode = 'bireysel' | 'grup';
export type QuestionType = 'quiz' | 'fill-in' | 'matching' | 'kapisma';
export type QuizMode = 'klasik' | 'zamana-karsi' | 'hayatta-kalma';

export interface BaseQuestion {
  id: number;
  grade: number;
  topic: string;
  difficulty: Difficulty;
  imageUrl?: string;
  kazanımId?: string;
  subjectId: string;
}

export interface QuizQuestion extends BaseQuestion {
  type: 'quiz';
  question: string;
  options: string[];
  answer: string;
  explanation?: string;
  // FIX: Added optional visualPrompt property to allow AI-generated image prompts.
  visualPrompt?: string;
}

export interface FillInQuestion extends BaseQuestion {
  type: 'fill-in';
  sentence: string;
  answer: string;
  distractors: string[];
}

export interface MatchingPair {
  term: string;
  definition: string;
}

export interface MatchingQuestion extends BaseQuestion {
  type: 'matching';
  question?: string;
  pairs: MatchingPair[];
}

export type Question = QuizQuestion | FillInQuestion | MatchingQuestion;

export interface GameSettings {
  grade?: number;
  topic?: string; // This is the learning area
  // FIX: Changed property name to 'kazanımId' for consistency across types.
  kazanımId?: string;
  competitionMode?: CompetitionMode;
  difficulty?: Difficulty;
  gameMode?: QuestionType;
  quizMode?: QuizMode;
  // For Kapisma mode
  teamACount?: number;
  teamBCount?: number;
  questionCount?: number;
}

export interface HighScore {
  name: string;
  score: number;
  date: string;
  settings: GameSettings;
}

export type DocumentLibraryItem = {
  id: string;
  name: string;
  content: { mimeType: string; data: string };
  topics: string[];
};

// FIX: Moved curriculum types here to be globally accessible.
export interface Kazanım {
  id: string;
  text: string;
}

export interface AltKonu {
  name: string;
  kazanımlar: Kazanım[];
}

export interface OgrenmeAlani { // Learning Area
  name: string;
  altKonular: AltKonu[];
}

export interface Exam {
  id: number;
  name: string;
  content: string;
  createdAt: number;
  feedback?: string;
  answerKey?: string;
}