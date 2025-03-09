
import { useState, useEffect } from 'react';
import { cn } from "@/lib/utils";
import { ImageOff } from "lucide-react";
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
    // Determine the best image to display
    const findBestImage = () => {
      // First check for embedded images in content
      const contentImages = extractImagesFromContent(description);
      if (contentImages.length > 0) {
        setBestImage(contentImages[0]);
        return;
      }
      
      // Fall back to imageUrl from the API
      if (imageUrl) {
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
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  if (!bestImage || imageError) {
    if (imageError && bestImage) {
      return (
        <div className="w-full h-40 flex items-center justify-center bg-muted/30">
          <div className="flex flex-col items-center text-muted-foreground">
            <ImageOff size={24} className="mb-2" />
            <span className="text-xs">Image unavailable</span>
          </div>
        </div>
      );
    }
    return null;
  }

  return (
    <div className="relative w-full h-40 bg-muted/30 overflow-hidden">
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
