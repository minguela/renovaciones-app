import { useCallback } from 'react';
import { useToastContext, ToastType } from '@/components/ui/ToastContext';

export { ToastProvider } from '@/components/ui/ToastContext';
export type { ToastType } from '@/components/ui/ToastContext';

export function useToast() {
  const { showToast: show, hideToast: hide } = useToastContext();

  const showToast = useCallback(
    (message: string, type?: ToastType, duration?: number) => {
      return show(message, type, duration);
    },
    [show]
  );

  const hideToast = useCallback(
    (id: string) => {
      hide(id);
    },
    [hide]
  );

  return { showToast, hideToast };
}
