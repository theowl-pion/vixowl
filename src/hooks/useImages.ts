import { useState, useCallback, useEffect } from "react";
import {
  fetchUserImages,
  uploadImage as uploadImageApi,
  deleteImage as deleteImageApi,
} from "@/services/api";
import { ImageData } from "@/types/image";

interface UseImagesProps {
  userId?: string;
  onUploadComplete?: () => Promise<void>;
}

export function useImages({ userId, onUploadComplete }: UseImagesProps) {
  const [images, setImages] = useState<ImageData[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<number>(Date.now());

  const fetchImages = useCallback(async () => {
    if (!userId) {
      console.warn("No userId provided for fetchImages");
      return;
    }

    try {
      console.log("fetchImages - Fetching images for user:", userId);
      const fetchedImages = await fetchUserImages();
      console.log("fetchImages - Fetched images:", fetchedImages.length);
      setImages(fetchedImages);
      setError(null);
      setLastRefresh(Date.now());
    } catch (err) {
      console.error("Error fetching images:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch images");
    }
  }, [userId]);

  // Fetch images on mount and when userId changes
  useEffect(() => {
    if (userId) {
      console.log("useImages - Initial fetch for user:", userId);
      fetchImages();
    }
  }, [userId, fetchImages]);

  const uploadImage = useCallback(
    async (imageData: string) => {
      if (!userId) {
        console.error("No userId provided for uploadImage");
        throw new Error("User ID is required");
      }

      try {
        setIsUploading(true);
        console.log("Starting upload...");
        const result = await uploadImageApi(imageData, userId);
        console.log("Upload successful, result:", result);

        // Refresh the images list
        await fetchImages();

        // Call the onUploadComplete callback if provided
        if (onUploadComplete) {
          await onUploadComplete();
        }

        return result;
      } catch (err) {
        console.error("Upload error:", err);
        setError(err instanceof Error ? err.message : "Failed to upload image");
        throw err; // Re-throw to allow handling in the component
      } finally {
        setIsUploading(false);
      }
    },
    [fetchImages, userId, onUploadComplete]
  );

  const deleteImage = useCallback(
    async (imageId: string) => {
      try {
        await deleteImageApi(imageId);
        setImages((prevImages) =>
          prevImages.filter((img) => img.id !== imageId)
        );

        // Call the onUploadComplete callback if provided (to refresh usage stats)
        if (onUploadComplete) {
          await onUploadComplete();
        }
      } catch (error) {
        console.error("Failed to delete image:", error);
        throw error;
      }
    },
    [onUploadComplete]
  );

  // Force refresh function
  const refreshImages = useCallback(() => {
    fetchImages();
  }, [fetchImages]);

  return {
    images,
    isUploading,
    error,
    fetchImages,
    uploadImage,
    deleteImage,
    refreshImages,
    lastRefresh,
    setImages,
  };
}
