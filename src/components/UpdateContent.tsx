
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
    
    // Initialize carousels using shadcn/ui Carousel component
    const initializeCarousels = () => {
      if (!contentRef.current) return;
      
      const carousels = contentRef.current.querySelectorAll('.embedded-carousel');
      
      carousels.forEach((carouselElement) => {
        // Parse the image data from the data attribute
        const imagesData = carouselElement.getAttribute('data-carousel-images');
        if (!imagesData) return;
        
        try {
          // Parse the JSON array of image URLs
          const images = JSON.parse(imagesData);
          if (!Array.isArray(images) || images.length === 0) return;
          
          // Create the carousel root
          const carouselRoot = document.createElement('div');
          carouselRoot.className = 'relative w-full carousel-wrapper';
          
          // Create the shadcn/ui carousel structure
          const carousel = document.createElement('div');
          carousel.setAttribute('data-carousel', 'true');
          carousel.className = 'w-full';
          
          // Create carousel content
          const carouselContent = document.createElement('div');
          carouselContent.className = 'relative overflow-hidden rounded-lg';
          carousel.appendChild(carouselContent);
          
          // Create slides container
          const slidesContainer = document.createElement('div');
          slidesContainer.className = 'flex transition-transform duration-300';
          carouselContent.appendChild(slidesContainer);
          
          // Add all images as slides
          images.forEach((imageUrl, index) => {
            const slide = document.createElement('div');
            slide.className = 'flex-[0_0_100%] min-w-0 h-full relative p-2';
            slide.setAttribute('data-slide-index', index.toString());
            
            const img = document.createElement('img');
            img.src = imageUrl;
            img.alt = `Slide ${index + 1}`;
            img.className = 'w-full h-auto max-h-[500px] object-contain';
            img.loading = 'lazy';
            
            slide.appendChild(img);
            slidesContainer.appendChild(slide);
          });
          
          // Create next/prev buttons
          const prevButton = document.createElement('button');
          prevButton.type = 'button';
          prevButton.className = 'absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-background/80 text-foreground hover:bg-background shadow-sm z-10 flex items-center justify-center';
          prevButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>';
          carousel.appendChild(prevButton);
          
          const nextButton = document.createElement('button');
          nextButton.type = 'button';
          nextButton.className = 'absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-background/80 text-foreground hover:bg-background shadow-sm z-10 flex items-center justify-center';
          nextButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>';
          carousel.appendChild(nextButton);
          
          // Add counter indicator
          const counter = document.createElement('div');
          counter.className = 'absolute bottom-2 right-2 bg-background/80 backdrop-blur-sm px-2 py-1 rounded text-xs font-medium z-10';
          counter.textContent = `1 / ${images.length}`;
          carousel.appendChild(counter);
          
          // Replace the placeholder with our carousel
          carouselRoot.appendChild(carousel);
          carouselElement.parentNode?.replaceChild(carouselRoot, carouselElement);
          
          // Set up carousel state and controls
          let currentIndex = 0;
          
          // Update slides position
          const updateSlides = () => {
            slidesContainer.style.transform = `translateX(-${currentIndex * 100}%)`;
            counter.textContent = `${currentIndex + 1} / ${images.length}`;
          };
          
          // Set up navigation handlers
          prevButton.addEventListener('click', () => {
            currentIndex = (currentIndex - 1 + images.length) % images.length;
            updateSlides();
          });
          
          nextButton.addEventListener('click', () => {
            currentIndex = (currentIndex + 1) % images.length;
            updateSlides();
          });
          
          // Initial position update
          updateSlides();
          
        } catch (error) {
          console.error('Error initializing carousel:', error);
          // Fallback for error - just show a message
          const errorMsg = document.createElement('div');
          errorMsg.className = 'p-4 text-red-500 border border-red-200 rounded-md';
          errorMsg.textContent = 'Error loading carousel';
          carouselElement.parentNode?.replaceChild(errorMsg, carouselElement);
        }
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
