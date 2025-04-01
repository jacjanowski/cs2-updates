
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { Splide } from '@splidejs/react-splide';
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
    
    // Process videos to ensure autoplay works
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
    
    // Initialize carousels with Splide
    const initializeCarousels = () => {
      // Find all carousel placeholders
      const carousels = contentRef.current?.querySelectorAll('.cs2-carousel');
      
      carousels?.forEach(carousel => {
        try {
          const carouselId = carousel.getAttribute('data-carousel-id');
          const imagesData = carousel.getAttribute('data-images');
          
          if (carouselId && imagesData) {
            const images = JSON.parse(decodeURIComponent(imagesData));
            
            if (images.length > 0) {
              // Create a container for the ContentCarousel component
              const carouselContainer = document.createElement('div');
              carouselContainer.id = `carousel-container-${carouselId}`;
              
              // Replace the placeholder with the container
              carousel.parentNode?.replaceChild(carouselContainer, carousel);
              
              // Create and render our carousel manually
              const carouselDiv = document.createElement('div');
              carouselDiv.className = 'splide-carousel';
              carouselContainer.appendChild(carouselDiv);
              
              // Create the slides container
              const slidesContainer = document.createElement('div');
              slidesContainer.className = 'splide__track';
              carouselDiv.appendChild(slidesContainer);
              
              // Create the list
              const slidesList = document.createElement('ul');
              slidesList.className = 'splide__list';
              slidesContainer.appendChild(slidesList);
              
              // Add slides
              images.forEach((image: string, index: number) => {
                const slide = document.createElement('li');
                slide.className = 'splide__slide';
                
                const img = document.createElement('img');
                img.src = image;
                img.alt = `Carousel image ${index + 1}`;
                img.className = 'w-full h-full object-contain';
                img.loading = 'lazy';
                
                slide.appendChild(img);
                slidesList.appendChild(slide);
              });
              
              // Initialize Splide
              new Splide(carouselDiv, {
                type: 'slide',
                perPage: 1,
                perMove: 1,
                pagination: images.length > 1,
                arrows: images.length > 1,
                drag: images.length > 1,
              }).mount();
              
              // Add counter if multiple images
              if (images.length > 1) {
                const counter = document.createElement('div');
                counter.className = 'absolute bottom-2 right-2 bg-background/80 backdrop-blur-sm px-2 py-1 rounded text-xs font-medium';
                counter.textContent = `1 / ${images.length}`;
                carouselDiv.appendChild(counter);
              }
            }
          }
        } catch (error) {
          console.error('Error initializing carousel:', error);
        }
      });
    };
    
    // Run initialization
    cleanupDebugInfo();
    
    // Initialize carousels and videos
    const timer = setTimeout(() => {
      initializeCarousels();
      initializeVideos();
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
