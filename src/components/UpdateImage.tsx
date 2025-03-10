
import { cn } from "@/lib/utils";

const DEFAULT_NEWS_IMAGE = '/lovable-uploads/953a1bfe-ab54-4c85-9968-2c79a39168d1.png';

interface UpdateImageProps {
  displayImage: string | null;
  imageError: boolean;
  imageLoaded: boolean;
  title: string;
  onImageError: () => void;
  onImageLoad: () => void;
}

const UpdateImage = ({ 
  title,
  imageLoaded,
  onImageError,
  onImageLoad
}: UpdateImageProps) => {
  // Always use the default image
  return (
    <div className="w-full relative h-[400px] overflow-hidden mb-6">
      <div className={cn(
        "absolute inset-0 bg-muted/50 animate-pulse-subtle flex items-center justify-center",
        imageLoaded ? 'opacity-0' : 'opacity-100',
        "transition-opacity duration-300"
      )}>
        <span className="text-muted-foreground">Loading image...</span>
      </div>
      <img 
        src={DEFAULT_NEWS_IMAGE} 
        alt={title} 
        className={cn(
          "w-full h-full object-cover",
          imageLoaded ? 'opacity-100' : 'opacity-0',
          "transition-opacity duration-300"
        )}
        onError={onImageError}
        onLoad={onImageLoad}
        crossOrigin="anonymous"
      />
    </div>
  );
};

export default UpdateImage;
