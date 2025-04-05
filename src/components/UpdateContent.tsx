import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import ContentCarousel from "@/components/ContentCarousel";
import { extractImagesFromContent } from "@/utils/formatting/mediaExtractor";
import ReactDOM from "react-dom/client";

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
    
    // Process carousel placeholders - instead of creating wrappers that get populated later,
    // we'll directly replace the placeholders with the actual carousels
    const processCustomCarousels = () => {
      if (!contentRef.current || !formattedHtml) return;
      
      // Find all carousel placeholders in the DOM
      const carouselPlaceholders = contentRef.current.querySelectorAll('[data-carousel-id]');
      
      carouselPlaceholders.forEach(placeholder => {
        const carouselId = placeholder.getAttribute('data-carousel-id');
        const imagesAttr = placeholder.getAttribute('data-images');
        
        if (carouselId && imagesAttr) {
          try {
            const images = JSON.parse(imagesAttr);
            if (Array.isArray(images) && images.length > 0) {
              // Create a new div that will be our carousel container
              const carouselContainer = document.createElement('div');
              carouselContainer.id = `carousel-container-${carouselId}`;
              carouselContainer.className = 'carousel-container'; 
              
              // Replace the placeholder with our container
              if (placeholder.parentNode) {
                placeholder.parentNode.replaceChild(carouselContainer, placeholder);
                
                // Create and render a carousel directly into this container
                const carousel = document.createElement('div');
                carousel.id = `carousel-wrapper-${carouselId}`;
                carousel.setAttribute('data-carousel-id', carouselId);
                carousel.setAttribute('data-images', imagesAttr);
                carouselContainer.appendChild(carousel);
                
                // Create the React component in this container
                if (carousel) {
                  // Use ReactDOM to render the carousel where it belongs in the document
                  const carouselElement = <ContentCarousel 
                    key={carouselId} 
                    images={images}
                    carouselId={carouselId}
                  />;
                  
                  // We'll track this carousel to render it via React
                  setCarousels(current => {
                    // Check if we already have this carousel
                    if (!current.some(c => c.id === carouselId)) {
                      return [...current, { id: carouselId, images }];
                    }
                    return current;
                  });
                }
              }
            }
          } catch (e) {
            console.error('Error processing carousel data:', e);
          }
        }
      });
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
  
  // Render the carousels where they should be by finding the corresponding elements
  useEffect(() => {
    if (!contentRef.current) return;
    
    carousels.forEach(carousel => {
      const container = document.getElementById(`carousel-wrapper-${carousel.id}`);
      if (container && !container.hasAttribute('data-carousel-rendered')) {
        // Mark as rendered to avoid duplicate renders
        container.setAttribute('data-carousel-rendered', 'true');
        
        // Create a div that will be our portal target
        const portalTarget = document.createElement('div');
        portalTarget.className = 'carousel-render-target';
        container.appendChild(portalTarget);
        
        // Use React DOM Portal to render the carousel into the correct DOM position
        const root = ReactDOM.createRoot(portalTarget);
        root.render(
          <ContentCarousel
            key={carousel.id}
            images={carousel.images}
            carouselId={carousel.id}
          />
        );
      }
    });
    
    // Cleanup on unmount
    return () => {
      carousels.forEach(carousel => {
        const container = document.getElementById(`carousel-wrapper-${carousel.id}`);
        if (container) {
          // Clean up any rendered carousels
          container.innerHTML = '';
        }
      });
    };
  }, [carousels]);
  
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
