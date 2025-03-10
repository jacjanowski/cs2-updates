
import { useState, useEffect } from 'react';
import { extractImagesFromContent } from "@/utils/updateFormatter";

const DEFAULT_NEWS_IMAGE = '/lovable-uploads/8db559b1-a09b-4644-b634-2215dba9100c.png';

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
  description: string | undefined,
  isNewsItem: boolean = false
): UseUpdateImageResult => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [displayImage, setDisplayImage] = useState<string | null>(DEFAULT_NEWS_IMAGE);
  const [contentImages, setContentImages] = useState<string[]>([]);
  const [hasAnyImage, setHasAnyImage] = useState(true);

  useEffect(() => {
    setImageError(false);
    setImageLoaded(false);
    
    // Extract all possible images
    if (description) {
      const extractedImages = extractImagesFromContent(description);
      setContentImages(extractedImages);
    } else {
      setContentImages([]);
    }
    
    // For updates, always default to the CS2 image
    if (!isNewsItem) {
      console.log("Is an update, using default CS2 image");
      setDisplayImage(DEFAULT_NEWS_IMAGE);
      return;
    }
    
    // For news, try to find the best image
    // First try content images
    if (contentImages.length > 0) {
      console.log("Using image from content:", contentImages[0]);
      setDisplayImage(contentImages[0]);
      return;
    }
    
    // Then try API image
    if (imageUrl) {
      console.log("Using API image:", imageUrl);
      setDisplayImage(imageUrl);
      return;
    }
    
    // Default to CS2 image if nothing else works
    console.log("No suitable image found, using default CS2 image");
    setDisplayImage(DEFAULT_NEWS_IMAGE);
    
  }, [imageUrl, description, isNewsItem, contentImages]);

  const handleImageError = () => {
    console.log(`Failed to load image: ${displayImage}, falling back to default image`);
    setImageError(true);
    setDisplayImage(DEFAULT_NEWS_IMAGE);
    setImageLoaded(true); // Mark as loaded so UI updates
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  return {
    displayImage,
    imageError,
    imageLoaded,
    handleImageError,
    handleImageLoad,
    hasAnyImage: true // Always true since we now always have a fallback image
  };
};
