import axios from "axios";

const apiClient = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 60000, // Augmenté à 60 secondes
  maxContentLength: 50 * 1024 * 1024, // 50MB max
  maxBodyLength: 50 * 1024 * 1024, // 50MB max
});

export const imageApi = {
  fetchUserImages: async (userId: string | undefined) => {
    if (!userId) {
      throw new Error("User ID is required");
    }

    try {
      const response = await fetch(`/api/images?userId=${userId}`, {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `HTTP error! status: ${response.status}, message: ${
            errorData.error || response.statusText
          }`
        );
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching images:", error);
      throw error;
    }
  },

  uploadImage: async (userId: string, src: string) => {
    try {
      console.log("Starting API upload request");
      console.log("Image size:", (src.length / 1024 / 1024).toFixed(2) + "MB");

      const response = await fetch("/api/images", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, src }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `Upload failed: ${errorData.error || response.statusText}`
        );
      }

      const data = await response.json();
      console.log("Upload successful");
      return data;
    } catch (error) {
      console.error("Upload error details:", {
        message: error instanceof Error ? error.message : "Unknown error",
        error,
      });
      throw error;
    }
  },

  deleteImage: async (imageId: string) => {
    try {
      const response = await fetch(`/api/images/${imageId}`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `Delete failed: ${errorData.error || response.statusText}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Error deleting image:", error);
      throw error;
    }
  },
};
