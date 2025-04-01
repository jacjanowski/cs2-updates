
import { useState } from "react";
import { Splide, SplideSlide } from '@splidejs/react-splide';
import '@splidejs/react-splide/css';

interface ContentCarouselProps {
  images: string[];
  carouselId: string;
}

const ContentCarousel = ({ images, carouselId }: ContentCarouselProps) => {
  const [isLoading, setIsLoading] = useState(true);
  
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
      <Splide
        options={{
          type: 'slide',
          perPage: 1,
          perMove: 1,
          gap: '1rem',
          pagination: images.length > 1,
          arrows: images.length > 1,
          drag: images.length > 1,
          autoHeight: true,
        }}
        aria-label="Image Carousel"
      >
        {images.map((image, index) => (
          <SplideSlide key={`${carouselId}-slide-${index}`}>
            <div className="relative aspect-video w-full bg-muted/50">
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-muted/20 backdrop-blur-sm z-10">
                  <p className="text-sm text-muted-foreground animate-pulse">Loading image...</p>
                </div>
              )}
              <img
                src={image}
                alt={`Carousel image ${index + 1}`}
                className="w-full h-full object-contain"
                loading="lazy"
                onLoad={handleLoad}
                onError={handleError}
              />
            </div>
          </SplideSlide>
        ))}
      </Splide>
      
      {images.length > 1 && (
        <div className="absolute bottom-2 right-2 bg-background/80 backdrop-blur-sm px-2 py-1 rounded text-xs font-medium">
          1 / {images.length}
        </div>
      )}
    </div>
  );
};

export default ContentCarousel;
