
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ContentCarouselProps {
  images: string[];
  carouselId: string;
}

const ContentCarousel = ({ images, carouselId }: ContentCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Don't render if there are no images
  if (images.length === 0) {
    return null;
  }

  const handlePrevious = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex > 0 ? prevIndex - 1 : images.length - 1
    );
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex < images.length - 1 ? prevIndex + 1 : 0
    );
  };

  return (
    <div className="w-full my-4 relative rounded-md overflow-hidden border border-border bg-card/50">
      <div className="relative aspect-video w-full">
        <img
          src={images[currentIndex]}
          alt={`Carousel image ${currentIndex + 1}`}
          className="w-full h-full object-contain"
          loading="lazy"
        />
      </div>
      
      {images.length > 1 && (
        <>
          <Button 
            variant="secondary" 
            size="icon" 
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full opacity-90 hover:opacity-100 shadow-md"
            onClick={handlePrevious}
            aria-label="Previous image"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <Button 
            variant="secondary" 
            size="icon" 
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full opacity-90 hover:opacity-100 shadow-md"
            onClick={handleNext}
            aria-label="Next image"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          
          <div className="absolute bottom-2 right-2 bg-background/80 backdrop-blur-sm px-2 py-1 rounded text-xs font-medium">
            {currentIndex + 1} / {images.length}
          </div>
        </>
      )}
    </div>
  );
};

export default ContentCarousel;
