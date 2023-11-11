import { Spinner } from '@blueprintjs/core';
import Editor from '@monaco-editor/react';
import { codeEditorOptions } from '../config';
import { CodeResultStage } from './CodeResultStage';
import { useChallengeContent } from '../hooks/useChallengeContent';
import { Challenge } from '../hooks/useChallenges';

/**
 * Code editor & Running result, as well as error console
 *
 * @returns
 */
export const ChallengePlayground = ({
  challenge,
}: {
  challenge: Challenge;
}) => {
  const ucc = useChallengeContent(challenge);

  return (
    <div className="flex h-96">
      {/* coding area */}
      <div className="code-editors border h-full border-gray-400 bg-white inline-block">
        <Editor
          defaultLanguage="javascript"
          defaultValue=""
          value={ucc.runningCode}
          options={codeEditorOptions}
          onChange={ucc.editChangeChandler}
        />
      </div>
      {/* run button */}
      <div className="running-code-button w-3 h-full flex relative">
        <button
          type="button"
          className="center-run-button bg-sky-600 border-2 border-sky-400 hover:drop-shadow-xl hover:bg-sky-500"
          onClick={ucc.runCodeHandler}
        >
          {ucc.startRunning ? <Spinner size={22} intent="warning" /> : 'Run'}
        </button>
      </div>
      {/* result result & error console */}
      <CodeResultStage code={ucc.runningCode} startRun={ucc.startRunning} />
    </div>
  );
};
