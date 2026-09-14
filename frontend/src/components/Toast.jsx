import React, { useEffect, useState } from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

export default function Toast({ toasts, removeToast }) {
  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onDismiss={() => removeToast(toast.id)} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onDismiss }) {
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    const timer = setTimeout(() => {
      setExiting(true);
      setTimeout(onDismiss, 300);
    }, 3500);
    return () => clearTimeout(timer);
  }, []);

  const isError = toast.type === 'error';

  return (
    <div
      className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border backdrop-blur-sm min-w-[320px] max-w-[420px]
        transition-all duration-300 ease-out
        ${visible && !exiting ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'}
        ${isError
          ? 'bg-rose-50/95 border-rose-200 text-rose-800'
          : 'bg-white/95 border-slate-200 text-slate-800'
        }`}
    >
      {isError
        ? <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />
        : <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
      }
      <span className="text-sm font-medium flex-1">{toast.message}</span>
      <button
        onClick={() => { setExiting(true); setTimeout(onDismiss, 300); }}
        className="text-slate-400 hover:text-slate-600 transition-colors p-0.5"
      >
        <X className="w-3.5 h-3.5" />
      </button>
      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-b-xl overflow-hidden">
        <div
          className={`h-full ${isError ? 'bg-rose-400' : 'bg-indigo-500'}`}
          style={{ animation: 'toast-progress 3.5s linear forwards' }}
        />
      </div>
    </div>
  );
}

