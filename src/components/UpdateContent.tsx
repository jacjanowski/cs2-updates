
import React, { useEffect, useRef } from "react";
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
  
  // Handle carousel placement
  useEffect(() => {
    if (!contentRef.current || carouselData.length === 0) return;
    
    // Get all carousel placeholders
    const carouselPlaceholders = contentRef.current.querySelectorAll('[data-carousel-id]');
    
    if (carouselPlaceholders.length === 0 && carouselData.length > 0) {
      console.log("No carousel placeholders found in content, but we have carousel data");
      toast({
        title: "Carousel placement issue",
        description: "Carousels not properly placed. Please try refreshing.",
        variant: "destructive"
      });
    } else {
      console.log(`Found ${carouselPlaceholders.length} carousel placeholders in content`);
    }
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
