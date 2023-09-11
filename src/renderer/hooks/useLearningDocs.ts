/**
 * For LearningPage logic use.
 *
 * Created at 2023/09/11
 */

import { useState } from 'react';
import MarkdownIt from 'markdown-it';
import { IpcEvents } from '../../ipc-events';

import docs from '../assets/docs.json';

type LearningDoc = {
  name: string;
  title: string;
  url: string;
  selected?: boolean;
  loading?: boolean;
  background?: string;
};

export const useLearningDocs = () => {
  const mdRenderer = MarkdownIt();
  const { baseURL, learning } = docs;
  const { ipcRenderer } = window.electron;

  const [learningDocs, setLearningDocs] = useState<LearningDoc[]>(
    learning.map((doc) => ({
      ...doc,
      background: 'bg-slate-500',
    }))
  );
  const [learningContent, setLearningContent] = useState('');

  const docLoadHandler = async (name: string, url: string) => {
    const learningCp = learningDocs.map((doc) => {
      if (doc.name === name)
        return {
          ...doc,
          name: 'loading...',
        };
      return doc;
    });
    setLearningDocs(learningCp);

    const remotePath = baseURL + url;
    const mdFileContent = (await ipcRenderer.invoke(
      IpcEvents.FETCH_REMOTE_JSON,
      remotePath
    )) as string;

    const htmlFromMD = mdRenderer.render(mdFileContent);
    setLearningContent(htmlFromMD);

    const learningDownloaded = learningDocs.map((doc) => {
      if (doc.name === name)
        return {
          ...doc,
          loading: false,
          background: 'bg-sky-600',
          name,
        };
      return { ...doc, background: 'bg-slate-500' };
    });

    setLearningDocs(learningDownloaded);
  };

  return {
    learningDocs,
    learningContent,
    docLoadHandler,
  };
};
