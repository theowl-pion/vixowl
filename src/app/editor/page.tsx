"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ImageEditor from "@/components/ImageEditor";
import { fetchImage } from "@/services/api";
import toast from "react-hot-toast";

export default function EditorPage() {
  const router = useRouter();
  const [imageData, setImageData] = useState<string | null>(null);
  const [imageId, setImageId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadImage = async () => {
      try {
        setIsLoading(true);
        const data = localStorage.getItem("tempImage");
        const id = localStorage.getItem("editImageId");

        if (!data) {
          router.push("/home");
          return;
        }

        // If we have an ID, verify it exists and belongs to the current user
        if (id) {
          try {
            await fetchImage(id);
            // If we get here, the image exists and belongs to the user
            setImageId(id);
          } catch (error) {
            console.error("Error fetching image:", error);
            // Clear the invalid image ID
            localStorage.removeItem("editImageId");
            toast.error(
              "Could not load the image for editing. Creating a new image instead."
            );
            // We'll continue with just the image data, without an ID
          }
        }

        setImageData(data);
      } catch (error) {
        console.error("Error in editor setup:", error);
        toast.error("Something went wrong. Please try again.");
        router.push("/home");
      } finally {
        setIsLoading(false);
      }
    };

    loadImage();
  }, [router]);

  if (isLoading || !imageData) {
    return (
      <div className="w-screen h-screen bg-[#1E1E1E] flex items-center justify-center">
        <div className="text-white/60">Loading image...</div>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen">
      <ImageEditor imageData={imageData} imageId={imageId || undefined} />
    </div>
  );
}
