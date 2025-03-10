
import { cn } from "@/lib/utils";
import { useState } from "react";

const DEFAULT_NEWS_IMAGE = '/lovable-uploads/953a1bfe-ab54-4c85-9968-2c79a39168d1.png';

interface UpdateImageProps {
  displayImage: string | null;
  imageError: boolean;
  imageLoaded: boolean;
  title: string;
  onImageError: () => void;
  onImageLoad: () => void;
}

const UpdateImage = ({ 
  displayImage, 
  imageError, 
  imageLoaded,
  title,
  onImageError,
  onImageLoad
}: UpdateImageProps) => {
  const [localImageError, setLocalImageError] = useState(false);
  
  // Always show an image - if there's no image to display or if there was an error, use default
  const imageToDisplay = localImageError || !displayImage ? DEFAULT_NEWS_IMAGE : displayImage;

  const handleImageError = () => {
    setLocalImageError(true);
    console.log("UpdateImage: Image error, using fallback image instead");
    onImageError();
  };

  return (
    <div className="w-full relative h-[400px] overflow-hidden mb-6">
      <img 
        src={imageToDisplay} 
        alt={title} 
        className="w-full h-full object-cover"
        onError={handleImageError}
        onLoad={onImageLoad}
        crossOrigin="anonymous"
      />
    </div>
  );
};

export default UpdateImage;
