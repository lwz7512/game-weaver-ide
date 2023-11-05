import React, { useEffect } from 'react';
import { Tree, TreeNodeInfo } from '@blueprintjs/core';

import LeftSideBar from '../components/LeftSideBar';
import { MODULETYPES } from '../config';
import useLeftSideBar from '../hooks/useLeftSideBar';
import { useExampleTree, createTreeNodeInfo } from '../hooks/useExampleTree';
import { useIframeFocus } from '../hooks/useIframeContext';

import examples from '../assets/examples.json';

/**
 *
 * Phaser Examples Page - example gallery:
 * left: category list, expand folder to list children example
 * right: example page, default to display `basic` examples if no category selected!
 *
 * @returns
 */
const CodeBlocksPage = () => {
  const { onModuleChanged } = useLeftSideBar();

  const exampleTreeNodes = createTreeNodeInfo(examples) as TreeNodeInfo[];
  const {
    nodes,
    selectedPages,
    handleNodeClick,
    handleNodeCollapse,
    handleNodeExpand,
  } = useExampleTree(exampleTreeNodes);

  useIframeFocus();

  return (
    <div className="w-full h-screen flex">
      <div className="left-sidepanel flex">
        <LeftSideBar
          activeModule={MODULETYPES.BLOCKS}
          onModuleChanged={onModuleChanged}
        />
        <div className="file-explorer bg-gray-100 w-60 overflow-y-scroll">
          <h1 className="p-4 bg-slate-600 text-white text-base">
            Phaserjs Game Examples
          </h1>
          <Tree
            contents={nodes}
            onNodeClick={handleNodeClick}
            onNodeExpand={handleNodeExpand}
            onNodeCollapse={handleNodeCollapse}
          />
        </div>
      </div>
      <div className="flex-1 bg-white">
        <h1 className="text-xl text-center p-8 border-b-2 font-semibold text-slate-600">
          Welcome to code examples!
        </h1>
        {/* height: calc(100% - 100px); */}
        <div className="overflow-y-scroll examples-container relative">
          {selectedPages.map((url) => {
            const height = selectedPages.length === 1 ? 2400 : 1600;
            return (
              <iframe
                key={url}
                title={url}
                width="90%"
                height={height}
                src={url}
                className="my-1"
              />
            );
          })}
          <div className="w-24 fixed right-0 top-24 p-4 pointer-events-none">
            <p className="text-sm text-gray-500">......S......</p>
            <p className="text-sm text-gray-500">......C......</p>
            <p className="text-sm text-gray-500">......R......</p>
            <p className="text-sm text-gray-500">......O......</p>
            <p className="text-sm text-gray-500">......L......</p>
            <p className="text-sm text-gray-500">......L......</p>
            <p className="text-sm text-gray-500">&nbsp;</p>
            <p className="text-sm text-gray-500">......A......</p>
            <p className="text-sm text-gray-500">......R......</p>
            <p className="text-sm text-gray-500">......E......</p>
            <p className="text-sm text-gray-500">......A......</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeBlocksPage;
