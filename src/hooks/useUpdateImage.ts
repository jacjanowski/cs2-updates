
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
  contentImages: string[];
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
  const [contentImages, setContentImages] = useState<string[]>([]);
  
  useEffect(() => {
    setImageError(false);
    setImageLoaded(false);
    
    // Extract all possible images but only once
    let extractedImages: string[] = [];
    if (description) {
      extractedImages = extractImagesFromContent(description);
      setContentImages(extractedImages);
      setHasAnyImage(extractedImages.length > 0);
    }
    
    // Priority for display image selection
    if (isNewsItem) {
      // First try API image if available (usually higher quality)
      if (imageUrl) {
        console.log("Using API image:", imageUrl);
        setDisplayImage(imageUrl);
        return;
      }
      
      // Then try content images
      if (extractedImages.length > 0) {
        console.log("Using image from content:", extractedImages[0]);
        setDisplayImage(extractedImages[0]);
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
    hasAnyImage,
    contentImages
  };
};
