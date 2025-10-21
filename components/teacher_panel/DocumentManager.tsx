import React, { useState, useCallback } from 'react';
import type { DocumentLibraryItem } from '../../types';
import { Button } from '../UI';
import { extractTopicsFromPDF, extractQuestionFromImage } from '../../services/geminiService';
import { Modal } from '../UI';
import { useAppContext } from '../../contexts/AppContext';

type LoadingStatus = 'idle' | 'reading' | 'processing';

const FileUploader: React.FC<{ 
  onFileUpload: (file: File) => void; 
  loadingStatus: LoadingStatus; 
}> = ({ onFileUpload, loadingStatus }) => {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      onFileUpload(e.target.files[0]);
    }
  };

  const onButtonClick = () => {
    inputRef.current?.click();
  };

  const loadingMessages: Record<LoadingStatus, string> = {
    idle: '',
    reading: 'Dosya okunuyor...',
    processing: 'Yapay zeka analiz ediyor...',
  };

  return (
    <form className="h-full" onDragEnter={handleDrag} onSubmit={(e) => e.preventDefault()}>
      <input ref={inputRef} type="file" className="hidden" accept=".pdf,image/*" onChange={handleChange} disabled={loadingStatus !== 'idle'} />
      <label
        className={`h-full flex items-center justify-center border-2 border-dashed rounded-lg cursor-pointer transition-colors ${dragActive ? "bg-slate-700 border-violet-400" : "bg-slate-800/50 border-slate-600"}`}
        onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
      >
        <div className="text-center">
            {loadingStatus !== 'idle' ? (
                <>
                    <div className="w-8 h-8 border-4 border-dashed rounded-full animate-spin border-violet-400 mx-auto mb-2"></div>
                    <p className="text-slate-300">{loadingMessages[loadingStatus]}</p>
                </>
            ) : (
                <>
                    <p className="font-semibold mb-2">PDF veya Resim Dosyasını Buraya Sürükleyin</p>
                    <p className="text-slate-400 text-sm mb-3">veya</p>
                    <button type="button" onClick={onButtonClick} className="px-4 py-2 bg-violet-600 hover:bg-violet-500 rounded-lg text-sm font-bold">Dosya Seç</button>
                </>
            )}
        </div>
      </label>
    </form>
  );
};


export const DocumentManager: React.FC = () => {
  const { documentLibrary, setDocumentLibrary, setQuestions, userType } = useAppContext();
  const [loadingStatus, setLoadingStatus] = useState<LoadingStatus>('idle');
  const [error, setError] = useState('');
  const [docToDelete, setDocToDelete] = useState<string | null>(null);

  const handleFileUpload = useCallback(async (file: File) => {
    setLoadingStatus('reading');
    setError('');
    
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        try {
            setLoadingStatus('processing');
            const base64 = (reader.result as string).split(',')[1];
            const mimeType = file.type;
            const newDoc: DocumentLibraryItem = {
            id: `${file.name}-${Date.now()}`,
            name: file.name,
            content: { mimeType, data: base64 },
            topics: []
            };

            if (mimeType === 'application/pdf') {
            const topics = await extractTopicsFromPDF({ mimeType, data: base64 });
            newDoc.topics = topics;
            } else if (mimeType.startsWith('image/')) {
            const extractedQuestions = await extractQuestionFromImage({ mimeType, data: base64 });
            if(extractedQuestions.length > 0) {
                const questionsWithMetadata = extractedQuestions.map((q, i) => ({
                    ...q,
                    id: Date.now() + i,
                    grade: 8, // Default grade
                    topic: "Görselden Çıkarım",
                    difficulty: "orta",
                    type: "quiz",
                    subjectId: 'image-extract'
                }));
                setQuestions(prev => [...questionsWithMetadata, ...prev]);
            }
            }
            
            setDocumentLibrary(prev => [newDoc, ...prev]);
        } catch (err: any) {
             setError(err.message || 'Dosya işlenirken bir hata oluştu.');
        } finally {
            setLoadingStatus('idle');
        }
      };
      reader.onerror = () => {
          setError('Dosya okunurken bir hata oluştu.');
          setLoadingStatus('idle');
      }
    } catch (err: any) {
      setError(err.message || 'Dosya işlenirken bir hata oluştu.');
      setLoadingStatus('idle');
    }
  }, [setDocumentLibrary, setQuestions]);

  const handleDelete = (id: string) => {
    setDocumentLibrary(prev => prev.filter(d => d.id !== id));
    setDocToDelete(null);
  };

    if (userType === 'guest') {
        return (
            <div className="p-6 text-center">
                <h3 className="text-xl font-bold text-yellow-300">Bu Özellik İçin Giriş Yapın</h3>
                <p className="mt-2 text-slate-400">Giriş yaparak kendi kaynak dökümanlarınızı yükleyebilir ve yönetebilirsiniz.</p>
            </div>
        );
    }

  return (
    <div className="p-4 sm:p-6 space-y-4">
        <h3 className="text-xl font-bold text-violet-300">Kaynak Kütüphanem</h3>
        <p className="text-sm text-slate-400 -mt-2">
            Buraya kendi ders notlarınızı, kitap bölümlerini (PDF) veya mevcut soruların görsellerini (JPG, PNG) yükleyebilirsiniz.
            Yapay zeka, PDF'lerinizden konu başlıkları çıkararak bu konulara özel sorular üretmenizi sağlar. Görsellerdeki sorular ise analiz edilerek doğrudan Soru Bankanıza eklenir.
        </p>
        <div className="h-48">
            <FileUploader onFileUpload={handleFileUpload} loadingStatus={loadingStatus} />
        </div>
        {error && <p className="text-red-400 text-sm text-center">{error}</p>}

        <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
            {documentLibrary.map(doc => (
                <div key={doc.id} className="flex justify-between items-center p-3 bg-slate-800/70 rounded-lg border border-slate-700">
                    <div>
                        <p className="font-semibold">{doc.name}</p>
                        <p className="text-xs text-slate-400">{doc.content.mimeType === 'application/pdf' ? `${doc.topics.length} Konu Bulundu` : 'Resim Dosyası'}</p>
                    </div>
                    <Button onClick={() => setDocToDelete(doc.id)} variant="secondary" className="px-3 py-1 text-sm !rounded-lg">Sil</Button>
                </div>
            ))}
        </div>

        <Modal 
            isOpen={!!docToDelete}
            title="Dökümanı Sil"
            message="Bu dökümanı kütüphaneden kalıcı olarak silmek istediğinizden emin misiniz?"
            onConfirm={() => handleDelete(docToDelete!)}
            onCancel={() => setDocToDelete(null)}
        />
    </div>
  );
};