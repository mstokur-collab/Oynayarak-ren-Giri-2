import React, { useState, useMemo, useEffect } from 'react';
import type { Exam, DocumentLibraryItem, Kazanım, OgrenmeAlani } from '../../types';
import { getCurriculumData } from '../../services/curriculumService';
import { generateExamFromKazanims, improveGeneratedExam } from '../../services/geminiService';
import { Button } from '../UI';
import ReactMarkdown from 'react-markdown';
import { useAppContext } from '../../contexts/AppContext';

const EXAM_GENERATION_COST = 5;

const subjectData: Record<string, { name: string }> = {
    'social-studies': { name: 'Sosyal Bilgiler' },
    'math': { name: 'Matematik' },
    'science': { name: 'Fen Bilimleri' },
    'turkish': { name: 'Türkçe' },
    'english': { name: 'İngilizce' },
    'paragraph': { name: 'Paragraf' },
};

const KazanımSelector: React.FC<{
    kazanımlar: Kazanım[];
    selections: Record<string, number>;
    onSelectionChange: (id: string, count: number) => void;
}> = ({ kazanımlar, selections, onSelectionChange }) => (
    <div className="space-y-2 max-h-60 overflow-y-auto pr-2 border-t border-b border-slate-700 py-2">
        {kazanımlar.map(k => (
            <div key={k.id} className="flex items-center justify-between p-2 bg-slate-700/50 rounded-md">
                <label htmlFor={k.id} className="text-sm flex-grow pr-2">{k.id} - {k.text}</label>
                <input
                    id={k.id}
                    type="number"
                    min="0"
                    max="10"
                    value={selections[k.id] || 0}
                    onChange={(e) => onSelectionChange(k.id, parseInt(e.target.value) || 0)}
                    className="w-16 p-1 bg-slate-600 rounded-md text-center"
                />
            </div>
        ))}
    </div>
);

export const ExamGenerator: React.FC = () => {
  const {
      userType,
      selectedSubjectId,
      generatedExams,
      setGeneratedExams,
      documentLibrary,
      aiCredits,
      setAiCredits
  } = useAppContext();
  
    const [grade, setGrade] = useState<number>(8);
    const [kazanımSelections, setKazanımSelections] = useState<Record<string, number>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [activeExam, setActiveExam] = useState<Exam | null>(null);
    const [feedback, setFeedback] = useState<string>('');
    const [isFeedbackLoading, setIsFeedbackLoading] = useState(false);
    const [referenceDocId, setReferenceDocId] = useState<string>('');
    const [sourceDocIds, setSourceDocIds] = useState<string[]>([]);
    
    const [curriculum, setCurriculum] = useState<Record<string, Record<number, OgrenmeAlani[]>>>({});
    const [isCurriculumLoading, setIsCurriculumLoading] = useState(true);

    useEffect(() => {
        const loadCurriculum = async () => {
          setIsCurriculumLoading(true);
          const data = await getCurriculumData();
          setCurriculum(data);
          setIsCurriculumLoading(false);
        };
        loadCurriculum();
    }, []);

    const ogrenmeAlanlari = useMemo(() => curriculum[selectedSubjectId]?.[grade] || [], [curriculum, selectedSubjectId, grade]);
    const allKazanims = useMemo(() => ogrenmeAlanlari.flatMap(oa => oa.altKonular.flatMap(ak => ak.kazanımlar)), [ogrenmeAlanlari]);

    const handleGenerate = async () => {
        const selectedKazanims = Object.entries(kazanımSelections)
            .filter(([, count]) => Number(count) > 0)
            .map(([id, count]) => {
                const text = allKazanims.find(k => k.id === id)?.text || '';
                return { id, text, count: Number(count) };
            });

        if (selectedKazanims.length === 0) {
            setError('Lütfen en az bir kazanımdan soru seçin.');
            return;
        }

        if (userType === 'authenticated' && aiCredits < EXAM_GENERATION_COST) {
            setError(`Yazılı oluşturmak için ${EXAM_GENERATION_COST} kredi gereklidir. Kalan krediniz: ${aiCredits}.`);
            return;
        }

        setIsLoading(true);
        setError('');
        
        try {
            const referenceDoc = documentLibrary.find(d => d.id === referenceDocId);
            const sourceDocs = documentLibrary.filter(d => sourceDocIds.includes(d.id));
            
            const { examContent, answerKeyContent } = await generateExamFromKazanims(
                grade,
                subjectData[selectedSubjectId]?.name,
                selectedKazanims,
                referenceDoc?.content,
                sourceDocs.map(d => ({ name: d.name, content: d.content }))
            );

            const newExam: Exam = {
                id: Date.now(),
                name: `${grade}. Sınıf ${subjectData[selectedSubjectId]?.name} Yazılısı - ${new Date().toLocaleDateString()}`,
                content: examContent,
                answerKey: answerKeyContent,
                createdAt: Date.now(),
            };

            setGeneratedExams(prev => [newExam, ...prev]);
            setActiveExam(newExam);
            if (userType === 'authenticated') {
                setAiCredits(prev => Math.max(0, prev - EXAM_GENERATION_COST));
            }
        } catch (err: any) {
            setError(err.message || 'Yazılı üretilirken bir hata oluştu.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleGetFeedback = async (examContent: string) => {
        setIsFeedbackLoading(true);
        try {
            const result = await improveGeneratedExam(examContent);
            setFeedback(result);
            if(activeExam) {
                const updatedExam = {...activeExam, feedback: result};
                setActiveExam(updatedExam);
                setGeneratedExams(prev => prev.map(e => e.id === activeExam.id ? updatedExam : e));
            }
        } catch (err) {
            console.error("Feedback error", err);
        } finally {
            setIsFeedbackLoading(false);
        }
    }
    
    if (userType === 'guest') {
        return (
            <div className="p-6 text-center">
                <h3 className="text-xl font-bold text-yellow-300">Bu Özellik İçin Giriş Yapın</h3>
                <p className="mt-2 text-slate-400">Giriş yaparak müfredata dayalı yazılı sınavlar oluşturabilir ve kaydedebilirsiniz.</p>
            </div>
        );
    }
    
    if (activeExam) {
        return (
            <div className="p-4 sm:p-6 space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="text-xl font-bold text-violet-300">{activeExam.name}</h3>
                    <Button onClick={() => setActiveExam(null)} variant='secondary' className="text-sm px-4 py-2 !rounded-lg">Geri Dön</Button>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-[calc(100vh-16rem)]">
                    <div className="prose prose-invert bg-slate-800/50 p-4 rounded-lg overflow-y-auto border border-slate-700">
                        <ReactMarkdown>{activeExam.content}</ReactMarkdown>
                        <hr />
                        <h4>Cevap Anahtarı</h4>
                        <ReactMarkdown>{activeExam.answerKey}</ReactMarkdown>
                    </div>
                    <div className="bg-slate-800/50 p-4 rounded-lg overflow-y-auto border border-slate-700">
                        <h4 className="font-bold mb-2 text-violet-300">AI Değerlendirmesi</h4>
                        {activeExam.feedback || feedback ? (
                             <div className="prose prose-invert prose-sm">
                                <ReactMarkdown>{activeExam.feedback || feedback}</ReactMarkdown>
                             </div>
                        ) : (
                             <Button onClick={() => handleGetFeedback(activeExam.content)} disabled={isFeedbackLoading} variant="violet" className="w-full !py-2 !text-base">
                                {isFeedbackLoading ? 'Değerlendiriliyor...' : '✨ AI ile Değerlendirme Al'}
                             </Button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    const getButtonText = () => {
        if (isLoading) {
            return 'Yazılı Üretiliyor...';
        }
        if (aiCredits < EXAM_GENERATION_COST) {
            return `Yetersiz Kredi (${aiCredits}/${EXAM_GENERATION_COST})`;
        }
        return `📝 AI ile Yazılı Üret (${EXAM_GENERATION_COST} Kredi)`;
    };

    return (
        <div className="p-4 sm:p-6 space-y-4">
            <h3 className="text-xl font-bold text-violet-300">AI ile Yazılı Sınav Oluştur</h3>
            <div className="space-y-4 bg-slate-800/50 p-4 rounded-xl border border-violet-500/30">
                <select value={grade} onChange={e => { setGrade(parseInt(e.target.value)); setKazanımSelections({}); }} className="p-2 bg-slate-700 rounded-md border border-slate-600 w-full">
                    {[5, 6, 7, 8].map(g => <option key={g} value={g}>{g}. Sınıf</option>)}
                </select>
                
                {isCurriculumLoading ? <p>Yükleniyor...</p> : (
                    <KazanımSelector 
                        kazanımlar={allKazanims} 
                        selections={kazanımSelections} 
                        onSelectionChange={(id, count) => setKazanımSelections(prev => ({...prev, [id]: count}))}
                    />
                )}
                
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300 block">Stil Referansı (İsteğe Bağlı)</label>
                    <select value={referenceDocId} onChange={e => setReferenceDocId(e.target.value)} className="p-2 bg-slate-700 rounded-md border border-slate-600 w-full">
                         <option value="">Referans Döküman Seç</option>
                         {documentLibrary.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                </div>
                
                 <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300 block">Bilgi Kaynağı (İsteğe Bağlı)</label>
                    <select multiple value={sourceDocIds} onChange={e => setSourceDocIds(Array.from(e.target.selectedOptions, (option: HTMLOptionElement) => option.value))} className="p-2 bg-slate-700 rounded-md border border-slate-600 w-full h-24">
                         {documentLibrary.filter(d => d.content.mimeType === 'application/pdf').map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                </div>

                <Button 
                    onClick={handleGenerate} 
                    disabled={isLoading || aiCredits < EXAM_GENERATION_COST} 
                    variant="violet" 
                    className="w-full !py-3 !text-lg">
                    {getButtonText()}
                </Button>
                {error && <p className="text-red-400 text-sm mt-2 text-center">{error}</p>}
            </div>

            <div className="space-y-2">
                <h4 className="font-semibold text-violet-300">Önceki Yazılılar</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                    {generatedExams.map(exam => (
                        <button key={exam.id} onClick={() => setActiveExam(exam)} className="w-full text-left p-3 bg-slate-800/50 rounded-md hover:bg-slate-700/80 transition-colors">
                            {exam.name}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};