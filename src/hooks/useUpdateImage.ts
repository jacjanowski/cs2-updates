
import { useState, useEffect } from 'react';

const DEFAULT_NEWS_IMAGE = '/lovable-uploads/953a1bfe-ab54-4c85-9968-2c79a39168d1.png';

interface UseUpdateImageResult {
  displayImage: string | null;
  imageError: boolean;
  imageLoaded: boolean;
  handleImageError: () => void;
  handleImageLoad: () => void;
  hasAnyImage: boolean;
}

export const useUpdateImage = (
  imageUrl: string | undefined, 
  description: string | undefined
): UseUpdateImageResult => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  const handleImageError = () => {
    console.error(`Failed to load image: ${DEFAULT_NEWS_IMAGE}`);
    setImageError(true);
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  return {
    displayImage: DEFAULT_NEWS_IMAGE,
    imageError,
    imageLoaded,
    handleImageError,
    handleImageLoad,
    hasAnyImage: true // Always true since we now always have a default image
  };
};
