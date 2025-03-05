interface UploadButtonProps {
  onClick: () => void;
  variant?: "large" | "small";
}

export default function UploadButton({
  onClick,
  variant = "small",
}: UploadButtonProps) {
  if (variant === "large") {
    return (
      <button
        onClick={onClick}
        className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-[#CDFF63] text-[#CDFF63] hover:bg-[#CDFF63]/10 transition-all"
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
            d="M12 4v16m8-8H4"
          />
        </svg>
        <span>Upload Image</span>
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-[#CDFF63] text-[#CDFF63] hover:bg-[#CDFF63]/10 transition-all mb-8 text-sm self-start"
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
          d="M12 4v16m8-8H4"
        />
      </svg>
      <span>Upload New Image</span>
    </button>
  );
}
