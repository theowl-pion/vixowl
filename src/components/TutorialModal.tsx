import { useState, useEffect } from "react";

export interface TutorialStep {
  title: string;
  description: string;
  image?: string;
  highlightElement?: string; // CSS selector for element to highlight
}

interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  steps: TutorialStep[];
  onComplete?: () => void;
  showAgainKey?: string; // localStorage key to remember user preference
}

export default function TutorialModal({
  isOpen,
  onClose,
  steps,
  onComplete,
  showAgainKey = "showTutorial",
}: TutorialModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  useEffect(() => {
    // Reset to first step when modal opens
    if (isOpen) {
      setCurrentStep(0);
    }
  }, [isOpen]);

  useEffect(() => {
    // Highlight the element if specified
    const currentStepData = steps[currentStep];
    if (currentStepData?.highlightElement) {
      const element = document.querySelector(currentStepData.highlightElement);
      if (element) {
        // Add a highlight class or effect
        element.classList.add("tutorial-highlight");

        // Clean up when step changes or modal closes
        return () => {
          element.classList.remove("tutorial-highlight");
        };
      }
    }
  }, [currentStep, steps, isOpen]);

  if (!isOpen) return null;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    if (dontShowAgain && showAgainKey) {
      localStorage.setItem(showAgainKey, "false");
    }
    if (onComplete) {
      onComplete();
    }
    onClose();
  };

  const currentStepData = steps[currentStep];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-[#1A1A1A] rounded-2xl border border-white/10 max-w-md w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h3 className="text-lg font-medium text-white">
            {currentStepData.title}
          </h3>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white/90 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-6 text-white/80 leading-relaxed">
            {currentStepData.description}
          </div>

          {/* Step indicator */}
          <div className="flex justify-center gap-1 my-4">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${
                  index === currentStep ? "bg-[#CDFF63]" : "bg-white/20"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/10 flex items-center justify-between">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="dontShowAgain"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="mr-2 accent-[#CDFF63]"
            />
            <label
              htmlFor="dontShowAgain"
              className="text-sm text-white/60 cursor-pointer"
            >
              Don't show again
            </label>
          </div>
          <div className="flex gap-2">
            {currentStep > 0 && (
              <button
                onClick={handlePrevious}
                className="px-4 py-2 rounded-full text-sm font-medium text-white/90 border border-white/20 hover:bg-white/10 transition-colors"
              >
                Previous
              </button>
            )}
            <button
              onClick={handleNext}
              className="px-4 py-2 rounded-full text-sm font-medium text-black bg-[#CDFF63] hover:bg-[#CDFF63]/90 transition-colors"
            >
              {currentStep < steps.length - 1 ? "Next" : "Finish"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
