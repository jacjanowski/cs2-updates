
import { useEffect, useState } from 'react';
import { cn } from "@/lib/utils";
import { extractImagesFromContent } from "@/utils/updateFormatter";

interface UpdateCardImageProps {
  description: string;
  imageUrl?: string;
  title: string;
  isNew?: boolean;
  isNewsItem?: boolean; // Added parameter to differentiate news from updates
}

const DEFAULT_NEWS_IMAGE = '/lovable-uploads/953a1bfe-ab54-4c85-9968-2c79a39168d1.png';

const UpdateCardImage = ({ description, imageUrl, title, isNew = false, isNewsItem = false }: UpdateCardImageProps) => {
  const [bestImage, setBestImage] = useState<string | null>(null);
  
  useEffect(() => {
    // Determine if there's any image to display
    const findBestImage = () => {
      // For updates, always use the default image
      if (!isNewsItem) {
        console.log("Using default CS2 image for update");
        setBestImage(DEFAULT_NEWS_IMAGE);
        return;
      }
      
      // For news articles, first check for embedded images in content - these are more reliable
      const contentImages = extractImagesFromContent(description);
      if (contentImages.length > 0) {
        console.log("Using content image for news:", contentImages[0]);
        setBestImage(contentImages[0]);
        return;
      }
      
      // Then try imageUrl from the API if content images aren't available
      if (imageUrl) {
        console.log("Using API image for news:", imageUrl);
        setBestImage(imageUrl); 
        return;
      }
      
      // If no image available, use default
      console.log("Using default CS2 image for news (no other images found)");
      setBestImage(DEFAULT_NEWS_IMAGE);
    };
    
    findBestImage();
  }, [description, imageUrl, isNewsItem]);

  // Always show an image - either the content image, API image, or default
  return (
    <div className="relative w-full sm:w-1/3 h-48 sm:h-auto bg-muted/30 overflow-hidden">
      <img
        src={bestImage || DEFAULT_NEWS_IMAGE}
        alt={title}
        className="w-full h-full object-cover"
        crossOrigin="anonymous"
      />
      {isNew && (
        <div className="absolute top-3 right-3">
          <span className="px-2 py-1 text-xs font-medium bg-primary text-primary-foreground rounded-full">
            New
          </span>
        </div>
      )}
    </div>
  );
};

export default UpdateCardImage;
