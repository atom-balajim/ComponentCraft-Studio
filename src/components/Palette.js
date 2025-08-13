import React from "react";
import { useDraggable } from "@dnd-kit/core";

const items = [
  { type: "Form", description: "Container for fields and submit" },
  { type: "Input", description: "Text input" },
  { type: "PasswordInput", description: "Password input" },
  { type: "Button", description: "Clickable button" },
  { type: "Card", description: "Container with title" },
  { type: "Logo", description: "Company or app logo" },
  { type: "Label", description: "Text label" },
  { type: "Divider", description: "Horizontal line separator" },
  { type: "Spacer", description: "Vertical space component" },
  { type: "Icon", description: "Icon component" },
  { type: "Badge", description: "Status or notification badge" },
  { type: "Tooltip", description: "Hover information tooltip" },
];

export default function Palette({ onAdd }) {
  return (
    <div className="panel palette-panel">
      <div className="panel-title">Palette</div>
      <div className="panel-body">
        {items.map((it) => (
          <div key={it.type}>
            <DraggableCard type={it.type} description={it.description} />
            <div style={{ height: 6 }} />
            <button className="btn" onClick={() => onAdd(it.type)}>
              Add
            </button>
            <div style={{ height: 18 }} />
          </div>
        ))}
      </div>
      <div className="muted">
        Tip: Click Add to place a Button on the canvas. Drag to reorder within
        the canvas.
      </div>
    </div>
  );
}

function DraggableCard({ type, description }) {
  const { attributes, listeners, setNodeRef } = useDraggable({
    id: `palette-${type}`,
    data: { type },
  });
  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className="palette-item"
    >
      <div style={{ fontWeight: 600 }}>{type}</div>
      <small>{description}</small>
    </div>
  );
}
