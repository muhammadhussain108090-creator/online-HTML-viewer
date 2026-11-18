import { useEffect } from 'react';
import { Minimize2, RefreshCw } from 'lucide-react';

interface FullScreenPreviewModalProps {
  isOpen: boolean;
  html: string;
  refreshCounter: number;
  onRefresh: () => void;
  onClose: () => void;
}

export function FullScreenPreviewModal({
  isOpen,
  html,
  refreshCounter,
  onRefresh,
  onClose,
}: FullScreenPreviewModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Full page HTML preview"
      className="fixed inset-0 z-50 flex flex-col bg-white dark:bg-[#111317]"
    >
      <div className="flex items-center justify-between gap-4 px-4 h-12 shrink-0 bg-neutral-100 dark:bg-[#111317] border-b border-neutral-200 dark:border-white/10">
        <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 whitespace-nowrap">
          Full Page Preview
        </span>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onRefresh}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md text-neutral-700 dark:text-neutral-200 hover:bg-neutral-200/70 dark:hover:bg-white/10 transition-colors cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Refresh</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:opacity-90 transition-opacity cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <Minimize2 className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Exit Full Page</span>
          </button>
        </div>
      </div>
      <div className="flex-1 min-h-0 bg-white">
        <iframe
          key={`fullscreen-${refreshCounter}`}
          title="Full Page HTML Preview"
          data-testid="fullscreen-preview-iframe"
          srcDoc={html}
          sandbox="allow-scripts allow-forms allow-modals allow-popups"
          className="w-full h-full border-0 bg-white"
        />
      </div>
    </div>
  );
}
