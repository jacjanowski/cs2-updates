
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
      
      const carouselWrappers = contentRef.current.querySelectorAll('.carousel-wrapper[data-carousel-images]');
      
      carouselWrappers.forEach((wrapper) => {
        // Get carousel data
        const dataImages = wrapper.getAttribute('data-carousel-images');
        if (!dataImages) return;
        
        const images = dataImages.split('||').filter(img => img.trim());
        if (images.length <= 0) return;
        
        // Create the carousel structure
        const carouselRoot = document.createElement('div');
        carouselRoot.className = 'relative w-full';
        
        // Create the carousel component
        const carouselElement = document.createElement('div');
        carouselElement.setAttribute('data-embla', 'true');
        carouselElement.className = 'overflow-hidden rounded-md';
        carouselRoot.appendChild(carouselElement);
        
        // Create carousel content
        const carouselContent = document.createElement('div');
        carouselContent.className = 'flex';
        carouselElement.appendChild(carouselContent);
        
        // Add slides
        images.forEach((imageUrl) => {
          const slide = document.createElement('div');
          slide.className = 'min-w-0 flex-[0_0_100%] pl-4';
          slide.setAttribute('role', 'group');
          slide.setAttribute('aria-roledescription', 'slide');
          
          const img = document.createElement('img');
          img.src = imageUrl;
          img.alt = 'Carousel image';
          img.className = 'aspect-video object-contain w-full h-auto max-h-[500px]';
          
          slide.appendChild(img);
          carouselContent.appendChild(slide);
        });
        
        // Add previous button
        const prevButton = document.createElement('button');
        prevButton.type = 'button';
        prevButton.className = 'absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-background/80 text-foreground hover:bg-background shadow-sm z-10 flex items-center justify-center';
        prevButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>';
        carouselRoot.appendChild(prevButton);
        
        // Add next button
        const nextButton = document.createElement('button');
        nextButton.type = 'button';
        nextButton.className = 'absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-background/80 text-foreground hover:bg-background shadow-sm z-10 flex items-center justify-center';
        nextButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>';
        carouselRoot.appendChild(nextButton);
        
        // Add counter
        const counter = document.createElement('div');
        counter.className = 'absolute bottom-2 right-2 bg-background/80 backdrop-blur-sm px-2 py-1 rounded text-xs font-medium z-10';
        counter.textContent = `1 / ${images.length}`;
        carouselRoot.appendChild(counter);
        
        // Replace the original placeholder with our carousel
        wrapper.innerHTML = '';
        wrapper.appendChild(carouselRoot);
        
        // Set up carousel logic
        let currentIndex = 0;
        const totalSlides = images.length;
        
        // Set up the slides to be properly positioned
        const updateCarousel = () => {
          const slides = carouselContent.children;
          for (let i = 0; i < slides.length; i++) {
            const slide = slides[i] as HTMLElement;
            slide.style.transform = `translateX(-${currentIndex * 100}%)`;
          }
          counter.textContent = `${currentIndex + 1} / ${totalSlides}`;
        };
        
        // Initial positioning
        updateCarousel();
        
        // Set up click handlers
        prevButton.addEventListener('click', () => {
          currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
          updateCarousel();
        });
        
        nextButton.addEventListener('click', () => {
          currentIndex = (currentIndex + 1) % totalSlides;
          updateCarousel();
        });
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
