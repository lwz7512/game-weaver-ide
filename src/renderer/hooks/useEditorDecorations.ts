/**
 * Add Decorations to edito
 * @date 2024/04/19
 */

import { useRef, useEffect } from 'react';
import * as monaco from 'monaco-editor';
import { Challenge } from '../config';

type MonacoEditor = monaco.editor.IStandaloneCodeEditor;

export const useEditorDecorations = (
  challenge: Challenge,
  codeLoaded: boolean
) => {
  const editorRef = useRef<MonacoEditor | null>(null);

  useEffect(() => {
    if (!editorRef.current) return;
    if (!codeLoaded) return;
    // console.log(`>>> start code loaded, to decorate editor:`);

    const editor = editorRef.current;
    const { codeDecorations } = challenge;
    if (!codeDecorations || !codeDecorations.length) return;

    const decorations = codeDecorations.map((dec) => {
      const { type, position } = dec;
      const [sl, sc, el, ec] = position;
      const decoration = {
        range: new monaco.Range(sl, sc, el, ec),
        options: {},
      };
      if (type === 'todo' || type === 'note') {
        decoration.options = {
          inlineClassName: 'todo-decoration',
        };
      }
      if (type === 'mark') {
        decoration.options = {
          linesDecorationsClassName: 'mark-decoration',
        };
      }
      return decoration;
    });

    setTimeout(() => {
      editor.createDecorationsCollection(decorations);
    });
  }, [editorRef, challenge, codeLoaded]);

  const handleEditorDidMount = (editor: MonacoEditor) => {
    editorRef.current = editor;
  };

  return {
    handleEditorDidMount,
  };
};
