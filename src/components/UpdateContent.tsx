import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import ReactDOM from "react-dom";
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
            
            // Create a container for the React carousel
            const carouselContainer = document.createElement('div');
            carouselContainer.id = `carousel-container-${carouselId}`;
            carouselContainer.className = 'carousel-container';
            
            // Replace the placeholder with our container
            carousel.parentNode?.replaceChild(carouselContainer, carousel);
            
            // Use ReactDOM to render the carousel component
            if (images.length > 0) {
              ReactDOM.render(
                <ContentCarousel images={images} carouselId={carouselId} />,
                carouselContainer
              );
            }
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
    
    // Cleanup function to remove any mounted components on unmount
    return () => {
      clearTimeout(timer);
      
      // Find and cleanup any carousel containers
      const carouselContainers = document.querySelectorAll('[id^="carousel-container-"]');
      carouselContainers.forEach(container => {
        ReactDOM.unmountComponentAtNode(container);
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
