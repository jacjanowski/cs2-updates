
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useNavigate } from 'react-router-dom';
import { getUpdateSlug } from "@/utils/urlHelpers";
import UpdateCardImage from "@/components/UpdateCardImage";
import UpdateCardContent from "@/components/UpdateCardContent";
import { extractImagesFromContent } from "@/utils/updateFormatter";

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
  isNewsItem?: boolean; // Added parameter to differentiate news from updates
}

const UpdateCard = ({ update, isNew = false, isNewsItem = false }: UpdateCardProps) => {
  const navigate = useNavigate();
  
  const handleCardClick = () => {
    const slug = getUpdateSlug(update.title);
    
    // Add additional logging to debug the navigation
    console.log(`Navigating to ${isNewsItem ? 'news' : 'update'} item:`, {
      title: update.title,
      date: update.date,
      slug: slug,
      rawSlug: update.title.toLowerCase().replace(/\s+/g, '-')
    });
    
    navigate(`/update/${slug}`);
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
