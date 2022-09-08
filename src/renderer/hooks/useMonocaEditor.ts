/* eslint-disable import/extensions */
import { useEffect, useRef } from 'react';
import * as monaco from 'monaco-editor';
import { TabId } from '@blueprintjs/core';
import { MODULETYPES, codeEditorOptions } from '../config';

monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
  target: monaco.languages.typescript.ScriptTarget.ES2015,
  allowNonTsExtensions: true,
});

// compiler options
monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
  target: monaco.languages.typescript.ScriptTarget.ES2015,
  allowNonTsExtensions: true,
});

// ****** add extra libraries  ******
const libSource = [
  'declare class Facts {',
  '    /**',
  '     * Returns the next fact',
  '     */',
  '    static next():string',
  '}',
].join('\n');
const libUri = 'ts:filename/facts.d.ts';
monaco.languages.typescript.javascriptDefaults.addExtraLib(libSource, libUri);
// TODO: add phaser library:

// ****** end of libraries addition ******

/**
 * **************************************************
 */
export const mockCodeForScene: { [key: TabId]: string } = {
  main: '// main scene code',
  success: '// sucess scene code',
  failure: '// failure scene code',
};

/**
 * language switch hook by tab
 * @param navbarTabId
 * @returns state and callbacks
 */
const useMonocaEditor = (navbarTabId: TabId) => {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  const verticalHandleBarMoveHandler = (diffH: number) => {};
  // TODO: add extra lib ...
  const codeEitorWillMountHandler = () => {};
  const codeEditorMountHandler = () => {};
  // TODO: save the current code to file
  const codeEditorValueHandler = () => true;

  useEffect(() => {
    const recreateEditor = () => {
      editorRef.current?.dispose();
      const editorContainer = document.getElementById('code-editors');
      if (editorContainer) {
        editorRef.current = monaco.editor.create(editorContainer, {
          value: mockCodeForScene[navbarTabId],
          language: 'javascript',
          ...codeEditorOptions,
        });
        editorRef.current.focus();
      }
    };
    const observer = new ResizeObserver(recreateEditor);
    const editorContainer = document.querySelector('#code-editors');
    if (editorContainer) observer.observe(editorContainer);
    return () => {
      if (editorContainer) observer.unobserve(editorContainer);
    };
  }, [navbarTabId]);

  useEffect(() => {
    const defaultCode = mockCodeForScene[navbarTabId];
    if (editorRef.current) {
      editorRef.current.setValue(defaultCode);
      editorRef.current.focus();
      return; // stop here!
    }
    // create model, call only once!
    monaco.editor.createModel(
      mockCodeForScene[navbarTabId],
      'typescript',
      monaco.Uri.parse(libUri)
    );
  }, [navbarTabId]);

  return {
    codeEitorWillMountHandler,
    codeEditorMountHandler,
    codeEditorValueHandler,
    verticalHandleBarMoveHandler,
    defaultCode: mockCodeForScene[navbarTabId],
  };
};

export default useMonocaEditor;
