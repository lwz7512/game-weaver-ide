/**
 * Ready to use:
 *
 * @2022/09/09
 */
import { useEffect, useRef } from 'react';

import * as monaco from 'monaco-editor';
import { TabId } from '@blueprintjs/core';
import {
  codeEditorOptions as cops,
  sourceRepo,
  TSLIB,
  JSFILE,
} from '../config';
import {
  EditorType,
  templetCode,
  isModelExists,
  saveEditorState,
  getEditorState,
} from '../state/template';

import { debounce } from '../utils';

/**
 * Runtime add editor model(some js file) to enable intellisense of code in other module
 * Do not create duplicated model with same uri! @2022/10/03
 *
 * @param code code value
 * @param fileName such as `success`, `failure` etc other phaser state module file
 * @param eagerMode model syncroniztion mode, if model is added after editor creation, this should be `true`
 */
export const addNewJSModel = (
  code = '',
  fileName: string,
  eagerMode = false
) => {
  const uri = monaco.Uri.parse(`file:///${fileName}.js`);
  // check model existence is a MUST!
  const savedModel = monaco.editor.getModel(uri);
  if (savedModel) return savedModel;

  const model = monaco.editor.createModel(code, 'javascript', uri);
  if (eagerMode) {
    monaco.languages.typescript.javascriptDefaults.setEagerModelSync(true);
  }
  return model;
};

/**
 * language switch hook by tab
 * @param navbarTabId
 * @returns state and callbacks
 */
const useMonocaEditor = (navbarTabId: TabId, mainJSCode: string) => {
  // keep an editor instance here
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  // keep the last file name
  const lastFileRef = useRef<string | null>(null);

  // build editor & observe container resize
  useEffect(() => {
    const editorParent = document.querySelector('#code-editors') as HTMLElement;

    const onCodeChange = (evt: monaco.editor.IModelContentChangedEvent) => {
      const currentValue = editorRef.current?.getValue() || '';
      templetCode[navbarTabId as JSFILE] = currentValue; // keep a internal value
    };

    const createEditor = () => {
      console.log('>>> to create monaco editor ...');
      const model = addNewJSModel(templetCode.main, 'main');
      const options = { ...cops, model };
      editorRef.current = monaco.editor.create(editorParent, options);
      editorRef.current.onDidChangeModelContent(onCodeChange);
      editorRef.current.focus();
      console.log('### editor created!');
      const editor = editorRef.current as EditorType;
      const state = editor.saveViewState();
      saveEditorState('main', model, state);
    };

    const resetModelAndState = (lastFile: string, editor: EditorType) => {
      const currentFile = navbarTabId as string;

      if (!lastFile || lastFile === currentFile) return;

      const lastModel = editor.getModel();
      const lastState = editor.saveViewState();
      saveEditorState(lastFile, lastModel, lastState);

      const modelExists = isModelExists(currentFile);
      if (!modelExists) {
        const dummyCode = templetCode[currentFile as JSFILE];
        const newModel = addNewJSModel(dummyCode, currentFile, true);
        editor.setModel(newModel);
      } else {
        const { model, state } = getEditorState(currentFile);
        editor.setModel(model);
        editor.restoreViewState(state);
      }
    };

    const relayoutEditor = (entries: ResizeObserverEntry[]) => {
      if (!editorRef.current) return createEditor();

      // lastFile could be `null` while resizing editor on main tab ...
      const lastFile = lastFileRef.current as string;
      const editor = editorRef.current as EditorType;
      resetModelAndState(lastFile, editor);

      // resize editor according to editorContainer change
      const editorBox = entries[0];
      editor.layout({
        width: editorBox.contentRect.width * 0.99,
        height: editorBox.contentRect.height * 0.99,
      });

      // focus at last!
      editor.focus();
    };
    // TODO: review this later... to accelerate animation
    // @2024/06/09
    const [lazyRelayout] = debounce(relayoutEditor, 50);

    const observer = new ResizeObserver(lazyRelayout);
    observer.observe(editorParent);

    // clearup when destroy
    return () => {
      observer.unobserve(editorParent);
      // rember last file name
      lastFileRef.current = navbarTabId as string;
    };
  }, [navbarTabId]);

  // load main.js content
  useEffect(() => {
    if (!mainJSCode) return;
    // save to main scene
    templetCode.main = mainJSCode;
    // editor not ready ...
    if (!editorRef.current) return;

    // editor and model is ready!
    const mainModel = getEditorState('main').model;
    if (mainModel) {
      mainModel.setValue(mainJSCode);
    }

    // FIXME: scroll top after new game source loaded - 2023/12/13
    editorRef.current.setScrollTop(0);
  }, [mainJSCode]);

  // *** build phaser source lib ***
  useEffect(() => {
    console.log('>>> Hacking monaco languages....');
    // ****** add extra libraries for test ******

    async function fetchExternalLib(fileName: string) {
      const response = await fetch(sourceRepo + fileName);
      const source = await response.text();
      // console.log(source);
      monaco.languages.typescript.javascriptDefaults.addExtraLib(
        source,
        `ts:${fileName}`
      );
    }

    async function fetchAll() {
      // console.log('>>> fetching phaser lib...');
      await fetchExternalLib(TSLIB.P2);
      // console.log('## p2.d done!');
      await fetchExternalLib(TSLIB.PIXI);
      // console.log('## pixi.d done!');
      await fetchExternalLib(TSLIB.PHASER);
      // console.log('## phaser.d done!');
      // await fetchExternalLib(TSLIB.GLOBAL);
      // console.log(`## global function fetched!`);
    }
    // fetching remote phaser lib..
    fetchAll();
    // ****** end of libraries addition ******
  }, []);

  // listen iframe onload
  useEffect(() => {
    const iframe = document.getElementById('gwpreview');
    const gwPreview = iframe as HTMLIFrameElement;

    const iframeLoadHandler = () => {
      if (editorRef.current) {
        // some time needed to reset focus! no less than 500!
        setTimeout(() => editorRef.current?.focus(), 500);
      }
    };
    gwPreview.addEventListener('load', iframeLoadHandler);

    return () => {
      gwPreview.removeEventListener('load', iframeLoadHandler);
    };
  }, []);

  const getCurrentCode = () => {
    const currentModel = getEditorState(navbarTabId as string).model;
    return currentModel ? currentModel.getValue() : '';
  };

  return {
    currentFile: navbarTabId as string,
    getCurrentCode,
  };
};

export default useMonocaEditor;
