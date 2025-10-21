import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'violet';
}

export const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', className = '', ...props }) => {
  const baseClasses = 'text-white border border-white/20 rounded-2xl px-8 py-4 text-xl sm:text-2xl font-semibold shadow-lg backdrop-blur-md transition-all duration-300 hover:scale-105 hover:shadow-2xl disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none';
  
  const variantClasses = {
    primary: 'bg-teal-600/90 hover:bg-teal-500/90 shadow-teal-500/40',
    secondary: 'bg-rose-500/80 hover:bg-rose-400/90 shadow-rose-500/30',
    success: 'bg-emerald-500/80 hover:bg-emerald-400/90 shadow-emerald-500/30',
    warning: 'bg-yellow-500/90 hover:bg-yellow-400/90 shadow-yellow-500/40 text-slate-900 font-bold',
    violet: 'bg-violet-600/90 hover:bg-violet-500/90 shadow-violet-500/40',
  };

  return (
    <button className={`${baseClasses} ${variantClasses[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

interface ModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, title, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 p-4 animate-fadeIn">
      <div className="bg-slate-800/50 backdrop-blur-xl border border-white/20 rounded-2xl p-6 sm:p-8 shadow-2xl text-center w-full max-w-md animate-slideIn">
        <h3 className="text-2xl font-bold mb-4">{title}</h3>
        <p className="text-slate-200 mb-6">{message}</p>
        <div className="flex gap-4 justify-center">
          <Button onClick={onCancel} variant="secondary" className="px-6 py-2 text-lg">Hayır</Button>
          <Button onClick={onConfirm} variant="primary" className="px-6 py-2 text-lg">Evet</Button>
        </div>
      </div>
    </div>
  );
};

interface InfoModalProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

export const InfoModal: React.FC<InfoModalProps> = ({ isOpen, title, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 p-4 animate-fadeIn">
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800 backdrop-blur-xl border border-violet-500/50 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-violet-800/40 text-left w-full max-w-lg animate-slideIn">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-1 bg-violet-500/50 rounded-full blur-lg"></div>
        <h3 className="text-3xl font-bold mb-4 text-center text-violet-300 flex items-center justify-center gap-2">{title}</h3>
        <div className="text-slate-200 mb-8 space-y-4 welcome-modal-content">{children}</div>
        <div className="flex justify-center">
          <Button onClick={onClose} variant="violet" className="px-10 py-3 !text-xl">Tamam</Button>
        </div>
      </div>
    </div>
  );
};


export const BackButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
    <button onClick={onClick} className="absolute top-6 left-6 bg-amber-400/80 hover:bg-amber-300/90 text-slate-900 font-bold px-4 py-2 rounded-xl backdrop-blur-md transition-transform hover:scale-105 shadow-lg z-10">
      ← Geri
    </button>
);

export const DeveloperSignature: React.FC = () => (
    <div className="absolute bottom-4 right-6 text-right">
        <h3 className="text-indigo-300 text-sm">Program Geliştiricisi</h3>
        <p className="text-cyan-300 font-bold text-lg tracking-wide">MUSTAFA OKUR</p>
    </div>
);

export const LoadingSpinner: React.FC = () => (
  <div className="flex justify-center items-center w-full h-full">
    <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-teal-400"></div>
  </div>
);