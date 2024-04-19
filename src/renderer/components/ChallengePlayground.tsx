import { Spinner } from '@blueprintjs/core';
import Editor from '@monaco-editor/react';

import { codeEditorOptions, Challenge } from '../config';
import { CodeResultStage } from './CodeResultStage';
import { useChallengePlayground } from '../hooks/useChallengeContent';
import { useEditorDecorations } from '../hooks/useEditorDecorations';

/**
 * Code editor & Running result, as well as error console
 *
 * @returns
 */
export const ChallengePlayground = ({
  challenge,
  editorLibSource,
  warningHandler,
}: {
  editorLibSource: string;
  challenge: Challenge;
  warningHandler: (message: string) => void;
}) => {
  const ucc = useChallengePlayground(
    challenge,
    editorLibSource,
    warningHandler
  );

  const { handleEditorDidMount } = useEditorDecorations(
    challenge,
    ucc.codeLoaded
  );

  return (
    <div className="flex h-96">
      {/* js coding area */}
      <div className="code-editors border h-full border-gray-400 bg-white inline-block">
        {/* monoca-editor instacne */}
        <Editor
          defaultLanguage="javascript"
          defaultValue=""
          value={ucc.runningCode}
          options={codeEditorOptions}
          onChange={ucc.editChangeChandler}
          onMount={handleEditorDidMount}
        />
      </div>
      {/* === Run button === */}
      <div className="running-code-button w-3 h-full flex relative">
        <button
          type="button"
          disabled={ucc.hasSyntaxError}
          className="center-run-button bg-sky-600 border-2 border-sky-400 hover:drop-shadow-xl hover:bg-sky-500"
          onClick={ucc.runCodeHandler}
        >
          {ucc.startRunning ? (
            <Spinner size={22} intent="warning" className="white-track" />
          ) : (
            'Run'
          )}
        </button>
      </div>
      {/* result result & error console */}
      <CodeResultStage />
    </div>
  );
};
