
import { useState, useEffect } from 'react';
import { cn } from "@/lib/utils";
import { extractImagesFromContent } from "@/utils/updateFormatter";

interface UpdateCardImageProps {
  description: string;
  imageUrl?: string;
  title: string;
  isNew?: boolean;
}

const UpdateCardImage = ({ description, imageUrl, title, isNew = false }: UpdateCardImageProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [bestImage, setBestImage] = useState<string | null>(null);
  
  useEffect(() => {
    // Reset states when props change
    setImageLoaded(false);
    setImageError(false);
    
    // Determine the best image to display
    const findBestImage = () => {
      // First check for embedded images in content - these are more reliable
      const contentImages = extractImagesFromContent(description);
      if (contentImages.length > 0) {
        console.log("Using content image:", contentImages[0]);
        setBestImage(contentImages[0]);
        return;
      }
      
      // Then try imageUrl from the API if content images aren't available
      if (imageUrl) {
        console.log("Using API image:", imageUrl.split('?')[0]);
        setBestImage(imageUrl.split('?')[0]); // Strip query parameters
        return;
      }
      
      setBestImage(null);
    };
    
    findBestImage();
  }, [description, imageUrl]);

  const handleImageError = () => {
    console.error(`Failed to load image:`, bestImage);
    setImageError(true);
    
    // Try to find another image in the content if the main one fails
    const contentImages = extractImagesFromContent(description);
    if (contentImages.length > 1 && bestImage !== contentImages[1]) {
      console.log("Trying alternative image:", contentImages[1]);
      setBestImage(contentImages[1]);
    }
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  // If there's no image to display or if there was an error, show a placeholder for layout consistency
  if (!bestImage || imageError) {
    return <div className="hidden sm:block sm:w-1/3 bg-muted/20" />;
  }

  return (
    <div className="relative w-full sm:w-1/3 h-48 sm:h-auto bg-muted/30 overflow-hidden">
      <div 
        className={cn(
          "absolute inset-0 bg-muted/50 animate-pulse-subtle transition-opacity duration-500",
          imageLoaded ? "opacity-0" : "opacity-100"
        )}
      />
      <img
        src={bestImage}
        alt={title}
        className={cn(
          "w-full h-full object-cover transition-all duration-500 transform hover:scale-105",
          imageLoaded ? "opacity-100" : "opacity-0"
        )}
        onLoad={handleImageLoad}
        onError={handleImageError}
        crossOrigin="anonymous"
      />
      {isNew && (
        <div className="absolute top-3 right-3">
          <span className="px-2 py-1 text-xs font-medium bg-primary text-primary-foreground rounded-full">
            New
          </span>
        </div>
      )}
    </div>
  );
};

export default UpdateCardImage;
