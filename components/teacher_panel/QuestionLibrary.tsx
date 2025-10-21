import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Question, QuizQuestion, FillInQuestion, MatchingQuestion } from '../../types';
import { Modal } from '../UI';
import { useAppContext } from '../../contexts/AppContext';

const QuestionCard: React.FC<{ question: Question; onDelete: (id: number) => void; onPlay: (question: Question) => void; }> = ({ question, onDelete, onPlay }) => {
    const renderQuestionDetails = () => {
        switch (question.type) {
            case 'quiz':
                const q = question as QuizQuestion;
                return (
                    <div>
                        <p className="font-semibold">{q.question}</p>
                        <ol className="list-alpha pl-6 mt-2 space-y-1 text-sm">
                            {q.options.map(opt => (
                                <li key={opt} className={opt === q.answer ? 'text-green-300 font-bold' : ''}>{opt}</li>
                            ))}
                        </ol>
                        {q.explanation && <p className="text-xs text-slate-400 mt-2">Açıklama: {q.explanation}</p>}
                    </div>
                );
            case 'fill-in':
                const f = question as FillInQuestion;
                return (
                    <p>{f.sentence.replace('___', `[${f.answer}]`)}</p>
                );
            case 'matching':
                 const m = question as MatchingQuestion;
                 return (
                     <div>
                         <p>{m.question || 'Eşleştirme sorusu'}</p>
                         <ul className="text-sm mt-2 space-y-1">
                             {m.pairs.map(p => <li key={p.term}><strong>{p.term}</strong> → {p.definition}</li>)}
                         </ul>
                     </div>
                 );
            default:
                return <p>Bilinmeyen soru tipi</p>;
        }
    };

    return (
        <div className="bg-slate-800/70 p-4 rounded-lg border border-slate-700 space-y-3">
            <div className="flex justify-between items-start text-xs text-slate-400">
                <span className="font-bold bg-slate-700 px-2 py-1 rounded-md">{question.grade}. Sınıf - {question.topic}</span>
                <span className="capitalize bg-slate-700 px-2 py-1 rounded-md">{question.difficulty}</span>
            </div>
            {renderQuestionDetails()}
            {question.imageUrl && (
                <img src={`data:image/png;base64,${question.imageUrl}`} alt="Soru görseli" className="max-h-32 w-auto rounded-md mt-2" />
            )}
            <div className="flex justify-end items-center gap-2 pt-2 border-t border-slate-700/50">
                <button onClick={() => onPlay(question)} className="px-3 py-1 text-xs bg-emerald-600 hover:bg-emerald-500 rounded-md">Oynat</button>
                <button onClick={() => onDelete(question.id)} className="px-3 py-1 text-xs bg-rose-600 hover:bg-rose-500 rounded-md">Sil</button>
            </div>
        </div>
    );
};

export const QuestionLibrary: React.FC = () => {
    const { questions, setQuestions, userType, setDirectGameQuestions, updateSetting, handleSubjectSelect } = useAppContext();
    const navigate = useNavigate();
    const [filterGrade, setFilterGrade] = useState<string>('all');
    const [filterType, setFilterType] = useState<string>('all');
    const [questionToDelete, setQuestionToDelete] = useState<number | null>(null);

    const filteredQuestions = useMemo(() => {
        return questions.filter(q =>
            (filterGrade === 'all' || q.grade === parseInt(filterGrade)) &&
            (filterType === 'all' || q.type === filterType)
        );
    }, [questions, filterGrade, filterType]);

    const handleDelete = (id: number) => {
        setQuestions(prev => prev.filter(q => q.id !== id));
        setQuestionToDelete(null);
    };
    
    const handleSelectQuestion = (q: Question) => {
        // Uygulamanın genel durumunu (state) oynanacak soruyla tutarlı hale getir.
        // Bu, GameScreen gibi bileşenlerdeki olası tutarsızlıkları ve çökmeleri önler.
        handleSubjectSelect(q.subjectId);
        updateSetting('grade', q.grade);
        updateSetting('topic', q.topic);
        updateSetting('kazanımId', q.kazanımId);
        updateSetting('difficulty', q.difficulty);
        // FIX: `Question` tipi 'kapisma' içermediği için `q.type === 'kapisma'` karşılaştırması
        // her zaman `false` olup TypeScript hatasına neden oluyordu.
        // Doğrudan oynatma için oyun modunu sorunun tipiyle eşleştirmek yeterlidir.
        updateSetting('gameMode', q.type);
        updateSetting('questionCount', 1);

        // Belirli bir soruyu oynatmak için özel mekanizmayı kullan.
        setDirectGameQuestions([q]);
        navigate('/oyun');
    }

    if (userType === 'guest') {
        return (
            <div className="p-6 text-center">
                <h3 className="text-xl font-bold text-yellow-300">Bu Özellik İçin Giriş Yapın</h3>
                <p className="mt-2 text-slate-400">Giriş yaparak kendi soru bankanızı oluşturabilir ve yönetebilirsiniz.</p>
            </div>
        );
    }
    
    return (
        <div className="p-4 sm:p-6 space-y-4">
            <h3 className="text-xl font-bold text-violet-300">Soru Bankası</h3>
            <div className="flex gap-4 p-4 bg-slate-800/50 rounded-xl border border-violet-500/30">
                <select value={filterGrade} onChange={e => setFilterGrade(e.target.value)} className="p-2 bg-slate-700 rounded-md border border-slate-600 w-full">
                    <option value="all">Tüm Sınıflar</option>
                    {[5, 6, 7, 8].map(g => <option key={g} value={g}>{g}. Sınıf</option>)}
                </select>
                <select value={filterType} onChange={e => setFilterType(e.target.value)} className="p-2 bg-slate-700 rounded-md border border-slate-600 w-full">
                    <option value="all">Tüm Tipler</option>
                    <option value="quiz">Çoktan Seçmeli</option>
                    <option value="fill-in">Boşluk Doldurma</option>
                    <option value="matching">Eşleştirme</option>
                </select>
            </div>
            
            {filteredQuestions.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 h-[calc(100vh-22rem)] overflow-y-auto pr-2">
                    {filteredQuestions.map(q => (
                        <QuestionCard key={q.id} question={q} onDelete={() => setQuestionToDelete(q.id)} onPlay={handleSelectQuestion} />
                    ))}
                </div>
            ) : (
                <div className="text-center text-slate-400 py-8">
                    <p>Kütüphanenizde soru bulunmuyor veya filtrenize uygun soru yok.</p>
                </div>
            )}

            <Modal 
                isOpen={!!questionToDelete}
                title="Soruyu Sil"
                message="Bu soruyu kütüphaneden kalıcı olarak silmek istediğinizden emin misiniz?"
                onConfirm={() => handleDelete(questionToDelete!)}
                onCancel={() => setQuestionToDelete(null)}
            />
        </div>
    );
};