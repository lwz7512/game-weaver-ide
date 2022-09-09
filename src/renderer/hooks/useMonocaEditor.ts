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

// import p2Source from '../assets/phaser/p2.d.txt';
// import pixiSource from '../assets/phaser/pixi.comments.d.txt';
// import phaserCESource from '../assets/phaser/phaser.comments.d.txt';

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
const useMonocaEditor = (containerSelector: string, navbarTabId: TabId) => {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  // build editor
  useEffect(() => {
    const editorContainer = document.querySelector(
      containerSelector
    ) as HTMLElement;
    const recreateEditor = () => {
      editorRef.current?.dispose();
      editorRef.current = monaco.editor.create(editorContainer, {
        value: mockCodeForScene[navbarTabId],
        language: 'javascript',
        ...codeEditorOptions,
      });
      editorRef.current.focus();
    };
    const observer = new ResizeObserver(recreateEditor);
    observer.observe(editorContainer);
    // clearup when destroy
    return () => observer.unobserve(editorContainer);
  }, [navbarTabId, containerSelector]);

  // build model
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

  // build phaser source lib
  useEffect(() => {
    console.log('>>> Hacking monaco languages....');
    // apply compiler options as typescript sensible!
    // monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
    //   target: monaco.languages.typescript.ScriptTarget.ES2015,
    //   allowNonTsExtensions: true,
    // });
    // add phaser-ce library:
    // https://github.com/photonstorm/phaser-ce/tree/master/typescript
    // monaco.languages.typescript.javascriptDefaults.addExtraLib(
    //   p2Source,
    //   'ts:phaser/p2.d.txt'
    // );
    // monaco.languages.typescript.javascriptDefaults.addExtraLib(
    //   pixiSource,
    //   'ts:phaser/pixi.comments.d.txt'
    // );
    // monaco.languages.typescript.javascriptDefaults.addExtraLib(
    //   phaserCESource,
    //   'ts:phaser/phaser.comments.d.txt'
    // );

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
    defaultCode: mockCodeForScene[navbarTabId],
  };
};

export default useMonocaEditor;
