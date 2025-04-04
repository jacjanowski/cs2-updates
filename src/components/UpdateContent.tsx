
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

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
      const videoElements = contentRef.current?.querySelectorAll('video');
      
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
    
    // Initialize custom carousels
    const initializeCarousels = () => {
      // Find all carousel containers
      const carousels = contentRef.current?.querySelectorAll('.custom-carousel');
      
      carousels?.forEach(carousel => {
        const slides = carousel.querySelectorAll('.carousel-slide');
        const prevButton = carousel.querySelector('.carousel-button.prev');
        const nextButton = carousel.querySelector('.carousel-button.next');
        const indicators = carousel.querySelectorAll('.carousel-indicators button');
        const counter = carousel.querySelector('.carousel-counter');
        
        if (!slides.length) return;
        
        let currentIndex = 0;
        
        // Function to update the active slide
        const showSlide = (index: number) => {
          // Handle index bounds
          if (index < 0) index = slides.length - 1;
          if (index >= slides.length) index = 0;
          
          currentIndex = index;
          
          // Update slides
          slides.forEach((slide, i) => {
            if (i === index) {
              slide.classList.add('active');
            } else {
              slide.classList.remove('active');
            }
          });
          
          // Update indicators
          indicators.forEach((indicator, i) => {
            if (i === index) {
              indicator.classList.add('active', 'bg-primary');
              indicator.classList.remove('bg-background/50');
            } else {
              indicator.classList.remove('active', 'bg-primary');
              indicator.classList.add('bg-background/50');
            }
          });
          
          // Update counter
          if (counter) {
            counter.textContent = `${index + 1} / ${slides.length}`;
          }
        };
        
        // Clear any existing event listeners (important fix)
        const newPrevButton = prevButton?.cloneNode(true);
        const newNextButton = nextButton?.cloneNode(true);
        
        if (prevButton && newPrevButton) {
          prevButton.parentNode?.replaceChild(newPrevButton, prevButton);
          newPrevButton.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            showSlide(currentIndex - 1);
          });
        }
        
        if (nextButton && newNextButton) {
          nextButton.parentNode?.replaceChild(newNextButton, nextButton);
          newNextButton.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            showSlide(currentIndex + 1);
          });
        }
        
        // Set up indicator click handlers with proper event handling
        indicators.forEach((indicator, i) => {
          // Clear existing listeners by cloning
          const newIndicator = indicator.cloneNode(true);
          if (indicator.parentNode) {
            indicator.parentNode.replaceChild(newIndicator, indicator);
            
            newIndicator.addEventListener('click', (e) => {
              e.preventDefault();
              e.stopPropagation();
              showSlide(i);
            });
          }
        });
        
        // Add keyboard navigation
        const handleKeyDown = (e: KeyboardEvent) => {
          if (e.key === 'ArrowLeft') {
            showSlide(currentIndex - 1);
          } else if (e.key === 'ArrowRight') {
            showSlide(currentIndex + 1);
          }
        };
        
        carousel.addEventListener('keydown', handleKeyDown);
        
        // Enable keyboard focus on the carousel
        carousel.setAttribute('tabindex', '0');
        
        // Add swipe support for touch devices
        let touchStartX = 0;
        let touchEndX = 0;
        
        carousel.addEventListener('touchstart', (e: TouchEvent) => {
          touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });
        
        carousel.addEventListener('touchend', (e: TouchEvent) => {
          touchEndX = e.changedTouches[0].screenX;
          handleSwipe();
        }, { passive: true });
        
        const handleSwipe = () => {
          const swipeThreshold = 50; // Minimum pixels to consider a swipe
          
          if (touchEndX - touchStartX > swipeThreshold) {
            // Swipe right
            showSlide(currentIndex - 1);
          } else if (touchStartX - touchEndX > swipeThreshold) {
            // Swipe left
            showSlide(currentIndex + 1);
          }
        };
        
        // Initialize the first slide
        showSlide(0);
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
