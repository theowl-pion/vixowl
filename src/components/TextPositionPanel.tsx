import { useState, useRef, useEffect } from "react";
import Tooltip from "./Tooltip";

interface TextUpdates {
  left?: number;
  top?: number;
  angle?: number;
  tilt?: number;
  verticalTilt?: number;
  perspective?: number;
  tiltX?: number;
  tiltY?: number;
  tiltZ?: number;
}

interface TextPositionPanelProps {
  updateTextObject: (updates: TextUpdates) => void;
  onLockChange: (locked: boolean) => void;
  isLocked: boolean;
  currentPosition: {
    x: number;
    y: number;
    rotation: number;
    tilt: number;
    verticalTilt: number;
    perspective: number;
    tiltX: number;
    tiltY: number;
    tiltZ: number;
  };
}

export default function TextPositionPanel({
  updateTextObject,
  onLockChange,
  isLocked,
  currentPosition,
}: TextPositionPanelProps) {
  const [isPanelVisible, setIsPanelVisible] = useState(true);
  const [position, setPosition] = useState({
    x: window.innerWidth - 370,
    y: 80,
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [activeTiltTab, setActiveTiltTab] = useState("basic"); // basic, advanced, 3d
  const [selectedPositionPreset, setSelectedPositionPreset] = useState<
    string | null
  >(null);
  const [selectedTiltPreset, setSelectedTiltPreset] = useState<string | null>(
    null
  );
  // Add state for collapsable sections
  const [isPresetPositionsCollapsed, setIsPresetPositionsCollapsed] =
    useState(false);
  const [isTiltPresetsCollapsed, setIsTiltPresetsCollapsed] = useState(false);
  const [isTiltControlsCollapsed, setIsTiltControlsCollapsed] = useState(false);

  const panelRef = useRef<HTMLDivElement>(null);

  // Preset positions
  const presetPositions = [
    { label: "Center", value: "center" },
    { label: "Top", value: "top" },
    { label: "Bottom", value: "bottom" },
    { label: "Left", value: "left" },
    { label: "Right", value: "right" },
  ];

  const applyPresetPosition = (preset: string) => {
    const positions: { [key: string]: TextUpdates } = {
      center: {
        left: 0,
        top: 0,
        angle: 0,
      },
      top: {
        left: 0,
        top: -200,
        angle: 0,
      },
      bottom: {
        left: 0,
        top: 200,
        angle: 0,
      },
      left: {
        left: -200,
        top: 0,
        angle: 0,
      },
      right: {
        left: 200,
        top: 0,
        angle: 0,
      },
    };

    setSelectedPositionPreset(preset);
    updateTextObject(positions[preset]);
  };

  // Preset tilt styles
  const presetTiltStyles = [
    {
      label: "Flat",
      value: "flat",
      updates: { tilt: 0, verticalTilt: 0, perspective: 0 },
      tooltip: "No tilt applied to text",
    },
    {
      label: "Italic",
      value: "italic",
      updates: { tilt: 15, verticalTilt: 0, perspective: 0 },
      tooltip: "Slant text to the right like italic font",
    },
    {
      label: "Reverse Italic",
      value: "reverse-italic",
      updates: { tilt: -15, verticalTilt: 0, perspective: 0 },
      tooltip: "Slant text to the left (reverse italic)",
    },
    {
      label: "Perspective",
      value: "perspective",
      updates: { tilt: 0, verticalTilt: 0, perspective: 500 },
      tooltip: "Add depth perspective to text",
    },
    {
      label: "Rising",
      value: "rising",
      updates: { tilt: 0, verticalTilt: 15, perspective: 0 },
      tooltip: "Text appears to rise upward",
    },
    {
      label: "Falling",
      value: "falling",
      updates: { tilt: 0, verticalTilt: -15, perspective: 0 },
      tooltip: "Text appears to fall downward",
    },
  ];

  const applyTiltStyle = (preset: TextUpdates, value: string) => {
    setSelectedTiltPreset(value);
    updateTextObject(preset);
  };

  // Handle mouse down for dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isLocked || !panelRef.current) return;

    const rect = panelRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    setIsDragging(true);
  };

  // Handle mouse move for dragging
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;

      // Calculate new position
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;

      // Apply bounds to keep panel within viewport
      const maxX = window.innerWidth - (panelRef.current?.offsetWidth || 250);
      const maxY = window.innerHeight - (panelRef.current?.offsetHeight || 300);

      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY)),
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  // Reset selected presets when position or tilt values change manually
  useEffect(() => {
    // Check if current values match any preset
    const matchesPositionPreset = presetPositions.some((preset) => {
      const presetValues = {
        center: { x: 0, y: 0 },
        top: { x: 0, y: -200 },
        bottom: { x: 0, y: 200 },
        left: { x: -200, y: 0 },
        right: { x: 200, y: 0 },
      }[preset.value];

      return (
        presetValues &&
        presetValues.x === currentPosition.x &&
        presetValues.y === currentPosition.y
      );
    });

    if (!matchesPositionPreset && selectedPositionPreset) {
      setSelectedPositionPreset(null);
    }

    const matchesTiltPreset = presetTiltStyles.some((preset) => {
      const updates = preset.updates;
      return (
        updates.tilt === currentPosition.tilt &&
        updates.verticalTilt === currentPosition.verticalTilt &&
        updates.perspective === currentPosition.perspective
      );
    });

    if (!matchesTiltPreset && selectedTiltPreset) {
      setSelectedTiltPreset(null);
    }
  }, [currentPosition, selectedPositionPreset, selectedTiltPreset]);

  return (
    <div
      ref={panelRef}
      className="absolute z-20"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        cursor: isDragging ? "grabbing" : "auto",
      }}
    >
      <div className="w-[300px] bg-[#1A1A1A]/95 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden shadow-2xl">
        {/* Header */}
        <div
          className={`flex items-center justify-between px-3 py-1.5 border-b border-white/10 bg-gradient-to-r from-black/40 to-black/20 ${
            !isLocked ? "cursor-grab" : ""
          }`}
          onMouseDown={handleMouseDown}
        >
          <div className="flex items-center">
            <div className="w-5 h-5 mr-2 flex items-center justify-center text-[#CDFF63]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-5 h-5"
              >
                <path
                  fillRule="evenodd"
                  d="M11.47 2.47a.75.75 0 0 1 1.06 0l3.75 3.75a.75.75 0 0 1-1.06 1.06l-2.47-2.47V21a.75.75 0 0 1-1.5 0V4.81L8.78 7.28a.75.75 0 0 1-1.06-1.06l3.75-3.75Z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <h2 className="text-white text-sm font-medium">Text Position</h2>
          </div>
          <Tooltip
            content={
              isLocked ? "Unlock panel to move it" : "Lock panel position"
            }
            position="bottom"
          >
            <button
              onClick={() => onLockChange(!isLocked)}
              className={`p-1 rounded-full transition-colors ${
                isLocked
                  ? "bg-[#CDFF63]/20 text-[#CDFF63]"
                  : "text-white/70 hover:text-white hover:bg-white/10"
              }`}
              aria-label={isLocked ? "Unlock Panel" : "Lock Panel"}
            >
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={
                    isLocked
                      ? "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      : "M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
                  }
                />
              </svg>
            </button>
          </Tooltip>
          <Tooltip
            content={isPanelVisible ? "Collapse panel" : "Expand panel"}
            position="bottom"
          >
            <button
              onClick={() => setIsPanelVisible(!isPanelVisible)}
              className="p-1 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors"
              aria-label={isPanelVisible ? "Collapse Panel" : "Expand Panel"}
            >
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={isPanelVisible ? "M19 9l-7 7-7-7" : "M9 5l7 7-7 7"}
                />
              </svg>
            </button>
          </Tooltip>
        </div>

        {/* Content */}
        {isPanelVisible && (
          <div className="p-2.5 space-y-2.5">
            {/* Preset Positions */}
            <div className="bg-black/20 rounded-lg p-3">
              <h3 className="text-white/90 text-xs font-medium mb-2 flex items-center justify-between">
                <div className="flex items-center">
                  <span className="inline-block w-3.5 h-3.5 mr-1.5 text-[#CDFF63]">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M11.47 2.47a.75.75 0 0 1 1.06 0l3.75 3.75a.75.75 0 0 1-1.06 1.06l-2.47-2.47V21a.75.75 0 0 1-1.5 0V4.81L8.78 7.28a.75.75 0 0 1-1.06-1.06l3.75-3.75Z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                  PRESET POSITIONS
                </div>
                <button
                  onClick={() =>
                    setIsPresetPositionsCollapsed(!isPresetPositionsCollapsed)
                  }
                  className="p-0.5 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                  aria-label={
                    isPresetPositionsCollapsed
                      ? "Expand Preset Positions"
                      : "Collapse Preset Positions"
                  }
                >
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d={
                        isPresetPositionsCollapsed
                          ? "M9 5l7 7-7 7"
                          : "M19 9l-7 7-7-7"
                      }
                    />
                  </svg>
                </button>
              </h3>
              {!isPresetPositionsCollapsed && (
                <div className="flex gap-1 flex-wrap">
                  {presetPositions.map((preset) => (
                    <Tooltip
                      key={preset.value}
                      content={`Position text at the ${preset.label.toLowerCase()} of the image`}
                      position="top"
                    >
                      <button
                        onClick={() => applyPresetPosition(preset.value)}
                        className={`px-2.5 py-0.5 text-white text-xs rounded-lg transition-colors ${
                          selectedPositionPreset === preset.value
                            ? "bg-[#CDFF63]/20 text-[#CDFF63] border border-[#CDFF63]/30"
                            : "bg-black/30 hover:bg-black/40 border border-white/5"
                        }`}
                      >
                        {preset.label}
                      </button>
                    </Tooltip>
                  ))}
                </div>
              )}
            </div>

            {/* Position Controls */}
            <div className="bg-black/20 rounded-lg p-3">
              <h3 className="text-white/90 text-xs font-medium mb-2 flex items-center">
                <span className="inline-block w-3.5 h-3.5 mr-1.5 text-[#CDFF63]">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm4.28 10.28a.75.75 0 000-1.06l-3-3a.75.75 0 10-1.06 1.06l1.72 1.72H8.25a.75.75 0 000 1.5h5.69l-1.72 1.72a.75.75 0 101.06 1.06l3-3z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
                POSITION
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {/* X Position */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <Tooltip content="Adjust horizontal position of text">
                      <label className="text-white/80 text-xs font-medium cursor-help">
                        X Position
                      </label>
                    </Tooltip>
                    <span className="text-white text-xs font-mono bg-black/30 px-1.5 py-0.5 rounded">
                      {currentPosition.x}px
                    </span>
                  </div>
                  <div className="relative h-5 flex items-center">
                    <input
                      type="range"
                      min="-500"
                      max="500"
                      value={currentPosition.x}
                      onChange={(e) =>
                        updateTextObject({ left: parseInt(e.target.value) })
                      }
                      className="w-full appearance-none bg-transparent [&::-webkit-slider-runnable-track]:h-1 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-white/10 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#CDFF63] [&::-webkit-slider-thumb]:mt-[-5px] [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer hover:[&::-webkit-slider-thumb]:bg-white"
                      aria-label="X Position"
                    />
                    <div
                      className="absolute pointer-events-none h-1 rounded-full bg-gradient-to-r from-[#CDFF63]/30 to-[#CDFF63] top-1/2 transform -translate-y-1/2"
                      style={{
                        width: `${
                          ((currentPosition.x - -500) / (500 - -500)) * 100
                        }%`,
                        left: 0,
                      }}
                    ></div>
                  </div>
                </div>

                {/* Y Position */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <Tooltip content="Adjust vertical position of text">
                      <label className="text-white/80 text-xs font-medium cursor-help">
                        Y Position
                      </label>
                    </Tooltip>
                    <span className="text-white text-xs font-mono bg-black/30 px-1.5 py-0.5 rounded">
                      {currentPosition.y}px
                    </span>
                  </div>
                  <div className="relative h-5 flex items-center">
                    <input
                      type="range"
                      min="-500"
                      max="500"
                      value={currentPosition.y}
                      onChange={(e) =>
                        updateTextObject({ top: parseInt(e.target.value) })
                      }
                      className="w-full appearance-none bg-transparent [&::-webkit-slider-runnable-track]:h-1 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-white/10 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#CDFF63] [&::-webkit-slider-thumb]:mt-[-5px] [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer hover:[&::-webkit-slider-thumb]:bg-white"
                      aria-label="Y Position"
                    />
                    <div
                      className="absolute pointer-events-none h-1 rounded-full bg-gradient-to-r from-[#CDFF63]/30 to-[#CDFF63] top-1/2 transform -translate-y-1/2"
                      style={{
                        width: `${
                          ((currentPosition.y - -500) / (500 - -500)) * 100
                        }%`,
                        left: 0,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Rotation */}
            <div className="bg-black/20 rounded-lg p-3">
              <h3 className="text-white/90 text-xs font-medium mb-2 flex items-center">
                <span className="inline-block w-3.5 h-3.5 mr-1.5 text-[#CDFF63]">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.755 10.059a7.5 7.5 0 0 1 12.548-3.364l1.903 1.903h-3.183a.75.75 0 1 0 0 1.5h4.992a.75.75 0 0 0 .75-.75V4.356a.75.75 0 0 0-1.5 0v3.18l-1.9-1.9A9 9 0 0 0 3.306 9.67a.75.75 0 1 0 1.45.388Zm15.408 3.352a.75.75 0 0 0-.919.53 7.5 7.5 0 0 1-12.548 3.364l-1.902-1.903h3.183a.75.75 0 0 0 0-1.5H2.984a.75.75 0 0 0-.75.75v4.992a.75.75 0 0 0 1.5 0v-3.18l1.9 1.9a9 9 0 0 0 15.059-4.035.75.75 0 0 0-.53-.918Z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
                ROTATION
              </h3>
              <div className="mb-1">
                <div className="flex justify-between items-center mb-1">
                  <Tooltip content="Rotate text around its center point">
                    <label className="text-white/80 text-xs font-medium cursor-help">
                      Angle
                    </label>
                  </Tooltip>
                  <span className="text-white text-xs font-mono bg-black/30 px-1.5 py-0.5 rounded">
                    {currentPosition.rotation}°
                  </span>
                </div>
                <div className="relative h-5 flex items-center">
                  <input
                    type="range"
                    min="-180"
                    max="180"
                    value={currentPosition.rotation}
                    onChange={(e) =>
                      updateTextObject({ angle: parseInt(e.target.value) })
                    }
                    className="w-full appearance-none bg-transparent [&::-webkit-slider-runnable-track]:h-1 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-white/10 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#CDFF63] [&::-webkit-slider-thumb]:mt-[-5px] [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer hover:[&::-webkit-slider-thumb]:bg-white"
                    aria-label="Rotation"
                  />
                  <div
                    className="absolute pointer-events-none h-1 rounded-full bg-gradient-to-r from-[#CDFF63]/30 to-[#CDFF63] top-1/2 transform -translate-y-1/2"
                    style={{
                      width: `${
                        ((currentPosition.rotation - -180) / (180 - -180)) * 100
                      }%`,
                      left: 0,
                    }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Tilt Presets */}
            <div className="bg-black/20 rounded-lg p-3">
              <h3 className="text-white/90 text-xs font-medium mb-2 flex items-center justify-between">
                <div className="flex items-center">
                  <span className="inline-block w-3.5 h-3.5 mr-1.5 text-[#CDFF63]">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M20.599 1.5c-.376 0-.743.111-1.055.32l-5.08 3.385a18.747 18.747 0 0 0-3.471 2.987 10.04 10.04 0 0 1 4.815 4.815 18.748 18.748 0 0 0 2.987-3.472l3.386-5.079A1.902 1.902 0 0 0 20.599 1.5Zm-8.3 14.025a18.76 18.76 0 0 0 1.896-1.207 8.026 8.026 0 0 0-4.513-4.513A18.75 18.75 0 0 0 8.475 11.7l-.278.5a5.26 5.26 0 0 1 3.601 3.602l.502-.278ZM6.75 13.5A3.75 3.75 0 0 0 3 17.25a1.5 1.5 0 0 1-1.601 1.497.75.75 0 0 0-.7 1.123 5.25 5.25 0 0 0 9.8-2.62 3.75 3.75 0 0 0-3.75-3.75Z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                  TILT PRESETS
                </div>
                <button
                  onClick={() =>
                    setIsTiltPresetsCollapsed(!isTiltPresetsCollapsed)
                  }
                  className="p-0.5 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                  aria-label={
                    isTiltPresetsCollapsed
                      ? "Expand Tilt Presets"
                      : "Collapse Tilt Presets"
                  }
                >
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d={
                        isTiltPresetsCollapsed
                          ? "M9 5l7 7-7 7"
                          : "M19 9l-7 7-7-7"
                      }
                    />
                  </svg>
                </button>
              </h3>
              {!isTiltPresetsCollapsed && (
                <div className="flex gap-1 flex-wrap">
                  {presetTiltStyles.map((preset) => (
                    <Tooltip
                      key={preset.value}
                      content={preset.tooltip}
                      position="top"
                    >
                      <button
                        onClick={() =>
                          applyTiltStyle(preset.updates, preset.value)
                        }
                        className={`px-2.5 py-0.5 text-white text-xs rounded-lg transition-colors ${
                          selectedTiltPreset === preset.value
                            ? "bg-[#CDFF63]/20 text-[#CDFF63] border border-[#CDFF63]/30"
                            : "bg-black/30 hover:bg-black/40 border border-white/5"
                        }`}
                      >
                        {preset.label}
                      </button>
                    </Tooltip>
                  ))}
                </div>
              )}
            </div>

            {/* Tilt Tabs */}
            <div className="bg-black/20 rounded-lg p-3 tilt-tabs">
              <h3 className="text-white/90 text-xs font-medium mb-2 flex items-center justify-between">
                <div className="flex items-center">
                  <span className="inline-block w-3.5 h-3.5 mr-1.5 text-[#CDFF63]">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M6.42 9.87c-.28.65-.5 1.3-.67 1.94A1.5 1.5 0 0 1 5.25 13.5h-.5a.75.75 0 0 1 0-1.5h.5c.01 0 .1-.14.27-.72.19-.64.46-1.36.78-2.08.33-.72.7-1.4 1.1-1.94.2-.27.38-.5.57-.67.17-.17.34-.28.48-.28a.75.75 0 0 1 0 1.5c.27 0 .34-.1.42-.15.08-.06.2-.18.35-.36.3-.4.63-1 .91-1.66.28.65.5 1.3.67 1.94a1.5 1.5 0 0 1-1.5 1.5h-.5a.75.75 0 0 1 0-1.5h.5c-.01 0-.1.14-.27.72-.19.64-.46 1.36-.78 2.08-.33.72-.7 1.4-1.1 1.94-.2.27-.38.5-.57.67-.17.17-.34.28-.48.28a.75.75 0 0 1 0-1.5c.27 0 .34-.1.42-.15.08-.06.2-.18.35-.36.3-.4.63-1 .91-1.66Z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                  TILT CONTROLS
                </div>
                <button
                  onClick={() =>
                    setIsTiltControlsCollapsed(!isTiltControlsCollapsed)
                  }
                  className="p-0.5 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                  aria-label={
                    isTiltControlsCollapsed
                      ? "Expand Tilt Controls"
                      : "Collapse Tilt Controls"
                  }
                >
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d={
                        isTiltControlsCollapsed
                          ? "M9 5l7 7-7 7"
                          : "M19 9l-7 7-7-7"
                      }
                    />
                  </svg>
                </button>
              </h3>
              {!isTiltControlsCollapsed && (
                <>
                  <div className="flex mb-2 bg-black/30 rounded-lg p-1 gap-1">
                    <Tooltip content="Basic horizontal tilt controls">
                      <button
                        onClick={() => setActiveTiltTab("basic")}
                        className={`flex-1 py-1.5 px-1 text-xs rounded-md transition-all ${
                          activeTiltTab === "basic"
                            ? "bg-[#CDFF63]/20 text-[#CDFF63] font-medium"
                            : "text-white/70 hover:text-white hover:bg-black/20"
                        }`}
                      >
                        Basic
                      </button>
                    </Tooltip>
                    <Tooltip content="Advanced tilt and perspective controls">
                      <button
                        onClick={() => setActiveTiltTab("advanced")}
                        className={`flex-1 py-1.5 px-1 text-xs rounded-md transition-all ${
                          activeTiltTab === "advanced"
                            ? "bg-[#CDFF63]/20 text-[#CDFF63] font-medium"
                            : "text-white/70 hover:text-white hover:bg-black/20"
                        }`}
                      >
                        Advanced
                      </button>
                    </Tooltip>
                    <Tooltip content="3D rotation controls for X, Y, and Z axes">
                      <button
                        onClick={() => setActiveTiltTab("3d")}
                        className={`flex-1 py-1.5 px-1 text-xs rounded-md transition-all ${
                          activeTiltTab === "3d"
                            ? "bg-[#CDFF63]/20 text-[#CDFF63] font-medium"
                            : "text-white/70 hover:text-white hover:bg-black/20"
                        }`}
                      >
                        3D
                      </button>
                    </Tooltip>
                  </div>

                  {/* Basic Tilt Controls */}
                  {activeTiltTab === "basic" && (
                    <div className="space-y-2">
                      {/* Horizontal Tilt (Skew X) */}
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <Tooltip content="Tilt text horizontally (like italic text)">
                            <label className="text-white/80 text-xs font-medium cursor-help">
                              Horizontal Tilt
                            </label>
                          </Tooltip>
                          <span className="text-white text-xs font-mono bg-black/30 px-1.5 py-0.5 rounded">
                            {currentPosition.tilt}°
                          </span>
                        </div>
                        <div className="relative h-5 flex items-center">
                          <input
                            type="range"
                            min="-45"
                            max="45"
                            value={currentPosition.tilt}
                            onChange={(e) =>
                              updateTextObject({
                                tilt: parseInt(e.target.value),
                              })
                            }
                            className="w-full appearance-none bg-transparent [&::-webkit-slider-runnable-track]:h-1 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-white/10 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#CDFF63] [&::-webkit-slider-thumb]:mt-[-5px] [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer hover:[&::-webkit-slider-thumb]:bg-white"
                            aria-label="Horizontal Tilt"
                          />
                          <div
                            className="absolute pointer-events-none h-1 rounded-full bg-gradient-to-r from-[#CDFF63]/30 to-[#CDFF63] top-1/2 transform -translate-y-1/2"
                            style={{
                              width: `${
                                ((currentPosition.tilt - -45) / (45 - -45)) *
                                100
                              }%`,
                              left: 0,
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Advanced Tilt Controls */}
                  {activeTiltTab === "advanced" && (
                    <div className="space-y-2">
                      {/* Vertical Tilt (Skew Y) */}
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <Tooltip content="Tilt text vertically (rising or falling effect)">
                            <label className="text-white/80 text-xs font-medium cursor-help">
                              Vertical Tilt
                            </label>
                          </Tooltip>
                          <span className="text-white text-xs font-mono bg-black/30 px-1.5 py-0.5 rounded">
                            {currentPosition.verticalTilt}°
                          </span>
                        </div>
                        <div className="relative h-5 flex items-center">
                          <input
                            type="range"
                            min="-45"
                            max="45"
                            value={currentPosition.verticalTilt}
                            onChange={(e) =>
                              updateTextObject({
                                verticalTilt: parseInt(e.target.value),
                              })
                            }
                            className="w-full appearance-none bg-transparent [&::-webkit-slider-runnable-track]:h-1 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-white/10 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#CDFF63] [&::-webkit-slider-thumb]:mt-[-5px] [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer hover:[&::-webkit-slider-thumb]:bg-white"
                            aria-label="Vertical Tilt"
                          />
                        </div>
                      </div>

                      {/* Perspective */}
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <Tooltip content="Add depth perspective to text (higher values = more dramatic)">
                            <label className="text-white/80 text-xs font-medium cursor-help">
                              Perspective
                            </label>
                          </Tooltip>
                          <span className="text-white text-xs font-mono bg-black/30 px-1.5 py-0.5 rounded">
                            {currentPosition.perspective}
                          </span>
                        </div>
                        <div className="relative h-5 flex items-center">
                          <input
                            type="range"
                            min="0"
                            max="1000"
                            value={currentPosition.perspective}
                            onChange={(e) =>
                              updateTextObject({
                                perspective: parseInt(e.target.value),
                              })
                            }
                            className="w-full appearance-none bg-transparent [&::-webkit-slider-runnable-track]:h-1 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-white/10 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#CDFF63] [&::-webkit-slider-thumb]:mt-[-5px] [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer hover:[&::-webkit-slider-thumb]:bg-white"
                            aria-label="Perspective"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 3D Tilt Controls */}
                  {activeTiltTab === "3d" && (
                    <div className="space-y-2">
                      {/* X Axis Rotation */}
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <Tooltip content="Rotate text around the horizontal axis (flip forward/backward)">
                            <label className="text-white/80 text-xs font-medium cursor-help">
                              X Axis Rotation
                            </label>
                          </Tooltip>
                          <span className="text-white text-xs font-mono bg-black/30 px-1.5 py-0.5 rounded">
                            {currentPosition.tiltX}°
                          </span>
                        </div>
                        <div className="relative h-5 flex items-center">
                          <input
                            type="range"
                            min="-180"
                            max="180"
                            value={currentPosition.tiltX}
                            onChange={(e) =>
                              updateTextObject({
                                tiltX: parseInt(e.target.value),
                              })
                            }
                            className="w-full appearance-none bg-transparent [&::-webkit-slider-runnable-track]:h-1 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-white/10 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#CDFF63] [&::-webkit-slider-thumb]:mt-[-5px] [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer hover:[&::-webkit-slider-thumb]:bg-white"
                            aria-label="X Axis Rotation"
                          />
                        </div>
                      </div>

                      {/* Y Axis Rotation */}
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <Tooltip content="Rotate text around the vertical axis (flip left/right)">
                            <label className="text-white/80 text-xs font-medium cursor-help">
                              Y Axis Rotation
                            </label>
                          </Tooltip>
                          <span className="text-white text-xs font-mono bg-black/30 px-1.5 py-0.5 rounded">
                            {currentPosition.tiltY}°
                          </span>
                        </div>
                        <div className="relative h-5 flex items-center">
                          <input
                            type="range"
                            min="-180"
                            max="180"
                            value={currentPosition.tiltY}
                            onChange={(e) =>
                              updateTextObject({
                                tiltY: parseInt(e.target.value),
                              })
                            }
                            className="w-full appearance-none bg-transparent [&::-webkit-slider-runnable-track]:h-1 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-white/10 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#CDFF63] [&::-webkit-slider-thumb]:mt-[-5px] [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer hover:[&::-webkit-slider-thumb]:bg-white"
                            aria-label="Y Axis Rotation"
                          />
                        </div>
                      </div>

                      {/* Z Axis Rotation */}
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <Tooltip content="Rotate text around the Z axis (standard rotation)">
                            <label className="text-white/80 text-xs font-medium cursor-help">
                              Z Axis Rotation
                            </label>
                          </Tooltip>
                          <span className="text-white text-xs font-mono bg-black/30 px-1.5 py-0.5 rounded">
                            {currentPosition.tiltZ}°
                          </span>
                        </div>
                        <div className="relative h-5 flex items-center">
                          <input
                            type="range"
                            min="-180"
                            max="180"
                            value={currentPosition.tiltZ}
                            onChange={(e) =>
                              updateTextObject({
                                tiltZ: parseInt(e.target.value),
                              })
                            }
                            className="w-full appearance-none bg-transparent [&::-webkit-slider-runnable-track]:h-1 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-white/10 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#CDFF63] [&::-webkit-slider-thumb]:mt-[-5px] [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer hover:[&::-webkit-slider-thumb]:bg-white"
                            aria-label="Z Axis Rotation"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
