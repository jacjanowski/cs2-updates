
import { useState, useEffect } from "react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

interface ContentCarouselProps {
  images: string[];
  carouselId: string;
}

const ContentCarousel = ({ images, carouselId }: ContentCarouselProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(1);
  const [imagesLoaded, setImagesLoaded] = useState(0);
  const [api, setApi] = useState<CarouselApi>();
  
  useEffect(() => {
    // Reset loading state when images prop changes
    setIsLoading(true);
    setImagesLoaded(0);
    
    // Log for debugging
    console.log(`Rendering carousel ${carouselId} with ${images.length} images:`, images);
  }, [images, carouselId]);

  useEffect(() => {
    // Check if all images are loaded
    if (images.length > 0 && imagesLoaded >= images.length) {
      console.log(`All ${imagesLoaded} images loaded for carousel ${carouselId}, hiding loading indicator`);
      setIsLoading(false);
    }
  }, [imagesLoaded, images, carouselId]);
  
  // Update current slide when the api changes slide
  useEffect(() => {
    if (!api) return;
    
    const handleSelect = () => {
      setCurrentSlide(api.selectedScrollSnap() + 1);
    };
    
    api.on("select", handleSelect);
    
    // Set initial slide
    handleSelect();
    
    return () => {
      api.off("select", handleSelect);
    };
  }, [api]);
  
  const handleLoad = () => {
    setImagesLoaded(prev => {
      const newCount = prev + 1;
      console.log(`Image ${newCount}/${images.length} loaded in carousel ${carouselId}`);
      
      // If this is the last image, ensure loading state is cleared
      if (newCount >= images.length) {
        setIsLoading(false);
      }
      
      return newCount;
    });
  };

  const handleError = () => {
    setImagesLoaded(prev => {
      const newCount = prev + 1;
      console.error(`Failed to load image ${newCount}/${images.length} in carousel ${carouselId}`);
      
      // If this is the last image, ensure loading state is cleared even if there was an error
      if (newCount >= images.length) {
        setIsLoading(false);
      }
      
      return newCount;
    });
  };

  // Don't render if there are no images
  if (images.length === 0) {
    return null;
  }

  // If only one image, show it without carousel controls
  if (images.length === 1) {
    return (
      <div className="w-full my-4 relative rounded-md overflow-hidden border border-border bg-card/50">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted/20 backdrop-blur-sm z-10">
            <p className="text-sm text-muted-foreground animate-pulse">Loading images...</p>
          </div>
        )}
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
      
      <Carousel
        className="w-full"
        setApi={setApi}
      >
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
