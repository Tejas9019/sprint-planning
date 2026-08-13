import { CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';
import { useBoardStore } from '../../store/boardStore';
import { IconButton } from './IconButton';

/** Single global toast outlet. Announced to screen readers via aria-live. */
export const ToastHost = () => {
  const { toast, dismissToast } = useBoardStore();

  const icon =
    toast?.type === 'success' ? (
      <CheckCircle2 size={15} className="text-emerald-500 flex-shrink-0" />
    ) : toast?.type === 'error' ? (
      <AlertTriangle size={15} className="text-rose-500 flex-shrink-0" />
    ) : (
      <Info size={15} className="text-purple-600 dark:text-purple-400 flex-shrink-0" />
    );

  return (
    <div
      className="fixed top-6 right-6 z-[60] pointer-events-none"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      {toast && (
        <div className="pointer-events-auto bg-bg-secondary/90 backdrop-blur-md border border-purple-500/30 dark:border-purple-500/20 text-text-primary px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 ring-1 ring-purple-500/10 max-w-sm animate-in fade-in slide-in-from-top-4 duration-200">
          {icon}
          <span className="text-xs font-semibold text-text-heading leading-relaxed">
            {toast.message}
          </span>
          <IconButton
            label="Dismiss notification"
            hideTitle
            size="sm"
            onClick={dismissToast}
            className="ml-1"
          >
            <X size={13} />
          </IconButton>
        </div>
      )}
    </div>
  );
};
