import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import ContentCarousel from "@/components/ContentCarousel";
import { extractImagesFromContent } from "@/utils/formatting/mediaExtractor";

interface UpdateContentProps {
  description: string;
  formattedHtml: string;
}

const UpdateContent = ({ formattedHtml, description }: UpdateContentProps) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [carousels, setCarousels] = useState<Array<{ id: string, images: string[] }>>([]);
  
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
        // Check for dimension text like "400px" or html attribute text
        if (/^\d+px[\s]*$/.test(node.textContent || '')) {
          nodesToRemove.push(node);
        }
        
        if (/^object-contain/.test(node.textContent || '')) {
          nodesToRemove.push(node);
        }
        
        if (/^loading=/.test(node.textContent || '')) {
          nodesToRemove.push(node);
        }
      }
      
      // Remove found debug nodes
      nodesToRemove.forEach(node => {
        node.parentNode?.removeChild(node);
      });
    };
    
    // Initialize video players
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
            console.log('Auto-play was prevented:', error);
            
            // Create a play button overlay for videos that couldn't autoplay
            const container = video.closest('.video-container') || video.parentElement;
            if (container && !container.querySelector('.video-play-button')) {
              const playButton = document.createElement('button');
              playButton.type = 'button';
              playButton.className = 'video-play-button absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors z-10';
              playButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>';
              playButton.onclick = () => {
                video.muted = false; // Unmute when user clicks
                video.play().catch(e => console.log('Play failed after click:', e));
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
    
    // Process carousel placeholders
    const processCustomCarousels = () => {
      if (!contentRef.current || !formattedHtml) return;
      
      // Find all carousel placeholders in the DOM
      const carouselPlaceholders = contentRef.current.querySelectorAll('[data-carousel-id]');
      const extractedCarousels: Array<{ id: string, images: string[] }> = [];
      
      carouselPlaceholders.forEach(placeholder => {
        const carouselId = placeholder.getAttribute('data-carousel-id');
        const imagesAttr = placeholder.getAttribute('data-images');
        
        if (carouselId && imagesAttr) {
          try {
            const images = JSON.parse(imagesAttr);
            if (Array.isArray(images) && images.length > 0) {
              extractedCarousels.push({ id: carouselId, images });
              
              // Create a wrapper div with the id that ContentCarousel will connect to
              const carouselWrapper = document.createElement('div');
              carouselWrapper.id = `carousel-wrapper-${carouselId}`;
              carouselWrapper.className = 'my-4 w-full carousel-wrapper';
              
              // Replace the placeholder with the wrapper
              if (placeholder.parentNode) {
                placeholder.parentNode.replaceChild(carouselWrapper, placeholder);
              }
            }
          } catch (e) {
            console.error('Error processing carousel data:', e);
          }
        }
      });
      
      // Update carousels state to trigger render of ContentCarousel components
      if (extractedCarousels.length > 0) {
        setCarousels(extractedCarousels);
      }
    };
    
    // Run initialization with a small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      try {
        cleanupDebugInfo();
        initializeVideos();
        processCustomCarousels();
      } catch (err) {
        console.error('Error initializing content:', err);
      }
    }, 100);
    
    // Cleanup function
    return () => {
      clearTimeout(timer);
    };
  }, [formattedHtml]);
  
  return (
    <>
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
      
      {/* Render ContentCarousels */}
      {carousels.map((carousel) => (
        <ContentCarousel
          key={carousel.id}
          images={carousel.images}
          carouselId={carousel.id}
        />
      ))}
    </>
  );
};

export default UpdateContent;
