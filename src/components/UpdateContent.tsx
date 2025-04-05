
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
  const [isContentReady, setIsContentReady] = useState(false);
  
  // Handle content preparation
  useEffect(() => {
    if (!contentRef.current) return;
    
    // Reset the state when content changes
    setIsContentReady(false);
    
    // Short delay to ensure HTML has been rendered properly
    const timer = setTimeout(() => {
      // Cleanup placeholder elements to prevent code display
      const placeholders = contentRef.current?.querySelectorAll('[data-carousel-id]');
      
      if (placeholders && placeholders.length > 0) {
        console.log(`Found ${placeholders.length} carousel placeholders in content`);
        
        // Clear any text content from placeholder divs
        placeholders.forEach(placeholder => {
          placeholder.innerHTML = ''; // Remove all content to avoid displaying any code
          
          // Add a minimal visual placeholder for carousel
          const loadingDiv = document.createElement('div');
          loadingDiv.className = 'h-[300px] flex items-center justify-center bg-muted/10';
          loadingDiv.innerHTML = '<p class="text-muted-foreground text-sm">Carousel loading...</p>';
          placeholder.appendChild(loadingDiv);
        });
      }
      
      // Mark content as ready to enable carousel rendering
      setIsContentReady(true);
    }, 50);
    
    return () => clearTimeout(timer);
  }, [formattedHtml]);
  
  return (
    <div className="update-content prose dark:prose-invert max-w-none">
      <div 
        ref={contentRef}
        dangerouslySetInnerHTML={{ __html: formattedHtml }}
        className="break-words"
      />
      
      {/* Only render carousels when content is ready */}
      {isContentReady && carouselData.map((carousel) => (
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
