import {
  useEffect,
  useState,
  useCallback,
  useRef,
  useLayoutEffect,
} from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import DraggablePanel from "./DraggablePanel";
import { useRouter } from "next/navigation";
import { uploadImage, updateImage, fetchImage } from "@/services/api";
import { removeBackgroundClient } from "@/services/clientBackgroundRemoval";
import "@fontsource/inter";
import "@fontsource/roboto";
import "@fontsource/playfair-display";
import "@fontsource/montserrat";
import "@fontsource/open-sans";
import "@fontsource/lora";
import "@fontsource/poppins";
import AsyncSelect from "react-select/async";
import { useGoogleFonts } from "@/hooks/useGoogleFonts";
import TextPositionPanel from "./TextPositionPanel";
import html2canvas from "html2canvas";
import TutorialModal, { TutorialStep } from "./TutorialModal";
import Tooltip from "./Tooltip";
import "@/styles/tutorial.css";
import { toast } from "react-hot-toast";
import UpgradeModal from "./UpgradeModal";
import { useSubscription } from "@/hooks/useSubscription";
import { FREE_PLAN_IMAGE_LIMIT } from "@/lib/stripe";
import { useAuth } from "@/context/AuthContext";

// Add custom styles for animations
const styles = `
  @keyframes spin-slow {
    to {
      transform: rotate(360deg);
    }
  }
  .animate-spin-slow {
    animation: spin-slow 3s linear infinite;
  }
  
  @keyframes pulse-border {
    0% {
      border-color: rgba(205, 255, 99, 0.3);
      background-color: rgba(205, 255, 99, 0.05);
    }
    50% {
      border-color: rgba(205, 255, 99, 1);
      background-color: rgba(205, 255, 99, 0.2);
    }
    100% {
      border-color: rgba(205, 255, 99, 0.3);
      background-color: rgba(205, 255, 99, 0.05);
    }
  }
  .animate-pulse-border {
    animation: pulse-border 2s ease-in-out infinite;
  }
`;

// Loading overlay component
const LoadingOverlay = ({ message }: { message: string }) => (
  <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
    <div className="bg-[#1A1A1A] border border-white/10 rounded-xl p-6 shadow-2xl max-w-md w-full">
      <div className="flex flex-col items-center">
        <div className="w-16 h-16 mb-4 relative">
          <div className="absolute inset-0 border-t-4 border-[#CDFF63] rounded-full animate-spin"></div>
          <div className="absolute inset-2 border-t-4 border-white/30 rounded-full animate-spin-slow"></div>
        </div>
        <h3 className="text-white text-xl font-medium mb-2">
          Processing Image
        </h3>
        <p className="text-white/70 text-center">{message}</p>
      </div>
    </div>
  </div>
);

// Types
interface ImageEditorProps {
  imageData: string;
  imageId?: string;
}

interface FontOption {
  value: string;
  label: string;
}

type TextPosition = "center" | "top" | "bottom";

const textPositions = [
  { label: "Center", value: "center" },
  { label: "Top", value: "top" },
  { label: "Bottom", value: "bottom" },
];

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
  fontWeight?: number;
  letterSpacing?: number;
}

export default function ImageEditor({ imageData, imageId }: ImageEditorProps) {
  const router = useRouter();
  const { user, session } = useAuth();
  const { loadFonts, loadFontOptions } = useGoogleFonts();
  const [isPanelVisible, setIsPanelVisible] = useState(true);
  const [isPanelLocked, setIsPanelLocked] = useState(false);
  const [isPositionPanelLocked, setIsPositionPanelLocked] = useState(false);
  const [isPanningLocked, setIsPanningLocked] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [processingMessage, setProcessingMessage] = useState<string>("");

  // Tutorial state
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialCompleted, setTutorialCompleted] = useState(false);

  // Text state
  const [text, setText] = useState(""); // Empty default text
  const [fontSize, setFontSize] = useState(150); // Default size
  const [fontColor, setFontColor] = useState("#FF0000"); // Default color (red)
  const [selectedFont, setSelectedFont] = useState("Inter");
  const [textPosition, setTextPosition] = useState<TextPosition>("center"); // Default to center position
  const [textX, setTextX] = useState(0);
  const [textY, setTextY] = useState(0);
  const [textRotation, setTextRotation] = useState(0);
  const [textTilt, setTextTilt] = useState(0); // Horizontal tilt (skew X)
  const [textVerticalTilt, setTextVerticalTilt] = useState(0); // Vertical tilt (skew Y)
  const [textPerspective, setTextPerspective] = useState(0); // Perspective effect
  const [textTiltX, setTextTiltX] = useState(0); // 3D rotation X
  const [textTiltY, setTextTiltY] = useState(0); // 3D rotation Y
  const [textTiltZ, setTextTiltZ] = useState(0); // 3D rotation Z
  const [textBehindMode, setTextBehindMode] = useState(true); // Default to text-behind mode
  const [fontWeight, setFontWeight] = useState(400); // Default font weight
  const [letterSpacing, setLetterSpacing] = useState(0); // Default letter spacing
  const [originalImageData, setOriginalImageData] = useState<string | null>(
    null
  );

  // Image processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [removedBgImage, setRemovedBgImage] = useState<string | null>(null);
  const [isRemovingBackground, setIsRemovingBackground] = useState(false);

  // Canvas references
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mainImageRef = useRef<HTMLImageElement>(null);
  const bgRemovedImageRef = useRef<HTMLImageElement | null>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 1920, height: 1080 });
  const [imageSize, setImageSize] = useState({
    width: 0,
    height: 0,
    x: 0,
    y: 0,
  });

  // Transform component reference
  const transformComponentRef = useRef<any>(null);

  // Debounce timer for rendering
  const renderTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Upgrade modal state
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Subscription state
  const { isSubscribed, imagesUploaded } = useSubscription();
  const uploadPercentage = Math.min(
    (imagesUploaded / FREE_PLAN_IMAGE_LIMIT) * 100,
    100
  );

  // New state variables
  const [isTextPanelVisible, setIsTextPanelVisible] = useState(false);
  const [isTextPositionPanelVisible, setIsTextPositionPanelVisible] =
    useState(false);
  const [isAppearanceCollapsed, setIsAppearanceCollapsed] = useState(false);

  // Add a ref for the text input
  const textInputRef = useRef<HTMLInputElement>(null);

  // State for text overlay hover
  const [isTextHovered, setIsTextHovered] = useState(false);

  // Add state to track if this is the first load of an image with text
  const [isFirstTextLoad, setIsFirstTextLoad] = useState(false);

  // Check if an image exists in the database
  const checkImageExists = useCallback(async (id: string): Promise<boolean> => {
    try {
      console.log("🔍 checkImageExists - Checking if image exists:", id);
      const response = await fetch(`/api/images/check/${id}`, {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        console.log(
          "❌ checkImageExists - Image check failed:",
          response.status,
          response.statusText
        );

        // If unauthorized or forbidden, log a specific message
        if (response.status === 401 || response.status === 403) {
          console.error(
            "❌ checkImageExists - Authentication error or image belongs to another user"
          );
        }

        return false;
      }

      const data = await response.json();
      console.log("✅ checkImageExists - Image check result:", data);
      return data.exists;
    } catch (error) {
      console.error("❌ checkImageExists - Error checking image:", error);
      return false;
    }
  }, []);

  // Clean up stale image IDs
  const cleanupStaleImageId = useCallback(async () => {
    if (imageId) {
      try {
        const exists = await checkImageExists(imageId);
        if (!exists) {
          console.log(
            "🧹 cleanupStaleImageId - Image doesn't exist or belongs to a different user:",
            imageId
          );
          // We can't modify props directly, but we can clean localStorage if needed
          localStorage.removeItem("lastEditedImageId");
          localStorage.removeItem("editImageId");
          // Set a flag to indicate we should treat this as a new image
          localStorage.setItem("treatAsNewImage", "true");
        }
      } catch (error) {
        console.error("❌ cleanupStaleImageId - Error checking image:", error);
        // If there's an error, treat it as a new image to be safe
        localStorage.removeItem("lastEditedImageId");
        localStorage.removeItem("editImageId");
        localStorage.setItem("treatAsNewImage", "true");
      }
    }
  }, [imageId, checkImageExists]);

  // Effect to check if the image exists when component mounts
  useEffect(() => {
    const verifyImageId = async () => {
      if (imageId) {
        try {
          // First, clean up any stale image IDs
          await cleanupStaleImageId();

          // Check if we should treat this as a new image (set by cleanupStaleImageId)
          const treatAsNew = localStorage.getItem("treatAsNewImage");
          if (treatAsNew === "true") {
            console.log(
              "🔄 verifyImageId - Treating as new image due to invalid ID"
            );
            // Clear the flag
            localStorage.removeItem("treatAsNewImage");
            // Don't attempt to load metadata for this image
            return;
          }

          console.log("✅ verifyImageId - Image ID is valid:", imageId);
        } catch (error) {
          console.error("❌ verifyImageId - Error verifying image ID:", error);
        }
      }
    };

    verifyImageId();
  }, [imageId, cleanupStaleImageId]);

  // Effect to load image metadata if we have an imageId
  useEffect(() => {
    const loadImageMetadata = async () => {
      if (!imageId) return;

      try {
        setProcessingMessage("Loading image data...");
        console.log("🔍 loadImageMetadata - Fetching image:", imageId);

        const imageData = await fetchImage(imageId);

        if (imageData.textMetadata) {
          console.log("✅ Loading text metadata from image:", imageData.id);
          console.log("📝 Text metadata content:", imageData.textMetadata);

          // Apply text metadata to the editor state
          const metadata = imageData.textMetadata;

          // Set text with explicit logging
          if (metadata.text) {
            console.log("📝 Setting text from metadata:", metadata.text);
            setText(metadata.text);
          } else {
            console.log("⚠️ No text found in metadata, keeping empty");
          }

          if (metadata.fontSize) setFontSize(metadata.fontSize);
          if (metadata.fontColor) setFontColor(metadata.fontColor);
          if (metadata.selectedFont) setSelectedFont(metadata.selectedFont);
          if (metadata.textPosition) setTextPosition(metadata.textPosition);
          if (metadata.letterSpacing) setLetterSpacing(metadata.letterSpacing);
          if (metadata.textRotation) setTextRotation(metadata.textRotation);
          if (metadata.textTilt) setTextTilt(metadata.textTilt);
          if (metadata.textVerticalTilt)
            setTextVerticalTilt(metadata.textVerticalTilt);
          if (metadata.fontWeight) setFontWeight(metadata.fontWeight);
          if (metadata.textTiltX) setTextTiltX(metadata.textTiltX);
          if (metadata.textTiltY) setTextTiltY(metadata.textTiltY);
          if (metadata.textTiltZ) setTextTiltZ(metadata.textTiltZ);
          if (metadata.textBehindMode !== undefined)
            setTextBehindMode(metadata.textBehindMode);

          // Set first text load flag to trigger animation
          setIsFirstTextLoad(true);

          // Show a notification that text is editable
          window.setTimeout(() => {
            toast.success("Text is editable! Click on it to edit.", {
              icon: "✏️",
              duration: 5000,
            });

            // Highlight the text area briefly
            setIsTextHovered(true);
            window.setTimeout(() => setIsTextHovered(false), 2000);

            // Reset first load flag after animation completes
            window.setTimeout(() => setIsFirstTextLoad(false), 5000);
          }, 1500);
        } else {
          console.log("⚠️ No text metadata found for image:", imageId);
        }

        setProcessingMessage("");
      } catch (error) {
        console.error(
          "❌ loadImageMetadata - Error loading image data:",
          error
        );
        setProcessingMessage("");

        // If we can't load the image data, treat it as a new image
        localStorage.removeItem("editImageId");
        localStorage.setItem("treatAsNewImage", "true");
      }
    };

    loadImageMetadata();
  }, [imageId, fetchImage]);

  // Load the main image once
  useEffect(() => {
    if (!imageData) return;

    // Store the original image data
    setOriginalImageData(imageData);
    setProcessingMessage("Loading your image...");

    const mainImg = new Image();
    mainImg.crossOrigin = "anonymous";
    mainImg.src = imageData;

    mainImg.onload = () => {
      mainImageRef.current = mainImg;

      // Calculate image dimensions to fit within canvas
      const canvas = canvasRef.current;
      if (!canvas) return;

      const scale = Math.min(
        (canvas.width - 100) / mainImg.width,
        (canvas.height - 100) / mainImg.height
      );
      const w = mainImg.width * scale;
      const h = mainImg.height * scale;
      const x = (canvas.width - w) / 2;
      const y = (canvas.height - h) / 2;

      setImageSize({ width: w, height: h, x, y });

      // Automatically start the background removal process
      setIsProcessing(true);
      setProcessingMessage("Removing background from your image...");
      handleRemoveBackground();
    };
  }, [imageData]);

  // Effect for loading the background-removed image
  useEffect(() => {
    if (!removedBgImage) return;

    const bgRemovedImg = new Image();
    bgRemovedImg.crossOrigin = "anonymous";
    bgRemovedImg.src = removedBgImage;

    bgRemovedImg.onload = () => {
      bgRemovedImageRef.current = bgRemovedImg;
      setIsProcessing(false);
      renderCanvas();
    };
  }, [removedBgImage]);

  // Handle background removal
  const handleRemoveBackground = async () => {
    if (!imageData || isRemovingBackground) return;

    try {
      setIsRemovingBackground(true);
      setProcessingMessage("Removing background from your image...");

      // Use client-side background removal
      const result = await removeBackgroundClient(imageData);

      setRemovedBgImage(result);
      setProcessingMessage("");
    } catch (error) {
      console.error("Error removing background:", error);
      setIsProcessing(false);
      setProcessingMessage("");
    } finally {
      setIsRemovingBackground(false);
    }
  };

  // Render canvas function (separated to avoid re-renders)
  const renderCanvas = useCallback(() => {
    // Hide text overlay when rendering
    setIsTextHovered(false);

    // Clear any pending render timeouts
    if (renderTimeoutRef.current) {
      clearTimeout(renderTimeoutRef.current);
    }

    renderTimeoutRef.current = setTimeout(() => {
      const canvas = canvasRef.current;
      if (!canvas || !mainImageRef.current) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Get image dimensions and position
      const mainImg = mainImageRef.current;
      const { x, y, width: w, height: h } = imageSize;

      // If we have the background removed image and we're in text-behind mode
      if (bgRemovedImageRef.current && textBehindMode) {
        // 1. First, draw the original background (from the original image)
        ctx.drawImage(mainImg, x, y, w, h);

        // 2. Draw the text on top of the background
        if (text && text.trim() !== "") {
          ctx.save();
          ctx.fillStyle = fontColor;
          ctx.font = `${fontWeight} ${fontSize}px ${selectedFont}`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";

          // Calculate text position based on the image center
          const centerX = x + w / 2 + textX;
          const centerY = y + h / 2 + textY;

          // Position text based on selected position
          let textPosY = centerY;
          if (textPosition === "top") textPosY = y + fontSize;
          if (textPosition === "bottom") textPosY = y + h - fontSize;

          // Draw text with rotation and tilt
          ctx.translate(centerX, textPosY);

          // Apply 3D transformations if perspective is set
          if (
            textPerspective > 0 ||
            textTiltX !== 0 ||
            textTiltY !== 0 ||
            textTiltZ !== 0
          ) {
            // Set perspective context
            ctx.setTransform(1, 0, 0, 1, centerX, textPosY);

            // Apply perspective and 3D rotations
            const perspective = textPerspective > 0 ? textPerspective : 1000;
            const angleX = (textTiltX * Math.PI) / 180;
            const angleY = (textTiltY * Math.PI) / 180;
            const angleZ = (textTiltZ * Math.PI) / 180;

            // Create a 3D-like transform matrix
            // This is a simplified approximation of 3D transforms
            const cosX = Math.cos(angleX);
            const sinX = Math.sin(angleX);
            const cosY = Math.cos(angleY);
            const sinY = Math.sin(angleY);
            const cosZ = Math.cos(angleZ);
            const sinZ = Math.sin(angleZ);

            // Apply rotation around Z axis (standard rotation)
            ctx.transform(cosZ, sinZ, -sinZ, cosZ, 0, 0);

            // Apply rotation around X axis (affects vertical perspective)
            ctx.transform(1, 0, 0, cosX, 0, 0);

            // Apply rotation around Y axis (affects horizontal perspective)
            ctx.transform(cosY, 0, 0, 1, 0, 0);

            // Apply perspective effect
            if (textPerspective > 0) {
              const scale = 1 - (1 / perspective) * 500;
              ctx.scale(scale, scale);
            }
          } else {
            // Standard 2D rotation
            ctx.rotate((textRotation * Math.PI) / 180);

            // Apply horizontal tilt (skew X)
            if (textTilt !== 0) {
              ctx.transform(
                1,
                0,
                Math.tan((textTilt * Math.PI) / 180),
                1,
                0,
                0
              );
            }

            // Apply vertical tilt (skew Y)
            if (textVerticalTilt !== 0) {
              ctx.transform(
                1,
                Math.tan((textVerticalTilt * Math.PI) / 180),
                0,
                1,
                0,
                0
              );
            }
          }

          // Custom implementation for letter spacing
          if (letterSpacing !== 0) {
            // Save the current text alignment
            const originalTextAlign = ctx.textAlign;

            // Set text alignment to left for letter spacing
            ctx.textAlign = "left";

            // Calculate the total width of the text with letter spacing
            const textWidth = ctx.measureText(text).width;
            const totalWidth = textWidth + (text.length - 1) * letterSpacing;

            // Calculate the starting position based on the original text alignment
            let startX = 0;
            if (originalTextAlign === "center") {
              startX = -totalWidth / 2;
            } else if (originalTextAlign === "right") {
              startX = -totalWidth;
            }

            // Draw each character with the specified spacing
            let currentX = startX;
            for (let i = 0; i < text.length; i++) {
              const char = text[i];
              ctx.fillText(char, currentX, 0);
              currentX += ctx.measureText(char).width + letterSpacing;
            }
          } else {
            // Draw text normally if no letter spacing
            ctx.fillText(text, 0, 0);
          }

          ctx.restore();
        }

        // 3. Draw the foreground subject (from the background-removed image) on top
        ctx.drawImage(bgRemovedImageRef.current, x, y, w, h);
      } else {
        // If background removal hasn't completed yet, just show the original image
        ctx.drawImage(mainImg, x, y, w, h);
      }
    }, 10); // Small delay to batch updates
  }, [
    text,
    fontSize,
    fontColor,
    selectedFont,
    textPosition,
    textX,
    textY,
    textRotation,
    textTilt,
    textVerticalTilt,
    textPerspective,
    textTiltX,
    textTiltY,
    textTiltZ,
    textBehindMode,
    canvasSize,
    imageSize,
    fontWeight,
    letterSpacing,
    setIsTextHovered,
  ]);

  // Effect to trigger canvas rendering when relevant state changes
  useEffect(() => {
    renderCanvas();
  }, [
    text,
    fontSize,
    fontColor,
    selectedFont,
    textPosition,
    textX,
    textY,
    textRotation,
    textTilt,
    textVerticalTilt,
    textPerspective,
    textTiltX,
    textTiltY,
    textTiltZ,
    fontWeight,
    letterSpacing,
    renderCanvas,
  ]);

  // Function to update font
  const updateFont = async (newFont: string) => {
    try {
      await loadFonts([newFont]);
      setSelectedFont(newFont);
    } catch (error) {
      console.error("Error updating font:", error);
    }
  };

  // Function to update text position
  const updateTextObject = useCallback((updates: TextUpdates) => {
    if (updates.left !== undefined) setTextX(updates.left);
    if (updates.top !== undefined) setTextY(updates.top);
    if (updates.angle !== undefined) setTextRotation(updates.angle);
    if (updates.tilt !== undefined) setTextTilt(updates.tilt);
    if (updates.verticalTilt !== undefined)
      setTextVerticalTilt(updates.verticalTilt);
    if (updates.perspective !== undefined)
      setTextPerspective(updates.perspective);
    if (updates.tiltX !== undefined) setTextTiltX(updates.tiltX);
    if (updates.tiltY !== undefined) setTextTiltY(updates.tiltY);
    if (updates.tiltZ !== undefined) setTextTiltZ(updates.tiltZ);
    if (updates.fontWeight !== undefined) setFontWeight(updates.fontWeight);
    if (updates.letterSpacing !== undefined)
      setLetterSpacing(updates.letterSpacing);
  }, []);

  // Function to generate and save the image
  const saveImage = async () => {
    try {
      console.log("🔄 Starting image save process...");

      if (!canvasRef.current) {
        console.error("❌ Canvas reference is null");
        toast.error("Error saving image: Canvas not found");
        return null;
      }

      if (!user?.id) {
        console.error("❌ User not authenticated");
        toast.error("You must be logged in to save images");
        return null;
      }

      setProcessingMessage("Saving your image...");

      const dataUrl = canvasRef.current.toDataURL("image/png");

      // Create text metadata object
      const textMetadata = {
        text,
        fontSize,
        fontColor,
        selectedFont,
        textPosition,
        textX,
        textY,
        textRotation,
        textTilt,
        textVerticalTilt,
        textPerspective,
        textTiltX,
        textTiltY,
        textTiltZ,
        fontWeight,
        letterSpacing,
        textBehindMode,
      };

      console.log("📝 Text metadata being saved:", textMetadata);

      // Always upload as a new image for reliability
      console.log(`🔄 Uploading image for user: ${user.id}`);
      localStorage.removeItem("treatAsNewImage");

      try {
        // Pass the text metadata to the upload function
        const result = await uploadImage(
          dataUrl,
          user.id,
          session?.access_token,
          textMetadata
        );
        console.log("✅ Image uploaded successfully:", result);
        setProcessingMessage("");
        toast.success("Image saved successfully!");
        return result;
      } catch (uploadError) {
        console.error("❌ Error uploading image:", uploadError);
        setProcessingMessage("");

        // Check if the error is related to the free plan limit
        if (
          (uploadError as Error).message?.includes("free plan limit") ||
          (uploadError as Error).message?.includes("upgrade to continue")
        ) {
          toast.error(
            "You've reached your free plan image limit. Please upgrade to continue."
          );
          setShowUpgradeModal(true);
        } else {
          toast.error(
            `Error saving image: ${
              (uploadError as Error).message || "Unknown error"
            }`
          );
        }
        return null;
      }
    } catch (apiError) {
      console.error("❌ Error saving image:", apiError);
      setProcessingMessage("");

      // Check if the error is related to the free plan limit
      if (
        (apiError as Error).message?.includes("free plan limit") ||
        (apiError as Error).message?.includes("upgrade to continue")
      ) {
        console.log("⚠️ User has reached free plan limit");
        toast.error(
          "You've reached your free plan image limit. Please upgrade to continue."
        );
        setShowUpgradeModal(true);
      } else {
        toast.error(
          `Error saving image: ${
            (apiError as Error).message || "Unknown error"
          }`
        );
      }
      return null;
    }
  };

  // Handle navigation to dashboard with auto-save
  const handleGoToDashboard = async () => {
    try {
      console.log("🔍 handleGoToDashboard - Starting save process");
      setIsSaving(true);
      setProcessingMessage("Saving your image and returning to dashboard...");

      // Make sure the canvas is ready
      const canvas = canvasRef.current;
      if (!canvas) {
        console.error("❌ handleGoToDashboard - No canvas reference found");
        setProcessingMessage("Error: Canvas not found");
        setIsSaving(false);

        // Still navigate to home even if save fails
        console.log("⚠️ handleGoToDashboard - Navigating despite canvas error");
        toast.error("Failed to save image: Canvas not found");
        setTimeout(() => router.push("/home"), 2000);
        return;
      }
      console.log("✅ handleGoToDashboard - Canvas reference found");

      // Make sure user is authenticated
      if (!user?.id) {
        console.error("❌ handleGoToDashboard - No user ID found");
        setProcessingMessage("Error: User not authenticated");
        setIsSaving(false);

        // Still navigate to home even if save fails
        console.log(
          "⚠️ handleGoToDashboard - Navigating despite authentication error"
        );
        toast.error("Failed to save image: User not authenticated");
        setTimeout(() => router.push("/home"), 2000);
        return;
      }
      console.log("✅ handleGoToDashboard - User authenticated:", user.id);

      // Attempt to save the image
      console.log("🔍 handleGoToDashboard - Calling saveImage function");
      const saveResult = await saveImage();
      console.log(
        "🔍 handleGoToDashboard - Save completed with result:",
        saveResult
      );

      // Show appropriate toast based on save result
      if (saveResult) {
        toast.success("Image saved successfully!");

        // If we created a new image (because the original imageId didn't exist),
        // we should update localStorage with the new image ID
        if (imageId && !(await checkImageExists(imageId))) {
          // Get the latest image ID from the user's images
          try {
            const response = await fetch("/api/images/latest", {
              credentials: "include",
              headers: {
                "Content-Type": "application/json",
              },
            });
            if (response.ok) {
              const data = await response.json();
              if (data.id) {
                console.log(
                  "✅ handleGoToDashboard - Storing new image ID:",
                  data.id
                );
                localStorage.setItem("lastEditedImageId", data.id);
              }
            }
          } catch (error) {
            console.error(
              "❌ handleGoToDashboard - Error getting latest image:",
              error
            );
          }
        }
      } else {
        toast.error("Failed to save image. Your changes were not saved.");
      }

      // Clear any temporary image data from localStorage
      console.log(
        "🔍 handleGoToDashboard - Clearing tempImage from localStorage"
      );
      localStorage.removeItem("tempImage");

      // Add a small delay to ensure the save completes
      console.log("🔍 handleGoToDashboard - Setting timeout for navigation");
      setTimeout(() => {
        console.log(
          "🔍 handleGoToDashboard - Timeout fired, navigating to /home"
        );
        setIsSaving(false);
        setProcessingMessage("");

        // Navigate to home page
        console.log("✅ handleGoToDashboard - Calling router.push('/home')");
        router.push("/home");
      }, 1000);
    } catch (error) {
      console.error("❌ handleGoToDashboard - Error:", error);
      // Ensure we still navigate even if there's an error
      setIsSaving(false);
      setProcessingMessage(
        `Error: ${error instanceof Error ? error.message : "Failed to save"}`
      );

      // Show error toast
      toast.error(
        `Failed to save image: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );

      // Wait a moment to show the error before navigating
      console.log(
        "⚠️ handleGoToDashboard - Setting timeout for error navigation"
      );
      setTimeout(() => {
        console.log(
          "🔍 handleGoToDashboard - Error timeout fired, attempting navigation"
        );
        router.push("/home");
      }, 2000);
    }
  };

  // Handle zoom in
  const handleZoomIn = () => {
    if (transformComponentRef.current) {
      transformComponentRef.current.zoomIn(0.1);
    }
  };

  // Handle zoom out
  const handleZoomOut = () => {
    if (transformComponentRef.current) {
      transformComponentRef.current.zoomOut(0.1);
    }
  };

  // Handle reset zoom
  const handleResetZoom = () => {
    if (transformComponentRef.current) {
      transformComponentRef.current.resetTransform();
    }
  };

  // Check if this is the first time the user is using the editor
  useEffect(() => {
    // Only show tutorial if it's a new image (not editing an existing one)
    if (!imageId) {
      const hasSeenTutorial = localStorage.getItem("hasSeenEditorTutorial");
      if (!hasSeenTutorial) {
        // Wait a bit for the UI to load before showing tutorial
        const timer = setTimeout(() => {
          setShowTutorial(true);
        }, 1000);
        return () => clearTimeout(timer);
      }
    }
  }, [imageId]);

  // Mark tutorial as completed
  const handleTutorialComplete = () => {
    localStorage.setItem("hasSeenEditorTutorial", "true");
    setTutorialCompleted(true);
  };

  // Tutorial steps
  const tutorialSteps: TutorialStep[] = [
    {
      title: "Welcome to the Image Editor",
      description:
        "This tutorial will guide you through the main features of the editor. You can add text to your image and position it behind the main subject of your photo for a professional look.",
    },
    {
      title: "Text Settings Panel",
      description:
        "The panel on the left lets you customize your text. You can change the text content, font family, size, and color. Each change you make will be immediately visible on your image.",
      highlightElement: ".text-settings-panel",
    },
    {
      title: "Text Position Panel",
      description:
        "The panel on the right controls the position of your text. You can move it horizontally and vertically, rotate it, or use the preset positions (Center, Top, Bottom) for quick adjustments.",
      highlightElement: ".text-position-panel",
    },
    {
      title: "Tilt Settings",
      description:
        "The tilt settings allow you to create interesting text effects. Try the different presets like 'Italic', 'Perspective', or 'Rising' to see how they transform your text. You can also use the sliders for fine-tuning.",
      highlightElement: ".tilt-tabs",
    },
    {
      title: "Advanced Tilt Options",
      description:
        "For more creative control, explore the Advanced and 3D tabs. The Advanced tab gives you vertical tilt and perspective effects. The 3D tab lets you rotate text in three dimensions for dramatic effects.",
    },
    {
      title: "Tooltips for Help",
      description:
        "Hover your mouse over any control to see a tooltip explaining what it does. This can help you understand how each setting affects your text without having to guess.",
    },
    {
      title: "You're Ready!",
      description:
        "Now you're ready to create amazing text effects on your images. Remember to save your work when you're done by clicking the 'Save & Exit' button at the bottom right of the screen.",
    },
  ];

  // Function to focus the text input
  const focusTextInput = () => {
    if (textInputRef.current) {
      textInputRef.current.focus();
      // Optionally select all text
      textInputRef.current.select();
    }
  };

  // Calculate text position for overlay
  const getTextOverlayPosition = useCallback(() => {
    if (!canvasRef.current) return { left: 0, top: 0, width: 0, height: 0 };

    const canvas = canvasRef.current;
    const { x, y, width: w, height: h } = imageSize;

    // Calculate text position based on the image center
    const centerX = x + w / 2 + textX;
    const centerY = y + h / 2 + textY;

    // Position text based on selected position
    let textPosY = centerY;
    if (textPosition === "top") textPosY = y + fontSize;
    if (textPosition === "bottom") textPosY = y + h - fontSize;

    // Estimate text width based on font size
    const estimatedWidth = text.length * (fontSize * 0.6);

    // Account for zoom level
    const scaledWidth = estimatedWidth * zoomLevel;
    const scaledHeight = fontSize * 1.2 * zoomLevel;

    // Get the canvas bounding rect to adjust for transform
    const canvasRect = canvas.getBoundingClientRect();
    const canvasScaleX = canvasRect.width / canvas.width;
    const canvasScaleY = canvasRect.height / canvas.height;

    // Calculate the position in the transformed space
    const transformedLeft = centerX * canvasScaleX - scaledWidth / 2;
    const transformedTop = textPosY * canvasScaleY - scaledHeight / 2;

    return {
      left: transformedLeft,
      top: transformedTop,
      width: scaledWidth,
      height: scaledHeight,
    };
  }, [
    canvasRef,
    imageSize,
    textX,
    textY,
    textPosition,
    fontSize,
    text,
    zoomLevel,
  ]);

  return (
    <div className="relative w-full h-full bg-[#1E1E1E] p-10">
      {/* Add style tag for custom animations */}
      <style dangerouslySetInnerHTML={{ __html: styles }} />

      {/* Loading Overlay */}
      {(isProcessing || isRemovingBackground || isSaving) &&
        processingMessage && <LoadingOverlay message={processingMessage} />}

      {/* Tutorial Modal */}
      <TutorialModal
        isOpen={showTutorial}
        onClose={() => setShowTutorial(false)}
        steps={tutorialSteps}
        onComplete={handleTutorialComplete}
        showAgainKey="hasSeenEditorTutorial"
      />

      {/* Panel principal */}
      <DraggablePanel
        defaultPosition={{ x: 20, y: 20 }}
        disabled={isPanelLocked}
      >
        <div className="w-[300px] bg-[#1A1A1A]/95 backdrop-blur-xl rounded-xl border border-white/10 shadow-2xl overflow-hidden text-settings-panel">
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-white/10 bg-gradient-to-r from-black/40 to-black/20">
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
                    d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0 0 16.5 9h-1.875a1.875 1.875 0 0 1-1.875-1.875V5.25A3.75 3.75 0 0 0 9 1.5H5.625ZM7.5 15a.75.75 0 0 1 .75-.75h7.5a.75.75 0 0 1 0 1.5h-7.5A.75.75 0 0 1 7.5 15Zm.75 2.25a.75.75 0 0 0 0 1.5H12a.75.75 0 0 0 0-1.5H8.25Z"
                    clipRule="evenodd"
                  />
                  <path d="M12.971 1.816A5.23 5.23 0 0 1 14.25 5.25v1.875c0 .207.168.375.375.375H16.5a5.23 5.23 0 0 1 3.434 1.279 9.768 9.768 0 0 0-6.963-6.963Z" />
                </svg>
              </div>
              <h2 className="text-white text-sm font-medium">Text Settings</h2>
            </div>
            <Tooltip
              content={isPanelLocked ? "Unlock panel" : "Lock panel position"}
              position="bottom"
            >
              <button
                onClick={() => setIsPanelLocked(!isPanelLocked)}
                className={`p-1.5 rounded-full transition-colors ${
                  isPanelLocked
                    ? "bg-[#CDFF63]/20 text-[#CDFF63]"
                    : "text-white/70 hover:text-white hover:bg-white/10"
                }`}
                aria-label={isPanelLocked ? "Unlock panel" : "Lock panel"}
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
                      isPanelLocked
                        ? "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        : "M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
                    }
                  />
                </svg>
              </button>
            </Tooltip>
          </div>

          {/* Content */}
          <div className="p-3 space-y-3">
            {/* Text Input */}
            <div>
              <h3 className="text-white/90 text-xs font-medium mb-2 flex items-center">
                <span className="inline-block w-3.5 h-3.5 mr-1.5 text-[#CDFF63]">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.25 2.25a3 3 0 0 0-3 3v4.318a3 3 0 0 0 .879 2.121l9.58 9.581c.92.92 2.39.92 3.31 0l4.23-4.231a2.34 2.34 0 0 0 0-3.31l-9.58-9.581a3 3 0 0 0-2.12-.879H5.25ZM6.375 7.5a1.125 1.125 0 1 0 0-2.25 1.125 1.125 0 0 0 0 2.25Z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
                TEXT CONTENT
              </h3>
              <Tooltip content="Enter the text you want to display on your image">
                <div className="relative">
                  <input
                    ref={textInputRef}
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#CDFF63]/50 focus:ring-1 focus:ring-[#CDFF63]/30 transition-all min-h-[40px] min-w-[260px]"
                    placeholder="Enter text to display on image..."
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-white/40">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  {/* Add a badge to indicate this is editable text on canvas */}
                  <div className="absolute -top-2 -right-2 bg-[#CDFF63] text-black text-xs px-1.5 py-0.5 rounded-full font-medium">
                    On Canvas
                  </div>
                </div>
              </Tooltip>
            </div>

            {/* Add a button to help find text on canvas */}
            <button
              onClick={() => {
                // Highlight the text area
                setIsTextHovered(true);
                window.setTimeout(() => setIsTextHovered(false), 2000);

                // Show a toast
                toast.success("Look for the highlighted text on the canvas", {
                  icon: "🔍",
                  duration: 3000,
                });
              }}
              className="mt-2 flex items-center gap-1.5 text-xs text-[#CDFF63] hover:text-[#CDFF63]/80 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3.5 w-3.5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                  clipRule="evenodd"
                />
              </svg>
              Find text on canvas
            </button>

            {/* Font Family */}
            <div className="bg-black/20 rounded-lg p-4">
              <h3 className="text-white/90 text-xs font-medium mb-3 flex items-center">
                <span className="inline-block w-4 h-4 mr-1.5 text-[#CDFF63]">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M9 4.5a.75.75 0 0 1 .721.544l.813 2.846a3.75 3.75 0 0 0-1.449.375l-.101.043c-.562.241-1.453.623-2.518.623-.981 0-1.856-.367-2.417-.6a2.77 2.77 0 0 0-.167-.06l-.42-1.474a.75.75 0 0 1 1.44-.414L5.6 7.539a1.665 1.665 0 0 0-.496.11l-.114.04c-.434.15-.828.287-1.2.287-.199 0-.389-.036-.572-.106l.147-.514a.75.75 0 0 1 1.44-.414l.933 3.266a3.75 3.75 0 0 0 2.29 5.32l.28.08a.75.75 0 0 1 .528.715V16.5a.75.75 0 0 1-1.5 0v-.039l-.003-.001-.004-.002-.006-.002a.75.75 0 0 1-.118-.069l-.009-.006-.022-.016a1.99 1.99 0 0 1-.1-.083 22.3 22.3 0 0 1-.122-.11 1.87 1.87 0 0 0-.145-.131A18.96 18.96 0 0 0 5.4 14.583L4.329 18.03a.75.75 0 0 1-1.443-.41l1.141-3.993a21.79 21.79 0 0 1-1.2-.96l-.009-.008a.75.75 0 1 1 .979-1.138 19.99 19.99 0 0 0 1.357 1.142 20.29 20.29 0 0 0 .603.48 19.86 19.86 0 0 0 3.831 2.352 19.86 19.86 0 0 0 5.43 1.447 19.95 19.95 0 0 0 5.429-1.447 19.86 19.86 0 0 0 3.83-2.352c.207-.157.41-.32.604-.48a19.89 19.89 0 0 0 1.356-1.142.75.75 0 0 1 .98 1.138l-.009.008a21.89 21.89 0 0 1-1.2.96l1.142 3.993a.75.75 0 1 1-1.443.41L19.6 14.583a18.96 18.96 0 0 1-2.282 1.365 1.87 1.87 0 0 0-.145.13c-.042.04-.085.076-.122.111a1.99 1.99 0 0 1-.1.083l-.022.016-.009.006-.007.004-.003.002a.75.75 0 0 1-.118.069l-.006.002-.004.002-.003.001V16.5a.75.75 0 0 1-1.5 0v-.039a.75.75 0 0 1 .528-.715l.28-.08a3.75 3.75 0 0 0 2.29-5.32l.933-3.266a.75.75 0 0 1 1.44.414l.147.514a2.12 2.12 0 0 1-.572.106c-.372 0-.766-.137-1.2-.287l-.114-.04a1.67 1.67 0 0 0-.496-.11l.797-2.788a.75.75 0 0 1 1.44.414l-.42 1.473a2.78 2.78 0 0 0-.167.06c-.561.234-1.436.6-2.417.6-1.066 0-1.956-.382-2.518-.623l-.101-.043a3.75 3.75 0 0 0-1.449-.375l.813-2.846A.75.75 0 0 1 9 4.5Z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
                FONT FAMILY
              </h3>
              <Tooltip content="Select a font for your text">
                <div className="w-full">
                  <AsyncSelect
                    defaultValue={{ value: selectedFont, label: selectedFont }}
                    onChange={(option) => option && updateFont(option.value)}
                    loadOptions={loadFontOptions}
                    className="react-select-container"
                    classNamePrefix="react-select"
                    placeholder="Search fonts..."
                    noOptionsMessage={() => "Type to search fonts..."}
                    loadingMessage={() => "Loading fonts..."}
                    styles={{
                      control: (base) => ({
                        ...base,
                        backgroundColor: "rgba(0, 0, 0, 0.2)",
                        borderColor: "rgba(255, 255, 255, 0.1)",
                        borderRadius: "0.5rem",
                        padding: "2px",
                        minHeight: "25px",
                        minWidth: "230px",
                        boxShadow: "none",
                        "&:hover": {
                          borderColor: "rgba(255, 255, 255, 0.2)",
                        },
                      }),
                      menu: (base) => ({
                        ...base,
                        backgroundColor: "#1A1A1A",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        borderRadius: "0.5rem",
                        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3)",
                        overflow: "hidden",
                      }),
                      menuList: (base) => ({
                        ...base,
                        padding: "4px",
                        maxHeight: "200px",
                      }),
                      option: (base, state) => ({
                        ...base,
                        backgroundColor: state.isFocused
                          ? "rgba(205, 255, 99, 0.1)"
                          : "transparent",
                        color: state.isFocused
                          ? "rgba(205, 255, 99, 0.9)"
                          : "rgba(255, 255, 255, 0.9)",
                        borderRadius: "0.375rem",
                        "&:hover": {
                          backgroundColor: "rgba(255, 255, 255, 0.1)",
                        },
                        padding: "8px 12px",
                      }),
                      singleValue: (base) => ({
                        ...base,
                        color: "rgba(255, 255, 255, 0.9)",
                      }),
                      input: (base) => ({
                        ...base,
                        color: "rgba(255, 255, 255, 0.9)",
                      }),
                      placeholder: (base) => ({
                        ...base,
                        color: "rgba(255, 255, 255, 0.5)",
                      }),
                      indicatorSeparator: (base) => ({
                        ...base,
                        backgroundColor: "rgba(255, 255, 255, 0.1)",
                      }),
                      dropdownIndicator: (base) => ({
                        ...base,
                        color: "rgba(255, 255, 255, 0.5)",
                        "&:hover": {
                          color: "rgba(255, 255, 255, 0.8)",
                        },
                      }),
                    }}
                  />
                </div>
              </Tooltip>
            </div>

            {/* Font Size and Color */}
            <div className="bg-black/20 rounded-lg p-3">
              <h3 className="text-white/90 text-xs font-medium mb-2 flex items-center justify-between">
                <div className="flex items-center">
                  <span className="inline-block w-3.5 h-3.5 mr-1.5 text-[#CDFF63]">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12.378 1.602a.75.75 0 0 0-.756 0L3 6.632l9 5.25 9-5.25-8.622-5.03ZM21.75 7.93l-9 5.25v9l8.628-5.032a.75.75 0 0 0 .372-.648V7.93ZM11.25 22.18v-9l-9-5.25v8.57a.75.75 0 0 0 .372.648l8.628 5.033Z" />
                    </svg>
                  </span>
                  APPEARANCE
                </div>
                <button
                  onClick={() =>
                    setIsAppearanceCollapsed(!isAppearanceCollapsed)
                  }
                  className="p-0.5 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                  aria-label={
                    isAppearanceCollapsed
                      ? "Expand Appearance"
                      : "Collapse Appearance"
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
                        isAppearanceCollapsed
                          ? "M9 5l7 7-7 7"
                          : "M19 9l-7 7-7-7"
                      }
                    />
                  </svg>
                </button>
              </h3>

              {!isAppearanceCollapsed && (
                <>
                  {/* Font Size */}
                  <div className="mb-2">
                    <div className="flex justify-between items-center mb-1">
                      <Tooltip content="Adjust the size of your text">
                        <label className="text-white/80 text-xs font-medium cursor-help">
                          Font Size
                        </label>
                      </Tooltip>
                      <span className="text-white text-xs font-mono bg-black/30 px-1.5 py-0.5 rounded">
                        {fontSize}px
                      </span>
                    </div>
                    <div className="relative h-5 flex items-center">
                      <input
                        type="range"
                        min="10"
                        max="500"
                        value={fontSize}
                        onChange={(e) => setFontSize(parseInt(e.target.value))}
                        className="w-full appearance-none bg-transparent [&::-webkit-slider-runnable-track]:h-1 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-white/10 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#CDFF63] [&::-webkit-slider-thumb]:mt-[-5px] [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer hover:[&::-webkit-slider-thumb]:bg-white"
                        aria-label="Font Size"
                      />
                      <div
                        className="absolute pointer-events-none h-1 rounded-full bg-gradient-to-r from-[#CDFF63]/30 to-[#CDFF63] top-1/2 transform -translate-y-1/2"
                        style={{
                          width: `${((fontSize - 10) / (500 - 10)) * 100}%`,
                          left: 0,
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* Font Weight */}
                  <div className="mb-2">
                    <div className="flex justify-between items-center mb-1">
                      <Tooltip content="Adjust the weight (boldness) of your text">
                        <label className="text-white/80 text-xs font-medium cursor-help">
                          Font Weight
                        </label>
                      </Tooltip>
                      <span className="text-white text-xs font-mono bg-black/30 px-1.5 py-0.5 rounded">
                        {fontWeight}
                      </span>
                    </div>
                    <div className="relative h-5 flex items-center">
                      <input
                        type="range"
                        min="100"
                        max="900"
                        step="100"
                        value={fontWeight}
                        onChange={(e) =>
                          updateTextObject({
                            fontWeight: parseInt(e.target.value),
                          })
                        }
                        className="w-full appearance-none bg-transparent [&::-webkit-slider-runnable-track]:h-1 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-white/10 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#CDFF63] [&::-webkit-slider-thumb]:mt-[-5px] [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer hover:[&::-webkit-slider-thumb]:bg-white"
                        aria-label="Font Weight"
                      />
                      <div
                        className="absolute pointer-events-none h-1 rounded-full bg-gradient-to-r from-[#CDFF63]/30 to-[#CDFF63] top-1/2 transform -translate-y-1/2"
                        style={{
                          width: `${((fontWeight - 100) / (900 - 100)) * 100}%`,
                          left: 0,
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* Letter Spacing */}
                  <div className="mb-2">
                    <div className="flex justify-between items-center mb-1">
                      <Tooltip content="Adjust the spacing between letters">
                        <label className="text-white/80 text-xs font-medium cursor-help">
                          Letter Spacing
                        </label>
                      </Tooltip>
                      <span className="text-white text-xs font-mono bg-black/30 px-1.5 py-0.5 rounded">
                        {letterSpacing}px
                      </span>
                    </div>
                    <div className="relative h-5 flex items-center">
                      <input
                        type="range"
                        min="-10"
                        max="50"
                        value={letterSpacing}
                        onChange={(e) =>
                          updateTextObject({
                            letterSpacing: parseInt(e.target.value),
                          })
                        }
                        className="w-full appearance-none bg-transparent [&::-webkit-slider-runnable-track]:h-1 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-white/10 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#CDFF63] [&::-webkit-slider-thumb]:mt-[-5px] [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer hover:[&::-webkit-slider-thumb]:bg-white"
                        aria-label="Letter Spacing"
                      />
                      <div
                        className="absolute pointer-events-none h-1 rounded-full bg-gradient-to-r from-[#CDFF63]/30 to-[#CDFF63] top-1/2 transform -translate-y-1/2"
                        style={{
                          width: `${
                            ((letterSpacing - -10) / (50 - -10)) * 100
                          }%`,
                          left: 0,
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* Font Color */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <Tooltip content="Choose a color for your text">
                        <label className="text-white/80 text-xs font-medium cursor-help">
                          Font Color
                        </label>
                      </Tooltip>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3.5 h-3.5 rounded-full border border-white/20"
                          style={{ backgroundColor: fontColor }}
                        ></div>
                        <span className="text-white text-xs font-mono bg-black/30 px-1.5 py-0.5 rounded">
                          {fontColor}
                        </span>
                      </div>
                    </div>
                    <div className="relative">
                      <input
                        type="color"
                        value={fontColor}
                        onChange={(e) => setFontColor(e.target.value)}
                        className="w-full h-8 rounded-lg cursor-pointer bg-black/10 border border-white/10 appearance-none overflow-hidden"
                        aria-label="Font Color"
                      />
                      <div
                        className="absolute inset-0 pointer-events-none rounded-lg"
                        style={{
                          background: `linear-gradient(to right, ${fontColor}20, ${fontColor})`,
                        }}
                      ></div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Info about text positioning */}
            <div className="bg-[#CDFF63]/5 rounded-lg p-3 border border-[#CDFF63]/20">
              <div className="flex">
                <div className="text-[#CDFF63] mr-3 mt-0.5">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-4 h-4"
                  >
                    <path
                      fillRule="evenodd"
                      d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm8.706-1.442c1.146-.573 2.437.463 2.126 1.706l-.709 2.836.042-.02a.75.75 0 0 1 .67 1.34l-.04.022c-1.147.573-2.438-.463-2.127-1.706l.71-2.836-.042.02a.75.75 0 1 1-.671-1.34l.041-.022ZM12 9a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <p className="text-white/70 text-xs">
                  Text is automatically positioned behind the main subject of
                  your image. Use the{" "}
                  <span className="text-[#CDFF63]">Text Position</span> panel to
                  adjust placement and tilt.
                </p>
              </div>
            </div>
          </div>
        </div>
      </DraggablePanel>

      {/* Canvas */}
      <div className="absolute inset-0 flex items-center justify-center">
        <TransformWrapper
          initialScale={1}
          disabled={isPanningLocked}
          minScale={0.5}
          maxScale={3}
          centerOnInit
          ref={transformComponentRef}
          onZoom={(ref) => setZoomLevel(ref.state.scale)}
        >
          <TransformComponent
            wrapperStyle={{ width: "100%", height: "100%" }}
            contentStyle={{ width: "100%", height: "100%" }}
          >
            <div className="relative flex items-center justify-center w-full h-full">
              <canvas
                ref={canvasRef}
                className="max-w-full max-h-full shadow-2xl"
                width={canvasSize.width}
                height={canvasSize.height}
              />

              {/* Text overlay indicator */}
              {text && text.trim() !== "" && (
                <div
                  className="absolute cursor-pointer"
                  style={{
                    top: `calc(50% + ${textY}px)`,
                    left: `calc(50% + ${textX}px)`,
                    transform: `translate(-50%, -50%) rotate(${textRotation}deg)`,
                    pointerEvents: "auto",
                    zIndex: 10,
                  }}
                  onMouseEnter={() => setIsTextHovered(true)}
                  onMouseLeave={() => setIsTextHovered(false)}
                  onClick={focusTextInput}
                >
                  <div
                    className={`p-2 rounded-md transition-all duration-200 ${
                      isTextHovered
                        ? "bg-[#CDFF63]/20 border border-[#CDFF63]/50"
                        : isFirstTextLoad
                        ? "bg-[#CDFF63]/10 border border-[#CDFF63]/30 animate-pulse-border"
                        : "bg-transparent border border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-1">
                      {isTextHovered && (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 text-[#CDFF63]"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                      )}
                      <span
                        className={`text-sm ${
                          isTextHovered ? "text-[#CDFF63]" : "text-white/70"
                        }`}
                      >
                        {isTextHovered ? "Click to edit text" : ""}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </TransformComponent>
        </TransformWrapper>

        {/* Canvas Controls Panel */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-[#1A1A1A]/90 backdrop-blur-xl rounded-full border border-white/10 px-4 py-2 flex items-center gap-3">
          <Tooltip content="Zoom in">
            <button
              onClick={handleZoomIn}
              className="p-2 text-white/60 hover:text-white/90 rounded-full transition-colors"
              aria-label="Zoom In"
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
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m4-3h-6"
                />
              </svg>
            </button>
          </Tooltip>
          <Tooltip content="Zoom out">
            <button
              onClick={handleZoomOut}
              className="p-2 text-white/60 hover:text-white/90 rounded-full transition-colors"
              aria-label="Zoom Out"
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
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7"
                />
              </svg>
            </button>
          </Tooltip>
          <Tooltip content="Reset zoom">
            <button
              onClick={handleResetZoom}
              className="p-2 text-white/60 hover:text-white/90 rounded-full transition-colors"
              aria-label="Reset Zoom"
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
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>
          </Tooltip>
          <div className="h-6 w-px bg-white/10 mx-1"></div>
          <Tooltip
            content={isPanningLocked ? "Enable panning" : "Disable panning"}
          >
            <button
              onClick={() => setIsPanningLocked(!isPanningLocked)}
              className={`p-2 rounded-full transition-colors ${
                isPanningLocked
                  ? "bg-[#CDFF63]/20 text-[#CDFF63]"
                  : "text-white/60 hover:text-white/90"
              }`}
              aria-label={
                isPanningLocked ? "Enable Panning" : "Disable Panning"
              }
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
                  d={
                    isPanningLocked
                      ? "M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      : "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  }
                />
              </svg>
            </button>
          </Tooltip>
          <span className="text-white/40 text-xs ml-1">
            {Math.round(zoomLevel * 100)}%
          </span>
        </div>
      </div>

      {/* Text Position Panel */}
      <div className="text-position-panel">
        <TextPositionPanel
          updateTextObject={updateTextObject}
          onLockChange={setIsPositionPanelLocked}
          isLocked={isPositionPanelLocked}
          currentPosition={{
            x: textX,
            y: textY,
            rotation: textRotation,
            tilt: textTilt,
            verticalTilt: textVerticalTilt,
            perspective: textPerspective,
            tiltX: textTiltX,
            tiltY: textTiltY,
            tiltZ: textTiltZ,
          }}
        />
      </div>

      {/* Dashboard Button */}
      <Tooltip content="Save and return to dashboard">
        <button
          onClick={handleGoToDashboard}
          disabled={isSaving}
          className="fixed bottom-8 right-8 px-6 py-2 bg-[#CDFF63] text-black rounded-full z-[100] flex items-center gap-2"
        >
          {isSaving ? (
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-black"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Saving...
            </span>
          ) : (
            <>
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
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Save & Exit
            </>
          )}
        </button>
      </Tooltip>

      {/* Show tutorial button (only visible after tutorial is completed) */}
      {tutorialCompleted && (
        <Tooltip content="Show tutorial again">
          <button
            onClick={() => setShowTutorial(true)}
            className="fixed bottom-8 left-8 p-3 bg-white/10 hover:bg-white/20 text-white/80 rounded-full z-[100] transition-colors"
            aria-label="Show Tutorial"
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
                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </button>
        </Tooltip>
      )}

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        percentage={uploadPercentage}
        isSubscribed={isSubscribed}
      />
    </div>
  );
}
