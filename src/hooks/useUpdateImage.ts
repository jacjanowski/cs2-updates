
import { useState, useEffect } from 'react';
import { extractImagesFromContent } from "@/utils/updateFormatter";

interface UseUpdateImageResult {
  displayImage: string | null;
  imageError: boolean;
  imageLoaded: boolean;
  handleImageError: () => void;
  handleImageLoad: () => void;
}

export const useUpdateImage = (
  imageUrl: string | undefined, 
  description: string | undefined
): UseUpdateImageResult => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [displayImage, setDisplayImage] = useState<string | null>(null);

  useEffect(() => {
    setImageError(false);
    setImageLoaded(false);
    
    // Determine best image to display
    const getBestImage = () => {
      // First try the update image if it exists
      if (imageUrl) {
        return imageUrl.split('?')[0]; // Strip query parameters
      }
      
      // Then try to extract images from content
      if (description) {
        const extractedImages = extractImagesFromContent(description);
        if (extractedImages.length > 0) {
          return extractedImages[0];
        }
      }
      
      return null;
    };
    
    setDisplayImage(getBestImage());
  }, [imageUrl, description]);

  const handleImageError = () => {
    console.error(`Failed to load image: ${displayImage}`);
    setImageError(true);
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  return {
    displayImage,
    imageError,
    imageLoaded,
    handleImageError,
    handleImageLoad
  };
};
