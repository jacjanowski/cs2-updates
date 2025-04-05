
import { useState, useEffect } from "react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

interface ContentCarouselProps {
  images: string[];
  carouselId: string;
}

const ContentCarousel = ({ images, carouselId }: ContentCarouselProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(1);
  const [imagesLoaded, setImagesLoaded] = useState(0);
  
  useEffect(() => {
    // Reset loading state when images prop changes
    setIsLoading(true);
    setImagesLoaded(0);
  }, [images]);

  useEffect(() => {
    // Check if all images are loaded
    if (images.length > 0 && imagesLoaded >= images.length) {
      setIsLoading(false);
    }
  }, [imagesLoaded, images]);
  
  const handleLoad = () => {
    setImagesLoaded(prev => prev + 1);
  };

  const handleError = () => {
    setImagesLoaded(prev => prev + 1);
    console.error("Failed to load carousel image");
  };

  // Don't render if there are no images
  if (images.length === 0) {
    return null;
  }

  // If only one image, show it without carousel controls
  if (images.length === 1) {
    return (
      <div className="w-full my-4 relative rounded-md overflow-hidden border border-border bg-card/50">
        <div className="relative aspect-auto max-h-[500px]">
          <img
            src={images[0]}
            alt="Image"
            className="w-full h-auto object-contain max-h-[500px]"
            loading="lazy"
            onLoad={handleLoad}
            onError={handleError}
          />
        </div>
      </div>
    );
  }

  return (
    <div 
      id={`carousel-${carouselId}`} 
      className="w-full my-4 relative rounded-md overflow-hidden border border-border bg-card/50"
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/20 backdrop-blur-sm z-10">
          <p className="text-sm text-muted-foreground animate-pulse">Loading images...</p>
        </div>
      )}
      
      <Carousel className="w-full">
        <CarouselContent>
          {images.map((image, index) => (
            <CarouselItem key={`${carouselId}-slide-${index}`}>
              <div className="relative aspect-auto flex items-center justify-center p-2">
                <img
                  src={image}
                  alt={`Slide ${index + 1}`}
                  className="max-w-full h-auto object-contain max-h-[500px]"
                  loading="lazy"
                  onLoad={handleLoad}
                  onError={handleError}
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        
        <div className="absolute left-0 top-0 h-full w-full flex justify-between items-center pointer-events-none z-10">
          <CarouselPrevious 
            variant="ghost" 
            size="icon"
            className={cn(
              "h-8 w-8 pointer-events-auto absolute left-2 opacity-70 hover:opacity-100",
              "bg-background/80 backdrop-blur-sm"
            )}
          />
          
          <CarouselNext 
            variant="ghost" 
            size="icon"
            className={cn(
              "h-8 w-8 pointer-events-auto absolute right-2 opacity-70 hover:opacity-100",
              "bg-background/80 backdrop-blur-sm"
            )}
          />
        </div>
        
        <div className="absolute bottom-2 right-2 bg-background/80 backdrop-blur-sm px-2 py-1 rounded text-xs font-medium z-20">
          {currentSlide} / {images.length}
        </div>
      </Carousel>
    </div>
  );
};

export default ContentCarousel;
