
import React, { useEffect, useRef, useState } from "react";
import ContentCarousel from "./ContentCarousel";
import { toast } from "@/hooks/use-toast";

interface UpdateContentProps {
  description: string;
  formattedHtml: string;
  carouselData: Array<{id: string, images: string[], originalContent: string, position: number}>;
}

const UpdateContent: React.FC<UpdateContentProps> = ({ 
  description, 
  formattedHtml,
  carouselData 
}) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [carouselsMounted, setCarouselsMounted] = useState(false);
  
  // Handle carousel placement
  useEffect(() => {
    if (!contentRef.current || carouselData.length === 0) return;
    
    // Reset mounted state when content changes
    setCarouselsMounted(false);
    
    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      // Get all carousel placeholders
      const carouselPlaceholders = contentRef.current?.querySelectorAll('[data-carousel-id]');
      
      if (carouselPlaceholders && carouselPlaceholders.length === 0 && carouselData.length > 0) {
        console.log("No carousel placeholders found in content, but we have carousel data", {
          carouselData,
          contentHtml: contentRef.current?.innerHTML
        });
        toast({
          title: "Carousel placement issue",
          description: "Carousels not properly placed. Try refreshing.",
          variant: "destructive"
        });
      } else if (carouselPlaceholders) {
        console.log(`Found ${carouselPlaceholders.length} carousel placeholders in content`);
        
        // Clean up any visible text in placeholder divs
        carouselPlaceholders.forEach(placeholder => {
          // Ensure the element is absolutely empty - remove all content
          while (placeholder.firstChild) {
            placeholder.removeChild(placeholder.firstChild);
          }
          
          // Add a minimal visual indicator while waiting for carousel
          const loadingDiv = document.createElement('div');
          loadingDiv.className = 'p-2 text-xs text-center text-muted-foreground animate-pulse';
          loadingDiv.textContent = 'Loading carousel...';
          placeholder.appendChild(loadingDiv);
        });
        
        // Mark carousels as mounted to trigger re-render
        setCarouselsMounted(true);
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, [carouselData, formattedHtml]);
  
  return (
    <div className="update-content prose dark:prose-invert max-w-none">
      <div 
        ref={contentRef}
        dangerouslySetInnerHTML={{ __html: formattedHtml }}
        className="break-words"
      />
      
      {/* Render each carousel with its proper ID */}
      {carouselData.map((carousel) => (
        <ContentCarousel
          key={carousel.id}
          images={carousel.images}
          carouselId={carousel.id}
          containerSelector={`#${carousel.id}`}
        />
      ))}
    </div>
  );
};

export default UpdateContent;
