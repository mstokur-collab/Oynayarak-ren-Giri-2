import React, { useState } from 'react';
import { Button, Modal } from '../UI';
import { PromptTemplateGenerator } from '../PromptTemplateGenerator';
import { useAppContext } from '../../contexts/AppContext';

export const Tools: React.FC = () => {
    const { 
        userType, 
        setSolvedQuestionIds, 
        setQuestions, 
        setHighScores, 
        setDocumentLibrary, 
        setGeneratedExams 
    } = useAppContext();

    const [showResetConfirm, setShowResetConfirm] = useState(false);
    const [showClearConfirm, setShowClearConfirm] = useState(false);

    const onResetSolvedQuestions = () => setSolvedQuestionIds([]);
    
    const onClearAllData = () => {
        setQuestions([]);
        setHighScores([]);
        setSolvedQuestionIds([]);
        setDocumentLibrary([]);
        setGeneratedExams([]);
    };

    if (userType === 'guest') {
        return (
            <div className="p-6 text-center">
                <h3 className="text-xl font-bold text-yellow-300">Bu Özellik İçin Giriş Yapın</h3>
                <p className="mt-2 text-slate-400">Giriş yaparak AI araçlarını kullanabilir ve verilerinizi yönetebilirsiniz.</p>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 space-y-6">
            <div className="bg-slate-800/50 p-4 rounded-xl border border-violet-500/30">
                <h3 className="text-xl font-bold text-violet-300 mb-3">Veri Yönetimi</h3>
                <div className="flex flex-col sm:flex-row gap-4">
                    <Button onClick={() => setShowResetConfirm(true)} variant="warning" className="w-full !py-2 !text-base">
                        Çözülmüş Soruları Sıfırla
                    </Button>
                    <Button onClick={() => setShowClearConfirm(true)} variant="secondary" className="w-full !py-2 !text-base">
                        Tüm Verileri Temizle
                    </Button>
                </div>
                <p className="text-xs text-slate-400 mt-3 text-center">
                    <strong>Uyarı:</strong> Bu işlemler geri alınamaz.
                </p>
            </div>

            <PromptTemplateGenerator />

            <Modal
                isOpen={showResetConfirm}
                title="Çözülmüş Soruları Sıfırla"
                message="Daha önce çözdüğünüz tüm soruları 'çözülmemiş' olarak işaretlemek istediğinizden emin misiniz? Skorlarınız etkilenmeyecektir."
                onConfirm={() => { onResetSolvedQuestions(); setShowResetConfirm(false); }}
                onCancel={() => setShowResetConfirm(false)}
            />
            <Modal
                isOpen={showClearConfirm}
                title="Tüm Verileri Temizle"
                message="UYARI: Bu işlem tüm soru kütüphanenizi, yüksek skorlarınızı, dökümanlarınızı ve sınavlarınızı kalıcı olarak silecektir. Bu işlem geri alınamaz. Emin misiniz?"
                onConfirm={() => { onClearAllData(); setShowClearConfirm(false); }}
                onCancel={() => setShowClearConfirm(false)}
            />
        </div>
    );
};
