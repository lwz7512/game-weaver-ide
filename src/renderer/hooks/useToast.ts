/**
 * Shortcut functions for blueprint toaster,
 * Created At:
 *
 * @date 2023/04/26
 */

import { useRef } from 'react';
import { Intent, Toaster, ToastProps } from '@blueprintjs/core';
import { toast } from 'react-toastify';

export const useBPToast = () => {
  const toasterRef = useRef<Toaster | null>(null);

  const addToast = (props: ToastProps) => {
    if (props.intent === Intent.WARNING) {
      toast.warn(props.message);
      return;
    }
    if (props.intent === Intent.SUCCESS) {
      toast.success(props.message);
      return;
    }
    toast(props.message);
  };

  const toasterCallback = (ref: Toaster) => {
    toasterRef.current = ref;
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
    // toastState,
    toasterCallback,
  };
};
