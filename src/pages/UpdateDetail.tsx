
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Header from "@/components/Header";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDescription } from "@/utils/updateFormatter";
import UpdateContent from "@/components/UpdateContent";
import UpdateLoadingSkeleton from "@/components/UpdateLoadingSkeleton";
import UpdateError from "@/components/UpdateError";
import UpdateTitle from "@/components/UpdateTitle";
import UpdateImage from "@/components/UpdateImage";
import UpdateFooter from "@/components/UpdateFooter";
import { useUpdateDetail } from "@/hooks/useUpdateDetail";
import { useUpdateImage } from "@/hooks/useUpdateImage";
import { Toaster } from "@/components/ui/toaster";
import "@/styles/updateContent.css";

interface LocationState {
  updateData?: any;
  isNewsItem?: boolean;
  uniqueId?: string;
}

const UpdateDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as LocationState | undefined;
  
  // Use custom hooks for data fetching and image handling
  const { update, loading, error, isNewsItem } = useUpdateDetail(id);
  const { 
    displayImage, 
    imageError, 
    imageLoaded, 
    handleImageError, 
    handleImageLoad,
    hasAnyImage,
    contentImages,
    hasCarousels,
    carouselData
  } = useUpdateImage(update?.imageUrl, update?.description, isNewsItem);
  
  // Format the description for display
  const formattedHtml = update?.description 
    ? formatDescription(update.description)
    : '';

  // Navigation helper
  const getBackPath = () => {
    return isNewsItem ? '/news' : '/';
  };

  // For news items, check if image is already included in the content
  const shouldHideHeaderImage = isNewsItem && hasAnyImage;

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
            <UpdateTitle title={update.title} date={update.date} />
            
            <UpdateImage 
              displayImage={displayImage}
              imageError={imageError}
              imageLoaded={imageLoaded}
              title={update.title}
              onImageError={handleImageError}
              onImageLoad={handleImageLoad}
              hideForNewsItems={shouldHideHeaderImage}
            />
            
            <div className="px-6 pb-6">
              <UpdateContent 
                description={update.description} 
                formattedHtml={formattedHtml}
                carouselData={carouselData} 
              />
              
              <UpdateFooter url={update.url} />
            </div>
          </article>
        )}
      </main>
      <Toaster />
    </div>
  );
};

export default UpdateDetail;
