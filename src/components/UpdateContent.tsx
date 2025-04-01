
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
// Import Swiper types and core
import { Swiper as SwiperType } from 'swiper/types';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

interface UpdateContentProps {
  description: string;
  formattedHtml: string;
}

const UpdateContent = ({ formattedHtml }: UpdateContentProps) => {
  const contentRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Find all video elements that should autoplay and ensure they play
    if (contentRef.current) {
      const videoElements = contentRef.current.querySelectorAll('video[autoplay]');
      videoElements.forEach(element => {
        // Cast the element to HTMLVideoElement to access video-specific properties
        const video = element as HTMLVideoElement;
        
        // Force autoplay even if browser policies might block it
        video.muted = true;
        
        // Attempt to play the video
        const playPromise = video.play();
        
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.error('Auto-play was prevented:', error);
            // Add a play button or other UI if autoplay fails
          });
        }
      });
    }
    
    // Initialize Swiper manually only if needed for backward compatibility
    const initSwiper = async () => {
      if (!contentRef.current) return;
      
      // Only try to initialize if there are actual carousels with the old format
      const oldCarousels = contentRef.current.querySelectorAll('.swiper-carousel-container .swiper');
      
      if (oldCarousels.length > 0) {
        console.log("Initializing old swiper carousels:", oldCarousels.length);
        
        try {
          // Dynamic import Swiper with the modules we need
          const SwiperCore = await import('swiper');
          const { Navigation, Pagination } = await import('swiper/modules');
          
          // Initialize each carousel
          oldCarousels.forEach(carousel => {
            // Don't initialize the same carousel twice
            if ((carousel as any).__swiper__) return;
            
            const container = carousel.closest('.swiper-carousel-container') as HTMLElement;
            if (!container) return;
            
            const swiper = new SwiperCore.default(carousel as HTMLElement, {
              modules: [Navigation, Pagination],
              slidesPerView: 1,
              spaceBetween: 30,
              loop: carousel.querySelectorAll('.swiper-slide').length > 1,
              pagination: {
                el: container.querySelector('.swiper-pagination') as HTMLElement,
                clickable: true,
              },
              navigation: {
                nextEl: container.querySelector('.swiper-button-next') as HTMLElement,
                prevEl: container.querySelector('.swiper-button-prev') as HTMLElement,
              },
            });
            
            console.log("Swiper instance created:", swiper);
          });
        } catch (error) {
          console.error("Error initializing Swiper:", error);
        }
      }
    };
    
    // Run the initialization
    initSwiper();
    
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
