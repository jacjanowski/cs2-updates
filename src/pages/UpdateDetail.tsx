
import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Header from "@/components/Header";
import { format } from 'date-fns';
import { UpdateData } from "@/components/UpdateCard";
import { ArrowLeft, ExternalLink, ImageOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SteamAPI } from "@/utils/steamAPI";
import { NewsAPI } from "@/utils/newsAPI";
import { formatDescription, extractImagesFromContent } from "@/utils/updateFormatter";
import UpdateContent from "@/components/UpdateContent";
import UpdateLoadingSkeleton from "@/components/UpdateLoadingSkeleton";
import UpdateError from "@/components/UpdateError";
import "@/styles/updateContent.css";

const UpdateDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [update, setUpdate] = useState<UpdateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isNewsItem, setIsNewsItem] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [contentImages, setContentImages] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setImageError(false);
        setImageLoaded(false);
        setContentImages([]);
        console.log("Fetching data for update ID:", id);
        
        // First try to find the update in CS2 updates
        const { updates } = await SteamAPI.getUpdates();
        
        let foundItem = updates.find(u => 
          encodeURIComponent(u.title.toLowerCase().replace(/\s+/g, '-')) === id
        );
        
        // If not found in updates, check the news
        if (!foundItem) {
          console.log("Item not found in updates, checking news...");
          const newsItems = await NewsAPI.getNews();
          
          foundItem = newsItems.find(n => 
            encodeURIComponent(n.title.toLowerCase().replace(/\s+/g, '-')) === id
          );
          
          if (foundItem) {
            console.log("Found item in news:", foundItem.title);
            setIsNewsItem(true);
          }
        } else {
          console.log("Found item in updates:", foundItem.title);
        }
        
        if (foundItem) {
          console.log("Item details:", {
            title: foundItem.title,
            hasImage: !!foundItem.imageUrl,
            imageUrl: foundItem.imageUrl
          });
          
          // Extract images from content
          const extractedImages = extractImagesFromContent(foundItem.description);
          console.log("Extracted images from content:", extractedImages);
          setContentImages(extractedImages);
          
          setUpdate(foundItem);
          setError(null);
        } else {
          // If still not found, show an error
          console.error("Content not found for ID:", id);
          setError('Content not found');
        }
      } catch (err) {
        console.error('Error fetching content:', err);
        setError('Failed to load content details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id]);

  const formattedDate = update?.date 
    ? format(new Date(update.date), 'MMMM d, yyyy').toUpperCase() 
    : '';
  
  const formattedHtml = update?.description 
    ? formatDescription(update.description)
    : '';

  const getBackPath = () => {
    return isNewsItem ? '/news' : '/';
  };

  const handleImageError = () => {
    console.error(`Failed to load image: ${update?.imageUrl}`);
    setImageError(true);
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  // Determine the best image to display
  const getBestImageToDisplay = (): string | null => {
    // First try content images
    if (contentImages.length > 0) {
      return contentImages[0];
    }
    
    // Fall back to the update image
    if (update?.imageUrl) {
      return update.imageUrl.split('?')[0]; // Strip query parameters
    }
    
    return null;
  };

  const displayImage = getBestImageToDisplay();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="max-w-4xl mx-auto pt-20 pb-10 px-4">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate(getBackPath())}
        >
          <ArrowLeft size={16} className="mr-2" />
          Back to {isNewsItem ? 'news' : 'updates'}
        </Button>
        
        {loading ? (
          <UpdateLoadingSkeleton />
        ) : error ? (
          <UpdateError error={error} />
        ) : update && (
          <article className="bg-card/70 backdrop-blur-sm rounded-lg shadow-sm overflow-hidden border">
            {formattedDate && (
              <p className="text-xs font-medium tracking-wider text-muted-foreground uppercase px-6 pt-6 pb-1">
                {formattedDate}
              </p>
            )}
            
            <h1 className="text-3xl font-bold px-6 pb-4">{update.title}</h1>
            
            {displayImage && !imageError ? (
              <div className="w-full relative h-[400px] overflow-hidden mb-6">
                <div className={`absolute inset-0 bg-muted/50 animate-pulse-subtle flex items-center justify-center ${imageLoaded ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}>
                  <span className="text-muted-foreground">Loading image...</span>
                </div>
                <img 
                  src={displayImage} 
                  alt={update.title} 
                  className={`w-full h-full object-cover ${imageLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
                  onError={handleImageError}
                  onLoad={handleImageLoad}
                  crossOrigin="anonymous"
                />
              </div>
            ) : imageError && (
              <div className="w-full h-[200px] flex items-center justify-center bg-muted mb-6">
                <div className="flex flex-col items-center text-muted-foreground">
                  <ImageOff size={48} className="mb-2" />
                  <p>Image could not be loaded</p>
                </div>
              </div>
            )}
            
            <div className="px-6 pb-6">
              <UpdateContent 
                description={update.description} 
                formattedHtml={formattedHtml} 
              />
              
              {update.url && (
                <div className="mt-8 flex justify-end">
                  <a
                    href={update.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                  >
                    <ExternalLink size={16} className="mr-2" />
                    View on Steam
                  </a>
                </div>
              )}
            </div>
          </article>
        )}
      </main>
    </div>
  );
};

export default UpdateDetail;
