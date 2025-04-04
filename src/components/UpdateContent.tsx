
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from "@/components/ui/carousel";

interface UpdateContentProps {
  description: string;
  formattedHtml: string;
}

const UpdateContent = ({ formattedHtml }: UpdateContentProps) => {
  const contentRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!contentRef.current) return;
    
    // Find and clean up any debug/dimension text nodes
    const cleanupDebugInfo = () => {
      if (!contentRef.current) return;
      
      // Find all text nodes
      const walk = document.createTreeWalker(
        contentRef.current,
        NodeFilter.SHOW_TEXT,
        null
      );
      
      const nodesToRemove = [];
      let node;
      
      while ((node = walk.nextNode())) {
        // Check for dimension text like "400px" or html tags
        if (/^\d+px[\s]*["']?\s*[/>]/.test(node.textContent || '')) {
          nodesToRemove.push(node);
        }
      }
      
      // Remove found debug nodes
      nodesToRemove.forEach(node => {
        node.parentNode?.removeChild(node);
      });
    };
    
    // Process videos to ensure autoplay works
    const initializeVideos = () => {
      if (!contentRef.current) return;
      
      const videoElements = contentRef.current.querySelectorAll('video');
      
      videoElements.forEach(video => {
        // Ensure proper attributes are set for autoplay
        video.setAttribute('playsinline', '');
        video.setAttribute('muted', 'true');
        video.setAttribute('autoplay', '');
        video.setAttribute('loop', '');
        video.muted = true; // Explicitly set the muted property

        // Set controls to false by default (unless explicitly set)
        if (!video.hasAttribute('controls')) {
          video.controls = false;
        }
        
        // Force autoplay
        const playVideo = () => {
          video.play().catch(error => {
            console.error('Auto-play was prevented:', error);
            
            // Create a play button overlay for videos that couldn't autoplay
            const container = video.closest('.video-container') || video.parentElement;
            if (container && !container.querySelector('.video-play-button')) {
              const playButton = document.createElement('button');
              playButton.type = 'button';
              playButton.className = 'video-play-button absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors z-10';
              playButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>';
              playButton.onclick = () => {
                video.muted = false; // Unmute when user clicks
                video.play().catch(e => console.error('Play failed after click:', e));
                video.controls = true; // Show controls after starting playback
                playButton.remove();
              };
              
              // Add a relative positioning to the container if needed
              if (container instanceof HTMLElement && getComputedStyle(container).position === 'static') {
                container.style.position = 'relative';
              }
              
              container.appendChild(playButton);
            }
          });
        };

        // Try to play the video
        if (video.readyState >= 2) {
          playVideo();
        } else {
          video.addEventListener('loadeddata', playVideo, { once: true });
        }
      });
    };
    
    // Initialize carousels using shadcn/ui carousel
    const initializeCarousels = () => {
      if (!contentRef.current) return;
      
      // Find all custom carousel containers
      const customCarousels = contentRef.current.querySelectorAll('.custom-carousel');
      
      customCarousels.forEach((carousel) => {
        const slideElements = carousel.querySelectorAll('.carousel-slide');
        
        // Skip if no slides
        if (!slideElements.length) return;
        
        // Create a new shadcn carousel
        const newCarousel = document.createElement('div');
        newCarousel.className = 'w-full my-4';
        
        // Create the carousel root
        const carouselRoot = document.createElement('div');
        carouselRoot.className = 'relative';
        newCarousel.appendChild(carouselRoot);
        
        // Create the carousel content
        const carouselContent = document.createElement('div');
        carouselContent.className = 'overflow-hidden';
        carouselRoot.appendChild(carouselContent);
        
        // Create the flex container
        const flexContainer = document.createElement('div');
        flexContainer.className = 'flex -ml-4';
        carouselContent.appendChild(flexContainer);
        
        // Add slides
        slideElements.forEach((slide) => {
          const carouselItem = document.createElement('div');
          carouselItem.className = 'pl-4 min-w-0 shrink-0 grow-0 basis-full';
          carouselItem.setAttribute('role', 'group');
          carouselItem.setAttribute('aria-roledescription', 'slide');
          
          // Move the slide content
          carouselItem.innerHTML = slide.innerHTML;
          flexContainer.appendChild(carouselItem);
        });
        
        // Add navigation buttons
        const prevButton = document.createElement('button');
        prevButton.type = 'button';
        prevButton.className = 'absolute -left-4 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-background/80 text-foreground hover:bg-background z-10';
        prevButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>';
        prevButton.setAttribute('aria-label', 'Previous slide');
        carouselRoot.appendChild(prevButton);
        
        const nextButton = document.createElement('button');
        nextButton.type = 'button';
        nextButton.className = 'absolute -right-4 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-background/80 text-foreground hover:bg-background z-10';
        nextButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>';
        nextButton.setAttribute('aria-label', 'Next slide');
        carouselRoot.appendChild(nextButton);
        
        // Replace the original carousel with our new one
        carousel.parentNode?.replaceChild(newCarousel, carousel);
        
        // Create embla carousel instance
        let currentIndex = 0;
        const totalSlides = slideElements.length;
        
        // Add counter
        const counter = document.createElement('div');
        counter.className = 'absolute bottom-2 right-2 bg-background/80 backdrop-blur-sm px-2 py-1 rounded text-xs font-medium z-10';
        counter.textContent = `1 / ${totalSlides}`;
        carouselRoot.appendChild(counter);
        
        // Setup click handlers
        prevButton.addEventListener('click', () => {
          currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
          flexContainer.style.transform = `translateX(-${currentIndex * 100}%)`;
          counter.textContent = `${currentIndex + 1} / ${totalSlides}`;
        });
        
        nextButton.addEventListener('click', () => {
          currentIndex = (currentIndex + 1) % totalSlides;
          flexContainer.style.transform = `translateX(-${currentIndex * 100}%)`;
          counter.textContent = `${currentIndex + 1} / ${totalSlides}`;
        });
        
        // Add transition
        flexContainer.style.transition = 'transform 0.3s ease';
      });
    };
    
    // Run initialization
    cleanupDebugInfo();
    
    // Initialize videos and custom carousels with short delay to ensure DOM is ready
    const timer = setTimeout(() => {
      initializeVideos();
      initializeCarousels();
    }, 300);
    
    // Cleanup function
    return () => {
      clearTimeout(timer);
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
