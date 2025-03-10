
import { useState, useEffect } from 'react';
import { extractImagesFromContent } from "@/utils/updateFormatter";

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
  description: string | undefined,
  isNewsItem: boolean = false // Added parameter to differentiate news from updates
): UseUpdateImageResult => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [displayImage, setDisplayImage] = useState<string | null>(null);
  const [contentImages, setContentImages] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [hasAnyImage, setHasAnyImage] = useState(true); // Default to true since we always have a fallback

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
    console.error(`Failed to load image: ${displayImage}`);
    setImageError(true);
    
    // For updates, just use the default image
    if (!isNewsItem) {
      setImageError(false);
      setDisplayImage(DEFAULT_NEWS_IMAGE);
      return;
    }
    
    // For news, try next content image if available
    if (contentImages.length > currentImageIndex + 1) {
      setCurrentImageIndex(currentImageIndex + 1);
      setImageError(false);
      setDisplayImage(contentImages[currentImageIndex + 1]);
    } else if (imageUrl && !contentImages.includes(imageUrl)) {
      // If we've tried all content images, try the API image as last resort
      setImageError(false);
      setDisplayImage(imageUrl);
    } else {
      // Use default image if all else fails
      setImageError(false);
      setDisplayImage(DEFAULT_NEWS_IMAGE);
    }
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
