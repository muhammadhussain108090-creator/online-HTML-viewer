import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { Compartment, EditorState } from '@codemirror/state';
import {
  EditorView,
  highlightActiveLine,
  highlightActiveLineGutter,
  keymap,
  lineNumbers,
  placeholder,
} from '@codemirror/view';
import {
  defaultKeymap,
  history,
  historyKeymap,
  indentWithTab,
} from '@codemirror/commands';
import {
  bracketMatching,
  codeFolding,
  foldAll,
  foldGutter,
  foldKeymap,
  HighlightStyle,
  indentUnit,
  syntaxHighlighting,
  unfoldAll,
} from '@codemirror/language';
import { html } from '@codemirror/lang-html';
import { tags as t } from '@lezer/highlight';

export interface HtmlCodeEditorHandle {
  expandAll: () => void;
  collapseAll: () => void;
  focus: () => void;
}

interface HtmlCodeEditorProps {
  value: string;
  theme: 'dark' | 'light';
  onChange: (nextValue: string) => void;
}

const darkHighlightStyle = HighlightStyle.define([
  { tag: [t.angleBracket, t.punctuation], color: '#717885' },
  { tag: t.tagName, color: '#7DD3FC', fontWeight: '500' },
  { tag: t.attributeName, color: '#FCD34D' },
  { tag: [t.attributeValue, t.string], color: '#86EFAC' },
  { tag: t.comment, color: '#6B7280', fontStyle: 'italic' },
  { tag: t.meta, color: '#A5B4FC' },
  { tag: [t.keyword, t.operator], color: '#C4B5FD' },
  { tag: [t.number, t.bool], color: '#FCA5A5' },
  { tag: t.propertyName, color: '#93C5FD' },
  { tag: t.variableName, color: '#E5E7EB' },
  { tag: t.definition(t.variableName), color: '#FDE68A' },
]);

const lightHighlightStyle = HighlightStyle.define([
  { tag: [t.angleBracket, t.punctuation], color: '#64748B' },
  { tag: t.tagName, color: '#0369A1', fontWeight: '500' },
  { tag: t.attributeName, color: '#B45309' },
  { tag: [t.attributeValue, t.string], color: '#15803D' },
  { tag: t.comment, color: '#6B7280', fontStyle: 'italic' },
  { tag: t.meta, color: '#4338CA' },
  { tag: [t.keyword, t.operator], color: '#6D28D9' },
  { tag: [t.number, t.bool], color: '#DC2626' },
  { tag: t.propertyName, color: '#1D4ED8' },
  { tag: t.variableName, color: '#1E293B' },
  { tag: t.definition(t.variableName), color: '#92400E' },
]);

function createEditorTheme(mode: 'dark' | 'light') {
  const isDark = mode === 'dark';
  return EditorView.theme(
    {
      '&': {
        backgroundColor: isDark ? '#16181D' : '#FAFAFA',
        color: isDark ? '#E4E7EC' : '#18181B',
        fontSize: '13.5px',
      },
      '.cm-content': {
        caretColor: isDark ? '#60A5FA' : '#2563EB',
        padding: '12px 0',
      },
      '.cm-cursor, .cm-dropCursor': {
        borderLeftColor: isDark ? '#60A5FA' : '#2563EB',
        borderLeftWidth: '2px',
      },
      '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection': {
        backgroundColor: isDark ? 'rgba(59, 130, 246, 0.25)' : 'rgba(37, 99, 235, 0.16)',
      },
      '.cm-gutters': {
        backgroundColor: isDark ? '#16181D' : '#FAFAFA',
        color: isDark ? '#525866' : '#94A3B8',
        borderRight: isDark ? '1px solid rgba(255, 255, 255, 0.06)' : '1px solid #E5E7EB',
        paddingRight: '4px',
        userSelect: 'none',
      },
      '.cm-lineNumbers .cm-gutterElement': {
        minWidth: '30px',
        padding: '0 6px 0 8px',
        fontSize: '12px',
      },
      '.cm-foldGutter .cm-gutterElement': {
        width: '16px',
        padding: '0 2px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '12px',
        color: isDark ? '#8B949E' : '#64748B',
      },
      '.cm-foldGutter .cm-gutterElement:hover': {
        color: isDark ? '#E5E7EB' : '#18181B',
      },
      '.cm-activeLine': {
        backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(15, 23, 42, 0.03)',
      },
      '.cm-activeLineGutter': {
        backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(15, 23, 42, 0.04)',
        color: isDark ? '#9CA3AF' : '#334155',
      },
      '.cm-foldPlaceholder': {
        backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#E2E8F0',
        border: isDark ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid #CBD5E1',
        color: isDark ? '#9CA3AF' : '#475569',
        borderRadius: '4px',
        padding: '0 6px',
        margin: '0 4px',
        fontSize: '12px',
      },
      '.cm-placeholder': {
        color: isDark ? '#525866' : '#94A3B8',
      },
    },
    { dark: isDark }
  );
}

export const HtmlCodeEditor = forwardRef<HtmlCodeEditorHandle, HtmlCodeEditorProps>(
  function HtmlCodeEditor({ value, theme, onChange }, ref) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const viewRef = useRef<EditorView | null>(null);
    const themeCompartmentRef = useRef(new Compartment());
    const highlightCompartmentRef = useRef(new Compartment());
    const onChangeRef = useRef(onChange);
    onChangeRef.current = onChange;

    useImperativeHandle(ref, () => ({
      expandAll: () => {
        if (viewRef.current) {
          unfoldAll(viewRef.current);
        }
      },
      collapseAll: () => {
        if (viewRef.current) {
          foldAll(viewRef.current);
        }
      },
      focus: () => {
        viewRef.current?.focus();
      },
    }));

    useEffect(() => {
      if (!containerRef.current) return;

      const state = EditorState.create({
        doc: value,
        extensions: [
          lineNumbers(),
          highlightActiveLineGutter(),
          highlightActiveLine(),
          history(),
          codeFolding(),
          foldGutter({
            markerDOM: (open) => {
              const span = document.createElement('span');
              span.textContent = open ? '▾' : '▸';
              span.style.fontSize = '11px';
              span.style.lineHeight = '1';
              return span;
            },
          }),
          bracketMatching(),
          indentUnit.of('  '),
          html(),
          EditorView.lineWrapping,
          EditorView.contentAttributes.of({
            'aria-label': 'HTML code editor',
          }),
          placeholder('Paste or write your HTML code here...'),
          keymap.of([indentWithTab, ...defaultKeymap, ...historyKeymap, ...foldKeymap]),
          themeCompartmentRef.current.of(createEditorTheme(theme)),
          highlightCompartmentRef.current.of(
            syntaxHighlighting(theme === 'dark' ? darkHighlightStyle : lightHighlightStyle)
          ),
          EditorView.updateListener.of((update) => {
            if (update.docChanged) {
              onChangeRef.current(update.state.doc.toString());
            }
          }),
        ],
      });

      const view = new EditorView({
        state,
        parent: containerRef.current,
      });

      viewRef.current = view;

      return () => {
        view.destroy();
        viewRef.current = null;
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Sync external value changes (Format, Sample, Clear, Import)
    useEffect(() => {
      const view = viewRef.current;
      if (!view) return;
      const currentDoc = view.state.doc.toString();
      if (value !== currentDoc) {
        view.dispatch({
          changes: {
            from: 0,
            to: currentDoc.length,
            insert: value,
          },
        });
      }
    }, [value]);

    // Sync dark/light theme changes without losing undo history or cursor
    useEffect(() => {
      const view = viewRef.current;
      if (!view) return;
      view.dispatch({
        effects: [
          themeCompartmentRef.current.reconfigure(createEditorTheme(theme)),
          highlightCompartmentRef.current.reconfigure(
            syntaxHighlighting(theme === 'dark' ? darkHighlightStyle : lightHighlightStyle)
          ),
        ],
      });
    }, [theme]);

    return (
      <div
        ref={containerRef}
        data-testid="html-editor"
        className="flex-1 min-h-0 w-full h-full overflow-hidden bg-[#FAFAFA] dark:bg-[#16181D]"
      />
    );
  }
);
