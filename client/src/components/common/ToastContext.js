import React, { createContext, useContext, useState, useCallback } from 'react';
import Toast from './Toast';

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);
  // show(msg, ms, actions) where actions is array of { label, onAction }
  // Backwards-compatible: if actions omitted and actionLabel/onAction provided, we adapt.
  const show = useCallback((msg, ms = 3000, actionsOrLabel = null, maybeOnAction = null) => {
    let actions = [];
    if (Array.isArray(actionsOrLabel)) actions = actionsOrLabel;
    else if (actionsOrLabel) actions = [{ label: actionsOrLabel, onAction: maybeOnAction }];
    setToast({ msg, actions });
    if (ms > 0) setTimeout(() => setToast(null), ms);
  }, []);
  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <Toast message={toast?.msg} actions={toast?.actions} onClose={() => setToast(null)} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
