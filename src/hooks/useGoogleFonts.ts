import { useState, useCallback } from "react";

const GOOGLE_FONTS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_FONTS_API_KEY;

interface GoogleFont {
  family: string;
  // Ajoutez d'autres propriétés si nécessaire
}

export function useGoogleFonts() {
  const [loadedFonts, setLoadedFonts] = useState<string[]>([]);

  const loadFonts = useCallback(
    async (fonts: string[]) => {
      const newFonts = fonts.filter((font) => !loadedFonts.includes(font));
      if (newFonts.length === 0) return;

      try {
        // Charger la police via l'API Web Font Loader
        const WebFont = (await import("webfontloader")).default;

        await new Promise<void>((resolve, reject) => {
          WebFont.load({
            google: {
              families: newFonts,
            },
            active: () => resolve(),
            inactive: () => reject(new Error("Failed to load font")),
            timeout: 2000,
          });
        });

        setLoadedFonts((prev) => [...prev, ...newFonts]);
      } catch (error) {
        console.error("Error loading fonts:", error);
        throw error;
      }
    },
    [loadedFonts]
  );

  const loadFontOptions = useCallback(async (inputValue: string) => {
    if (!GOOGLE_FONTS_API_KEY) {
      console.error("Google Fonts API key is missing");
      return [];
    }

    try {
      const response = await fetch(
        `https://www.googleapis.com/webfonts/v1/webfonts?key=${GOOGLE_FONTS_API_KEY}&sort=popularity`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch fonts");
      }

      const data = await response.json();

      return data.items
        .filter((font: { family: string }) =>
          font.family.toLowerCase().includes(inputValue.toLowerCase())
        )
        .map((font: { family: string }) => ({
          value: font.family,
          label: font.family,
        }));
    } catch (error) {
      console.error("Error loading fonts:", error);
      return [];
    }
  }, []);

  return { loadFonts, loadFontOptions };
}
