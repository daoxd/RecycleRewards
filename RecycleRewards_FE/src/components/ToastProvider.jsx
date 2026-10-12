import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);
  const timer = useRef(null);
  const nextId = useRef(0);

  const dismiss = useCallback(() => {
    clearTimeout(timer.current);
    setToast(null);
  }, []);

  const notify = useCallback((message, type = 'info') => {
    clearTimeout(timer.current);
    setToast({ id: ++nextId.current, message, type });
    timer.current = setTimeout(() => setToast(null), 3200);
  }, []);

  useEffect(() => () => clearTimeout(timer.current), []);

  return <ToastContext.Provider value={{ notify }}>
    {children}
    {toast && <div key={toast.id} className={'toast toast-' + toast.type} role={toast.type === 'error' ? 'alert' : 'status'} aria-live={toast.type === 'error' ? 'assertive' : 'polite'}>
      <span>{toast.message}</span>
      <button type="button" aria-label="Đóng thông báo" onClick={dismiss}>×</button>
    </div>}
  </ToastContext.Provider>;
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast phải được sử dụng bên trong ToastProvider.');
  return context;
}
