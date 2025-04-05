
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import ContentCarousel from "@/components/ContentCarousel";
import { extractImagesFromContent } from "@/utils/formatting/mediaExtractor";

interface UpdateContentProps {
  description: string;
  formattedHtml: string;
}

const UpdateContent = ({ formattedHtml, description }: UpdateContentProps) => {
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
    
    // Parse carousel data attributes and replace with ContentCarousel
    const processCustomCarousels = () => {
      if (!contentRef.current || !description) return;
      
      // Find elements with data-carousel-id attribute
      const carouselPlaceholders = contentRef.current.querySelectorAll('[data-carousel-id]');
      
      carouselPlaceholders.forEach(placeholder => {
        const carouselId = placeholder.getAttribute('data-carousel-id');
        const imagesAttr = placeholder.getAttribute('data-images');
        
        if (carouselId && imagesAttr) {
          try {
            const images = JSON.parse(imagesAttr);
            if (Array.isArray(images) && images.length > 0) {
              // Create a wrapper div for the carousel
              const carouselWrapper = document.createElement('div');
              carouselWrapper.id = `carousel-wrapper-${carouselId}`;
              carouselWrapper.className = 'my-4 carousel-wrapper';
              
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
  }, [formattedHtml, description]);
  
  // Extract carousel images for proper rendering
  const carouselData = parseCarousels(formattedHtml);
  
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
      
      {/* Render ContentCarousels as React components after the content */}
      {carouselData.map((carousel) => (
        <ContentCarousel
          key={carousel.id}
          images={carousel.images}
          carouselId={carousel.id}
        />
      ))}
    </>
  );
};

// Helper function to parse carousel data from HTML
function parseCarousels(html: string): Array<{id: string, images: string[]}> {
  const carousels: Array<{id: string, images: string[]}> = [];
  
  // Extract carousel data using regex
  const carouselRegex = /<div\s+class="carousel-container.*?"\s+data-carousel-id="([^"]+)"[^>]*>/g;
  let match;
  
  // Find all carousel containers
  while ((match = carouselRegex.exec(html)) !== null) {
    const carouselId = match[1];
    
    // Extract image URLs from this carousel
    const imgRegex = new RegExp(`data-carousel-id="${carouselId}"[\\s\\S]*?<img[^>]*src="([^"]+)"`, 'g');
    let imgMatch;
    const images: string[] = [];
    
    while ((imgMatch = imgRegex.exec(html)) !== null) {
      images.push(imgMatch[1]);
    }
    
    if (images.length > 0) {
      carousels.push({ id: carouselId, images });
    }
  }
  
  return carousels;
}

export default UpdateContent;
