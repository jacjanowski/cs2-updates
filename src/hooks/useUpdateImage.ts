
import { useState, useEffect } from 'react';
import { extractImagesFromContent } from "@/utils/formatting/mediaExtractor";

const DEFAULT_NEWS_IMAGE = 'https://cdn.akamai.steamstatic.com/apps/csgo/images/csgo_react/cs2/event_header.png';

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
  const [displayImage, setDisplayImage] = useState<string | null>(null);
  const [hasAnyImage, setHasAnyImage] = useState(false);

  useEffect(() => {
    setImageError(false);
    setImageLoaded(false);
    
    // Extract all possible images but only once
    let extractedImages: string[] = [];
    if (description) {
      extractedImages = extractImagesFromContent(description);
      setHasAnyImage(extractedImages.length > 0);
    }
    
    // For news, try to find the best image
    if (isNewsItem) {
      // First try content images
      if (extractedImages.length > 0) {
        console.log("Using image from content:", extractedImages[0]);
        setDisplayImage(extractedImages[0]);
        return;
      }
      
      // Then try API image
      if (imageUrl) {
        console.log("Using API image:", imageUrl);
        setDisplayImage(imageUrl);
        return;
      }
    }
    
    // Default to CS2 image for updates or fallback
    setDisplayImage(DEFAULT_NEWS_IMAGE);
  }, [imageUrl, description, isNewsItem]);

  const handleImageError = () => {
    console.log(`Failed to load image: ${displayImage}, falling back to default image`);
    setImageError(true);
    setDisplayImage(DEFAULT_NEWS_IMAGE);
    setImageLoaded(true);
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
    hasAnyImage
  };
};
