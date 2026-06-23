import Editor from '@monaco-editor/react';
import type { OnMount } from '@monaco-editor/react';
import React from 'react';

import '@/lib/monacoEnv';
import { useTheme } from '@/context/ThemeContext';
import { cn } from '@/lib/utils';

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
      <Editor
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
    </div>
  );
};

export default JsonCodeEditor;
