
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
// Import shadcn/ui Carousel components
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

interface UpdateContentProps {
  description: string;
  formattedHtml: string;
}

const UpdateContent = ({ formattedHtml }: UpdateContentProps) => {
  const contentRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Process videos to ensure autoplay works
    if (contentRef.current) {
      // Initialize videos
      const videoElements = contentRef.current.querySelectorAll('video[autoplay]');
      videoElements.forEach(element => {
        const video = element as HTMLVideoElement;
        video.muted = true; // Must be muted to autoplay
        video.loop = true; // Loop the video
        
        // Try to play the video
        const playPromise = video.play();
        
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.error('Auto-play was prevented:', error);
          });
        }
      });
      
      // Define carousel navigation function
      window.navigateCarousel = (button: HTMLButtonElement, direction: 'prev' | 'next') => {
        const carousel = button.closest('.embla');
        if (!carousel) return;
        
        const container = carousel.querySelector('.embla__container');
        const slides = carousel.querySelectorAll('.embla__slide');
        if (!container || slides.length === 0) return;
        
        // Find currently visible slide
        let currentIndex = 0;
        slides.forEach((slide, index) => {
          if (slide.classList.contains('is-selected')) {
            currentIndex = index;
          }
        });
        
        // Calculate next index
        let nextIndex = currentIndex;
        if (direction === 'prev') {
          nextIndex = (currentIndex - 1 + slides.length) % slides.length;
        } else {
          nextIndex = (currentIndex + 1) % slides.length;
        }
        
        // Update slides
        slides.forEach((slide, index) => {
          if (index === nextIndex) {
            slide.classList.add('is-selected');
          } else {
            slide.classList.remove('is-selected');
          }
          
          (slide as HTMLElement).style.transform = `translateX(${100 * (index - nextIndex)}%)`;
        });
      };
      
      // Initialize all carousels
      const carousels = contentRef.current.querySelectorAll('.embla');
      carousels.forEach(carousel => {
        const slides = carousel.querySelectorAll('.embla__slide');
        if (slides.length === 0) return;
        
        // Select first slide
        slides[0].classList.add('is-selected');
        
        // Position all slides
        slides.forEach((slide, index) => {
          (slide as HTMLElement).style.transform = index === 0 ? 'translateX(0%)' : `translateX(${100}%)`;
        });
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

// Add the navigateCarousel function to the window object
declare global {
  interface Window {
    navigateCarousel: (button: HTMLButtonElement, direction: 'prev' | 'next') => void;
  }
}

export default UpdateContent;
