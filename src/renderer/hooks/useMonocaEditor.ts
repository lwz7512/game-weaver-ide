/* eslint-disable import/extensions */
import { useEffect, useRef } from 'react';
import * as monaco from 'monaco-editor';
import { TabId } from '@blueprintjs/core';
import {
  codeEditorOptions,
  libUri,
  libSource,
  sourceRepo,
  p2File,
  pixiFile,
  phaserFile,
} from '../config';

import { templetCode } from '../state/templete';

/**
 * language switch hook by tab
 * @param navbarTabId
 * @returns state and callbacks
 */
const useMonocaEditor = (
  containerSelector: string,
  navbarTabId: TabId,
  onValueChange: (code: string, eol: string) => void
) => {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  // build editor & observe container resize
  useEffect(() => {
    const editorContainer = document.querySelector(
      containerSelector
    ) as HTMLElement;

    const options = {
      value: templetCode[navbarTabId],
      ...codeEditorOptions,
    };

    const onChange = (evt: monaco.editor.IModelContentChangedEvent) => {
      const currentValue = editorRef.current?.getValue() || '';
      onValueChange(currentValue, evt.eol);
      templetCode[navbarTabId] = currentValue; // keep a internal value
    };

    const recreateEditor = () => {
      // console.log('>>> Dispose editor...');
      editorRef.current?.dispose();
      console.log('>>> To create editor...');
      editorRef.current = monaco.editor.create(editorContainer, options);
      editorRef.current.onDidChangeModelContent(onChange);
      editorRef.current.focus();
    };
    const observer = new ResizeObserver(recreateEditor);
    observer.observe(editorContainer);

    // clearup when destroy
    return () => {
      observer.unobserve(editorContainer);
    };
  }, [navbarTabId, containerSelector, onValueChange]);

  // build phaser source lib
  useEffect(() => {
    console.log('>>> Hacking monaco languages....');
    // ****** add extra libraries for test ******
    monaco.languages.typescript.javascriptDefaults.addExtraLib(
      libSource,
      libUri
    );
    async function fetchPhaserLib(fileName: string) {
      const response = await fetch(sourceRepo + fileName);
      const source = await response.text();
      monaco.languages.typescript.javascriptDefaults.addExtraLib(
        source,
        `ts:${fileName}`
      );
    }
    // TODO: fetch game code template ...

    async function fetchAll() {
      console.log('>>> fetching phaser lib...');
      await fetchPhaserLib(p2File);
      console.log('## p2.d done!');
      await fetchPhaserLib(pixiFile);
      console.log('## pixi.d done!');
      await fetchPhaserLib(phaserFile);
      console.log('## phaser.d done!');
    }
    // fetching remote phaser lib..
    fetchAll();
    // ****** end of libraries addition ******
  }, []);

  const verticalHandleBarMoveHandler = (diffH: number) => {};
  // TODO: add extra lib ...
  const codeEitorWillMountHandler = () => {};
  const codeEditorMountHandler = () => {};
  // TODO: save the current code to file
  const codeEditorValueHandler = () => true;

  return {
    codeEitorWillMountHandler,
    codeEditorMountHandler,
    codeEditorValueHandler,
    verticalHandleBarMoveHandler,
    defaultCode: '//',
  };
};

export default useMonocaEditor;
