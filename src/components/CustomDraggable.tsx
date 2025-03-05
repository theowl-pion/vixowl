// src/components/CustomDraggable.tsx

"use client";

import React, { useState, useEffect } from "react";

interface Props {
  children: React.ReactNode;
  initialPosition?: { x: number; y: number };
}

export default function CustomDraggable({ children, initialPosition }: Props) {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (initialPosition) {
      setPos(initialPosition);
    }
  }, [initialPosition]);

  const handlePointerDown = (e: React.PointerEvent) => {
    setDragging(true);
    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    setOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    target.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragging) return;

    const newX = e.clientX - offset.x;
    const newY = e.clientY - offset.y;

    // Prevent dragging outside viewport
    const maxX =
      window.innerWidth - (e.currentTarget as HTMLElement).offsetWidth;
    const maxY =
      window.innerHeight - (e.currentTarget as HTMLElement).offsetHeight;

    setPos({
      x: Math.max(0, Math.min(newX, maxX)),
      y: Math.max(0, Math.min(newY, maxY)),
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setDragging(false);
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  };

  return (
    <div
      style={{
        position: "absolute",
        left: pos.x,
        top: pos.y,
        cursor: dragging ? "grabbing" : "grab",
        userSelect: "none",
        touchAction: "none",
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {children}
    </div>
  );
}
