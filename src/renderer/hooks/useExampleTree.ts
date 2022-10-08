import React, { useState } from 'react';
import { cloneDeep } from 'lodash-es';
import { Tree, TreeNodeInfo } from '@blueprintjs/core';

type KeyNode = TreeNodeInfo & { key: string };
type NodeSimple = { name: string; children: string[] };
type NodeList = NodeSimple[];
type NodePath = number[];
type TreeAction =
  | {
      type: 'SET_IS_EXPANDED';
      payload: { path: NodePath; isExpanded: boolean };
    }
  | { type: 'DESELECT_ALL' }
  | {
      type: 'SET_IS_SELECTED';
      payload: { path: NodePath; isSelected: boolean };
    };

/**
 * Tree node info list for tree component
 * @param nodes json data
 * @returns
 */
export const createTreeNodeInfo = (nodes: NodeList) => {
  let nodeId = 0;
  return nodes.map((folder) => {
    nodeId += 1;
    const folderNode = {
      id: nodeId,
      icon: 'folder-close',
      isExpanded: false,
      label: folder.name,
    };
    const childNodes = folder.children.map((pageURL) => {
      const leafName = pageURL.split('/')[1].split('.')[0];
      nodeId += 1;
      return {
        id: nodeId,
        icon: 'document',
        label: leafName,
        key: encodeURI(pageURL),
      }; // leaf node
    });
    return { ...folderNode, childNodes };
  });
};

const forEachNode = (
  nodes: TreeNodeInfo[] | undefined,
  callback: (node: TreeNodeInfo) => void
) => {
  if (nodes === undefined) {
    return;
  }

  nodes.forEach((node) => {
    callback(node);
    forEachNode(node.childNodes, callback);
  });
};

const forNodeAtPath = (
  nodes: TreeNodeInfo[],
  path: NodePath,
  callback: (node: TreeNodeInfo) => void
) => {
  callback(Tree.nodeFromPath(path, nodes));
};

/**
 * tree node state handlers
 * @param state
 * @param action
 * @returns
 */
const treeExampleReducer = (state: TreeNodeInfo[], action: TreeAction) => {
  switch (action.type) {
    case 'DESELECT_ALL': {
      const cloned = cloneDeep(state);
      forEachNode(cloned, (node) => {
        node.isSelected = false;
      });
      return cloned;
    }
    case 'SET_IS_EXPANDED': {
      const cloned = cloneDeep(state);
      forNodeAtPath(cloned, action.payload.path, (node) => {
        node.isExpanded = action.payload.isExpanded;
      });
      return cloned;
    }
    case 'SET_IS_SELECTED': {
      const cloned = cloneDeep(state);
      forNodeAtPath(cloned, action.payload.path, (node) => {
        node.isSelected = action.payload.isSelected;
      });
      return cloned;
    }

    default:
      return state;
  }
};

const exampleSite = 'https://samme.github.io/phaser-examples-mirror';
const initURLs = [
  `${exampleSite}/basics/01%20load%20an%20image.html`,
  `${exampleSite}/basics/02%20click%20on%20an%20image.html`,
  `${exampleSite}/basics/03%20move%20an%20image.html`,
  `${exampleSite}/basics/04%20image%20follow%20input.html`,
  `${exampleSite}/basics/05%20load%20an%20animation.html`,
  `${exampleSite}/basics/06%20render%20text.html`,
  `${exampleSite}/basics/07%20tween%20an%20image.html`,
  `${exampleSite}/basics/08%20sprite%20rotation.html`,
];

/**
 * General tree hook for different hierarchy data structure
 * @param initTree inital tree data
 */
export const useExampleTree = (initTree: TreeNodeInfo[]) => {
  const [nodes, dispatch] = React.useReducer(treeExampleReducer, initTree);
  const [selectedPages, setSelectedPages] = useState<string[]>(initURLs);

  const handleNodeClick = React.useCallback(
    (
      node: TreeNodeInfo,
      nodePath: NodePath,
      e: React.MouseEvent<HTMLElement>
    ) => {
      const anyNode = node as KeyNode;
      if (typeof node.isExpanded === 'undefined') {
        // leaf node
        setSelectedPages([`${exampleSite}/${anyNode.key}`]);
      }
      const originallySelected = node.isSelected;
      if (!e.shiftKey) {
        dispatch({ type: 'DESELECT_ALL' });
      }
      dispatch({
        payload: {
          path: nodePath,
          isSelected: originallySelected == null ? true : !originallySelected,
        },
        type: 'SET_IS_SELECTED',
      });
    },
    []
  );

  const handleNodeCollapse = React.useCallback(
    (_node: TreeNodeInfo, nodePath: NodePath) => {
      dispatch({
        payload: { path: nodePath, isExpanded: false },
        type: 'SET_IS_EXPANDED',
      });
    },
    []
  );

  const handleNodeExpand = React.useCallback(
    (_node: TreeNodeInfo, nodePath: NodePath) => {
      dispatch({
        payload: { path: nodePath, isExpanded: true },
        type: 'SET_IS_EXPANDED',
      });
    },
    []
  );

  return {
    nodes,
    selectedPages,
    handleNodeClick,
    handleNodeCollapse,
    handleNodeExpand,
  };
};
