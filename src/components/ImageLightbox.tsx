import { useState, useEffect } from "react";
import { Heart, X, ChevronLeft, ChevronRight } from "lucide-react";
import { getMediaUrl } from "@/lib/api/client";

interface ImageLightboxProps {
  images: Array<{
    id: number;
    url: string;
    filename: string;
    favorites: number;
  }>;
  initialIndex: number;
  onClose: () => void;
  onFavorite: (photoId: number) => void;
}

export function ImageLightbox({
  images,
  initialIndex,
  onClose,
  onFavorite,
}: ImageLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const currentImage = images[currentIndex];

  // Handle Esc key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft") {
        handlePrev();
      } else if (e.key === "ArrowRight") {
        handleNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div
      className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/40 rounded-full text-white z-10"
      >
        <X size={24} />
      </button>

      {/* Main image */}
      <div
        className="relative w-full h-full flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={getMediaUrl(currentImage.url)}
          alt={currentImage.filename}
          className="max-w-[90vw] max-h-[90vh] object-contain"
        />

        {/* Prev button */}
        {images.length > 1 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            className="absolute left-4 p-2 bg-white/20 hover:bg-white/40 rounded-full text-white"
          >
            <ChevronLeft size={24} />
          </button>
        )}

        {/* Next button */}
        {images.length > 1 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            className="absolute right-4 p-2 bg-white/20 hover:bg-white/40 rounded-full text-white"
          >
            <ChevronRight size={24} />
          </button>
        )}

        {/* Bottom controls */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-4 items-center bg-black/50 px-6 py-3 rounded-full">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onFavorite(currentImage.id);
            }}
            className="flex items-center gap-2 text-white hover:text-red-500 transition-colors"
          >
            <Heart
              size={20}
              fill={currentImage.favorites > 0 ? "currentColor" : "none"}
              className={currentImage.favorites > 0 ? "text-red-500" : ""}
            />
          </button>

          {images.length > 1 && (
            <span className="text-white text-sm">
              {currentIndex + 1} / {images.length}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}