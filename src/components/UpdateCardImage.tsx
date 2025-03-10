
import { useState, useEffect } from 'react';
import { cn } from "@/lib/utils";

interface UpdateCardImageProps {
  description: string;
  imageUrl?: string;
  title: string;
  isNew?: boolean;
}

const DEFAULT_NEWS_IMAGE = '/lovable-uploads/953a1bfe-ab54-4c85-9968-2c79a39168d1.png';

const UpdateCardImage = ({ description, imageUrl, title, isNew = false }: UpdateCardImageProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  const handleImageError = () => {
    console.error(`Failed to load image:`, imageUrl);
    setImageError(true);
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  // Always show the default image
  return (
    <div className="relative w-full sm:w-1/3 h-48 sm:h-auto bg-muted/30 overflow-hidden">
      <div 
        className={cn(
          "absolute inset-0 bg-muted/50 animate-pulse-subtle transition-opacity duration-500",
          imageLoaded ? "opacity-0" : "opacity-100"
        )}
      />
      <img
        src={DEFAULT_NEWS_IMAGE}
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
