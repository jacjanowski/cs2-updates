
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
// Import Swiper
import { Swiper } from 'swiper/types';
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
    // Initialize Swiper carousels if they exist
    let swiperInstances: Swiper[] = [];
    
    const initSwiper = async () => {
      if (!contentRef.current) return;
      
      try {
        // Correctly import Swiper and its modules
        const swiperModule = await import('swiper');
        const Swiper = swiperModule.default;
        
        // Import modules from the correct location
        const { Navigation, Pagination } = await import('swiper/modules');
        
        // Find all carousel containers
        const carousels = contentRef.current.querySelectorAll('.swiper-carousel-container .swiper');
        
        console.log("Found carousels:", carousels.length);
        
        // Initialize each carousel
        carousels.forEach(carousel => {
          // Don't initialize the same carousel twice
          if ((carousel as any).__swiper__) return;
          
          const container = carousel.closest('.swiper-carousel-container') as HTMLElement;
          if (!container) return;
          
          try {
            const swiper = new Swiper(carousel as HTMLElement, {
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
            
            swiperInstances.push(swiper);
            console.log("Swiper initialized successfully");
          } catch (carouselError) {
            console.error("Error initializing individual carousel:", carouselError);
          }
        });
      } catch (error) {
        console.error('Error initializing Swiper:', error);
      }
    };
    
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
    
    // Initialize Swiper only after the content is rendered
    initSwiper();
    
    // Cleanup
    return () => {
      swiperInstances.forEach(swiper => {
        if (swiper && typeof swiper.destroy === 'function') {
          swiper.destroy();
        }
      });
    };
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
