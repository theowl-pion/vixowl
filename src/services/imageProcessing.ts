const REMOVE_BG_API_KEY = "YOUR_API_KEY"; // À remplacer par votre clé API

export async function processImage(imageData: string) {
  try {
    // Créer une nouvelle image
    const img = new Image();
    img.src = imageData;
    await new Promise((resolve) => {
      img.onload = resolve;
    });

    return {
      originalImage: imageData,
      width: img.width,
      height: img.height,
    };
  } catch (error) {
    console.error("Error processing image:", error);
    throw error;
  }
}
