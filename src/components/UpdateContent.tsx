
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import ContentCarousel from "./ContentCarousel";

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
    
    // Initialize carousels directly without React DOM
    const initializeCarousels = () => {
      // Find all carousel placeholders
      const carousels = contentRef.current?.querySelectorAll('.cs2-carousel');
      
      carousels?.forEach(carousel => {
        try {
          const carouselId = carousel.getAttribute('data-carousel-id');
          const imagesData = carousel.getAttribute('data-images');
          
          if (carouselId && imagesData) {
            const images = JSON.parse(decodeURIComponent(imagesData));
            
            // Create the carousel element directly
            const carouselContainer = document.createElement('div');
            carouselContainer.id = `carousel-container-${carouselId}`;
            carouselContainer.className = 'carousel-container';
            
            // Create a carousel instance
            const carouselInstance = document.createElement('div');
            carouselInstance.className = 'w-full my-4 relative rounded-md overflow-hidden border border-border bg-card/50';
            
            // Image container
            const imageContainer = document.createElement('div');
            imageContainer.className = 'relative aspect-video w-full';
            
            // Current image
            const img = document.createElement('img');
            img.src = images[0];
            img.alt = 'Carousel image 1';
            img.className = 'w-full h-full object-contain';
            img.loading = 'lazy';
            
            // Append elements
            imageContainer.appendChild(img);
            carouselInstance.appendChild(imageContainer);
            
            // Add navigation if multiple images
            if (images.length > 1) {
              // Add counter
              const counter = document.createElement('div');
              counter.className = 'absolute bottom-2 right-2 bg-background/80 backdrop-blur-sm px-2 py-1 rounded text-xs font-medium';
              counter.textContent = `1 / ${images.length}`;
              carouselInstance.appendChild(counter);
            }
            
            // Replace the placeholder with our carousel
            carouselContainer.appendChild(carouselInstance);
            carousel.parentNode?.replaceChild(carouselContainer, carousel);
            
            // Create a real React carousel
            const carouselElement = document.createElement('div');
            carouselElement.id = `carousel-${carouselId}`;
            carouselElement.className = 'carousel-react-container';
            carouselContainer.appendChild(carouselElement);
            
            // Import the ContentCarousel component at runtime and render it
            const carouselComponent = new ContentCarousel({ 
              images: images,
              carouselId: carouselId
            });
            
            // Replace our dummy carousel with the real one
            carouselContainer.replaceChild(carouselElement, carouselInstance);
          }
        } catch (error) {
          console.error('Error initializing carousel:', error);
        }
      });
    };
    
    // Find all video elements and ensure they play
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
    
    // Run initialization
    cleanupDebugInfo();
    
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
    
    // Run the update for carousel tags
    updateCarouselTags();
    
    // Initialize carousels and videos
    const timer = setTimeout(() => {
      cleanupDebugInfo();
      initializeCarousels();
      initializeVideos();
    }, 300);
    
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
