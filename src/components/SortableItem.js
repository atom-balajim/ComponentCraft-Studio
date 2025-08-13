import React from 'react';
import { useSortable } from '@dnd-kit/sortable';

export default function SortableItem({ id, parentId, children }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id, data: { parentId: parentId ?? null } });
  const style = {
    transform: transform
      ? `translate3d(${Math.round(transform.x)}px, ${Math.round(transform.y)}px, 0) ` +
        `scaleX(${transform.scaleX ?? 1}) scaleY(${transform.scaleY ?? 1})`
      : undefined,
    transition,
  };
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </div>
  );
}


