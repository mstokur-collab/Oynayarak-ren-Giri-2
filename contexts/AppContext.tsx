import React, { createContext, useContext, useState, useMemo, useCallback, useEffect, ReactNode } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import type { GameSettings, Question, HighScore, DocumentLibraryItem, Exam, OgrenmeAlani } from '../types';
import { getCurriculumData } from '../services/curriculumService';
import { demoQuestions } from '../data/demoQuestions';

const DAILY_CREDIT_LIMIT = 10;
type UserType = 'guest' | 'authenticated';

interface AppContextType {
  // State
  settings: GameSettings;
  questions: Question[];
  highScores: HighScore[];
  solvedQuestionIds: number[];
  playerName: string;
  documentLibrary: DocumentLibraryItem[];
  generatedExams: Exam[];
  selectedSubjectId: string;
  score: number;
  finalGroupScores?: { grup1: number; grup2: number };
  curriculum: Record<string, Record<number, OgrenmeAlani[]>>;
  isCurriculumLoading: boolean;
  userType: UserType;
  showWelcomeModal: boolean;
  showNoQuestionsModal: boolean;
  welcomeModalTitle: string;
  aiCredits: number;

  // Setters & Functions
  setQuestions: React.Dispatch<React.SetStateAction<Question[]>>;
  setHighScores: React.Dispatch<React.SetStateAction<HighScore[]>>;
  setSolvedQuestionIds: React.Dispatch<React.SetStateAction<number[]>>;
  setDocumentLibrary: React.Dispatch<React.SetStateAction<DocumentLibraryItem[]>>;
  setGeneratedExams: React.Dispatch<React.SetStateAction<Exam[]>>;
  setShowWelcomeModal: React.Dispatch<React.SetStateAction<boolean>>;
  setShowNoQuestionsModal: React.Dispatch<React.SetStateAction<boolean>>;
  setAiCredits: React.Dispatch<React.SetStateAction<number>>;
  setDirectGameQuestions: React.Dispatch<React.SetStateAction<Question[] | null>>;
  
  // Derived State & Complex Logic
  updateSetting: <K extends keyof GameSettings>(setting: K, value: GameSettings[K]) => void;
  handleGameEnd: (finalScore: number, finalGroupScores?: { grup1: number; grup2: number }) => void;
  handleQuestionAnswered: (questionId: number) => void;
  getQuestionsForCriteria: (criteria: Partial<GameSettings>, limit?: number) => Question[];
  getSubjectCount: (subjectId: string) => number;
  handleLogin: () => void;
  handleSubjectSelect: (subjectId: string) => void;
  gameQuestions: Question[];
  ogrenmeAlanlari: OgrenmeAlani[];
  kazanımlar: { id: string; text: string; }[];
  subjectName: string;
  dailyCreditLimit: number;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [settings, setSettings] = useState<GameSettings>({});
    const [questions, setQuestions] = useLocalStorage<Question[]>('quizQuestions', []);
    const [highScores, setHighScores] = useLocalStorage<HighScore[]>('highScores', []);
    const [solvedQuestionIds, setSolvedQuestionIds] = useLocalStorage<number[]>('solvedQuestionIds', []);
    const [playerName, setPlayerName] = useLocalStorage<string>('playerName', 'Oyuncu 1');
    const [documentLibrary, setDocumentLibrary] = useLocalStorage<DocumentLibraryItem[]>('documentLibrary', []);
    const [generatedExams, setGeneratedExams] = useLocalStorage<Exam[]>('generatedExams', []);
    const [selectedSubjectId, setSelectedSubjectId] = useLocalStorage<string>('selectedSubjectId', 'social-studies');
    
    const [score, setScore] = useState(0);
    const [finalGroupScores, setFinalGroupScores] = useState<{ grup1: number, grup2: number } | undefined>();
    
    const [curriculum, setCurriculum] = useState<Record<string, Record<number, OgrenmeAlani[]>>>({});
    const [isCurriculumLoading, setIsCurriculumLoading] = useState(true);
    const [userType, setUserType] = useState<UserType>('guest');
    const [showWelcomeModal, setShowWelcomeModal] = useState(false);
    const [showNoQuestionsModal, setShowNoQuestionsModal] = useState(false);
    const [welcomeModalTitle, setWelcomeModalTitle] = useState("🎉 Hoş Geldiniz!");
    
    const [aiCredits, setAiCredits] = useLocalStorage<number>('aiCredits', DAILY_CREDIT_LIMIT);
    const [lastCreditReset, setLastCreditReset] = useLocalStorage<string>('lastCreditReset', '');
    const [directGameQuestions, setDirectGameQuestions] = useState<Question[] | null>(null);

    useEffect(() => {
        const loadCurriculum = async () => {
          setIsCurriculumLoading(true);
          const data = await getCurriculumData();
          setCurriculum(data);
          setIsCurriculumLoading(false);
        };
        loadCurriculum();
    }, []); 

    useEffect(() => {
      if (userType === 'authenticated') {
        const today = new Date().toISOString().split('T')[0];
        if (lastCreditReset !== today) {
          setAiCredits(DAILY_CREDIT_LIMIT);
          setLastCreditReset(today);
        }
      }
    }, [userType, lastCreditReset, setAiCredits, setLastCreditReset]);

    const updateSetting = useCallback(<K extends keyof GameSettings>(setting: K, value: GameSettings[K]) => {
        setSettings(prev => ({ ...prev, [setting]: value }));
    }, []);

    const handleGameEnd = useCallback((finalScore: number, finalGroupScoresValue?: { grup1: number, grup2: number }) => {
        setDirectGameQuestions(null);
        setScore(finalScore);
        setFinalGroupScores(finalGroupScoresValue);
        if (userType === 'authenticated' && finalScore > 0 && !finalGroupScoresValue) {
            const newHighScore: HighScore = { name: playerName, score: finalScore, date: new Date().toISOString(), settings };
            setHighScores(prev => [...prev, newHighScore].sort((a, b) => b.score - a.score).slice(0, 10));
        }
    }, [userType, playerName, settings, setHighScores]);

    const handleQuestionAnswered = useCallback((questionId: number) => {
        if (userType === 'authenticated' && questionId > 0 && !solvedQuestionIds.includes(questionId)) {
            setSolvedQuestionIds(prev => [...prev, questionId]);
        }
    }, [userType, solvedQuestionIds, setSolvedQuestionIds]);

    const getQuestionsForCriteria = useCallback((criteria: Partial<GameSettings>, limit?: number): Question[] => {
      const sourceQuestions = userType === 'guest' ? (demoQuestions[selectedSubjectId] || []) : questions;
      
      const gameModeFilter = criteria.gameMode === 'kapisma' ? 'quiz' : criteria.gameMode;
      
      const filtered = sourceQuestions.filter(q =>
        (userType === 'authenticated' ? q.subjectId === selectedSubjectId : true) &&
        (!criteria.grade || q.grade === criteria.grade) &&
        (!criteria.topic || q.topic === criteria.topic) &&
        (!criteria.kazanımId || q.kazanımId === criteria.kazanımId) &&
        (!criteria.difficulty || q.difficulty === criteria.difficulty) &&
        (!gameModeFilter || q.type === gameModeFilter) &&
        (userType === 'guest' || !solvedQuestionIds.includes(q.id))
      );
      
      const sorted = filtered.sort(() => Math.random() - 0.5);
      return limit ? sorted.slice(0, limit) : sorted;
    }, [userType, selectedSubjectId, questions, solvedQuestionIds]);
    
    const getSubjectCount = useCallback((subjectId: string) => {
      if (userType === 'guest') {
        return demoQuestions[subjectId]?.length || 0;
      }
      return questions.filter(q => q.subjectId === subjectId && !solvedQuestionIds.includes(q.id)).length;
    }, [userType, questions, solvedQuestionIds]);
    
    const handleSubjectSelect = useCallback((subjectId: string) => {
      setSelectedSubjectId(subjectId);
      const count = getSubjectCount(subjectId);
      if (userType === 'authenticated' && count === 0) {
        setShowNoQuestionsModal(true);
      }
    }, [getSubjectCount, userType, setSelectedSubjectId, setShowNoQuestionsModal]);

    const handleLogin = useCallback(() => {
        const hasLoggedIn = window.localStorage.getItem('hasLoggedInBefore');
        if (hasLoggedIn) {
            setWelcomeModalTitle("🎉 Tekrar Hoş Geldiniz!");
        } else {
            setWelcomeModalTitle("🎉 Hoş Geldiniz!");
            window.localStorage.setItem('hasLoggedInBefore', 'true');
        }
        setUserType('authenticated');
        setShowWelcomeModal(true);
    }, []);

    const gameQuestions = useMemo(() => {
        if (directGameQuestions) {
            return directGameQuestions;
        }
        const criteria = { ...settings };
        if(settings.gameMode === 'kapisma') {
            criteria.gameMode = 'quiz';
        }
        return getQuestionsForCriteria(criteria, settings.questionCount);
    }, [settings, getQuestionsForCriteria, directGameQuestions]);
    
    const ogrenmeAlanlari = useMemo(() => curriculum[selectedSubjectId]?.[settings.grade || 5] || [], [curriculum, selectedSubjectId, settings.grade]);
    const kazanımlar = useMemo(() => {
        const alan = ogrenmeAlanlari.find(oa => oa.name === settings.topic);
        return alan?.altKonular.flatMap(ak => ak.kazanımlar) || [];
    }, [settings.topic, ogrenmeAlanlari]);

    const subjectName = useMemo(() => {
        const subjectData: Record<string, { name: string, color: string }> = {
            'social-studies': { name: 'Sosyal Bilgiler', color: 'bg-sky-600' },
            'math': { name: 'Matematik', color: 'bg-rose-600' },
            'science': { name: 'Fen Bilimleri', color: 'bg-emerald-600' },
            'turkish': { name: 'Türkçe', color: 'bg-amber-600' },
            'english': { name: 'İngilizce', color: 'bg-indigo-600' },
            'paragraph': { name: 'Paragraf', color: 'bg-slate-600' },
        };
        return subjectData[selectedSubjectId]?.name || 'Bilgi Yarışması'
    }, [selectedSubjectId]);

    const value = useMemo(() => ({
      settings,
      questions, setQuestions,
      highScores, setHighScores,
      solvedQuestionIds, setSolvedQuestionIds,
      playerName,
      documentLibrary, setDocumentLibrary,
      generatedExams, setGeneratedExams,
      selectedSubjectId,
      score,
      finalGroupScores,
      curriculum,
      isCurriculumLoading,
      userType,
      showWelcomeModal, setShowWelcomeModal,
      showNoQuestionsModal, setShowNoQuestionsModal,
      welcomeModalTitle,
      aiCredits, setAiCredits,
      updateSetting,
      handleGameEnd,
      handleQuestionAnswered,
      getQuestionsForCriteria,
      getSubjectCount,
      handleLogin,
      handleSubjectSelect,
      gameQuestions,
      ogrenmeAlanlari,
      kazanımlar,
      subjectName,
      dailyCreditLimit: DAILY_CREDIT_LIMIT,
      setDirectGameQuestions,
    }), [
        settings, questions, highScores, solvedQuestionIds, playerName, documentLibrary,
        generatedExams, selectedSubjectId, score, finalGroupScores, curriculum, isCurriculumLoading,
        userType, showWelcomeModal, showNoQuestionsModal, welcomeModalTitle, aiCredits,
        setQuestions, setHighScores, setSolvedQuestionIds, setDocumentLibrary, setGeneratedExams,
        setShowWelcomeModal, setShowNoQuestionsModal, setAiCredits, setDirectGameQuestions,
        updateSetting, handleGameEnd, handleQuestionAnswered, getQuestionsForCriteria,
        getSubjectCount, handleLogin, handleSubjectSelect, gameQuestions, ogrenmeAlanlari, kazanımlar, subjectName
    ]);

    return <AppContext.Provider value={value as AppContextType}>{children}</AppContext.Provider>;
};

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};