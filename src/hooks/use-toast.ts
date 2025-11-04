import { useState, useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'info';

export type Toast = {
  id: string;
  title: string;
  description?: string;
  type: ToastType;
  createdAt: number;
  duration: number;
};

type ToastState = {
  toasts: Toast[];
};

const listeners: Array<(state: ToastState) => void> = [];
let memoryState: ToastState = { toasts: [] };
let count = 0;

function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER;
  return count.toString();
}

function dispatch(toasts: Toast[]) {
  memoryState = { toasts };
  listeners.forEach((listener) => {
    listener(memoryState);
  });
}

export function toast({ title, description, type = 'info', duration = 3000 }: { title: string; description?: string; type?: ToastType; duration?: number }) {
  const id = genId();
  const newToast: Toast = { id, title, description, type, createdAt: Date.now(), duration };
  
  dispatch([...memoryState.toasts, newToast]);

  // Auto-dismiss after specified duration
  setTimeout(() => {
    dismiss(id);
  }, duration);

  return { id };
}

function dismiss(toastId: string) {
  dispatch(memoryState.toasts.filter((t) => t.id !== toastId));
}

export function useToast() {
  const [state, setState] = useState<ToastState>(memoryState);

  useEffect(() => {
    listeners.push(setState);
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, []);

  return {
    toasts: state.toasts,
    toast,
    dismiss,
  };
}

