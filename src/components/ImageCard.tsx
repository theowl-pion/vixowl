import Image from "next/image";
import { useState, useRef, useEffect } from "react";

interface ImageCardProps {
  id: string;
  src: string;
  title?: string;
  onEdit: (id: string, src: string) => void;
  onDelete: (img: { id: string; src: string }) => void;
  onDownload: (src: string) => void;
  onTitleChange?: (id: string, newTitle: string) => void;
}

export default function ImageCard({
  id,
  src,
  title = "Creative Design",
  onEdit,
  onDelete,
  onDownload,
  onTitleChange,
}: ImageCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [newTitle, setNewTitle] = useState(title);
  const titleInputRef = useRef<HTMLInputElement>(null);

  // Update newTitle when title prop changes
  useEffect(() => {
    setNewTitle(title);
  }, [title]);

  // Focus input when editing starts
  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
    }
  }, [isEditingTitle]);

  // Format date from ID (assuming ID contains timestamp)
  const formatDate = () => {
    try {
      // Extract date from the first part of UUID if possible
      const dateStr = new Date().toLocaleDateString();
      return dateStr;
    } catch (e) {
      return "Recent creation";
    }
  };

  const handleTitleClick = () => {
    if (onTitleChange) {
      setIsEditingTitle(true);
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewTitle(e.target.value);
  };

  const handleTitleBlur = () => {
    setIsEditingTitle(false);
    if (onTitleChange && newTitle !== title) {
      onTitleChange(id, newTitle);
    }
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setIsEditingTitle(false);
      if (onTitleChange && newTitle !== title) {
        onTitleChange(id, newTitle);
      }
    } else if (e.key === "Escape") {
      setIsEditingTitle(false);
      setNewTitle(title);
    }
  };

  return (
    <div
      className="rounded-xl overflow-hidden group relative border border-white/10 flex flex-col bg-[#1A1A1A]/80 backdrop-blur-sm shadow-lg transition-all duration-300 hover:shadow-[#CDFF63]/10 hover:shadow-xl hover:scale-[1.02] hover:border-[#CDFF63]/30"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image container */}
      <div className="aspect-square relative">
        <Image
          src={src}
          alt={newTitle}
          fill
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
        />

        {/* Overlay with quick actions */}
        <div
          className={`absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center gap-3 transition-opacity duration-300 ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}
        >
          <button
            onClick={() => onDownload(src)}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-[#CDFF63] hover:text-black text-white flex items-center justify-center transition-colors"
            title="Download"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
          </button>
          <button
            onClick={() => onDelete({ id, src })}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-red-500 text-white flex items-center justify-center transition-colors"
            title="Delete"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Card footer with info */}
      <div className="p-4 bg-gradient-to-b from-[#1A1A1A]/80 to-[#1A1A1A] backdrop-blur-sm">
        <div className="flex justify-between items-center mb-2">
          {isEditingTitle ? (
            <input
              ref={titleInputRef}
              type="text"
              value={newTitle}
              onChange={handleTitleChange}
              onBlur={handleTitleBlur}
              onKeyDown={handleTitleKeyDown}
              className="text-white/90 text-sm font-medium bg-white/10 rounded px-2 py-1 w-full focus:outline-none focus:ring-1 focus:ring-[#CDFF63]/50"
              maxLength={30}
            />
          ) : (
            <h3
              className="text-white/90 text-sm font-medium truncate cursor-pointer hover:text-[#CDFF63] transition-colors"
              onClick={handleTitleClick}
              title={onTitleChange ? "Click to edit title" : ""}
            >
              {newTitle}
              {onTitleChange && (
                <span className="ml-1 text-white/40 text-xs">✏️</span>
              )}
            </h3>
          )}
          <span className="text-white/50 text-xs">{formatDate()}</span>
        </div>

        <div className="flex gap-2 items-center">
          <button
            onClick={() => onDownload(src)}
            className="flex-1 px-3 py-1.5 rounded-md text-xs font-medium text-white bg-white/5 hover:bg-[#CDFF63] hover:text-black transition-colors flex items-center justify-center gap-1"
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
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            Download
          </button>
          <button
            onClick={() => onDelete({ id, src })}
            className="w-8 h-8 rounded-md flex items-center justify-center text-white/70 hover:text-red-500 hover:bg-red-500/10 transition-colors"
            title="Delete"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
