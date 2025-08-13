import { useMemo, useState } from "react";
import { nanoid } from "nanoid";

const CONTAINER_TYPES = new Set(["Form", "Card"]);

export function useDesignerState() {
  const [tree, setTree] = useState([]);
  const [selectedId, setSelectedId] = useState(null);

  const selectedNode = useMemo(() => {
    // We use a memoized value here so it doesn't re-calculate unless the tree or selectedId changes.
    return findNode(tree, selectedId)?.node ?? null;
  }, [tree, selectedId]);

  function addNode(type, targetId = null) {
    const node = createNode(type);
    setTree((prev) => {
      // If there's no target, add the node to the root of the tree
      if (!targetId) return [...prev, node];

      // Find the target node in the tree
      const targetResult = findNode(prev, targetId);
      const target = targetResult?.node;

      // If target exists and is a container, add the new node as a child
      if (target && CONTAINER_TYPES.has(target.type)) {
        const next = clone(prev);
        const { node: targetNext } = findNode(next, targetId);
        targetNext.children.push(node);
        return next;
      }

      // If the target is not a container, just add the new node to the root.
      return [...prev, node];
    });
    setSelectedId(node.id);
  }

  function removeNode(id) {
    setTree((prev) => removeNodeFromTree(prev, id));
    if (selectedId === id) setSelectedId(null);
  }

  function updateNode(id, updater) {
    setTree((prev) => {
      const next = clone(prev);
      const result = findNode(next, id);
      if (!result) return prev;
      const { node } = result;
      const updated =
        typeof updater === "function" ? updater(node) : { ...node, ...updater };
      Object.assign(node, updated);
      return next;
    });
  }

  const suggestions = useMemo(() => computeSuggestions(tree), [tree]);

  const updateNodePosition = (id, x, y) => {
    setTree((prev) =>
      prev.map((node) =>
        node.id === id ? { ...node, position: { x, y } } : node
      )
    );
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
      setTree((prev) => {
        if (oldIndex === newIndex) return prev;
        const next = [...prev];
        const [moved] = next.splice(oldIndex, 1);
        next.splice(newIndex, 0, moved);
        return next;
      });
    },
    reorderWithin: (parentId, oldIndex, newIndex) => {
      setTree((prev) => {
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
      setTree((prev) => {
        const next = clone(prev);
        // Get the source list (root or children of a container)
        const sourceList = sourceParentId
          ? findNode(next, sourceParentId)?.node?.children || []
          : next;
        // Get the target list (root or children of a container)
        const targetList = targetParentId
          ? findNode(next, targetParentId)?.node?.children || []
          : next;

        // If either list is invalid, return the previous state
        if (!sourceList.length || !targetList) return prev;

        // Remove the moved node from the source list
        const [moved] = sourceList.splice(sourceIndex, 1);
        // Insert the node into the target list
        const insertAt =
          typeof targetIndex === "number" ? targetIndex : targetList.length;
        targetList.splice(insertAt, 0, moved);
        return next;
      });
    },
    updateNodePosition,
    loadComponent,
    resetCanvas,
    getChildIds: (parentId) => {
      if (!parentId) return tree.map((n) => n.id);
      const res = findNode(tree, parentId);
      const list = res?.node?.children || [];
      return list.map((n) => n.id);
    },
    locate: (id) => {
      const res = findNode(tree, id);
      if (!res) return null;

      const { indexPath } = res;
      let parentId = null;
      let index = indexPath[indexPath.length - 1]; // Index is always the last element in the path

      // If the node is not at the root level, find its parent's id
      if (indexPath.length > 1) {
        const parentIndexPath = indexPath.slice(0, -1);
        let cursor = { children: tree };
        for (const i of parentIndexPath) {
          cursor = (cursor.children || [])[i];
        }
        parentId = cursor?.id || null;
      }

      return { parentId, index };
    },
  };
}

function createNode(type) {
  const id = nanoid();
  switch (type) {
    case "Form":
      return {
        id,
        type,
        label: "Form",
        props: { title: "Login Form", submitLabel: "Login" },
        children: [],
        position: { x: 0, y: 0 },
      };
    case "Card":
      return {
        id,
        type,
        label: "Card",
        props: { title: "Card", name: "card-1" },
        children: [],
        position: { x: 0, y: 0 },
      };
    case "Label":
      return {
        id,
        type,
        label: "Label",
        props: { text: "Label" },
        children: [],
        position: { x: 0, y: 0 },
      };
    case "Logo":
      return {
        id: nanoid(),
        type: "Logo",
        props: {
          text: "LOGO",
          size: "medium",
          displayType: "text",
          imageUrl: "",
          altText: "",
        },
        position: { x: 0, y: 0 },
      };
    case "Input":
      return {
        id,
        type,
        label: "Input",
        props: { name: "username", placeholder: "Username" },
        children: [],
        position: { x: 0, y: 0 },
      };
    case "PasswordInput":
      return {
        id,
        type,
        label: "Password",
        props: { name: "password", placeholder: "Password", type: "password" },
        children: [],
        position: { x: 0, y: 0 },
      };
    case "Button":
      return {
        id,
        type,
        label: "Button",
        props: { text: "Submit", variant: "primary" },
        children: [],
        position: { x: 0, y: 0 },
      };
    default:
      return {
        id,
        type: "Box",
        label: "Box",
        props: {},
        children: [],
        position: { x: 0, y: 0 },
      };
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
      const [type] = key.split("|");
      suggestions.push({ key, type, count: items.length, nodes: items });
    }
  }
  return suggestions;
}

function suggestionKey(node) {
  switch (node.type) {
    case "Label":
      return `Label|${(node.props?.text || "").toLowerCase()}`;
    case "Input":
      return `Input|${(node.props?.placeholder || "").toLowerCase()}`;
    case "PasswordInput":
      return `PasswordInput|${(node.props?.placeholder || "").toLowerCase()}`;
    case "Button":
      return `Button|${(node.props?.text || "").toLowerCase()}|${
        node.props?.variant || "primary"
      }`;
    default:
      return `${node.type}|`;
  }
}

export function isContainerType(type) {
  return CONTAINER_TYPES.has(type);
}
