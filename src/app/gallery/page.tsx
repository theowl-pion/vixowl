"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

// Gallery images with categories and shape information
const galleryImages = [
  {
    id: 8,
    src: "/ASSETS/image (12).jpg",
    alt: "Text behind waterfront image",
    category: "Urban",
    shape: "rectangle",
    featured: true,
  },
  {
    id: 1,
    src: "/ASSETS/image (5).jpg",
    alt: "Text behind architecture image",
    category: "Architecture",
    shape: "square",
  },
  {
    id: 2,
    src: "/ASSETS/image (6).jpg",
    alt: "Text behind interior design image",
    category: "Interior",
    shape: "square",
  },
  {
    id: 3,
    src: "/ASSETS/image (7).jpg",
    alt: "Text behind urban space image",
    category: "Urban",
    shape: "square",
  },
  {
    id: 4,
    src: "/ASSETS/image (8).jpg",
    alt: "Text behind modern building image",
    category: "Architecture",
    shape: "square",
  },
  {
    id: 5,
    src: "/ASSETS/image (9).jpg",
    alt: "Text behind residential image",
    category: "Residential",
    shape: "rectangle",
  },
  {
    id: 6,
    src: "/ASSETS/image (10).jpg",
    alt: "Text behind office space image",
    category: "Interior",
    shape: "rectangle",
  },
  {
    id: 7,
    src: "/ASSETS/image (11).jpg",
    alt: "Text behind historical image",
    category: "Architecture",
    shape: "rectangle",
  },
  {
    id: 9,
    src: "/ASSETS/image (13).jpg",
    alt: "Text behind housing image",
    category: "Residential",
    shape: "rectangle",
  },
  {
    id: 10,
    src: "/ASSETS/image (14).jpg",
    alt: "Text behind cultural image",
    category: "Architecture",
    shape: "rectangle",
  },
  {
    id: 11,
    src: "/ASSETS/image (15).jpg",
    alt: "Text behind retail image",
    category: "Interior",
    shape: "rectangle",
  },
];

export default function GalleryPage() {
  // Force enable scrolling
  useEffect(() => {
    // Enable scrolling
    document.body.style.overflow = "auto";
    document.documentElement.style.overflow = "auto";

    // Force layout recalculation
    window.scrollTo(0, 0);
    setTimeout(() => {
      window.scrollTo(0, 1);
    }, 0);

    return () => {
      // Cleanup
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, []);

  // Get featured image
  const featuredImage = galleryImages.find((img) => img.featured);

  // Get remaining images
  const remainingImages = galleryImages.filter((img) => !img.featured);

  // Separate square and rectangle images from remaining images
  const squareImages = remainingImages.filter((img) => img.shape === "square");
  const rectangleImages = remainingImages.filter(
    (img) => img.shape === "rectangle"
  );

  // Create pairs of square images for display
  const squarePairs = [];
  for (let i = 0; i < squareImages.length; i += 2) {
    if (i + 1 < squareImages.length) {
      squarePairs.push([squareImages[i], squareImages[i + 1]]);
    } else {
      squarePairs.push([squareImages[i]]);
    }
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-auto">
      {/* Navigation */}
      <nav className="bg-black/80 backdrop-blur-md p-4 border-b border-white/10 sticky top-0 z-10">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/assets/vixowl.png"
              alt="Vixowl Logo"
              width={40}
              height={40}
              className="rounded-md"
            />
            <span className="text-2xl font-bold text-[#CDFF63]">Vixowl</span>
          </Link>
          <div className="flex gap-6">
            <Link href="/gallery" className="text-[#CDFF63]">
              Gallery
            </Link>
            <Link
              href="/pricing"
              className="text-white/70 hover:text-white transition-colors"
            >
              Pricing
            </Link>
          </div>
        </div>
      </nav>

      {/* Header */}
      <header className="py-12 bg-gradient-to-b from-black via-gray-900/80 to-black relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-[#CDFF63]/10 rounded-full filter blur-[100px] opacity-30"></div>
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full filter blur-[120px] opacity-20"></div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="text-5xl font-bold mb-4">
            Text Behind Images Gallery
          </h1>
          <p className="text-xl text-white/70 mb-0 max-w-2xl mx-auto">
            Explore our collection of designs with text positioned behind images
            for inspiration
          </p>
        </div>
      </header>

      {/* Gallery Grid */}
      <section className="pt-6 pb-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col gap-12">
            {/* Featured Image */}
            {featuredImage && (
              <div className="w-full p-4 bg-white/5 rounded-[40px] shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="group relative aspect-[16/9] overflow-hidden">
                  <Image
                    src={featuredImage.src}
                    alt={featuredImage.alt}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105 rounded-[32px]"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-[32px]"></div>
                </div>
              </div>
            )}

            {/* Alternating rows of square pairs and rectangle images */}
            {squarePairs.map((pair, pairIndex) => (
              <React.Fragment key={`pair-${pairIndex}`}>
                {/* Row of square images (2 per row) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {pair.map((image) => (
                    <div
                      key={image.id}
                      className="p-4 bg-white/5 rounded-[40px] shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <div className="group relative aspect-square overflow-hidden">
                        <Image
                          src={image.src}
                          alt={image.alt}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105 rounded-[32px]"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-[32px]"></div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Row with a rectangle image (if available) */}
                {rectangleImages[pairIndex] && (
                  <div className="w-full p-4 bg-white/5 rounded-[40px] shadow-lg hover:shadow-xl transition-all duration-300">
                    <div className="group relative aspect-[16/9] overflow-hidden">
                      <Image
                        src={rectangleImages[pairIndex].src}
                        alt={rectangleImages[pairIndex].alt}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105 rounded-[32px]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-[32px]"></div>
                    </div>
                  </div>
                )}
              </React.Fragment>
            ))}

            {/* Display any remaining rectangle images */}
            {rectangleImages.slice(squarePairs.length).map((image) => (
              <div
                key={image.id}
                className="w-full p-4 bg-white/5 rounded-[40px] shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="group relative aspect-[16/9] overflow-hidden">
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105 rounded-[32px]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-[32px]"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-black border-t border-white/10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-8 md:mb-0 text-center md:text-left">
              <h3 className="text-2xl font-bold mb-2 text-[#CDFF63]">Vixowl</h3>
              <p className="text-white/60 max-w-md">
                The ultimate platform for positioning text behind images with
                precision and style.
              </p>
            </div>
            <div className="flex gap-8">
              <Link
                href="/gallery"
                className="text-white/70 hover:text-white transition-colors text-lg"
              >
                Gallery
              </Link>
              <Link
                href="/pricing"
                className="text-white/70 hover:text-white transition-colors text-lg"
              >
                Pricing
              </Link>
            </div>
          </div>
          <div className="mt-12 text-center text-white/40 text-sm">
            © {new Date().getFullYear()} Vixowl. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
