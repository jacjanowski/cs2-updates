import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import ContentCarousel from "./ContentCarousel";
import { createRoot } from "react-dom/client";

interface UpdateContentProps {
  description: string;
  formattedHtml: string;
}

const UpdateContent = ({ formattedHtml }: UpdateContentProps) => {
  const contentRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!contentRef.current) return;
    
    // Initialize carousels
    const initializeCarousels = () => {
      const carousels = contentRef.current?.querySelectorAll('.cs2-carousel');
      
      carousels?.forEach(carousel => {
        const carouselId = carousel.getAttribute('data-carousel-id');
        const imagesData = carousel.getAttribute('data-images');
        
        if (carouselId && imagesData) {
          try {
            const images = JSON.parse(decodeURIComponent(imagesData));
            
            // Create a div to render our React component
            const container = document.createElement('div');
            container.id = `carousel-container-${carouselId}`;
            
            // Replace the placeholder with our container
            carousel.replaceWith(container);
            
            // Render the carousel component directly
            const reactRoot = createRoot(container);
            reactRoot.render(
              <ContentCarousel 
                images={images} 
                carouselId={carouselId} 
              />
            );
          } catch (error) {
            console.error('Error initializing carousel:', error);
          }
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
      });
    };
    
    // Initialize both carousels and videos
    initializeCarousels();
    initializeVideos();
    
    // Try again after a short delay to catch any that might have loaded later
    const timer = setTimeout(() => {
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
