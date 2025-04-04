
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
    
    // Convert custom-carousel elements to shadcn/ui Carousel components
    const initializeCarousels = () => {
      if (!contentRef.current) return;
      
      const customCarousels = contentRef.current.querySelectorAll('.custom-carousel');
      
      customCarousels.forEach((carouselElement, carouselIndex) => {
        const slideElements = carouselElement.querySelectorAll('.carousel-slide');
        if (slideElements.length === 0) return;
        
        // Create a new wrapper for our React carousel
        const carouselContainer = document.createElement('div');
        carouselContainer.className = 'carousel-wrapper my-6 relative';
        carouselContainer.dataset.carouselId = `carousel-${carouselIndex}`;
        
        // Extract slide contents for later use
        const slideContents: string[] = [];
        slideElements.forEach((slide) => {
          slideContents.push(slide.innerHTML);
        });
        
        // Replace the old carousel with our wrapper
        carouselElement.parentNode?.replaceChild(carouselContainer, carouselElement);
        
        // Create a JSON representation of slides to be parsed by our React component
        const slidesDataScript = document.createElement('script');
        slidesDataScript.type = 'application/json';
        slidesDataScript.className = 'carousel-data';
        slidesDataScript.textContent = JSON.stringify(slideContents);
        carouselContainer.appendChild(slidesDataScript);
        
        // Create and render our React carousel
        createReactCarousel(carouselContainer, slideContents, carouselIndex);
      });
    };
    
    // Create a React carousel using the shadcn/ui Carousel component
    const createReactCarousel = (container: Element, slideContents: string[], carouselIndex: number) => {
      // Clear the container first
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }
      
      // Create carousel container
      const carouselRoot = document.createElement('div');
      carouselRoot.className = 'relative w-full max-w-full';
      container.appendChild(carouselRoot);
      
      // Create carousel content
      const carouselContent = document.createElement('div');
      carouselContent.className = 'overflow-hidden relative';
      carouselRoot.appendChild(carouselContent);
      
      // Create slides container
      const slidesContainer = document.createElement('div');
      slidesContainer.className = 'flex transition-transform duration-300 ease-in-out';
      slidesContainer.dataset.embla = 'true';
      carouselContent.appendChild(slidesContainer);
      
      // Add slides
      slideContents.forEach((content, index) => {
        const slide = document.createElement('div');
        slide.className = 'min-w-0 flex-[0_0_100%] pl-4';
        slide.setAttribute('role', 'group');
        slide.setAttribute('aria-roledescription', 'slide');
        slide.innerHTML = content;
        slidesContainer.appendChild(slide);
      });
      
      // Add previous button
      const prevButton = document.createElement('button');
      prevButton.type = 'button';
      prevButton.className = 'absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-background/80 text-foreground hover:bg-background z-10 flex items-center justify-center cursor-pointer';
      prevButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>';
      prevButton.setAttribute('aria-label', 'Previous slide');
      carouselRoot.appendChild(prevButton);
      
      // Add next button
      const nextButton = document.createElement('button');
      nextButton.type = 'button';
      nextButton.className = 'absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-background/80 text-foreground hover:bg-background z-10 flex items-center justify-center cursor-pointer';
      nextButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>';
      nextButton.setAttribute('aria-label', 'Next slide');
      carouselRoot.appendChild(nextButton);
      
      // Add counter
      const counter = document.createElement('div');
      counter.className = 'absolute bottom-2 right-2 bg-background/80 backdrop-blur-sm px-2 py-1 rounded text-xs font-medium z-10';
      counter.textContent = `1 / ${slideContents.length}`;
      carouselRoot.appendChild(counter);
      
      // Set up carousel logic
      let currentIndex = 0;
      const totalSlides = slideContents.length;
      
      // Function to update the carousel display
      const updateCarousel = () => {
        slidesContainer.style.transform = `translateX(-${currentIndex * 100}%)`;
        counter.textContent = `${currentIndex + 1} / ${totalSlides}`;
      };
      
      // Setup click handlers
      prevButton.addEventListener('click', () => {
        currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
        updateCarousel();
      });
      
      nextButton.addEventListener('click', () => {
        currentIndex = (currentIndex + 1) % totalSlides;
        updateCarousel();
      });
      
      // Initialize the carousel
      updateCarousel();
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
