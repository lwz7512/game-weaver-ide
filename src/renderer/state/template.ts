import * as monaco from 'monaco-editor';
import { TemplateCodeType } from '../config';

export type EditorType = monaco.editor.IStandaloneCodeEditor;

/**
 * TODO: add succes and failure state code ...
 * ************* TEMPORAL CODE STORE ***********************
 */
export const templetCode: TemplateCodeType = {
  main: '//loading game source...',
  success: `class SuccessState extends Phaser.State {
    init() {
      // ...
    }
  
    preload() {
      // ...
    }
  
    create() {
      // ...
    }
  
    update() {
      // ...
    }
  }`,
  failure: `class FailureState extends Phaser.State {
    init() {
      // ...
    }
  
    preload() {
      // ...
    }
  
    create() {
      // ...
    }
  
    update() {
      // ...
    }
  }
  `,
};

type NullMoM = monaco.editor.ITextModel | null;
type NullMoV = monaco.editor.ICodeEditorViewState | null;

type ModelAndState = {
  model: NullMoM;
  state: NullMoV;
};

const editorState: {
  [file: string]: ModelAndState;
} = {};

export const saveEditorState = (
  file: string,
  model: NullMoM,
  state: NullMoV
) => {
  console.log('>>> save model and state:');
  console.log(file);
  editorState[file] = {
    model,
    state,
  };
};

export const getEditorState = (file: string) => {
  const vm = editorState[file];
  return vm || {};
};

export const getEditorValue = (file: string) => {
  const vm = editorState[file];
  return vm.model ? vm.model.getValue() : '';
};

export const isModelExists = (file: string) => {
  const vm = editorState[file];
  return !!vm;
};
