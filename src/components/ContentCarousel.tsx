
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

interface ContentCarouselProps {
  images: string[];
  carouselId: string;
  containerSelector?: string; // Optional selector to mount carousel in specific DOM element
}

const ContentCarousel = ({ images, carouselId, containerSelector }: ContentCarouselProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(1);
  const [imagesLoaded, setImagesLoaded] = useState(0);
  const [api, setApi] = useState<CarouselApi>();
  const [mountElement, setMountElement] = useState<Element | null>(null);
  const [portalError, setPortalError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [mountAttempted, setMountAttempted] = useState(false);
  
  // Force re-render on mount to ensure proper initialization
  useEffect(() => {
    // Initial render flag
    const timer = setTimeout(() => setMountAttempted(true), 50);
    return () => clearTimeout(timer);
  }, []);
  
  useEffect(() => {
    if (containerSelector) {
      const checkForElement = () => {
        console.log(`Looking for mount element for carousel ${carouselId} using selector ${containerSelector}`);
        const element = document.querySelector(containerSelector);
        if (element) {
          console.log(`Found mount element for carousel ${carouselId}:`, element);
          
          // Apply styling to the placeholder element - important for visibility
          element.className = "my-4 w-full carousel-placeholder bg-muted/20 min-h-[300px] rounded-md border border-border";
          
          // Ensure element is empty to prevent content flicker
          while (element.firstChild) {
            element.removeChild(element.firstChild);
          }
          
          setMountElement(element);
          setPortalError(null);
        } else {
          console.warn(`Mount element not found for carousel ${carouselId} with selector ${containerSelector}`);
          if (retryCount < 15) { // Increase max retries further
            setRetryCount(prev => prev + 1);
          } else {
            const errorMsg = `Failed to find mount element for carousel ${carouselId} after ${retryCount} attempts`;
            console.error(errorMsg);
            setPortalError(errorMsg);
          }
        }
      };

      // Initial check with a shorter delay to ensure DOM is updated quickly
      const timeoutId = setTimeout(checkForElement, 100);
      
      // Retry logic with increased frequency
      if (retryCount > 0 && retryCount < 15 && !mountElement) {
        const retryInterval = 200 * Math.min(retryCount, 3); // Shorter intervals
        console.log(`Scheduling retry ${retryCount} for carousel ${carouselId} in ${retryInterval}ms`);
        const retryTimeoutId = setTimeout(checkForElement, retryInterval);
        return () => clearTimeout(retryTimeoutId);
      }
      
      return () => clearTimeout(timeoutId);
    }
  }, [containerSelector, carouselId, retryCount, mountElement, mountAttempted]);
  
  useEffect(() => {
    setIsLoading(true);
    setImagesLoaded(0);
    
    console.log(`Rendering carousel ${carouselId} with ${images.length} images:`, images);
  }, [images, carouselId]);

  useEffect(() => {
    if (images.length > 0 && imagesLoaded >= images.length) {
      console.log(`All ${imagesLoaded} images loaded for carousel ${carouselId}, hiding loading indicator`);
      setIsLoading(false);
    }
  }, [imagesLoaded, images, carouselId]);
  
  useEffect(() => {
    if (!api) return;
    
    const handleSelect = () => {
      setCurrentSlide(api.selectedScrollSnap() + 1);
    };
    
    api.on("select", handleSelect);
    
    handleSelect();
    
    return () => {
      api.off("select", handleSelect);
    };
  }, [api]);
  
  useEffect(() => {
    // Display toast for portal errors after multiple retries
    if (portalError && retryCount >= 15) {
      toast({
        title: "Carousel error",
        description: "Unable to place carousel at the correct position. Try refreshing the page.",
        variant: "destructive"
      });
    }
  }, [portalError, retryCount]);
  
  const handleLoad = () => {
    setImagesLoaded(prev => {
      const newCount = prev + 1;
      console.log(`Image ${newCount}/${images.length} loaded in carousel ${carouselId}`);
      return newCount;
    });
  };

  const handleError = () => {
    setImagesLoaded(prev => {
      const newCount = prev + 1;
      console.error(`Failed to load image ${newCount}/${images.length} in carousel ${carouselId}`);
      return newCount;
    });
  };

  if (images.length === 0) {
    return null;
  }

  const carouselContent = (
    <div className="relative w-full">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/20 backdrop-blur-sm z-10">
          <div className="flex flex-col items-center">
            <p className="text-sm text-muted-foreground animate-pulse mb-1">Loading images...</p>
            <p className="text-xs text-muted-foreground">{imagesLoaded} of {images.length}</p>
          </div>
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
  
  // If we have a mount element, render as a portal
  if (containerSelector && mountElement) {
    console.log(`Rendering carousel ${carouselId} as portal into`, mountElement);
    return createPortal(carouselContent, mountElement);
  }

  // If portal mount failed after retries but we have a selector, show an error indicator
  if (containerSelector && portalError && retryCount >= 15) {
    console.error(`Portal creation failed for carousel ${carouselId}:`, portalError);
    // Return a fallback if portal doesn't work (render directly in component tree)
    return (
      <div 
        className="w-full my-4 relative rounded-md overflow-hidden border border-border bg-card/50"
      >
        <div className="p-4 text-center">
          <p className="text-red-500">Carousel failed to mount at proper position</p>
          {carouselContent}
        </div>
      </div>
    );
  }

  // While still trying, show an empty state
  if (containerSelector && retryCount < 15 && !mountElement) {
    return null;
  }

  // Default case: render carousel directly without portal
  return (
    <div 
      id={`carousel-${carouselId}`} 
      className="w-full my-4 relative rounded-md overflow-hidden border border-border bg-card/50"
    >
      {carouselContent}
    </div>
  );
};

export default ContentCarousel;
