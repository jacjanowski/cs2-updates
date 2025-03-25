
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

const DEFAULT_NEWS_IMAGE = 'https://cdn.akamai.steamstatic.com/apps/csgo/images/csgo_react/cs2/event_header.png';

interface UpdateImageProps {
  displayImage: string | null;
  imageError: boolean;
  imageLoaded: boolean;
  title: string;
  onImageError: () => void;
  onImageLoad: () => void;
  hideForNewsItems?: boolean;
}

const UpdateImage = ({ 
  displayImage, 
  imageError, 
  imageLoaded,
  title,
  onImageError,
  onImageLoad,
  hideForNewsItems = false
}: UpdateImageProps) => {
  const [localImageError, setLocalImageError] = useState(false);
  
  // Always show an image - if there's no image to display or if there was an error, use default
  const imageToDisplay = localImageError || !displayImage ? DEFAULT_NEWS_IMAGE : displayImage;

  const handleImageError = () => {
    setLocalImageError(true);
    console.log("UpdateImage: Image error, using fallback image instead");
    onImageError();
  };

  // Reset error state when displayImage changes
  useEffect(() => {
    setLocalImageError(false);
  }, [displayImage]);

  // If this is a news item and we should hide the image (to avoid duplication)
  // and the image is from the content, return null
  if (hideForNewsItems) {
    return null;
  }

  return (
    <div className="w-full relative h-auto mb-6 overflow-hidden">
      <img 
        src={imageToDisplay} 
        alt={title || "CS2 Update"} 
        className="w-full object-contain max-h-[500px]"
        onError={handleImageError}
        onLoad={onImageLoad}
      />
    </div>
  );
};

export default UpdateImage;
