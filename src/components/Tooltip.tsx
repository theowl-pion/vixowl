import { useState, useRef, useEffect } from "react";

interface TooltipProps {
  children: React.ReactNode;
  content: string;
  position?: "top" | "bottom" | "left" | "right";
  delay?: number; // Delay in ms before showing tooltip
  className?: string;
}

export default function Tooltip({
  children,
  content,
  position = "top",
  delay = 300,
  className = "",
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const childRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const calculatePosition = () => {
    if (!childRef.current || !tooltipRef.current) return;

    const childRect = childRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();

    let top = 0;
    let left = 0;

    switch (position) {
      case "top":
        top = childRect.top - tooltipRect.height - 8;
        left = childRect.left + childRect.width / 2 - tooltipRect.width / 2;
        break;
      case "bottom":
        top = childRect.bottom + 8;
        left = childRect.left + childRect.width / 2 - tooltipRect.width / 2;
        break;
      case "left":
        top = childRect.top + childRect.height / 2 - tooltipRect.height / 2;
        left = childRect.left - tooltipRect.width - 8;
        break;
      case "right":
        top = childRect.top + childRect.height / 2 - tooltipRect.height / 2;
        left = childRect.right + 8;
        break;
    }

    // Ensure tooltip stays within viewport
    if (left < 10) left = 10;
    if (left + tooltipRect.width > window.innerWidth - 10) {
      left = window.innerWidth - tooltipRect.width - 10;
    }
    if (top < 10) top = 10;
    if (top + tooltipRect.height > window.innerHeight - 10) {
      top = window.innerHeight - tooltipRect.height - 10;
    }

    setTooltipPosition({ top, left });
  };

  const handleMouseEnter = () => {
    timerRef.current = setTimeout(() => {
      setIsVisible(true);
      // Calculate position after a small delay to ensure tooltip is rendered
      setTimeout(calculatePosition, 0);
    }, delay);
  };

  const handleMouseLeave = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setIsVisible(false);
  };

  // Recalculate position if window is resized
  useEffect(() => {
    if (isVisible) {
      window.addEventListener("resize", calculatePosition);
      return () => window.removeEventListener("resize", calculatePosition);
    }
  }, [isVisible]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return (
    <div
      className={`relative inline-block ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      ref={childRef}
    >
      {children}

      {isVisible && (
        <div
          ref={tooltipRef}
          className="fixed z-50 px-3 py-2 text-sm text-white bg-[#1A1A1A] rounded-lg shadow-lg border border-[#CDFF63]/30 max-w-xs pointer-events-none animate-fadeIn"
          style={{
            top: `${tooltipPosition.top}px`,
            left: `${tooltipPosition.left}px`,
          }}
        >
          {content}
          <div
            className={`absolute w-2 h-2 bg-[#1A1A1A] transform rotate-45 border-[#CDFF63]/30
              ${
                position === "bottom"
                  ? "top-[-4px] left-1/2 ml-[-4px] border-t border-l"
                  : ""
              }
              ${
                position === "top"
                  ? "bottom-[-4px] left-1/2 ml-[-4px] border-r border-b"
                  : ""
              }
              ${
                position === "left"
                  ? "right-[-4px] top-1/2 mt-[-4px] border-t border-r"
                  : ""
              }
              ${
                position === "right"
                  ? "left-[-4px] top-1/2 mt-[-4px] border-b border-l"
                  : ""
              }
            `}
          />
        </div>
      )}
    </div>
  );
}
