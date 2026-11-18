interface LivePreviewPaneProps {
  html: string;
  refreshCounter: number;
  isResizing: boolean;
  onLoadSample: () => void;
}

export function LivePreviewPane({
  html,
  refreshCounter,
  isResizing,
  onLoadSample,
}: LivePreviewPaneProps) {
  const isEmpty = html.trim().length === 0;

  return (
    <div className="relative flex-1 min-h-0 w-full h-full bg-white">
      <iframe
        key={refreshCounter}
        title="Live HTML Preview"
        data-testid="live-preview-iframe"
        srcDoc={html}
        sandbox="allow-scripts allow-forms allow-modals allow-popups"
        className={`w-full h-full border-0 bg-white ${
          isResizing ? 'pointer-events-none select-none' : ''
        }`}
      />
      {isEmpty && (
        <div
          data-testid="preview-empty-state"
          className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-white text-neutral-600"
        >
          <p className="text-sm font-medium text-neutral-800 mb-1">
            Preview is empty
          </p>
          <p className="text-xs text-neutral-500 max-w-xs mb-4">
            Write or paste HTML in the editor to see it rendered here immediately.
          </p>
          <button
            type="button"
            onClick={onLoadSample}
            className="px-3.5 py-2 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 rounded-md transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            Load Sample HTML
          </button>
        </div>
      )}
    </div>
  );
}
