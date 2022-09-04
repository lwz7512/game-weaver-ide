import { useEffect, useRef } from 'react';
import * as monaco from 'monaco-editor';
import { TabId } from '@blueprintjs/core';
import { OnMount, OnChange } from '@monaco-editor/react';

export const mockCodeForScene: { [key: TabId]: string } = {
  main: '// main scene code',
  success: '// sucess scene code',
  failure: '// failure scene code',
};

const useMonocaEditor = (navbarTabId: TabId) => {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  const codeEditorMountHandler: OnMount = (editor) => {
    editorRef.current = editor;
    editor.focus();
    // console.log('editor mounted!');
  };
  // TODO: save the current code to file
  const codeEditorValueHandler: OnChange = (value) => console.log(value);

  useEffect(() => {
    const defaultCode = mockCodeForScene[navbarTabId];
    if (editorRef.current) {
      editorRef.current.setValue(defaultCode);
      editorRef.current.focus();
    }
  }, [navbarTabId]);

  return {
    codeEditorMountHandler,
    codeEditorValueHandler,
    defaultCode: mockCodeForScene[navbarTabId],
  };
};

export default useMonocaEditor;
