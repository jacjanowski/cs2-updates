
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useNavigate } from 'react-router-dom';
import { getUpdateSlug } from "@/utils/urlHelpers";
import UpdateCardImage from "@/components/UpdateCardImage";
import UpdateCardContent from "@/components/UpdateCardContent";
import { useState } from "react";
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
}

const UpdateCard = ({ update, isNew = false }: UpdateCardProps) => {
  const navigate = useNavigate();
  const [hasImage, setHasImage] = useState(() => {
    // Check if there's an image available
    const contentImages = extractImagesFromContent(update.description);
    return contentImages.length > 0 || !!update.imageUrl;
  });
  
  const handleCardClick = () => {
    navigate(`/update/${getUpdateSlug(update.title)}`);
  };
  
  return (
    <Card 
      className={cn(
        "overflow-hidden transition-all duration-300 animate-slide-up bg-card/60 backdrop-blur-sm hover:shadow-lg border-border/80",
        isNew && "ring-2 ring-primary/30",
        "dark:bg-gray-900/90 text-foreground",
        "cursor-pointer hover:scale-[1.01] hover:shadow-xl flex flex-col sm:flex-row"
      )}
      onClick={handleCardClick}
    >
      <UpdateCardImage 
        description={update.description}
        imageUrl={update.imageUrl}
        title={update.title}
        isNew={isNew}
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
