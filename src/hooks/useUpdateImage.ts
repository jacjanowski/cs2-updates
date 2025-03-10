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
  const [displayImage, setDisplayImage] = useState<string | null>(null);
  const [contentImages, setContentImages] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [hasAnyImage, setHasAnyImage] = useState(true);

  useEffect(() => {
    setImageError(false);
    setImageLoaded(false);
    setCurrentImageIndex(0);
    
    // Extract all possible images
    if (description) {
      const extractedImages = extractImagesFromContent(description);
      setContentImages(extractedImages);
    } else {
      setContentImages([]);
    }
    
    // Determine best image to display
    const getBestImage = () => {
      // For updates, always use the default image
      if (!isNewsItem) {
        return DEFAULT_NEWS_IMAGE;
      }
      
      // For news, try to find an image from content first
      if (description) {
        const extractedImages = extractImagesFromContent(description);
        if (extractedImages.length > 0) {
          return extractedImages[0];
        }
      }
      
      // Then try the API image if it exists
      if (imageUrl) {
        return imageUrl;
      }
      
      // Default to CS2 image if no other image is available
      return DEFAULT_NEWS_IMAGE;
    };
    
    setDisplayImage(getBestImage());
  }, [imageUrl, description, isNewsItem]);

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
