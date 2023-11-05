import Editor from '@monaco-editor/react';
import { codeEditorOptions } from '../config';

/**
 * Code editor & Running result, as well as error console
 *
 * @returns
 */
export const ChallengePlayground = () => {
  return (
    <div className="flex h-96">
      {/* coding area */}
      <div className="code-editors border h-full border-gray-400 bg-white inline-block">
        <Editor
          defaultLanguage="javascript"
          defaultValue="// some comment"
          options={codeEditorOptions}
        />
      </div>
      {/* run button */}
      <div className="play-button-column w-3 h-full flex relative">
        <button
          type="button"
          className="center-run-button bg-green-700 border-green-800 hover:drop-shadow-xl hover:bg-green-600"
        >
          Run
        </button>
      </div>
      {/* result result & error console */}
      <div className="coding-result border  h-full border-gray-400 bg-slate-50 inline-block">
        result...
      </div>
    </div>
  );
};
