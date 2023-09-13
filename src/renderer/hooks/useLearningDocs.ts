/**
 * For LearningPage logic use.
 *
 * Created at 2023/09/11
 */

import { useState } from 'react';
import MarkdownIt from 'markdown-it';
import { IpcEvents } from '../../ipc-events';
import useFullscreenButton from './useFullscreenButton';

import docs from '../assets/docs.json';

type LearningDoc = {
  id: number;
  name: string;
  title: string;
  url: string;
  selected?: boolean;
  loading?: boolean;
  background?: string;
  description: string;
  border: string;
  theme: string;
};

export const useLearningDocs = () => {
  const mdRenderer = MarkdownIt();
  const { baseURL, learning } = docs;
  const { ipcRenderer } = window.electron;

  const [learningDocs, setLearningDocs] = useState<LearningDoc[]>(learning);
  const [learningContent, setLearningContent] = useState('');

  const { isWVFullscreen, fullScreenOpenHandler, closeFullscreenGameHandler } =
    useFullscreenButton('');

  const markdownLinkHandler = (event: React.MouseEvent) => {
    // prevent replace current view with new page
    event.preventDefault();
    // check clicked element
    const clickedTag = event.target as HTMLElement;
    const isLink = clickedTag.tagName === 'A';
    if (isLink) {
      const { href } = clickedTag as HTMLLinkElement;
      // TODO: implement a iframe view ...
      console.log(`>>> to open webpage in next view: `);
      console.log(href);
      fullScreenOpenHandler(href);
    }
  };

  const fetchDocBy = async (url: string) => {
    const markdownBox = document.querySelector('.markdown-container');
    markdownBox?.scrollTo({ top: 0, behavior: 'smooth' });

    const remotePath = baseURL + url;
    const mdFileContent = (await ipcRenderer.invoke(
      IpcEvents.FETCH_REMOTE_JSON,
      remotePath
    )) as string;

    const htmlFromMD = mdRenderer.render(mdFileContent);
    setLearningContent(htmlFromMD);
  };

  const docLoadHandler = async (name: string, url: string) => {
    const learningCp = learningDocs.map((doc) => {
      if (doc.name === name)
        return {
          ...doc,
          name: 'loading ...',
        };
      return doc;
    });
    setLearningDocs(learningCp);

    await fetchDocBy(url);

    const learningDownloaded = learningDocs.map((doc) => {
      if (doc.name === name)
        return {
          ...doc,
          name, // restore to initial name
          loading: false,
          selected: true,
        };
      return { ...doc, selected: false };
    });

    setLearningDocs(learningDownloaded);
  };

  const openDocBy = async (id: number) => {
    const result = learning.find((doc) => doc.id === id);
    if (!result) return;
    await fetchDocBy(result.url);
  };

  return {
    learningDocs,
    learningContent,
    isWVFullscreen,
    closeFullscreenGameHandler,
    docLoadHandler,
    openDocBy,
    markdownLinkHandler,
  };
};
