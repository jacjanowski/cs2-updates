
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface UpdateContentProps {
  description: string;
  formattedHtml: string;
}

const UpdateContent = ({ formattedHtml }: UpdateContentProps) => {
  const contentRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Find all video elements that should autoplay and ensure they play
    if (contentRef.current) {
      const videos = contentRef.current.querySelectorAll('video[autoplay]');
      videos.forEach(video => {
        // Force autoplay even if browser policies might block it
        video.muted = true;
        
        // Attempt to play the video
        const playPromise = video.play();
        
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.error('Auto-play was prevented:', error);
            // Add a play button or other UI if autoplay fails
          });
        }
      });
    }
  }, [formattedHtml]);
  
  return (
    <div 
      ref={contentRef}
      className={cn(
        "text-foreground/90 space-y-2 update-content dark:text-gray-300",
        "prose dark:prose-invert max-w-none"
      )}
      dangerouslySetInnerHTML={{ 
        __html: formattedHtml
      }}
    />
  );
};

export default UpdateContent;
