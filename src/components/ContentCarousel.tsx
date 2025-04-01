
import { useState, useEffect } from "react";
import { Slider } from "@/components/ui/slider";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ContentCarouselProps {
  images: string[];
  carouselId: string;
}

const ContentCarousel = ({ images, carouselId }: ContentCarouselProps) => {
  const [mounted, setMounted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || images.length === 0) {
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

  const handleSliderChange = (value: number[]) => {
    setCurrentIndex(value[0]);
  };

  return (
    <div className="w-full my-4 space-y-2">
      <div className="relative">
        <AspectRatio ratio={16 / 9} className="bg-muted/20">
          <img
            src={images[currentIndex]}
            alt={`Carousel image ${currentIndex + 1}`}
            className="w-full object-contain h-full max-h-[400px] rounded-md"
          />
        </AspectRatio>
        
        {images.length > 1 && (
          <>
            <Button 
              variant="outline" 
              size="icon" 
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full"
              onClick={handlePrevious}
              aria-label="Previous image"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <Button 
              variant="outline" 
              size="icon" 
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full"
              onClick={handleNext}
              aria-label="Next image"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>
      
      {images.length > 1 && (
        <div className="px-6">
          <Slider
            value={[currentIndex]}
            max={images.length - 1}
            step={1}
            onValueChange={handleSliderChange}
            aria-label="Carousel navigation"
          />
          <div className="text-xs text-center text-muted-foreground mt-1">
            {currentIndex + 1} / {images.length}
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentCarousel;
