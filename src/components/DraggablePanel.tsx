import { useState } from "react";
import { motion } from "framer-motion";

interface DraggablePanelProps {
  children: React.ReactNode;
  defaultPosition: { x: number; y: number };
  disabled?: boolean;
}

export default function DraggablePanel({
  children,
  defaultPosition,
  disabled,
}: DraggablePanelProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <motion.div
      drag={!disabled}
      dragMomentum={false}
      initial={defaultPosition}
      className="absolute top-0 left-0 z-50"
    >
      {children}
    </motion.div>
  );
}
