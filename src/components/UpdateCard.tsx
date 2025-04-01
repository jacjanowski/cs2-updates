
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useNavigate } from 'react-router-dom';
import { getUpdateSlug, getUpdateUniqueId } from "@/utils/urlHelpers";
import UpdateCardImage from "@/components/UpdateCardImage";
import UpdateCardContent from "@/components/UpdateCardContent";
import { extractImagesFromContent } from "@/utils/updateFormatter";

export interface UpdateData {
  title: string;
  description: string;
  date: string;
  url: string;
  imageUrl?: string;
  id?: string; // Optional unique identifier for the update
}

interface UpdateCardProps {
  update: UpdateData;
  isNew?: boolean;
  isNewsItem?: boolean;
}

const UpdateCard = ({ update, isNew = false, isNewsItem = false }: UpdateCardProps) => {
  const navigate = useNavigate();
  
  const handleCardClick = () => {
    // Generate a unique identifier from the update title and date
    const uniqueId = getUpdateUniqueId(update.title, update.date);
    const slug = getUpdateSlug(update.title);
    
    // Log detailed information about the update being clicked
    console.log(`[UpdateCard] Navigating to:`, {
      title: update.title,
      type: isNewsItem ? 'news' : 'update',
      slug,
      uniqueId,
      path: `/update/${slug}`
    });
    
    // Navigate to the detail page with the slug
    navigate(`/update/${slug}`, { 
      state: { 
        updateData: update,
        isNewsItem: isNewsItem,
        uniqueId: uniqueId
      } 
    });
  };
  
  return (
    <Card 
      className={cn(
        "overflow-hidden transition-all duration-300 animate-slide-up bg-card/60 backdrop-blur-sm hover:shadow-lg border-border/80",
        isNew && "ring-2 ring-primary/30",
        "dark:bg-gray-900/90 text-foreground",
        "cursor-pointer hover:scale-[1.01] hover:shadow-xl flex"
      )}
      onClick={handleCardClick}
    >
      <UpdateCardImage 
        description={update.description}
        imageUrl={update.imageUrl}
        title={update.title}
        isNew={isNew}
        isNewsItem={isNewsItem}
      />
      
      <UpdateCardContent
        title={update.title}
        description={update.description}
        date={update.date}
        url={update.url}
      />
    </Card>
  );
};

export default UpdateCard;
