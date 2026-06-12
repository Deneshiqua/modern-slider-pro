import React, { Suspense, lazy } from 'react';
import type { OnMount } from '@monaco-editor/react';

import '@/lib/monacoEnv';
import { useTheme } from '@/context/ThemeContext';
import { cn } from '@/lib/utils';

const MonacoEditor = lazy(() => import('@monaco-editor/react'));

export type JsonCodeEditorProps = {
  value: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  height?: number | string;
  className?: string;
};

const JsonCodeEditor = ({
  value,
  onChange,
  readOnly = false,
  height = 300,
  className,
}: JsonCodeEditorProps) => {
  const { theme } = useTheme();

  const handleMount: OnMount = (editor) => {
    editor.focus();
  };

  return (
    <div
      className={cn(
        'msp-overflow-hidden msp-rounded-md msp-border msp-border-border',
        className,
      )}
    >
      <Suspense
        fallback={
          <div
            className="msp-flex msp-items-center msp-justify-center msp-bg-muted msp-text-xs msp-text-muted-foreground"
            style={{ height: typeof height === 'number' ? `${height}px` : height }}
          >
            …
          </div>
        }
      >
        <MonacoEditor
          height={height}
          language="json"
          value={value}
          theme={theme === 'dark' ? 'vs-dark' : 'light'}
          onChange={onChange ? (next) => onChange(next ?? '') : undefined}
          onMount={handleMount}
          options={{
            readOnly,
            minimap: { enabled: false },
            fontSize: 12,
            lineHeight: 18,
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            wordWrap: 'on',
            padding: { top: 8, bottom: 8 },
            folding: true,
            formatOnPaste: true,
            bracketPairColorization: { enabled: true },
          }}
        />
      </Suspense>
    </div>
  );
};

export default JsonCodeEditor;
