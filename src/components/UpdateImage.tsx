
import { ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface UpdateImageProps {
  displayImage: string | null;
  imageError: boolean;
  imageLoaded: boolean;
  title: string;
  onImageError: () => void;
  onImageLoad: () => void;
}

const UpdateImage = ({ 
  displayImage, 
  imageError, 
  imageLoaded,
  title,
  onImageError,
  onImageLoad
}: UpdateImageProps) => {
  if (!displayImage || imageError) {
    return (
      <div className="w-full h-[200px] flex items-center justify-center bg-muted mb-6">
        <div className="flex flex-col items-center text-muted-foreground">
          <ImageOff size={48} className="mb-2" />
          <p>Image could not be loaded</p>
        </div>
      </div>
    );
  }

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
        src={displayImage} 
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
