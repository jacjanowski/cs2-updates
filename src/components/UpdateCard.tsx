
import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ExternalLink } from "lucide-react";
import { format } from 'date-fns';

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
  const [imageLoaded, setImageLoaded] = useState(false);
  
  const formattedDate = update.date ? format(new Date(update.date), 'MMM d, yyyy') : '';
  
  return (
    <Card className={cn(
      "overflow-hidden transition-all duration-300 animate-slide-up bg-card/60 backdrop-blur-sm hover:shadow-lg border-border/80",
      isNew && "ring-2 ring-primary/30"
    )}>
      {update.imageUrl && (
        <div className="relative w-full h-40 bg-muted/30 overflow-hidden">
          <div 
            className={cn(
              "absolute inset-0 bg-muted/50 animate-pulse-subtle transition-opacity duration-500",
              imageLoaded ? "opacity-0" : "opacity-100"
            )}
          />
          <img
            src={update.imageUrl}
            alt={update.title}
            className={cn(
              "w-full h-full object-cover transition-all duration-500 transform hover:scale-105",
              imageLoaded ? "opacity-100" : "opacity-0"
            )}
            onLoad={() => setImageLoaded(true)}
          />
          {isNew && (
            <div className="absolute top-3 right-3">
              <span className="px-2 py-1 text-xs font-medium bg-primary text-primary-foreground rounded-full">
                New
              </span>
            </div>
          )}
        </div>
      )}
      
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-medium text-lg leading-tight">{update.title}</h3>
          {update.url && (
            <a 
              href={update.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-full hover:bg-secondary"
              aria-label="Open link"
            >
              <ExternalLink size={16} />
            </a>
          )}
        </div>
        
        {formattedDate && (
          <p className="text-sm text-muted-foreground mb-3">{formattedDate}</p>
        )}
        
        <div className="text-sm text-foreground/80 space-y-2">
          {update.description}
        </div>
      </div>
    </Card>
  );
};

export default UpdateCard;
