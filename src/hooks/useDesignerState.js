import { useMemo, useState } from 'react';
import { nanoid } from 'nanoid';

const CONTAINER_TYPES = new Set(['Form', 'Card']);

export function useDesignerState() {
  const [tree, setTree] = useState([]);
  const [selectedId, setSelectedId] = useState(null);

  const selectedNode = useMemo(() => {
    return findNode(tree, selectedId)?.node ?? null;
  }, [tree, selectedId]);

  function addNode(type, targetId = null) {
    const node = createNode(type);
    setTree(prev => {
      if (!targetId) return [...prev, node];
      const { node: target } = findNode(prev, targetId) || {};
      if (!target || !CONTAINER_TYPES.has(target.type)) return [...prev, node];
      const next = clone(prev);
      const { node: targetNext } = findNode(next, targetId);
      targetNext.children.push(node);
      return next;
    });
    setSelectedId(node.id);
  }

  function removeNode(id) {
    setTree(prev => removeNodeFromTree(prev, id));
    if (selectedId === id) setSelectedId(null);
  }

  function updateNode(id, updater) {
    setTree(prev => {
      const next = clone(prev);
      const result = findNode(next, id);
      if (!result) return prev;
      const { node } = result;
      const updated = typeof updater === 'function' ? updater(node) : { ...node, ...updater };
      Object.assign(node, updated);
      return next;
    });
  }

  const suggestions = useMemo(() => computeSuggestions(tree), [tree]);

  const updateNodePosition = (id, x, y) => {
    setTree(prev => prev.map(node => 
      node.id === id 
        ? { ...node, position: { x, y } }
        : node
    ));
  };

  const loadComponent = (componentData) => {
    // Clear current canvas and load the saved component
    setTree(componentData.tree);
    setSelectedId(null);
  };

  const resetCanvas = () => {
    setTree([]);
    setSelectedId(null);
  };

  return {
    tree,
    selectedId,
    selectedNode,
    setSelectedId,
    addNode,
    removeNode,
    updateNode,
    suggestions,
    CONTAINER_TYPES,
    reorderRoot: (oldIndex, newIndex) => {
      setTree(prev => {
        if (oldIndex === newIndex) return prev;
        const next = [...prev];
        const [moved] = next.splice(oldIndex, 1);
        next.splice(newIndex, 0, moved);
        return next;
      });
    },
    reorderWithin: (parentId, oldIndex, newIndex) => {
      setTree(prev => {
        if (oldIndex === newIndex) return prev;
        if (!parentId) {
          const next = [...prev];
          const [moved] = next.splice(oldIndex, 1);
          next.splice(newIndex, 0, moved);
          return next;
        }
        const next = clone(prev);
        const result = findNode(next, parentId);
        if (!result?.node?.children) return prev;
        const list = result.node.children;
        const [moved] = list.splice(oldIndex, 1);
        list.splice(newIndex, 0, moved);
        return next;
      });
    },
    moveBetween: (sourceParentId, sourceIndex, targetParentId, targetIndex) => {
      setTree(prev => {
        const next = clone(prev);
        const sourceList = sourceParentId ? (findNode(next, sourceParentId)?.node?.children || []) : next;
        const targetList = targetParentId ? (findNode(next, targetParentId)?.node?.children || []) : next;
        if (!sourceList.length || !targetList) return prev;
        const [moved] = sourceList.splice(sourceIndex, 1);
        const insertAt = typeof targetIndex === 'number' ? targetIndex : targetList.length;
        targetList.splice(insertAt, 0, moved);
        return next;
      });
    },
    updateNodePosition,
    loadComponent,
    resetCanvas,
    getChildIds: (parentId) => {
      if (!parentId) return tree.map(n => n.id);
      const res = findNode(tree, parentId);
      const list = res?.node?.children || [];
      return list.map(n => n.id);
    },
    locate: (id) => {
      const res = findNode(tree, id);
      if (!res) return null;
      const parentId = res.parent ? res.parent.list[res.parent.index]?.id ?? null : null;
      // The above is not correct: parent.list[parent.index] is the node itself; we want parent container id. We compute by searching one level above via indexPath.
      const index = res.parent?.index ?? tree.findIndex(n => n.id === id);
      let containerId = null;
      if (res.indexPath && res.indexPath.length > 1) {
        // indexPath points to indexes from root to this node; the container is the node at indexPath without last index
        const path = res.indexPath.slice(0, -1);
        let cursor = { children: tree };
        for (const pi of path) {
          cursor = (cursor.children || [])[pi];
        }
        containerId = cursor?.id || null;
      }
      return { parentId: containerId, index };
    }
  };
}

function createNode(type) {
  const id = nanoid();
  switch (type) {
    case 'Form':
      return { id, type, label: 'Form', props: { title: 'Login Form', submitLabel: 'Login' }, children: [], position: { x: 0, y: 0 } };
    case 'Card':
      return { id, type, label: 'Card', props: { title: 'Card', name: 'card-1' }, children: [], position: { x: 0, y: 0 } };
    case 'Label':
      return { id, type, label: 'Label', props: { text: 'Label' }, children: [], position: { x: 0, y: 0 } };
    case 'Logo':
      return {
        id: nanoid(),
        type: 'Logo',
        props: {
          text: 'LOGO',
          size: 'medium',
          displayType: 'text',
          imageUrl: '',
          altText: ''
        },
        position: { x: 0, y: 0 }
      };
    case 'Input':
      return { id, type, label: 'Input', props: { name: 'username', placeholder: 'Username' }, children: [], position: { x: 0, y: 0 } };
    case 'PasswordInput':
      return { id, type, label: 'Password', props: { name: 'password', placeholder: 'Password', type: 'password' }, children: [], position: { x: 0, y: 0 } };
    case 'Button':
      return { id, type, label: 'Button', props: { text: 'Submit', variant: 'primary' }, children: [], position: { x: 0, y: 0 } };
    default:
      return { id, type: 'Box', label: 'Box', props: {}, children: [], position: { x: 0, y: 0 } };
  }
}

function findNode(nodes, id) {
  if (!id) return null;
  let parent = null;
  let indexPath = [];
  function dfs(list, path) {
    for (let i = 0; i < list.length; i += 1) {
      const n = list[i];
      const nextPath = [...path, i];
      if (n.id === id) {
        parent = { list, index: i };
        indexPath = nextPath;
        return { node: n, parent, indexPath };
      }
      if (n.children && n.children.length) {
        const r = dfs(n.children, nextPath);
        if (r) return r;
      }
    }
    return null;
  }
  const result = dfs(nodes, []);
  return result;
}

function removeNodeFromTree(nodes, id) {
  const next = [];
  for (const n of nodes) {
    if (n.id === id) continue;
    const copy = { ...n };
    if (n.children && n.children.length) {
      copy.children = removeNodeFromTree(n.children, id);
    }
    next.push(copy);
  }
  return next;
}

function clone(x) {
  return JSON.parse(JSON.stringify(x));
}

function computeSuggestions(tree) {
  const flat = [];
  function walk(nodes) {
    for (const n of nodes) {
      flat.push(n);
      if (n.children?.length) walk(n.children);
    }
  }
  walk(tree);

  const groups = new Map();
  for (const n of flat) {
    const key = suggestionKey(n);
    const list = groups.get(key) || [];
    list.push(n);
    groups.set(key, list);
  }
  const suggestions = [];
  for (const [key, items] of groups) {
    if (items.length >= 2) {
      const [type] = key.split('|');
      suggestions.push({ key, type, count: items.length, nodes: items });
    }
  }
  return suggestions;
}

function suggestionKey(node) {
  switch (node.type) {
    case 'Label':
      return `Label|${(node.props?.text || '').toLowerCase()}`;
    case 'Input':
      return `Input|${(node.props?.placeholder || '').toLowerCase()}`;
    case 'PasswordInput':
      return `PasswordInput|${(node.props?.placeholder || '').toLowerCase()}`;
    case 'Button':
      return `Button|${(node.props?.text || '').toLowerCase()}|${node.props?.variant || 'primary'}`;
    default:
      return `${node.type}|`;
  }
}

export function isContainerType(type) {
  return CONTAINER_TYPES.has(type);
}


