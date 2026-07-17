import { useCallback, useState } from 'react';

export interface ConfirmOptions {
  title?: string;
  body: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'primary' | 'danger' | 'warning';
}

interface ConfirmState extends ConfirmOptions {
  open: boolean;
  resolve?: (value: boolean) => void;
}

/**
 * Promise-based confirm dialog state. Pair with <ConfirmDialog /> which reads
 * the returned `state` and calls `onHide`/`onConfirm`.
 */
export function useConfirm() {
  const [state, setState] = useState<ConfirmState>({ open: false, body: '' });

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise<boolean>((resolve) => {
      setState({ ...options, open: true, resolve });
    });
  }, []);

  const handleClose = useCallback(
    (result: boolean) => {
      state.resolve?.(result);
      setState((prev) => ({ ...prev, open: false, resolve: undefined }));
    },
    [state],
  );

  return {
    confirmState: state,
    confirm,
    onConfirm: () => handleClose(true),
    onCancel: () => handleClose(false),
  };
}
