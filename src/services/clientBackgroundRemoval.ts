import { removeBackground as backgroundRemoval } from "@imgly/background-removal";

/**
 * Removes the background from an image using the @imgly/background-removal package
 * This is a client-side implementation that runs in the browser
 *
 * @param imageUrl - The URL or data URL of the image to process
 * @returns A Promise that resolves to a data URL of the image with the background removed
 */
export async function removeBackgroundClient(
  imageUrl: string
): Promise<string> {
  try {
    // If the image is a data URL, use it directly
    // Otherwise, fetch it and convert to a Blob
    const imageBlob = imageUrl.startsWith("data:")
      ? await fetch(imageUrl).then((r) => r.blob())
      : await fetch(imageUrl).then((r) => r.blob());

    // Use the @imgly/background-removal package to remove the background
    const removedBgBlob = await backgroundRemoval(imageBlob, {
      // Optional configuration
      progress: (...args: any[]) => {
        if (typeof args[1] === "number") {
          console.log(`Background removal progress: ${args[1] * 100}%`);
        }
      },
      model: "isnet", // Use isnet model which is the default high-quality model
      output: {
        format: "image/png", // PNG format to preserve transparency
        quality: 0.8,
      },
    });

    // Convert the result back to a data URL
    return URL.createObjectURL(removedBgBlob);
  } catch (error) {
    console.error("Error removing background on client:", error);
    throw error;
  }
}
