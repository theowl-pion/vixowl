import { ImageData } from "@/types/image";

export async function fetchUserImages(token?: string): Promise<ImageData[]> {
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch("/api/images", {
      credentials: "include",
      headers,
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to fetch images: ${JSON.stringify(error)}`);
    }
    return response.json();
  } catch (error) {
    console.error("Fetch error details:", error);
    throw error;
  }
}

export async function fetchImage(imageId: string, token?: string) {
  console.log("🔍 fetchImage - Fetching image:", imageId);

  try {
    if (!imageId) {
      console.error("❌ fetchImage - Invalid image ID");
      throw new Error("Invalid image ID: Image ID is required");
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`/api/images/${imageId}`, {
      credentials: "include",
      headers,
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("❌ fetchImage - Response error:", error);
      throw new Error(`Failed to fetch image: ${JSON.stringify(error)}`);
    }

    const image = await response.json();
    console.log("✅ fetchImage - Image fetched successfully:", {
      id: image.id,
      hasTextMetadata: !!image.textMetadata,
    });

    return image;
  } catch (error) {
    console.error("❌ fetchImage - Error details:", error);
    throw error;
  }
}

export async function trackImageUpload(token?: string) {
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch("/api/images/upload-tracker", {
      method: "POST",
      credentials: "include",
      headers,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Tracking failed: ${JSON.stringify(error)}`);
    }

    return response.json();
  } catch (error) {
    console.error("Tracking error details:", error);
    throw error;
  }
}

export async function uploadImage(
  imageData: string,
  userId: string,
  token?: string,
  textMetadata?: any
) {
  console.log("🔍 uploadImage - Starting upload", {
    userId,
    dataLength: imageData?.length || 0,
    hasTextMetadata: !!textMetadata,
  });

  try {
    if (!imageData || imageData.length < 1000) {
      console.error("❌ uploadImage - Invalid image data:", {
        length: imageData?.length || 0,
      });
      throw new Error("Invalid image data: The image appears to be empty");
    }

    if (!userId) {
      console.error("❌ uploadImage - Invalid user ID");
      throw new Error("Invalid user ID: User ID is required");
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    // Attempt to upload the image
    console.log("🔍 uploadImage - Sending POST request to /api/images");
    const response = await fetch("/api/images", {
      method: "POST",
      credentials: "include",
      headers,
      body: JSON.stringify({
        imageUrl: imageData,
        userId,
        textMetadata: textMetadata || null,
      }),
    });

    console.log("🔍 uploadImage - Response status:", response.status);

    if (!response.ok) {
      const errorData = await response.json();
      console.error("❌ uploadImage - Response error:", errorData);

      // Check if this is a subscription limit error
      if (
        response.status === 403 &&
        errorData.error === "Free plan limit reached"
      ) {
        throw new Error(
          errorData.message ||
            "You've reached your upload limit. Please upgrade to continue."
        );
      }

      throw new Error(`Upload failed: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    console.log("✅ uploadImage - Success", data);
    return data;
  } catch (error) {
    console.error("❌ uploadImage - Error details:", error);
    throw error;
  }
}

export async function deleteImage(imageId: string, token?: string) {
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`/api/images/${imageId}`, {
      method: "DELETE",
      credentials: "include",
      headers,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Delete failed: ${JSON.stringify(error)}`);
    }

    return response.json();
  } catch (error) {
    console.error("Delete error details:", error);
    throw error;
  }
}

export async function updateImage(
  imageId: string,
  imageData: string,
  token?: string,
  textMetadata?: any
) {
  console.log("🔍 updateImage - Starting update", {
    imageId,
    dataLength: imageData?.length || 0,
    hasTextMetadata: !!textMetadata,
  });

  try {
    if (!imageId) {
      console.error("❌ updateImage - Invalid image ID");
      throw new Error("Invalid image ID: Image ID is required");
    }

    if (!imageData || imageData.length < 1000) {
      console.error("❌ updateImage - Invalid image data:", {
        length: imageData?.length || 0,
      });
      throw new Error("Invalid image data: The image appears to be empty");
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    // Try to upload as a new image instead of updating
    // This is more reliable than trying to update an existing image
    console.log("🔍 updateImage - Uploading as new image instead of updating");
    try {
      const response = await fetch(`/api/images`, {
        method: "POST",
        credentials: "include",
        headers,
        body: JSON.stringify({
          imageUrl: imageData,
          textMetadata: textMetadata || null,
        }),
      });

      console.log("🔍 updateImage - Response status:", response.status);

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
          console.error("❌ updateImage - Response error details:", errorData);
        } catch (e) {
          console.error("❌ updateImage - Could not parse error response:", e);
          errorData = { message: "Could not parse error response" };
        }

        // Handle specific error cases
        if (
          response.status === 403 &&
          errorData.error === "Free plan limit reached"
        ) {
          throw new Error(
            "You've reached your free plan limit. Please upgrade to continue."
          );
        } else {
          throw new Error(
            `Upload failed: ${response.status} - ${
              errorData.error || errorData.message || "Unknown error"
            }`
          );
        }
      }

      const data = await response.json();
      console.log("✅ updateImage - Success (uploaded as new):", data);
      return data;
    } catch (uploadError) {
      console.error("❌ updateImage - Error uploading as new:", uploadError);
      throw uploadError;
    }
  } catch (error) {
    console.error("❌ updateImage - Error details:", error);
    throw error;
  }
}
