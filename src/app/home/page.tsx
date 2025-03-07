"use client";

import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { redirect, useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { v4 as uuidv4 } from "uuid";
import { imageApi } from "@/lib/api";
import Sidebar from "@/components/Sidebar";
import { useImages } from "@/hooks/useImages";
import { compressImage } from "@/services/imageCompression";
import ImageCard from "@/components/ImageCard";
import LoadingOverlay from "@/components/LoadingOverlay";
import DeleteConfirmModal from "@/components/DeleteConfirmModal";
import Navbar from "@/components/Navbar";
import { useSubscription } from "@/hooks/useSubscription";
import UpgradeModal from "@/components/UpgradeModal";
import { FREE_PLAN_IMAGE_LIMIT } from "@/lib/stripe";
import UsageDisplay from "@/components/UsageDisplay";
import { toast } from "react-hot-toast";
import axios from "axios";

interface Image {
  id: string;
  src: string;
  createdAt: Date;
  title?: string;
}

export default function HomePage() {
  const { user, session } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [imageToDelete, setImageToDelete] = useState<{
    id: string;
    src: string;
  } | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isFixingSubscription, setIsFixingSubscription] = useState(false);

  const { isSubscribed, imagesUploaded, remainingImages, refreshUsage } =
    useSubscription();

  const {
    images,
    isUploading,
    error,
    fetchImages,
    uploadImage,
    deleteImage,
    refreshImages,
    setImages,
  } = useImages({
    userId: user?.id,
    onUploadComplete: refreshUsage,
  });

  // Move the redirect to a useEffect hook
  useEffect(() => {
    if (!user) {
      router.push("/");
    }
  }, [user, router]);

  // Fetch images on initial load and when returning to this page
  useEffect(() => {
    console.log("HomePage - Initial fetch or navigation return");
    if (user?.id) {
      fetchImages();
      refreshUsage();
    }
  }, [fetchImages, refreshUsage, user?.id]);

  // Add a pathname listener to refresh images when this page is active
  useEffect(() => {
    if (pathname === "/home") {
      console.log("HomePage - Active, refreshing images");
      fetchImages();
      refreshUsage();
    }
  }, [pathname, fetchImages, refreshUsage]);

  // Manual refresh function
  const handleRefresh = () => {
    console.log("HomePage - Manual refresh triggered");
    fetchImages();
    refreshUsage();
  };

  const handleOpenFileDialog = () => {
    if (fileInputRef.current) {
      // Check if user has reached the free limit
      if (!isSubscribed && remainingImages <= 0) {
        setShowUpgradeModal(true);
        return;
      }

      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadError(null);
      const reader = new FileReader();
      reader.onloadend = async () => {
        if (reader.result && typeof reader.result === "string") {
          try {
            const compressedImage = await compressImage(reader.result);
            localStorage.setItem("tempImage", compressedImage);
            router.push("/editor");
          } catch (error: any) {
            console.error("Error compressing image:", error);

            // Check if this is a subscription limit error
            if (error.message && error.message.includes("upgrade")) {
              setShowUpgradeModal(true);
            } else {
              setUploadError("Failed to process image. Please try again.");
            }
          }
        }
      };
      reader.readAsDataURL(file);
    } catch (error: any) {
      console.error("Error reading file:", error);

      // Check if this is a subscription limit error
      if (error.message && error.message.includes("upgrade")) {
        setShowUpgradeModal(true);
      } else {
        setUploadError("Failed to read file. Please try again.");
      }
    }
  };

  const handleEdit = (id: string, src: string) => {
    localStorage.setItem("tempImage", src);
    localStorage.setItem("editImageId", id);
    router.push("/editor");
  };

  const handleDeleteClick = (img: { id: string; src: string }) => {
    setImageToDelete(img);
  };

  const handleConfirmDelete = async () => {
    if (!imageToDelete) return;

    try {
      await deleteImage(imageToDelete.id);
      // Refresh usage data after deletion
      await refreshUsage();
    } catch (error) {
      console.error("Error deleting image:", error);
    } finally {
      setImageToDelete(null);
    }
  };

  const handleDownload = (src: string) => {
    const link = document.createElement("a");
    link.href = src;
    link.download = "image.jpg";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter images based on search query (for future implementation)
  const filteredImages = images.filter(
    (img) =>
      img.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      searchQuery === ""
  );

  // Add a function to handle title changes
  const handleTitleChange = async (id: string, newTitle: string) => {
    try {
      // In a real app, you would update the title in the database
      // For now, we'll just update it in the local state
      const updatedImages = images.map((img) =>
        img.id === id ? { ...img, title: newTitle } : img
      );

      // Update the images state
      // This is a simplified approach - in a real app, you would call an API
      // to update the title in the database
      // await updateImageTitle(id, newTitle);

      // For now, just update the local state
      setImages(updatedImages);
      toast.success("Title updated successfully!");
    } catch (error) {
      console.error("Error updating title:", error);
      toast.error("Failed to update title. Please try again.");
    }
  };

  const handleFixSubscription = async () => {
    if (!session?.access_token) {
      toast.error("Please sign in to fix your subscription");
      return;
    }

    setIsFixingSubscription(true);
    try {
      const response = await axios.post(
        "/api/subscription/fix",
        {},
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (response.data.success) {
        toast.success("Subscription status updated successfully");
        // Refresh subscription data
        await refreshUsage();
      } else {
        toast.error(response.data.message || "No active subscription found");
      }
    } catch (error) {
      console.error("Error fixing subscription:", error);
      toast.error("Failed to fix subscription status");
    } finally {
      setIsFixingSubscription(false);
    }
  };

  const handleManageSubscription = async () => {
    if (!session?.access_token) {
      toast.error("Please sign in to manage your subscription");
      return;
    }

    if (isSubscribed) {
      try {
        toast.loading("Accessing billing portal...");
        const response = await axios.post(
          "/api/stripe/portal",
          {},
          {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          }
        );

        toast.dismiss();
        if (response.data.url) {
          window.location.href = response.data.url;
        }
      } catch (error: any) {
        toast.dismiss();
        console.error("Error accessing billing portal:", error);

        // Display more specific error message
        if (error.response) {
          const errorData = error.response.data;
          toast.error(
            errorData.message ||
              errorData.error ||
              "Failed to access billing portal"
          );
        } else {
          toast.error("Failed to access billing portal");
        }
      }
    } else {
      setShowUpgradeModal(true);
    }
  };

  const handleCheckSubscription = async () => {
    if (!session?.access_token) {
      toast.error("Please sign in to check your subscription");
      return;
    }

    try {
      toast.loading("Checking subscription status...");
      const response = await axios.get("/api/subscription/check", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      toast.dismiss();
      console.log("Subscription check:", response.data);
      toast.success("Subscription status checked. See console for details.");
    } catch (error: any) {
      toast.dismiss();
      console.error("Error checking subscription:", error);

      if (error.response) {
        const errorData = error.response.data;
        toast.error(
          errorData.message || errorData.error || "Failed to check subscription"
        );
      } else {
        toast.error("Failed to check subscription");
      }
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-[#1E1E1E] to-[#121212] overflow-hidden">
      <Navbar />

      {/* Decorative elements */}
      <div className="absolute top-40 left-20 w-72 h-72 bg-[#CDFF63]/10 rounded-full filter blur-[100px] opacity-30"></div>
      <div className="absolute bottom-20 right-20 w-80 h-80 bg-purple-500/10 rounded-full filter blur-[120px] opacity-20"></div>

      <main className="flex-1 px-8 pb-8 flex flex-col overflow-hidden relative z-10">
        <header className="py-6 flex justify-between items-center mb-8 w-full">
          <div>
            <h1 className="text-3xl text-white/90 font-light mb-1">
              Your Creative Canvas
            </h1>
            <p className="text-white/50 text-sm">
              Explore and manage your stunning text-behind-image masterpieces
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-white/5 backdrop-blur-md border border-white/5 rounded-full px-4 py-2 shadow-lg">
              <svg
                className="w-4 h-4 text-white/60"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                placeholder="Search designs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent text-white/90 w-64 focus:outline-none text-sm"
              />
            </div>

            <button
              onClick={handleManageSubscription}
              className="bg-gradient-to-r from-[#CDFF63] to-[#CDFF63]/90 text-black px-5 py-2 rounded-full text-sm font-medium hover:shadow-lg hover:shadow-[#CDFF63]/20 transition-all flex items-center gap-2"
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
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {isSubscribed ? "Manage Subscription" : "Upgrade to Pro"}
            </button>

            <button
              onClick={handleFixSubscription}
              disabled={isFixingSubscription}
              className="bg-[#CDFF63] text-black px-4 py-2 rounded-lg hover:bg-[#CDFF63]/90 transition-colors"
            >
              {isFixingSubscription ? "Fixing..." : "Fix Subscription"}
            </button>

            <button
              onClick={handleCheckSubscription}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Check Subscription
            </button>
          </div>
        </header>

        <div className="flex gap-6 flex-1 overflow-hidden">
          {/* Left sidebar with usage display */}
          <div className="w-80 flex-shrink-0">
            <UsageDisplay
              isSubscribed={isSubscribed}
              imagesUploaded={imagesUploaded}
              onUpgradeClick={() => setShowUpgradeModal(true)}
            />
          </div>

          {/* Main content area */}
          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold">Your Images</h1>
              <div className="flex gap-2">
                <button
                  onClick={handleRefresh}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 transition-colors"
                  disabled={isUploading}
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
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  <span className="hidden sm:inline">Refresh</span>
                </button>
                <button
                  onClick={handleOpenFileDialog}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#CDFF63] text-black hover:shadow-lg hover:shadow-[#CDFF63]/20 transition-all text-sm font-medium"
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
                  <span>Create New</span>
                </button>
              </div>
            </div>

            {images.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-white/60 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-12">
                <div className="w-20 h-20 rounded-full bg-[#CDFF63]/10 flex items-center justify-center mb-6">
                  <svg
                    className="w-10 h-10 text-[#CDFF63]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-light text-white/90 mb-2">
                  Your creative journey starts here
                </h2>
                <p className="text-white/60 text-center max-w-md mb-8">
                  Create your first masterpiece by uploading an image and adding
                  your personal touch with beautiful text effects ✨
                </p>
                <button
                  onClick={handleOpenFileDialog}
                  className="flex items-center gap-2 px-6 py-3 rounded-full bg-[#CDFF63] text-black hover:shadow-lg hover:shadow-[#CDFF63]/20 transition-all font-medium"
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
                  <span>Upload First Image</span>
                </button>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto scrollbar-hide w-full pr-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {filteredImages.map((img) => (
                      <ImageCard
                        key={img.id}
                        id={img.id}
                        src={img.src}
                        title={img.title}
                        onEdit={handleEdit}
                        onDelete={handleDeleteClick}
                        onDownload={handleDownload}
                        onTitleChange={handleTitleChange}
                      />
                    ))}
                  </div>
                </div>
              </>
            )}

            {uploadError && (
              <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
                {uploadError}
              </div>
            )}
          </div>
        </div>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/*"
        />

        {imageToDelete && (
          <DeleteConfirmModal
            isOpen={!!imageToDelete}
            onClose={() => setImageToDelete(null)}
            onConfirm={handleConfirmDelete}
          />
        )}

        {isUploading && <LoadingOverlay />}
      </main>

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        percentage={Math.min(
          (imagesUploaded / FREE_PLAN_IMAGE_LIMIT) * 100,
          100
        )}
        isSubscribed={isSubscribed}
      />
    </div>
  );
}
