import React, { useEffect } from "react";
import "./App.css";
import Palette from "./components/Palette";
import Canvas from "./components/Canvas";
import Inspector from "./components/Inspector";
import Suggestions from "./components/Suggestions";
import ComponentManager from "./components/ComponentManager";
import { useDesignerState } from "./hooks/useDesignerState";
import {
  DndContext,
  useSensors,
  useSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
} from "@dnd-kit/core";

export default function App() {
  const {
    tree,
    selectedId,
    selectedNode,
    setSelectedId,
    addNode,
    removeNode,
    updateNode,
    suggestions,
    reorderWithin,
    locate,
    getChildIds,
    moveBetween,
    updateNodePosition,
    loadComponent,
  } = useDesignerState();

  const [savedComponents, setSavedComponents] = React.useState([]);
  const [selectedLanguage, setSelectedLanguage] = React.useState("");

  const sensors = useSensors(useSensor(MouseSensor), useSensor(TouchSensor));

  useEffect(() => {
    setSelectedLanguage("reactjs");
  });

  const handleSaveComponent = (componentData) => {
    const next = [...savedComponents, componentData];
    setSavedComponents(next);
    localStorage.setItem("savedComponents", JSON.stringify(next));
  };

  const handleQuickSave = () => {
    const name = prompt("Enter a name for this component");
    if (!name) return;
    handleSaveComponent({
      id: Date.now().toString(),
      name,
      tree: JSON.parse(JSON.stringify(tree)),
      createdAt: new Date().toISOString(),
      language: selectedLanguage,
    });
    alert("Saved!");
  };

  const handleLoadComponent = (component) => {
    loadComponent(component);
    alert(`Component "${component.name}" loaded successfully!`);
  };

  const handleDeleteComponent = (id) => {
    const next = savedComponents.filter((c) => c.id !== id);
    setSavedComponents(next);
    localStorage.setItem("savedComponents", JSON.stringify(next));
  };

  React.useEffect(() => {
    const saved = localStorage.getItem("savedComponents");
    if (saved) {
      try {
        setSavedComponents(JSON.parse(saved));
      } catch {}
    }
  }, []);

  return (
    <div className="app-shell">
      <div
        className="panel app-header"
        style={{
          marginTop: 2,
          marginBottom: 7,
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <h1
          style={{
            fontSize: 26,
            fontWeight: 500,
            fontStyle: "italic",
            marginLeft: 16,
            marginTop: 9,
            marginBottom: 4,
            alignItems: "center",
          }}
        >
          UI Builder
        </h1>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={(event) => {
          const { active, over } = event;
          if (!over) return;
          const activeData = active?.data?.current;
          const overId = over.id;

          // New from palette
          if (active.id.toString().startsWith("palette-") && activeData?.type) {
            const targetId = overId === "canvas-root" ? null : String(overId);
            // Drop on canvas root → create at mouse position
            if (overId === "canvas-root") {
              const rect = event.activatorEvent?.target
                ?.closest(".canvas")
                ?.getBoundingClientRect();
              if (rect) {
                const x = event.activatorEvent.clientX - rect.left;
                const y = event.activatorEvent.clientY - rect.top;
                addNode(activeData.type, targetId);
                const newNodeId = tree[tree.length - 1]?.id;
                if (newNodeId) updateNodePosition(newNodeId, x, y);
                return;
              }
            }
            // Drop on container → append as child
            addNode(activeData.type, targetId);
            return;
          }

          const activeId = String(active.id);
          const source = locate(activeId);

          // Dropped over a container's child → reorder/move within/between containers
          const overData = over.data?.current;
          if (overData?.kind === "container-child") {
            const targetId = String(over.id);
            const targetInfo = locate(targetId);
            if (!source || !targetInfo) return;
            const sameParent =
              (source.parentId || null) === (targetInfo.parentId || null);
            if (sameParent) {
              reorderWithin(
                targetInfo.parentId || null,
                source.index,
                targetInfo.index
              );
            } else {
              moveBetween(
                source.parentId || null,
                source.index,
                targetInfo.parentId || null,
                targetInfo.index
              );
            }
            return;
          }

          // Dropped over a container (Form/Card) itself → append to end
          if (overId && overId !== "canvas-root") {
            const targetParentId = String(overId);
            const targetListIds = getChildIds(targetParentId) || [];
            const targetIndex = targetListIds.length;
            if (source) {
              moveBetween(
                source.parentId || null,
                source.index,
                targetParentId,
                targetIndex
              );
              return;
            }
          }

          // Move on canvas (root) by delta
          if (overId === "canvas-root") {
            const rect = event.activatorEvent?.target
              ?.closest(".canvas")
              ?.getBoundingClientRect();
            if (rect) {
              const delta = event.delta;
              const currentPosition = tree.find((n) => n.id === activeId)
                ?.position || { x: 0, y: 0 };
              const x = Math.max(0, currentPosition.x + delta.x);
              const y = Math.max(0, currentPosition.y + delta.y);
              updateNodePosition(activeId, x, y);
              return;
            }
          }
        }}
      >
        <Palette onAdd={(type) => addNode(type)} />
        <Canvas tree={tree} selectedId={selectedId} onSelect={setSelectedId} />
      </DndContext>

      <EventBridge onReorder={reorderWithin} />

      <div>
        <Inspector
          node={selectedNode}
          onUpdate={(partial) => {
            if (!selectedId) return;
            updateNode(selectedId, (n) => ({ ...n, ...partial }));
          }}
          onRemove={removeNode}
        />
        <div style={{ height: 12 }} />
        <ComponentManager
          tree={tree}
          onSaveComponent={handleSaveComponent}
          onLoadComponent={handleLoadComponent}
          onDeleteComponent={handleDeleteComponent}
          savedComponents={savedComponents}
        />
        <div style={{ height: 12 }} />
        <Suggestions suggestions={suggestions} />
      </div>
    </div>
  );
}

function EventBridge({ onReorder }) {
  React.useEffect(() => {
    function handler(e) {
      const { parentId, oldIndex, newIndex } = e.detail || {};
      if (typeof oldIndex === "number" && typeof newIndex === "number") {
        onReorder(parentId, oldIndex, newIndex);
      }
    }
    window.addEventListener("reorder-request", handler);
    return () => window.removeEventListener("reorder-request", handler);
  }, [onReorder]);
  return null;
}
