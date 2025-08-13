import React, { useEffect, useState } from "react";
import cx from "classnames";
import { useDroppable, useDraggable } from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

export default function Canvas({ tree, selectedId, onSelect }) {
  const rootDrop = useDroppable({ id: "canvas-root" });
  const [canvasHeight, setCanvasHeight] = useState(500);

  console.log("canvasHeight", canvasHeight);

  // Calculate dynamic canvas height based on content
  const calculateCanvasHeight = () => {
    if (tree.length === 0) return 500; // Default height for empty canvas

    let maxY = 0;
    tree.forEach((node) => {
      // Prefer user-defined height when available, otherwise use sensible defaults per type
      let defaultHeight = 100;
      if (node.type === "Form") defaultHeight = 300;
      else if (node.type === "Card") defaultHeight = 200;
      else if (
        node.type === "Input" ||
        node.type === "PasswordInput" ||
        node.type === "Label" ||
        node.type === "Button"
      )
        defaultHeight = 60;
      const nodeHeight =
        typeof node.props?.height === "number"
          ? node.props.height
          : defaultHeight;
      const nodeBottom = (node.position?.y || 0) + nodeHeight;
      maxY = Math.max(maxY, nodeBottom);
    });

    // Add padding and ensure minimum height
    return Math.max(500, maxY + 100);
  };

  useEffect(() => {
    setCanvasHeight(calculateCanvasHeight());
  }, [tree]);

  return (
    <div className="panel canvas-panel">
      <div className="panel-title">Canvas</div>
      <div className="panel-body">
        <div
          ref={rootDrop.setNodeRef}
          className={cx("canvas", { "drop-target-hint": rootDrop.isOver })}
        >
          {tree.length === 0 && (
            <div className="muted">
              Drag from palette to add. Drag components to move them around.
            </div>
          )}
          {tree.map((node) => (
            <Node
              key={node.id}
              node={node}
              selectedId={selectedId}
              onSelect={onSelect}
              insideParent={false}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function Node({ node, selectedId, onSelect, insideParent }) {
  const isSelected = node.id === selectedId;
  const { isOver, setNodeRef: setDroppableRef } = useDroppable({ id: node.id });
  const isContainer = node.type === "Form" || node.type === "Card";

  // Draggable only when not inside a container (free placement on canvas)
  const enableDrag = !insideParent;
  const draggable = useDraggable({
    id: node.id,
    data: { type: "existing-node" },
  });

  const position = node.position || { x: 0, y: 0 };

  const setRefs = (element) => {
    setDroppableRef(element);
    if (enableDrag) draggable.setNodeRef(element);
  };

  const handleClick = (e) => {
    e.stopPropagation(); // Prevent bubbling to parent elements
    if (typeof onSelect === "function") {
      onSelect(node.id);
    }
  };

  return (
    <div
      ref={setRefs}
      {...(enableDrag ? draggable.attributes : {})}
      className={cx("node", {
        "node-container": isContainer,
        "node-card": node.type === "Card",
        "node-form": node.type === "Form",
        "node-field": !isContainer,
        selected: isSelected,
        "drop-target-hint": isOver,
        dragging: enableDrag && draggable.isDragging,
      })}
      style={{
        position: enableDrag ? "absolute" : "relative",
        left: enableDrag ? position.x : undefined,
        top: enableDrag ? position.y : undefined,
        zIndex: enableDrag && draggable.isDragging ? 100 : isSelected ? 10 : 1,
        cursor: enableDrag ? "pointer" : "default",
        opacity: enableDrag && draggable.isDragging ? 0.8 : 1,
        transform: enableDrag
          ? draggable.isDragging
            ? "rotate(2deg) scale(1.06)"
            : "none"
          : undefined,
        transition:
          enableDrag && draggable.isDragging ? "none" : "all 0.2s ease",
        width:
          typeof node.props?.width === "number"
            ? node.props.width
            : isContainer
            ? "min(100%, 360px)"
            : undefined,
        minHeight: isContainer
          ? typeof node.props?.height === "number"
            ? node.props.height
            : 120
          : undefined,
        height:
          !isContainer && typeof node.props?.height === "number"
            ? node.props.height
            : undefined,
        backgroundColor: node.props?.backgroundColor,
      }}
      onClick={handleClick}
    >
      {/* Drag handle for draggable nodes */}
      {enableDrag && (
        <div
          {...draggable.listeners}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "20px",
            cursor: "move",
            zIndex: 2,
            backgroundColor: "rgba(96, 165, 250, 0.1)",
            borderBottom: "1px solid rgba(96, 165, 250, 0.3)",
          }}
        />
      )}
      {!isContainer && (
        <div className="node-header">
          <div className="node-title">
            {node.type === "Button" ? "Button" : node.label || node.type}{" "}
            <span className="chip">{node.type}</span>
          </div>
        </div>
      )}
      {renderPreview(node)}

      {isContainer && (
        <div className="node-children">
          <SortableContext
            items={(node.children || []).map((c) => c.id)}
            strategy={verticalListSortingStrategy}
          >
            {(node.children || []).map((child) => (
              <SortableChild
                key={child.id}
                parentId={node.id}
                child={child}
                selectedId={selectedId}
                onSelect={onSelect}
              />
            ))}
          </SortableContext>
          {(!node.children || node.children.length === 0) && (
            <div className="drop-hint">Drop components here</div>
          )}
        </div>
      )}
    </div>
  );
}

function SortableChild({ parentId, child, selectedId, onSelect }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: child.id,
    data: { kind: "container-child", parentId },
  });
  const translate = transform
    ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
    : "";
  const scale = isDragging ? " scale(1.06)" : "";
  const combinedTransform =
    translate || scale ? `${translate}${scale}` : undefined;
  const style = {
    transform: combinedTransform,
    transition,
    zIndex: isDragging ? 50 : "auto",
  };
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Node
        node={child}
        selectedId={selectedId}
        onSelect={onSelect}
        insideParent={true}
      />
    </div>
  );
}

function renderPreview(node) {
  switch (node.type) {
    case "Form":
      return (
        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 18 }}>
            {node.props?.title || "Login Form"}
          </div>
        </div>
      );
    case "Card":
      return (
        <div style={{ textAlign: "center", marginBottom: 8 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#64748b" }}>
            {node.props?.title || "Card"}
          </div>
        </div>
      );
    case "Logo":
      return (
        <div
          style={{
            textAlign: "center",
            margin: "16px auto",
            padding: "16px 20px",
            border: "2px solid #60a5fa",
            borderRadius: "12px",
            background:
              "linear-gradient(135deg, rgba(96, 165, 250, 0.05) 0%, rgba(96, 165, 250, 0.15) 100%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight:
              node.props?.size === "large"
                ? "140px"
                : node.props?.size === "small"
                ? "80px"
                : "110px",
            boxShadow: "0 2px 8px rgba(96, 165, 250, 0.1)",
            transition: "all 0.2s ease",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Background decorative elements */}
          <div
            style={{
              position: "absolute",
              top: "-20px",
              right: "-20px",
              width: "40px",
              height: "40px",
              background: "rgba(96, 165, 250, 0.1)",
              borderRadius: "50%",
              zIndex: 0,
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: "-15px",
              left: "-15px",
              width: "30px",
              height: "30px",
              background: "rgba(96, 165, 250, 0.08)",
              borderRadius: "50%",
              zIndex: 0,
            }}
          />

          {/* Logo content */}
          <div style={{ position: "relative", zIndex: 1 }}>
            {node.props?.displayType === "image" && node.props?.imageUrl ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <div
                  style={{
                    width:
                      node.props?.size === "large"
                        ? "120px"
                        : node.props?.size === "small"
                        ? "60px"
                        : "80px",
                    height:
                      node.props?.size === "large"
                        ? "120px"
                        : node.props?.size === "small"
                        ? "60px"
                        : "80px",
                    borderRadius: "8px",
                    overflow: "hidden",
                    border: "1px solid rgba(96, 165, 250, 0.2)",
                    background: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                  }}
                >
                  <img
                    src={node.props.imageUrl}
                    alt={node.props.altText || "Logo"}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                      borderRadius: "6px",
                    }}
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.nextSibling.style.display = "flex";
                    }}
                  />
                  {/* Fallback icon when image fails */}
                  <div
                    style={{
                      display: "none",
                      width: "100%",
                      height: "100%",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "rgba(96, 165, 250, 0.1)",
                      color: "#60a5fa",
                      fontSize:
                        node.props?.size === "large"
                          ? "24px"
                          : node.props?.size === "small"
                          ? "16px"
                          : "20px",
                    }}
                  >
                    🖼️
                  </div>
                </div>
                {/* Image caption */}
                {node.props?.altText && (
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#64748b",
                      fontStyle: "italic",
                      maxWidth: "100px",
                      textAlign: "center",
                    }}
                  >
                    {node.props.altText}
                  </div>
                )}
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                {/* Text logo with enhanced styling */}
                <div
                  style={{
                    fontSize:
                      node.props?.size === "large"
                        ? 36
                        : node.props?.size === "small"
                        ? 18
                        : 28,
                    fontWeight: "800",
                    color: "#1e40af",
                    textShadow: "0 1px 2px rgba(0, 0, 0, 0.1)",
                    letterSpacing: "0.5px",
                    background:
                      "linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  {node.props?.text || "LOGO"}
                </div>
                {/* Size indicator */}
                <div
                  style={{
                    fontSize: "10px",
                    color: "#94a3b8",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    fontWeight: "600",
                  }}
                >
                  {node.props?.size || "medium"}
                </div>
              </div>
            )}
          </div>

          {/* Corner badge */}
          <div
            style={{
              position: "absolute",
              top: "8px",
              right: "8px",
              background: "#60a5fa",
              color: "white",
              fontSize: "10px",
              padding: "2px 6px",
              borderRadius: "10px",
              fontWeight: "600",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            Logo
          </div>
        </div>
      );
    case "Label":
      return (
        <div
          style={{
            textAlign: "left",
            width: "100%",
            padding: "8px 12px",
            fontSize: "14px",
            color: "#374151",
            fontWeight: "500",
            height: "60px",
            display: "flex",
            alignItems: "center",
          }}
        >
          {node.props?.text || "Label Text"}
        </div>
      );
    case "Input":
      return (
        <input
          disabled
          placeholder={node.props?.placeholder || "Enter text..."}
          style={{
            width: "100%",
            height: "60px",
            padding: "8px 12px",
            border: "1px solid #d1d5db",
            borderRadius: "6px",
            fontSize: "14px",
            background: "white",
            color: "#374151",
            boxSizing: "border-box",
          }}
        />
      );
    case "PasswordInput":
      return (
        <input
          disabled
          type="password"
          placeholder={node.props?.placeholder || "Enter password..."}
          style={{
            width: "100%",
            height: "60px",
            padding: "8px 12px",
            border: "1px solid #d1d5db",
            borderRadius: "6px",
            fontSize: "14px",
            background: "white",
            color: "#374151",
            boxSizing: "border-box",
          }}
        />
      );
    case "Button":
      return (
        <button
          disabled
          className="btn"
          style={{
            padding: "8px 16px",
            fontSize: "14px",
            margin: "8px auto 0",
            display: "inline-block",
            minWidth: "100px",
            backgroundColor: node.props?.buttonBgColor || undefined,
            color: node.props?.buttonTextColor || undefined,
          }}
        >
          {node.props?.text || "Button"}
        </button>
      );
    default:
      return null;
  }
}
