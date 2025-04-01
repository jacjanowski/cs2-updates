
import { useState, useEffect } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { AspectRatio } from "@/components/ui/aspect-ratio";

interface ContentCarouselProps {
  images: string[];
  carouselId: string;
}

const ContentCarousel = ({ images, carouselId }: ContentCarouselProps) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || images.length === 0) {
    return null;
  }

  return (
    <div className="w-full my-6">
      <Carousel className="w-full">
        <CarouselContent>
          {images.map((image, index) => (
            <CarouselItem key={`${carouselId}-${index}`}>
              <div className="p-1">
                <AspectRatio ratio={16 / 9} className="bg-muted/20">
                  <img
                    src={image}
                    alt={`Carousel image ${index + 1}`}
                    className="w-full object-contain max-h-[400px] rounded-md"
                  />
                </AspectRatio>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious 
          className="absolute left-2 top-1/2 -translate-y-1/2" 
          aria-label="Previous slide" 
        />
        <CarouselNext 
          className="absolute right-2 top-1/2 -translate-y-1/2" 
          aria-label="Next slide" 
        />
      </Carousel>
    </div>
  );
};

export default ContentCarousel;
