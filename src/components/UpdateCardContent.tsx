
import { format } from 'date-fns';
import { ExternalLink } from "lucide-react";
import { getPreviewDescription } from "@/utils/previewFormatter";

interface UpdateCardContentProps {
  title: string;
  description: string;
  date: string;
  url: string | undefined;
}

const UpdateCardContent = ({ title, description, date, url }: UpdateCardContentProps) => {
  const formattedDate = date ? format(new Date(date), 'MMMM d, yyyy').toUpperCase() : '';
  
  return (
    <div className="p-5">
      <div className="flex flex-col space-y-1">
        {formattedDate && (
          <p className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
            {formattedDate}
          </p>
        )}
        
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-bold text-xl leading-tight">{title}</h3>
          
          {url && (
            <a 
              href={url} 
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
        {getPreviewDescription(description)}
      </div>
    </div>
  );
};

export default UpdateCardContent;
