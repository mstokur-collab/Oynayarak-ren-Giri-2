import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BackButton } from './UI';
import { QuestionGenerator } from './teacher_panel/QuestionGenerator';
import { QuestionLibrary } from './teacher_panel/QuestionLibrary';
import { DocumentManager } from './teacher_panel/DocumentManager';
import { ExamGenerator } from './teacher_panel/ExamGenerator';
import { Tools } from './teacher_panel/Tools';
import { useAppContext } from '../contexts/AppContext';

type TeacherPanelTab = 'generator' | 'library' | 'documents' | 'exams' | 'tools';

const TeacherPanel: React.FC = () => {
  const { 
    userType,
    questions,
    documentLibrary,
    aiCredits,
    dailyCreditLimit 
  } = useAppContext();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<TeacherPanelTab>('generator');

  const tabConfig = {
    generator: { label: 'Soru Üret', icon: '✨' },
    library: { label: `Soru Bankası (${questions.length})`, icon: '📚' },
    documents: { label: `Kütüphanem (${documentLibrary.length})`, icon: '📂' },
    exams: { label: 'Yazılı Hazırla', icon: '📝' },
    tools: { label: 'Araçlar', icon: '🛠️' },
  };
  
  const tabColors = [
    'bg-blue-600',
    'bg-emerald-600',
    'bg-rose-600',
    'bg-amber-500',
    'bg-indigo-600',
  ];


  const renderContent = () => {
    switch (activeTab) {
      case 'generator':
        return <QuestionGenerator />;
      case 'library':
        return <QuestionLibrary />;
      case 'documents':
        return <DocumentManager />;
      case 'exams':
        return <ExamGenerator />;
      case 'tools':
        return <Tools />;
      default:
        return null;
    }
  };

  return (
     <div className="w-full h-full flex justify-center items-center p-4 sm:p-6">
        <div className="w-full max-w-7xl h-full flex flex-col bg-gradient-to-br from-slate-900 to-slate-800 text-white border border-violet-500/30 rounded-2xl shadow-2xl overflow-hidden relative">
            <BackButton onClick={() => navigate(-1)} />
             {userType === 'authenticated' && (
                <div className="absolute top-4 right-6 bg-yellow-500/20 border border-yellow-500/50 text-yellow-300 font-bold px-3 py-1 rounded-lg text-sm z-10">
                    Kalan Kredi: {aiCredits} / {dailyCreditLimit}
                </div>
            )}
            <header className="flex-shrink-0 p-4 text-center">
                <h1 className="text-3xl font-extrabold text-white">Yapay Zeka Soru Atölyesi</h1>
            </header>
            <nav className="flex-shrink-0 flex justify-center items-center gap-2 sm:gap-4 p-3 border-b border-t border-violet-500/30 bg-black/20 flex-wrap">
                {Object.entries(tabConfig).map(([key, { label, icon }], index) => (
                <button
                    key={key}
                    onClick={() => setActiveTab(key as TeacherPanelTab)}
                    className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-white font-semibold transition-all duration-200 shadow-md
                        ${tabColors[index % tabColors.length]}
                        ${activeTab === key ? 'opacity-50 scale-95' : 'opacity-100 hover:opacity-90 hover:scale-105'}`
                    }
                >
                    <span>{icon}</span>
                    <span className="hidden sm:inline">{label}</span>
                </button>
                ))}
            </nav>
            <main className="flex-grow overflow-y-auto">
                {renderContent()}
            </main>
        </div>
    </div>
  );
};

export default TeacherPanel;