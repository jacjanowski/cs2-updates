
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
  
  useEffect(() => {
    if (containerSelector) {
      // Add a small delay to ensure the DOM has been updated with our placeholders
      const timeoutId = setTimeout(() => {
        const element = document.querySelector(containerSelector);
        if (element) {
          setMountElement(element);
          setPortalError(null);
          console.log(`Found mount element for carousel ${carouselId} using selector ${containerSelector}`);
        } else {
          const errorMsg = `Mount element not found for carousel ${carouselId} with selector ${containerSelector}`;
          console.warn(errorMsg);
          setPortalError(errorMsg);
          // Try again in case we need to wait for more DOM updates
          setTimeout(() => {
            const retryElement = document.querySelector(containerSelector);
            if (retryElement) {
              setMountElement(retryElement);
              setPortalError(null);
              console.log(`Found mount element on retry for carousel ${carouselId}`);
            }
          }, 1000);
        }
      }, 100);
      
      return () => clearTimeout(timeoutId);
    }
  }, [containerSelector, carouselId]);
  
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
    // Display toast for portal errors
    if (portalError) {
      toast({
        title: "Carousel error",
        description: "Unable to place carousel at the correct position. Try refreshing the page.",
        variant: "destructive"
      });
    }
  }, [portalError]);
  
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
    <>
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
    </>
  );
  
  if (containerSelector && mountElement) {
    console.log(`Rendering carousel ${carouselId} as portal into`, mountElement);
    return createPortal(carouselContent, mountElement);
  }

  // If portal mount failed but we have a selector, show an error indicator
  if (containerSelector && portalError) {
    console.error(`Portal creation failed for carousel ${carouselId}:`, portalError);
    return null; // Return null as we don't want to show misplaced carousels
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
