import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ChangeEvent, CSSProperties, KeyboardEvent as ReactKeyboardEvent } from 'react';
import { ToolbarSidebar } from './components/ToolbarSidebar';
import { HtmlCodeEditor, type HtmlCodeEditorHandle } from './components/HtmlCodeEditor';
import { LivePreviewPane } from './components/LivePreviewPane';
import { FullScreenPreviewModal } from './components/FullScreenPreviewModal';
import { countEditorStats, formatHtml } from './utils/htmlFormatter';
import {
  clampSplitRatio,
  ensureValidHtmlDocument,
  getExportFilename,
  isValidHtmlFilename,
} from './utils/fileHelpers';
import { SAMPLE_HTML } from './utils/sampleHtml';

type ThemeMode = 'dark' | 'light';
type MobilePane = 'editor' | 'preview';

export default function App() {
  const [theme, setTheme] = useState<ThemeMode>('dark');
  const [code, setCode] = useState<string>(SAMPLE_HTML);
  const [refreshCounter, setRefreshCounter] = useState<number>(0);
  const [splitPercent, setSplitPercent] = useState<number>(50);
  const [isResizing, setIsResizing] = useState<boolean>(false);
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);
  const [mobilePane, setMobilePane] = useState<MobilePane>('editor');
  const [statusNotice, setStatusNotice] = useState<{ text: string; isError?: boolean } | null>(null);

  const editorRef = useRef<HtmlCodeEditorHandle | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const workspaceRef = useRef<HTMLDivElement | null>(null);
  const noticeTimerRef = useRef<number | null>(null);

  const showNotice = useCallback((text: string, isError = false) => {
    if (noticeTimerRef.current !== null) {
      window.clearTimeout(noticeTimerRef.current);
    }
    setStatusNotice({ text, isError });
    noticeTimerRef.current = window.setTimeout(() => {
      setStatusNotice(null);
      noticeTimerRef.current = null;
    }, 2600);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    return () => {
      if (noticeTimerRef.current !== null) {
        window.clearTimeout(noticeTimerRef.current);
      }
    };
  }, []);

  // Mouse-drag resizing for desktop split workspace
  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (event: MouseEvent) => {
      const container = workspaceRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      if (rect.width <= 0) return;
      const rawPercent = ((event.clientX - rect.left) / rect.width) * 100;
      setSplitPercent(clampSplitRatio(rawPercent));
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  const stats = useMemo(() => countEditorStats(code), [code]);

  const handlePreview = useCallback(() => {
    setRefreshCounter((prev) => prev + 1);
    setMobilePane('preview');
    showNotice('Preview refreshed');
  }, [showNotice]);

  const handleFormat = useCallback(() => {
    const formatted = formatHtml(code);
    setCode(formatted);
    showNotice('HTML formatted');
  }, [code, showNotice]);

  const handleLoadSample = useCallback(() => {
    setCode(SAMPLE_HTML);
    setRefreshCounter((prev) => prev + 1);
    showNotice('Sample loaded');
  }, [showNotice]);

  const handleClear = useCallback(() => {
    setCode('');
    setRefreshCounter((prev) => prev + 1);
    editorRef.current?.focus();
    showNotice('Editor cleared');
  }, [showNotice]);

  const handleImportClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      event.target.value = '';
      if (!file) return;

      if (!isValidHtmlFilename(file.name) && file.type !== 'text/html') {
        showNotice('Please select an .html or .htm file', true);
        return;
      }

      try {
        const text = await file.text();
        setCode(text);
        setRefreshCounter((prev) => prev + 1);
        showNotice(`Imported ${file.name}`);
      } catch {
        showNotice('Could not read selected file', true);
      }
    },
    [showNotice]
  );

  const handleExport = useCallback(() => {
    const content = ensureValidHtmlDocument(code);
    const filename = getExportFilename(code);
    const blob = new Blob([content], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showNotice(`Exported ${filename}`);
  }, [code, showNotice]);

  const handleExpandAll = useCallback(() => {
    editorRef.current?.expandAll();
    showNotice('Expanded all sections');
  }, [showNotice]);

  const handleCollapseAll = useCallback(() => {
    editorRef.current?.collapseAll();
    showNotice('Collapsed all sections');
  }, [showNotice]);

  const handleToggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const handleFullPagePreview = useCallback(() => {
    setIsFullScreen(true);
  }, []);

  const handleSplitterKeyDown = useCallback((event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      setSplitPercent((prev) => clampSplitRatio(prev - 2));
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      setSplitPercent((prev) => clampSplitRatio(prev + 2));
    } else if (event.key === 'Home') {
      event.preventDefault();
      setSplitPercent(50);
    }
  }, []);

  return (
    <div className="flex flex-col h-dvh w-screen overflow-hidden bg-white text-neutral-900 dark:bg-[#111317] dark:text-neutral-100">
      {/* Minimal Top Bar */}
      <header className="flex items-center justify-between gap-4 px-4 h-11 shrink-0 bg-neutral-50 dark:bg-[#111317] border-b border-neutral-200 dark:border-white/10">
        <div className="flex items-center gap-3 min-w-0">
          <h1 className="text-sm font-semibold tracking-tight text-neutral-900 dark:text-neutral-100 whitespace-nowrap">
            HTML Online Viewer
          </h1>
          {statusNotice && (
            <span
              role="status"
              aria-live="polite"
              className={`hidden sm:inline text-xs truncate ${
                statusNotice.isError
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-neutral-500 dark:text-neutral-400'
              }`}
            >
              {statusNotice.text}
            </span>
          )}
        </div>

        {/* Mobile View Switcher (< 768px) */}
        <div
          role="tablist"
          aria-label="Workspace view"
          className="flex md:hidden items-center gap-1 p-0.5 rounded-md bg-neutral-200/80 dark:bg-white/10 shrink-0"
        >
          <button
            type="button"
            role="tab"
            aria-selected={mobilePane === 'editor'}
            onClick={() => setMobilePane('editor')}
            className={`px-3 py-1 text-xs font-medium rounded transition-colors cursor-pointer whitespace-nowrap ${
              mobilePane === 'editor'
                ? 'bg-white text-neutral-900 dark:bg-[#1E222A] dark:text-white shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            Editor
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mobilePane === 'preview'}
            onClick={() => setMobilePane('preview')}
            className={`px-3 py-1 text-xs font-medium rounded transition-colors cursor-pointer whitespace-nowrap ${
              mobilePane === 'preview'
                ? 'bg-white text-neutral-900 dark:bg-[#1E222A] dark:text-white shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            Preview
          </button>
        </div>
      </header>

      {/* Main 3-Zone Workspace */}
      <div className="flex flex-col md:flex-row flex-1 min-h-0 overflow-hidden">
        <ToolbarSidebar
          theme={theme}
          onPreview={handlePreview}
          onFormat={handleFormat}
          onLoadSample={handleLoadSample}
          onClear={handleClear}
          onImportClick={handleImportClick}
          onExport={handleExport}
          onExpandAll={handleExpandAll}
          onCollapseAll={handleCollapseAll}
          onToggleTheme={handleToggleTheme}
          onFullPagePreview={handleFullPagePreview}
        />

        <input
          ref={fileInputRef}
          type="file"
          accept=".html,.htm,text/html"
          aria-label="Import HTML file"
          onChange={handleFileChange}
          className="sr-only"
        />

        {/* Resizable Split Container */}
        <main
          ref={workspaceRef}
          style={{ '--editor-width': `${splitPercent}%` } as CSSProperties}
          className={`flex flex-1 min-w-0 min-h-0 overflow-hidden ${
            isResizing ? 'cursor-col-resize select-none' : ''
          }`}
        >
          {/* Center Panel: HTML Code Editor */}
          <section
            aria-label="HTML code editor panel"
            className={`${
              mobilePane === 'editor' ? 'flex' : 'hidden md:flex'
            } flex-col min-w-0 min-h-0 w-full md:w-[var(--editor-width)] md:shrink-0 bg-[#FAFAFA] dark:bg-[#16181D]`}
          >
            <div className="flex items-center justify-between gap-3 px-3.5 h-9 shrink-0 bg-neutral-100/70 dark:bg-[#1A1D24] border-b border-neutral-200 dark:border-white/8">
              <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300 whitespace-nowrap">
                HTML
              </span>
              <span className="text-xs text-neutral-500 dark:text-neutral-400 font-mono tabular-nums whitespace-nowrap">
                {stats.lines} {stats.lines === 1 ? 'line' : 'lines'} · {stats.chars.toLocaleString()} chars
              </span>
            </div>
            <HtmlCodeEditor
              ref={editorRef}
              value={code}
              theme={theme}
              onChange={setCode}
            />
          </section>

          {/* Resizable Splitter Handle (Desktop) */}
          <div
            role="separator"
            tabIndex={0}
            aria-orientation="vertical"
            aria-label="Resize editor and preview panels"
            aria-valuemin={20}
            aria-valuemax={80}
            aria-valuenow={Math.round(splitPercent)}
            onMouseDown={(event) => {
              event.preventDefault();
              setIsResizing(true);
            }}
            onDoubleClick={() => setSplitPercent(50)}
            onKeyDown={handleSplitterKeyDown}
            title="Drag to resize panels (double-click to reset)"
            className="hidden md:flex items-center justify-center w-2 shrink-0 cursor-col-resize bg-neutral-200/60 dark:bg-[#111317] hover:bg-blue-500/20 dark:hover:bg-blue-500/25 border-x border-neutral-200 dark:border-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <span
              aria-hidden="true"
              className="w-0.5 h-8 rounded-full bg-neutral-400/70 dark:bg-neutral-600"
            />
          </div>

          {/* Right Panel: Clean White Live HTML Preview */}
          <section
            aria-label="Live HTML preview panel"
            className={`${
              mobilePane === 'preview' ? 'flex' : 'hidden md:flex'
            } flex-col flex-1 min-w-0 min-h-0 bg-white`}
          >
            <div className="flex items-center justify-between gap-3 px-3.5 h-9 shrink-0 bg-neutral-100/70 dark:bg-[#1A1D24] border-b border-neutral-200 dark:border-white/8">
              <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300 whitespace-nowrap">
                Preview
              </span>
              <span className="hidden md:inline text-xs text-neutral-500 dark:text-neutral-400 font-mono tabular-nums whitespace-nowrap">
                {Math.round(100 - splitPercent)}% width
              </span>
            </div>
            <LivePreviewPane
              html={code}
              refreshCounter={refreshCounter}
              isResizing={isResizing}
              onLoadSample={handleLoadSample}
            />
          </section>
        </main>
      </div>

      <FullScreenPreviewModal
        isOpen={isFullScreen}
        html={code}
        refreshCounter={refreshCounter}
        onRefresh={() => setRefreshCounter((prev) => prev + 1)}
        onClose={() => setIsFullScreen(false)}
      />
    </div>
  );
}
