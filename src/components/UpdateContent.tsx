
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
// Import shadcn/ui Carousel components
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import 'swiper/css';

interface UpdateContentProps {
  description: string;
  formattedHtml: string;
}

const UpdateContent = ({ formattedHtml }: UpdateContentProps) => {
  const contentRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Process videos to ensure autoplay works
    if (contentRef.current) {
      const videoElements = contentRef.current.querySelectorAll('video[autoplay]');
      videoElements.forEach(element => {
        const video = element as HTMLVideoElement;
        video.muted = true;
        const playPromise = video.play();
        
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.error('Auto-play was prevented:', error);
          });
        }
      });
      
      // Process carousels
      const carouselContainers = contentRef.current.querySelectorAll('.carousel-container');
      carouselContainers.forEach(container => {
        // Ensure we don't initialize the same carousel twice
        if (container.classList.contains('initialized')) return;
        container.classList.add('initialized');
      });
    }
  }, [formattedHtml]);
  
  return (
    <div 
      ref={contentRef}
      className={cn(
        "text-foreground/90 space-y-2 update-content dark:text-gray-300",
        "prose dark:prose-invert max-w-none"
      )}
      dangerouslySetInnerHTML={{ 
        __html: formattedHtml
      }}
    />
  );
};

export default UpdateContent;
