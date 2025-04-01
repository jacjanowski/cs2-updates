
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ContentCarouselProps {
  images: string[];
  carouselId: string;
}

// This component is now just a fallback in case we need it for any reason
// The main carousel implementation is now directly in UpdateContent.tsx
const ContentCarousel = ({ images, carouselId }: ContentCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  // Reset loading state when images change
  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
  };

  // Don't render if there are no images
  if (images.length === 0) {
    return null;
  }

  return (
    <div id={`carousel-${carouselId}`} className="w-full my-4 relative rounded-md overflow-hidden border border-border bg-card/50">
      <div className="relative aspect-video w-full bg-muted/50">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted/20 backdrop-blur-sm z-10">
            <p className="text-sm text-muted-foreground animate-pulse">Loading image...</p>
          </div>
        )}
        
        <img
          src={images[currentIndex]}
          alt={`Carousel image ${currentIndex + 1}`}
          className="w-full h-full object-contain"
          loading="lazy"
          onLoad={handleLoad}
          onError={handleError}
        />
      </div>
      
      {images.length > 1 && (
        <div className="absolute bottom-2 right-2 bg-background/80 backdrop-blur-sm px-2 py-1 rounded text-xs font-medium">
          {currentIndex + 1} / {images.length}
        </div>
      )}
    </div>
  );
};

export default ContentCarousel;
