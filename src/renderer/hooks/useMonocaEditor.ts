/* eslint-disable import/extensions */
import { useEffect, useRef } from 'react';
import * as monaco from 'monaco-editor';
import { TabId } from '@blueprintjs/core';
import { codeEditorOptions, libUri, libSource } from '../config';

import p2Source from '../assets/phaser/p2.d.txt';
import pixiSource from '../assets/phaser/pixi.comments.d.txt';
import phaserCESource from '../assets/phaser/phaser.comments.d.txt';

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

  useEffect(() => {
    console.log('>>> hacking monaco languages....');

    // apply compiler options as typescript sensible!
    // monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
    //   target: monaco.languages.typescript.ScriptTarget.ES2015,
    //   allowNonTsExtensions: true,
    // });

    // ****** add extra libraries for test ******
    monaco.languages.typescript.javascriptDefaults.addExtraLib(
      libSource,
      libUri
    );

    // add phaser-ce library:
    // https://github.com/photonstorm/phaser-ce/tree/master/typescript
    monaco.languages.typescript.javascriptDefaults.addExtraLib(
      p2Source,
      'ts:phaser/p2.d.txt'
    );
    monaco.languages.typescript.javascriptDefaults.addExtraLib(
      pixiSource,
      'ts:phaser/pixi.comments.d.txt'
    );
    monaco.languages.typescript.javascriptDefaults.addExtraLib(
      phaserCESource,
      'ts:phaser/phaser.comments.d.txt'
    );

    // ****** end of libraries addition ******
  }, []);

  return {
    codeEitorWillMountHandler,
    codeEditorMountHandler,
    codeEditorValueHandler,
    verticalHandleBarMoveHandler,
    defaultCode: mockCodeForScene[navbarTabId],
  };
};

export default useMonocaEditor;
