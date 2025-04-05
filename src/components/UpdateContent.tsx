import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import ContentCarousel from "@/components/ContentCarousel";
import { extractCarouselsFromContent } from "@/utils/formatting/mediaExtractor";

interface UpdateContentProps {
  description: string;
  formattedHtml: string;
  carouselData?: Array<{id: string, images: string[], originalContent: string, position: number}>;
}

const UpdateContent = ({ formattedHtml, description, carouselData = [] }: UpdateContentProps) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentLoaded, setContentLoaded] = useState(false);
  
  useEffect(() => {
    if (!contentRef.current || !formattedHtml) return;
    
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
    const processCarousels = () => {
      if (!contentRef.current) return;
      
      // Find all carousel placeholders
      const carouselPlaceholders = contentRef.current.querySelectorAll('[data-carousel-id]');
      
      carouselPlaceholders.forEach(placeholder => {
        const carouselId = placeholder.getAttribute('data-carousel-id');
        const imagesAttr = placeholder.getAttribute('data-images');
        
        if (carouselId && imagesAttr) {
          try {
            const images = JSON.parse(imagesAttr);
            
            if (Array.isArray(images) && images.length > 0) {
              // Create a carousel container
              const carouselContainer = document.createElement('div');
              carouselContainer.id = `carousel-container-${carouselId}`;
              carouselContainer.className = 'carousel-container my-4';
              
              // Replace the placeholder with the container
              placeholder.parentNode?.replaceChild(carouselContainer, placeholder);
              
              // Create the carousel component
              const carousel = document.createElement('div');
              carousel.id = `carousel-${carouselId}`;
              carousel.className = 'w-full my-4 relative rounded-md overflow-hidden border border-border bg-card/50';
              
              // Create image container
              if (images.length === 1) {
                // For single image, create a simple image element
                const img = document.createElement('img');
                img.src = images[0];
                img.alt = 'Update image';
                img.className = 'w-full h-auto object-contain max-h-[500px]';
                img.loading = 'lazy';
                carousel.appendChild(img);
              } else {
                // For multiple images, create a dynamic carousel
                const carouselInner = document.createElement('div');
                carouselInner.className = 'carousel-inner';
                carouselInner.setAttribute('data-carousel-id', carouselId);
                carouselInner.setAttribute('data-images', imagesAttr);
                carousel.appendChild(carouselInner);
                
                // Create mounting point for React carousel
                const reactRoot = document.createElement('div');
                reactRoot.id = `carousel-mount-${carouselId}`;
                carouselInner.appendChild(reactRoot);
                
                // Initialize the React carousel
                const root = document.getElementById(`carousel-mount-${carouselId}`);
                if (root) {
                  // We'll handle this in a separate effect
                  root.setAttribute('data-ready', 'true');
                }
              }
              
              carouselContainer.appendChild(carousel);
            }
          } catch (e) {
            console.error('Error processing carousel data:', e);
          }
        }
      });
      
      // Mark content as loaded to trigger carousel rendering
      setContentLoaded(true);
    };
    
    // Run initialization with a small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      try {
        cleanupDebugInfo();
        initializeVideos();
        processCarousels();
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
      
      {/* Render ContentCarousels after content loads */}
      {contentLoaded && carouselData.map((carousel) => {
        const mountPoint = document.getElementById(`carousel-mount-${carousel.id}`);
        if (mountPoint && carousel.images.length > 1) {
          return (
            <ContentCarousel
              key={carousel.id}
              images={carousel.images}
              carouselId={carousel.id}
              containerSelector={`#carousel-mount-${carousel.id}`}
            />
          );
        }
        return null;
      })}
    </>
  );
};

export default UpdateContent;
