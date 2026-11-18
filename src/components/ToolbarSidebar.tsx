import {
  Play,
  AlignLeft,
  FileCode2,
  Trash2,
  Upload,
  Download,
  UnfoldVertical,
  FoldVertical,
  Sun,
  Moon,
  Maximize2,
} from 'lucide-react';
import type { ReactNode } from 'react';

interface ToolbarSidebarProps {
  theme: 'dark' | 'light';
  onPreview: () => void;
  onFormat: () => void;
  onLoadSample: () => void;
  onClear: () => void;
  onImportClick: () => void;
  onExport: () => void;
  onExpandAll: () => void;
  onCollapseAll: () => void;
  onToggleTheme: () => void;
  onFullPagePreview: () => void;
}

interface ToolbarButtonProps {
  label: string;
  title: string;
  icon: ReactNode;
  onClick: () => void;
  accent?: boolean;
  danger?: boolean;
}

function ToolbarButton({
  label,
  title,
  icon,
  onClick,
  accent = false,
  danger = false,
}: ToolbarButtonProps) {
  const colorClasses = accent
    ? 'text-blue-600 dark:text-blue-400 hover:bg-blue-500/10 dark:hover:bg-blue-500/15'
    : danger
      ? 'text-neutral-600 dark:text-neutral-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-500/10'
      : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-200/70 dark:hover:bg-white/8';

  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={title}
      className={`group flex flex-col items-center justify-center gap-1 rounded-md px-2 py-1.5 md:py-2 min-w-[52px] md:min-w-0 md:w-full min-h-[42px] md:min-h-[44px] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 cursor-pointer shrink-0 ${colorClasses}`}
    >
      <span className="shrink-0" aria-hidden="true">
        {icon}
      </span>
      <span className="text-[11px] font-medium leading-none whitespace-nowrap">
        {label}
      </span>
    </button>
  );
}

export function ToolbarSidebar({
  theme,
  onPreview,
  onFormat,
  onLoadSample,
  onClear,
  onImportClick,
  onExport,
  onExpandAll,
  onCollapseAll,
  onToggleTheme,
  onFullPagePreview,
}: ToolbarSidebarProps) {
  return (
    <aside
      aria-label="Editor toolbar"
      className="flex md:flex-col items-center md:items-stretch gap-1 md:gap-1 px-2 py-1.5 md:py-2.5 md:px-1.5 w-full md:w-[76px] shrink-0 overflow-x-auto md:overflow-x-visible md:overflow-y-auto bg-neutral-100 dark:bg-[#111317] border-b md:border-b-0 md:border-r border-neutral-200 dark:border-white/10"
    >
      <ToolbarButton
        label="Preview"
        title="Refresh live preview"
        icon={<Play className="w-4 h-4" />}
        onClick={onPreview}
        accent
      />
      <ToolbarButton
        label="Format"
        title="Format and indent HTML"
        icon={<AlignLeft className="w-4 h-4" />}
        onClick={onFormat}
      />
      <ToolbarButton
        label="Sample"
        title="Load sample HTML"
        icon={<FileCode2 className="w-4 h-4" />}
        onClick={onLoadSample}
      />
      <ToolbarButton
        label="Clear"
        title="Clear HTML editor"
        icon={<Trash2 className="w-4 h-4" />}
        onClick={onClear}
        danger
      />

      <div
        role="separator"
        className="w-px h-6 md:w-full md:h-px bg-neutral-200 dark:bg-white/10 my-0 md:my-1 mx-1 md:mx-0 shrink-0"
      />

      <ToolbarButton
        label="Import"
        title="Import HTML file"
        icon={<Upload className="w-4 h-4" />}
        onClick={onImportClick}
      />
      <ToolbarButton
        label="Export"
        title="Export HTML file"
        icon={<Download className="w-4 h-4" />}
        onClick={onExport}
      />

      <div
        role="separator"
        className="w-px h-6 md:w-full md:h-px bg-neutral-200 dark:bg-white/10 my-0 md:my-1 mx-1 md:mx-0 shrink-0"
      />

      <ToolbarButton
        label="Expand"
        title="Expand all HTML sections"
        icon={<UnfoldVertical className="w-4 h-4" />}
        onClick={onExpandAll}
      />
      <ToolbarButton
        label="Collapse"
        title="Collapse all HTML sections"
        icon={<FoldVertical className="w-4 h-4" />}
        onClick={onCollapseAll}
      />

      <div
        role="separator"
        className="w-px h-6 md:w-full md:h-px bg-neutral-200 dark:bg-white/10 my-0 md:my-1 mx-1 md:mx-0 shrink-0"
      />

      <ToolbarButton
        label={theme === 'dark' ? 'Light' : 'Dark'}
        title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        icon={theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        onClick={onToggleTheme}
      />
      <ToolbarButton
        label="Full Page"
        title="Open full page preview"
        icon={<Maximize2 className="w-4 h-4" />}
        onClick={onFullPagePreview}
      />
    </aside>
  );
}
