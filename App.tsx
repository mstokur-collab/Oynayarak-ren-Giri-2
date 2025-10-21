import React, { lazy, Suspense } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import type { QuizQuestion, GameSettings, Difficulty } from './types';
import { Button, DeveloperSignature, LoadingSpinner, InfoModal } from './components/UI';
import GameScreen from './components/QuizComponents';
import { useAppContext } from './contexts/AppContext';

// Lazy-loaded components for code splitting
const TeacherPanel = lazy(() => import('./components/TeacherPanel'));
const KapismaSetupScreen = lazy(() => import('./components/KapismaSetupScreen'));
const KapismaGame = lazy(() => import('./components/KapismaGame'));


const subjectData: Record<string, { name: string, color: string }> = {
    'social-studies': { name: 'Sosyal Bilgiler', color: 'bg-sky-600' },
    'math': { name: 'Matematik', color: 'bg-rose-600' },
    'science': { name: 'Fen Bilimleri', color: 'bg-emerald-600' },
    'turkish': { name: 'Türkçe', color: 'bg-amber-600' },
    'english': { name: 'İngilizce', color: 'bg-indigo-600' },
    'paragraph': { name: 'Paragraf', color: 'bg-slate-600' },
};

// SVG Icons for the new UI
const GameModeTitleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path d="M15.59 14.37a6 6 0 0 1-5.84 7.38v-4.82m5.84-2.56a16.5 16.5 0 0 0-1.62-7.024l-2.16 1.96m-4.24-7.38a16.5 16.5 0 0 0-7.024 1.62l1.96 2.16" />
      <path d="M2.25 12a10.5 10.5 0 0 1 10.5-10.5c.376 0 .744.025 1.11.072l-1.528 1.351a4.5 4.5 0 0 0-6.364 6.364l1.351-1.528A10.5 10.5 0 0 1 2.25 12Z" />
      <path d="m15.59 14.37 5.337 5.337a1.5 1.5 0 0 1-2.121 2.122l-5.338-5.337m5.84-2.56a4.5 4.5 0 0 0-6.363-6.363l-1.351 1.528a4.5 4.5 0 0 0 6.363 6.363l1.351-1.528Z" />
    </svg>
);
const QuizIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
);
const FillInIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
    </svg>
);
const MatchingIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
    </svg>
);
const KapismaIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.375 12.375 0 0110.5 21.75c-2.596 0-4.92-1.004-6.683-2.662z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.023 15.75a12.006 12.006 0 001.28 4.48" />
    </svg>
);

const RouteWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="w-full h-full flex flex-col justify-center items-center text-center p-4 sm:p-6">
      {children}
    </div>
);

const App: React.FC = () => {
    const navigate = useNavigate();
    const {
        settings,
        highScores,
        score,
        isCurriculumLoading,
        userType,
        showWelcomeModal,
        showNoQuestionsModal,
        welcomeModalTitle,
        gameQuestions,
        ogrenmeAlanlari,
        kazanımlar,
        subjectName,
        selectedSubjectId,
        updateSetting,
        getQuestionsForCriteria,
        getSubjectCount,
        handleLogin,
        handleSubjectSelect,
        setShowWelcomeModal,
        setShowNoQuestionsModal
    } = useAppContext();

    const getCount = (criteria: Partial<GameSettings>) => getQuestionsForCriteria(criteria).length;
    
    if (isCurriculumLoading) {
        return <div className="w-screen h-screen flex justify-center items-center"><LoadingSpinner /></div>;
    }

    return (
        <div className="w-screen h-screen font-sans overflow-hidden">
            <main className="w-full h-full">
                <Suspense fallback={<div className="w-screen h-screen flex justify-center items-center bg-slate-900/50 backdrop-blur-sm"><LoadingSpinner /></div>}>
                    <Routes>
                        <Route path="/" element={
                            <RouteWrapper>
                                <h1 className="text-6xl sm:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-indigo-400 mb-2 py-4">Oynayarak Öğren</h1>
                                <p className="text-lg text-slate-400 mb-10">Öğrenmenin en eğlenceli yolu!</p>
                                <div className="flex flex-col gap-4 w-full max-w-sm">
                                    <Button onClick={() => { handleSubjectSelect(selectedSubjectId); navigate('/basla'); }}>🎮 Misafir Olarak Hızlı Başla</Button>
                                    <Button onClick={() => { handleLogin(); navigate('/ders-sec'); }} variant="primary" className="text-base py-3">Giriş Yap</Button>
                                    <Button onClick={() => {}} variant="secondary" className="text-base py-3">Kayıt Ol</Button>
                                </div>
                            </RouteWrapper>
                        } />
                        
                        <Route path="/ders-sec" element={
                             <RouteWrapper>
                                <div className="grade-selection-container">
                                    <button onClick={() => navigate(-1)} className="back-button-yellow">← Geri</button>
                                    <h2 className="grade-selection-title">Dersini Seç</h2>
                                    <div className="grade-buttons-wrapper subject-selection-grid">
                                        {Object.entries(subjectData).map(([id, { name }], index) => {
                                        const count = getSubjectCount(id);
                                        const colorClass = `color-${(index % 6) + 1}`;
                                        return (
                                            <button 
                                                key={id} 
                                                onClick={() => { handleSubjectSelect(id); navigate('/basla'); }}
                                                className={`subject-button ${colorClass}`}
                                            >
                                                <span className="subject-button__name">{name}</span>
                                                <span className="subject-button__count">
                                                {userType === 'guest' ? 'Demo' : `${count} Soru`}
                                                </span>
                                            </button>
                                        );
                                        })}
                                    </div>
                                </div>
                            </RouteWrapper>
                        } />
                        
                        <Route path="/basla" element={
                            <RouteWrapper>
                                <div className="selection-container items-center" style={{ background: 'transparent', border: 'none', boxShadow: 'none', gap: '1rem' }}>
                                    <button onClick={() => navigate('/ders-sec')} className="back-button-yellow">← Ders Seç</button>
                                    <h1 className="selection-title text-4xl sm:text-5xl flex items-center gap-4 mb-10">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 7V9H4V18H3V20H21V18H20V9H22V7L12 2ZM18 18H15V11H9V18H6V9H8.2L12 6.3L15.8 9H18V18Z"></path></svg>
                                        <span>{subjectName} Bilgi Yarışması</span>
                                    </h1>
                                    <div className="flex flex-col gap-4 w-full max-w-md">
                                        <Button 
                                            onClick={() => navigate('/sinif-sec')} 
                                            variant="primary"
                                            className="w-full text-center flex items-center justify-center gap-3 py-4 text-2xl"
                                            disabled={getSubjectCount(selectedSubjectId) === 0 && userType === 'authenticated'}
                                        >
                                            <span>👾</span>
                                            <span>Oyuna Başla</span>
                                        </Button>
                                        <Button 
                                            onClick={() => navigate('/ogretmen-paneli')} 
                                            variant="secondary"
                                            className="w-full text-center flex items-center justify-center gap-3 py-4 text-2xl"
                                        >
                                            <span>✨</span>
                                            <span>Yapay Zeka Soru Atölyesi</span>
                                        </Button>
                                        <Button 
                                            onClick={() => navigate('/yuksek-skorlar')} 
                                            variant="success"
                                            disabled={userType === 'guest'}
                                            title={userType === 'guest' ? 'Bu özellik için giriş yapmalısınız' : ''}
                                            className="w-full text-center flex items-center justify-center gap-3 py-4 text-2xl"
                                        >
                                            <span>🏆</span>
                                            <span>Yüksek Skorlar</span>
                                        </Button>
                                    </div>
                                </div>
                            </RouteWrapper>
                        } />

                        <Route path="/sinif-sec" element={
                            <RouteWrapper>
                                <div className="grade-selection-container">
                                    <button onClick={() => navigate(-1)} className="back-button-yellow">← Geri</button>
                                    <h2 className="grade-selection-title">Sınıfını Seç</h2>
                                    <div className="grade-buttons-wrapper">
                                        {[5, 6, 7, 8].map((grade, index) => {
                                            const count = getCount({ grade });
                                            const colorClass = `color-${index + 1}`;
                                            return (
                                                <button 
                                                    key={grade} 
                                                    onClick={() => { updateSetting('grade', grade); navigate('/ogrenme-alani-sec'); }}
                                                    disabled={count === 0 && userType === 'authenticated'}
                                                    className={`grade-button ${colorClass}`}
                                                >
                                                    <span className='grade-button__text'>{grade}.</span>
                                                    <span className='grade-button__subtext'>Sınıf</span>
                                                    <span className="grade-button__count">{count > 0 || userType === 'guest' ? `${count} Soru` : 'Yok'}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </RouteWrapper>
                        } />
                        
                        <Route path="/ogrenme-alani-sec" element={
                             <RouteWrapper>
                                <div className="selection-container">
                                    <button onClick={() => navigate(-1)} className="back-button-yellow">← Geri</button>
                                    <h2 className="selection-title">Öğrenme Alanı Seçin</h2>
                                    <div className="flex flex-col gap-3 w-full max-w-2xl max-h-[60vh] overflow-y-auto pr-2">
                                        {ogrenmeAlanlari.map(oa => {
                                            const count = getCount({ grade: settings.grade, topic: oa.name });
                                            return (
                                                <button key={oa.name} onClick={() => { updateSetting('topic', oa.name); navigate('/kazanim-sec'); }} disabled={count === 0 && userType === 'authenticated'} className="list-button">
                                                    <span className="list-button__text">{oa.name}</span>
                                                    <span className="list-button__count">{count > 0 || userType === 'guest' ? `${count} Soru` : 'Yok'}</span>
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                            </RouteWrapper>
                        } />

                        <Route path="/kazanim-sec" element={
                            <RouteWrapper>
                                <div className="selection-container">
                                    <button onClick={() => navigate(-1)} className="back-button-yellow">← Geri</button>
                                    <h2 className="selection-title">Kazanım Seçin</h2>
                                    <div className="flex flex-col gap-3 w-full max-w-3xl max-h-[70vh] overflow-y-auto pr-2">
                                        {kazanımlar.map(k => {
                                            const count = getCount({ ...settings, kazanımId: k.id });
                                            return (
                                                <button key={k.id} onClick={() => { updateSetting('kazanımId', k.id); navigate('/oyun-turu-sec'); }} disabled={count === 0 && userType === 'authenticated'} className="kazanim-button">
                                                    <span className="kazanim-button__text">
                                                        <span className="kazanim-button__id">{k.id}</span>
                                                        <span> - {k.text}</span>
                                                    </span>
                                                    <span className="kazanim-button__count">{count > 0 || userType === 'guest' ? `${count} Soru` : 'Yok'}</span>
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                            </RouteWrapper>
                        } />
                        
                        <Route path="/oyun-turu-sec" element={
                           <RouteWrapper>
                                <div className="selection-container">
                                    <button onClick={() => navigate(-1)} className="back-button-yellow">← Geri</button>
                                    <h2 className="selection-title">
                                        <GameModeTitleIcon />
                                        <span>Oyun Türünü Seçin</span>
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {(['quiz', 'fill-in', 'matching', 'kapisma'] as const).map(mode => {
                                            const count = getCount({ ...settings, gameMode: mode === 'kapisma' ? 'quiz' : mode });
                                            const details = {
                                                quiz: { name: 'Çoktan Seçmeli', desc: 'Verilen soruya karşı sunulan seçeneklerden doğru olanı bulun.', icon: <QuizIcon />, nextScreen: '/zorluk-sec' },
                                                'fill-in': { name: 'Boşluk Doldurma', desc: 'Cümledeki boşluğa en uygun ifadeyi seçenekler arasından seçin.', icon: <FillInIcon />, nextScreen: '/zorluk-sec' },
                                                matching: { name: 'Eşleştirme', desc: 'İlgili kavramları ve açıklamalarını doğru şekilde bir araya getirin.', icon: <MatchingIcon />, nextScreen: '/zorluk-sec' },
                                                kapisma: { name: 'Kapışma', desc: 'İki takım aynı anda yarışır, hızlı ve doğru olan kazanır.', icon: <KapismaIcon />, nextScreen: '/kapisma-kurulum' }
                                            }[mode];
                                            
                                            return (
                                                <button 
                                                    key={mode} 
                                                    onClick={() => { updateSetting('gameMode', mode); navigate(details.nextScreen); }} 
                                                    disabled={count === 0 && userType === 'authenticated'}
                                                    className="selection-card"
                                                >
                                                    <span className="selection-card__count">{count > 0 || userType === 'guest' ? count : 'Yok'}</span>
                                                    <div className="selection-card__icon">{details.icon}</div>
                                                    <h3 className="selection-card__title">{details.name}</h3>
                                                    <p className="selection-card__description">{details.desc}</p>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </RouteWrapper>
                        } />

                        <Route path="/zorluk-sec" element={
                            <RouteWrapper>
                                <div className="selection-container">
                                    <button onClick={() => navigate(-1)} className="back-button-yellow">← Geri</button>
                                    <h2 className="selection-title">Zorluk Seviyesini Seçin</h2>
                                    <div className="flex flex-col gap-4 w-full max-w-lg">
                                        {(['kolay', 'orta', 'zor'] as Difficulty[]).map(level => {
                                        const count = getCount({ ...settings, difficulty: level });
                                        return (
                                            <button key={level} onClick={() => { updateSetting('difficulty', level); navigate('/oyun'); }} disabled={count === 0 && userType === 'authenticated'} className="list-button">
                                                <span className="list-button__text capitalize">{level}</span>
                                                <span className="list-button__count">{count > 0 || userType === 'guest' ? `${count} Soru` : 'Yok'}</span>
                                            </button>
                                        );
                                        })}
                                    </div>
                                </div>
                            </RouteWrapper>
                        } />
                        
                        <Route path="/oyun" element={
                            <div id="game-screen" className="w-full h-full flex flex-col">
                                {gameQuestions.length > 0 ? (
                                    <GameScreen />
                                ) : (
                                    <RouteWrapper>
                                        <h2 className="text-2xl font-bold mb-4">Uygun Soru Bulunamadı!</h2>
                                        <p className="text-slate-300 mb-6">Seçtiğiniz kriterlere uygun soru kalmadı.</p>
                                        <Button onClick={() => navigate('/')}>Ana Menüye Dön</Button>
                                    </RouteWrapper>
                                )}
                            </div>
                        } />

                        <Route path="/sonuc" element={
                            <RouteWrapper>
                                <h2 className="text-6xl font-bold mb-4">Oyun Bitti!</h2>
                                <p className="text-3xl text-yellow-400 mb-8">Skorun: {score}</p>
                                <div className="flex gap-4">
                                    <Button onClick={() => navigate('/')}>Ana Menü</Button>
                                </div>
                            </RouteWrapper>
                        } />

                        <Route path="/yuksek-skorlar" element={
                           <RouteWrapper>
                                <div className="selection-container w-full max-w-2xl">
                                    <button onClick={() => navigate(-1)} className="back-button-yellow">← Geri</button>
                                    <h2 className="selection-title">
                                        <span className="text-yellow-400 text-4xl">🏆</span>
                                        <span>Yüksek Skorlar</span>
                                    </h2>
                                    <div className="mt-6 w-full max-h-[60vh] overflow-y-auto pr-2">
                                        {highScores.length > 0 ? (
                                            <ul className="space-y-3 text-left">
                                                {highScores.map((score, index) => (
                                                    <li key={index} className="flex items-center justify-between p-4 bg-slate-800/60 rounded-xl border border-slate-700 text-lg animate-slideIn" style={{ animationDelay: `${index * 50}ms`}}>
                                                        <div className="flex items-center gap-4">
                                                            <span className={`font-bold text-2xl w-8 text-center ${index < 3 ? 'text-yellow-400' : 'text-slate-400'}`}>{index + 1}.</span>
                                                            <span className="font-semibold text-slate-200">{score.name}</span>
                                                        </div>
                                                        <div className="flex flex-col items-end">
                                                            <span className="font-bold text-2xl text-yellow-300">{score.score} Puan</span>
                                                            <span className="text-xs text-slate-400">{new Date(score.date).toLocaleDateString('tr-TR')}</span>
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="text-slate-400 text-center py-10">Henüz kaydedilmiş yüksek skor yok.</p>
                                        )}
                                    </div>
                                </div>
                            </RouteWrapper>
                        } />

                        <Route path="/kapisma-kurulum" element={<KapismaSetupScreen />} />
                        
                        <Route path="/kapisma-oyun" element={
                            <div id="kapisma-game-screen" className="w-full h-full">
                                {gameQuestions.length > 0 ? (
                                    <KapismaGame />
                                ) : (
                                    <RouteWrapper>
                                        <h2 className="text-2xl font-bold mb-4">Kapışma için Uygun Soru Bulunamadı!</h2>
                                        <p className="text-slate-300 mb-6">Bu mod için Çoktan Seçmeli soru bulunamadı.</p>
                                        <Button onClick={() => navigate('/')}>Ana Menüye Dön</Button>
                                    </RouteWrapper>
                                )}
                            </div>
                        } />

                        <Route path="/ogretmen-paneli" element={<TeacherPanel />} />
                    </Routes>
                </Suspense>
            </main>
            <InfoModal 
                isOpen={showWelcomeModal}
                title={welcomeModalTitle}
                onClose={() => setShowWelcomeModal(false)}
            >
                <p>Giriş yaptığınız için artık tüm özelliklerden faydalanabilirsiniz. İşte sizi bekleyenler:</p>
                <ul>
                    <li><strong>Yüksek Skorlar:</strong> Yaptığınız en iyi skorlar artık kaydedilecek ve liderlik tablosunda yer alacak.</li>
                    <li><strong>İlerleme Takibi:</strong> Çözdüğünüz sorular işaretlenir, böylece aynı sorularla tekrar karşılaşmazsınız.</li>
                    <li><strong>Yapay Zeka Soru Atölyesi:</strong> Kendi soru bankanızı oluşturabilir, dökümanlar yükleyebilir ve hatta yapay zeka ile yazılı sınavlar hazırlayabilirsiniz!</li>
                </ul>
                <p className="mt-4">İyi eğlenceler ve bol şans!</p>
            </InfoModal>
            <InfoModal 
                isOpen={showNoQuestionsModal}
                title="🚀 Soru Bankanız Boş!"
                onClose={() => setShowNoQuestionsModal(false)}
            >
                <p>Seçtiğiniz derste henüz hiç soru bulunmuyor.</p>
                <p className="mt-4">Oyun oynamaya başlayabilmek için <strong>Yapay Zeka Soru Atölyesi</strong>'ni kullanarak kendi sorularınızı üretebilirsiniz:</p>
                <ul>
                    <li><strong>Soru Üret:</strong> Müfredat kazanımlarına göre anında yeni sorular oluşturun.</li>
                    <li><strong>Kütüphanem:</strong> Kendi dökümanlarınızı (PDF, resim) yükleyerek onlardan sorular türetin.</li>
                    <li><strong>Yazılı Hazırla:</strong> Tek tıkla yapay zeka destekli yazılı sınav kağıtları oluşturun.</li>
                </ul>
                <p className="mt-4">Ana menüdeki <strong>Yapay Zeka Soru Atölyesi</strong> butonuna tıklayarak başlayabilirsiniz!</p>
            </InfoModal>
            <DeveloperSignature />
        </div>
    );
};

export default App;