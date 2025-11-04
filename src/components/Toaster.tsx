import { useToast } from '../hooks/use-toast';
import { X, CheckCircle, XCircle, Info } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { Toast } from '../hooks/use-toast';

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const [progress, setProgress] = useState(100);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Date.now() - toast.createdAt;
      const remaining = Math.max(0, 100 - (elapsed / toast.duration) * 100);
      setProgress(remaining);

      if (remaining === 0) {
        clearInterval(interval);
      }
    }, 10);

    // Start exit animation 200ms before toast expires
    const exitTimeout = setTimeout(() => {
      setIsExiting(true);
    }, toast.duration - 200);

    return () => {
      clearInterval(interval);
      clearTimeout(exitTimeout);
    };
  }, [toast.createdAt, toast.duration]);

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => onDismiss(toast.id), 200);
  };

  return (
    <div
      className={`overflow-hidden rounded-lg shadow-lg border transition-all duration-200 ${
        isExiting ? 'opacity-0 translate-x-full' : 'opacity-100 translate-x-0'
      } ${
        toast.type === 'success'
          ? 'bg-green-50 border-green-200'
          : toast.type === 'error'
          ? 'bg-red-50 border-red-200'
          : 'bg-blue-50 border-blue-200'
      }`}
    >
      <div className="flex items-start gap-3 p-4">
        {toast.type === 'success' && <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />}
        {toast.type === 'error' && <XCircle className="h-5 w-5 text-red-600 flex-shrink-0" />}
        {toast.type === 'info' && <Info className="h-5 w-5 text-blue-600 flex-shrink-0" />}
        
        <div className="flex-1 min-w-0">
          <p className={`font-semibold text-sm ${
            toast.type === 'success'
              ? 'text-green-900'
              : toast.type === 'error'
              ? 'text-red-900'
              : 'text-blue-900'
          }`}>
            {toast.title}
          </p>
          {toast.description && (
            <p className={`text-sm mt-1 ${
              toast.type === 'success'
                ? 'text-green-700'
                : toast.type === 'error'
                ? 'text-red-700'
                : 'text-blue-700'
            }`}>
              {toast.description}
            </p>
          )}
        </div>
        
        <button
          onClick={handleDismiss}
          className={`flex-shrink-0 rounded-md p-1 hover:bg-black/5 transition-colors ${
            toast.type === 'success'
              ? 'text-green-600'
              : toast.type === 'error'
              ? 'text-red-600'
              : 'text-blue-600'
          }`}
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Timer bar */}
      <div className="h-1 bg-black/10">
        <div
          className={`h-full transition-all duration-100 ease-linear ${
            toast.type === 'success'
              ? 'bg-green-500'
              : toast.type === 'error'
              ? 'bg-red-500'
              : 'bg-blue-500'
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

export function Toaster() {
  const { toasts, dismiss } = useToast();

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-md">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={dismiss} />
      ))}
    </div>
  );
}

