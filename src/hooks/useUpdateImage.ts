
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
  const [contentImages, setContentImages] = useState<string[]>([]);
  const [displayImage, setDisplayImage] = useState<string | null>(null);

  useEffect(() => {
    setImageError(false);
    setImageLoaded(false);
    
    // Extract images from content if available
    if (description) {
      const extractedImages = extractImagesFromContent(description);
      setContentImages(extractedImages);
    } else {
      setContentImages([]);
    }
    
    // Determine best image to display
    const getBestImage = () => {
      // First try content images
      if (contentImages.length > 0) {
        return contentImages[0];
      }
      
      // Fall back to the update image
      if (imageUrl) {
        return imageUrl.split('?')[0]; // Strip query parameters
      }
      
      return null;
    };
    
    setDisplayImage(getBestImage());
  }, [imageUrl, description, contentImages]);

  const handleImageError = () => {
    console.error(`Failed to load image: ${imageUrl}`);
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
