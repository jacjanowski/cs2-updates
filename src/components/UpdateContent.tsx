
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
      const videoElements = contentRef.current?.querySelectorAll('video[autoplay]');
      
      videoElements?.forEach(element => {
        // Cast the element to HTMLVideoElement to access video-specific properties
        const video = element as HTMLVideoElement;
        
        // Ensure video is muted to support autoplay
        video.muted = true;
        
        // Force play the video
        try {
          const playPromise = video.play();
          
          if (playPromise !== undefined) {
            playPromise.catch(error => {
              console.error('Auto-play was prevented:', error);
              
              // Create a play button overlay for videos that couldn't autoplay
              const container = video.closest('.video-container');
              if (container && !container.querySelector('.video-play-button')) {
                const playButton = document.createElement('button');
                playButton.className = 'video-play-button absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors';
                playButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>';
                playButton.onclick = () => {
                  video.muted = false; // Unmute when user clicks
                  video.play().catch(e => console.error('Play failed after click:', e));
                  video.controls = true; // Show controls after starting playback
                  playButton.remove();
                };
                container.appendChild(playButton);
                
                // Add a relative positioning to the container for the absolute overlay
                container.classList.add('relative');
              }
            });
          }
        } catch (e) {
          console.error('Error playing video:', e);
        }
      });
    };
    
    // Update the formatting for carousel tags in the HTML
    const updateCarouselTags = () => {
      if (!contentRef.current) return;
      
      // Find all elements with the cs2-carousel-loading class
      const loadingElements = contentRef.current.querySelectorAll('.cs2-carousel-loading');
      
      loadingElements.forEach(element => {
        // Update the text to be more descriptive
        element.textContent = 'Loading images...';
        
        // Add some styling to make it look better
        element.classList.add('animate-pulse', 'flex', 'items-center', 'justify-center', 'h-32');
      });
    };
    
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
    
    // Initialize carousels directly
    const initializeCarousels = () => {
      // Find all carousel placeholders
      const carousels = contentRef.current?.querySelectorAll('.cs2-carousel');
      
      carousels?.forEach(carousel => {
        try {
          const carouselId = carousel.getAttribute('data-carousel-id');
          const imagesData = carousel.getAttribute('data-images');
          
          if (carouselId && imagesData) {
            const images = JSON.parse(decodeURIComponent(imagesData));
            
            // Create the carousel container
            const carouselContainer = document.createElement('div');
            carouselContainer.id = `carousel-container-${carouselId}`;
            carouselContainer.className = 'embla w-full my-4 relative rounded-md overflow-hidden border border-border bg-card/50';
            
            // Create the container for slides
            const slideContainer = document.createElement('div');
            slideContainer.className = 'embla__container flex transition-transform duration-300';
            
            // Create slides for each image
            images.forEach((image: string, index: number) => {
              const slide = document.createElement('div');
              slide.className = `embla__slide flex-shrink-0 flex-grow-0 min-w-full relative ${index === 0 ? 'is-selected' : ''}`;
              slide.style.transform = index === 0 ? 'translateX(0%)' : `translateX(100%)`;
              
              const img = document.createElement('img');
              img.src = image;
              img.alt = `Carousel image ${index + 1}`;
              img.className = 'w-full h-full object-contain';
              img.loading = 'lazy';
              
              slide.appendChild(img);
              slideContainer.appendChild(slide);
            });
            
            // Add the slide container to the carousel
            carouselContainer.appendChild(slideContainer);
            
            // Add navigation if there are multiple images
            if (images.length > 1) {
              // Create previous button
              const prevButton = document.createElement('button');
              prevButton.className = 'absolute left-2 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-secondary text-secondary-foreground opacity-90 hover:opacity-100 shadow-md flex items-center justify-center';
              prevButton.setAttribute('aria-label', 'Previous image');
              prevButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>';
              prevButton.onclick = function() {
                window.navigateCarousel(this, 'prev');
              };
              
              // Create next button
              const nextButton = document.createElement('button');
              nextButton.className = 'absolute right-2 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-secondary text-secondary-foreground opacity-90 hover:opacity-100 shadow-md flex items-center justify-center';
              nextButton.setAttribute('aria-label', 'Next image');
              nextButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>';
              nextButton.onclick = function() {
                window.navigateCarousel(this, 'next');
              };
              
              // Add counter
              const counter = document.createElement('div');
              counter.className = 'absolute bottom-2 right-2 bg-background/80 backdrop-blur-sm px-2 py-1 rounded text-xs font-medium';
              counter.textContent = `1 / ${images.length}`;
              
              carouselContainer.appendChild(prevButton);
              carouselContainer.appendChild(nextButton);
              carouselContainer.appendChild(counter);
            }
            
            // Replace the placeholder with our carousel
            carousel.parentNode?.replaceChild(carouselContainer, carousel);
          }
        } catch (error) {
          console.error('Error initializing carousel:', error);
        }
      });
    };
    
    // Run initialization
    cleanupDebugInfo();
    updateCarouselTags();
    
    // Initialize carousels and videos
    const timer = setTimeout(() => {
      cleanupDebugInfo();
      initializeCarousels();
      initializeVideos();
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

// Add the navigateCarousel function to the window object
declare global {
  interface Window {
    navigateCarousel: (button: HTMLButtonElement, direction: 'prev' | 'next') => void;
  }
}

export default UpdateContent;
