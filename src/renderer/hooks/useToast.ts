import { useRef } from 'react';
import {
  Intent,
  IToasterProps,
  Position,
  Toaster,
  ToastProps,
} from '@blueprintjs/core';

export const useBPToast = () => {
  const toasterRef = useRef<Toaster | null>(null);

  const addToast = (toast: ToastProps) => {
    if (!toasterRef.current) return;
    // toast.className = '';
    toast.timeout = 3000;
    toasterRef.current.show(toast);
  };

  const toasterCallback = (ref: Toaster) => {
    toasterRef.current = ref;
  };

  // toast properties
  const toastState: IToasterProps = {
    autoFocus: false,
    canEscapeKeyClear: true,
    position: Position.TOP,
    usePortal: true,
    maxToasts: 1,
  };

  const addSuccessToast = (message: string) => {
    addToast({
      icon: 'tick-circle',
      intent: Intent.SUCCESS,
      message,
    });
  };

  const addWarningToast = (message: string) => {
    addToast({
      icon: 'small-info-sign',
      intent: Intent.WARNING,
      message,
    });
  };

  return {
    addToast,
    addSuccessToast,
    addWarningToast,
    toastState,
    toasterCallback,
  };
};
