/**
 * Ready to use:
 *
 * @2022/09/09
 */
import { useEffect, useRef } from 'react';

import * as monaco from 'monaco-editor';
import { TabId } from '@blueprintjs/core';
import {
  codeEditorOptions,
  libSource,
  sourceRepo,
  TSLIB,
  JSFILE,
  IFrameContext,
} from '../config';
import { templetCode } from '../state/template';
import { throttleURLHandler } from '../utils';

/**
 * iframe refresh context
 */
const webviewContext: IFrameContext = {
  url: '',
  timerId: undefined,
  handler: (url: string) => {
    const iframe = document.getElementById('gwpreview');
    const gwPreview = iframe as HTMLIFrameElement;
    gwPreview.src = url;
  },
};

export const useIframeContext = (url: string) => {
  webviewContext.url = url;
};

/**
 * language switch hook by tab
 * @param navbarTabId
 * @returns state and callbacks
 */
const useMonocaEditor = (
  containerSelector: string,
  navbarTabId: TabId,
  mainJSCode: string
) => {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  // load main.js content
  useEffect(() => {
    if (!mainJSCode) return;
    // save to main scene
    templetCode.main = mainJSCode;
    if (editorRef.current) {
      editorRef.current.setValue(mainJSCode);
    }
  }, [mainJSCode]);

  // build editor & observe container resize
  useEffect(() => {
    const editorContainer = document.querySelector(
      containerSelector
    ) as HTMLElement;

    const options = {
      value: templetCode[navbarTabId as JSFILE],
      ...codeEditorOptions,
    };

    const codeValueChangeHandler = (value: string, eol: string) => {
      templetCode.main = value; // cache to a global object
      // throttle to reduce the screen blinking!
      throttleURLHandler(webviewContext, 3000);
    };

    const onChange = (evt: monaco.editor.IModelContentChangedEvent) => {
      const currentValue = editorRef.current?.getValue() || '';
      codeValueChangeHandler(currentValue, evt.eol);
      templetCode[navbarTabId as JSFILE] = currentValue; // keep a internal value
    };

    const recreateEditor = () => {
      // console.log('>>> Dispose editor...');
      editorRef.current?.dispose();
      // console.log('>>> To create editor...');
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
  }, [navbarTabId, containerSelector]);

  // build phaser source lib
  useEffect(() => {
    console.log('>>> Hacking monaco languages....');
    // ****** add extra libraries for test ******
    monaco.languages.typescript.javascriptDefaults.addExtraLib(
      libSource,
      TSLIB.FACTS
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
      await fetchPhaserLib(TSLIB.P2);
      console.log('## p2.d done!');
      await fetchPhaserLib(TSLIB.PIXI);
      console.log('## pixi.d done!');
      await fetchPhaserLib(TSLIB.PHASER);
      console.log('## phaser.d done!');
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

  return {
    defaultCode: '//',
  };
};

export default useMonocaEditor;
