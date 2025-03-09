
import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ExternalLink, ImageOff } from "lucide-react";
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

export interface UpdateData {
  title: string;
  description: string;
  date: string;
  url: string;
  imageUrl?: string;
}

interface UpdateCardProps {
  update: UpdateData;
  isNew?: boolean;
}

// Helper function to parse and format description content - now moved to the detail page
const getPreviewDescription = (description: string) => {
  // Remove any HTML or special formatting
  const plainText = description.replace(/\[.*?\]|\*|\•|\-/g, '').replace(/\n/g, ' ');
  
  // Truncate to approximately 200 characters
  return plainText.length > 200
    ? plainText.substring(0, 200) + '...'
    : plainText;
};

const UpdateCard = ({ update, isNew = false }: UpdateCardProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const navigate = useNavigate();
  
  const formattedDate = update.date ? format(new Date(update.date), 'MMMM d, yyyy').toUpperCase() : '';
  
  // Create URL-friendly slug from the title
  const getUpdateSlug = () => {
    return encodeURIComponent(update.title.toLowerCase().replace(/\s+/g, '-'));
  };
  
  const handleCardClick = () => {
    navigate(`/update/${getUpdateSlug()}`);
  };

  const handleImageError = () => {
    console.error(`Failed to load image: ${update.imageUrl}`);
    setImageError(true);
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };
  
  // Helper function to sanitize image URLs
  const getSanitizedImageUrl = (url: string | undefined) => {
    if (!url) return null;
    // Strip any query parameters which might cause CORS issues
    return url.split('?')[0];
  };
  
  return (
    <Card 
      className={cn(
        "overflow-hidden transition-all duration-300 animate-slide-up bg-card/60 backdrop-blur-sm hover:shadow-lg border-border/80",
        isNew && "ring-2 ring-primary/30",
        "dark:bg-gray-900/90 text-foreground",
        "cursor-pointer hover:scale-[1.01] hover:shadow-xl"
      )}
      onClick={handleCardClick}
    >
      {update.imageUrl && !imageError ? (
        <div className="relative w-full h-40 bg-muted/30 overflow-hidden">
          <div 
            className={cn(
              "absolute inset-0 bg-muted/50 animate-pulse-subtle transition-opacity duration-500",
              imageLoaded ? "opacity-0" : "opacity-100"
            )}
          />
          <img
            src={getSanitizedImageUrl(update.imageUrl) || ''}
            alt={update.title}
            className={cn(
              "w-full h-full object-cover transition-all duration-500 transform hover:scale-105",
              imageLoaded ? "opacity-100" : "opacity-0"
            )}
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
          {isNew && (
            <div className="absolute top-3 right-3">
              <span className="px-2 py-1 text-xs font-medium bg-primary text-primary-foreground rounded-full">
                New
              </span>
            </div>
          )}
        </div>
      ) : imageError && update.imageUrl ? (
        <div className="w-full h-40 flex items-center justify-center bg-muted/30">
          <div className="flex flex-col items-center text-muted-foreground">
            <ImageOff size={24} className="mb-2" />
            <span className="text-xs">Image unavailable</span>
          </div>
        </div>
      ) : null}
      
      <div className="p-5">
        <div className="flex flex-col space-y-1">
          {formattedDate && (
            <p className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
              {formattedDate}
            </p>
          )}
          
          <div className="flex justify-between items-start mb-3">
            <h3 className="font-bold text-xl leading-tight">{update.title}</h3>
            
            {update.url && (
              <a 
                href={update.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-full hover:bg-secondary flex-shrink-0"
                aria-label="Open link"
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink size={16} />
              </a>
            )}
          </div>
        </div>
        
        <div className="text-sm text-foreground/90 line-clamp-3">
          {getPreviewDescription(update.description)}
        </div>
      </div>
    </Card>
  );
};

export default UpdateCard;
