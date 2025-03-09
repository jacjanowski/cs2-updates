import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ExternalLink, Eye } from "lucide-react";
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
  onViewDetails: (update: UpdateData) => void;
}

// Helper function to parse and format description content
const formatDescription = (description: string) => {
  const lines = description.split('\n');
  const formattedLines = [];
  let inList = false;
  let listType = '';
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Skip empty lines
    if (!line) continue;
    
    // Check for section headers like [MAPS], [MISC]
    if (line.match(/^\[.*\]$/)) {
      // Close any open list
      if (inList) {
        formattedLines.push('</ul>');
        inList = false;
      }
      formattedLines.push(`<div class="section-header">${line}</div>`);
    }
    // Check for bullet points
    else if (line.startsWith('•') || line.startsWith('-') || line.startsWith('*')) {
      const bulletContent = line.substring(1).trim();
      
      // Start a new list if not already in one
      if (!inList) {
        formattedLines.push('<ul class="update-list">');
        inList = true;
        listType = 'main';
      }
      
      formattedLines.push(`<li class="list-item">${bulletContent}</li>`);
    }
    // Check for sub-bullet points (usually indented with spaces or tabs)
    else if (line.match(/^\s+[•\-*]/) || line.startsWith('○')) {
      const bulletContent = line.replace(/^\s+[•\-*○]/, '').trim();
      
      // If we're not in a list or we're in a main list, we need to handle differently
      if (!inList || listType === 'main') {
        if (!inList) {
          formattedLines.push('<ul class="update-list">');
          inList = true;
        }
        
        // Add this as a sub-list within the current list item
        // Replace the last list item with a nested list
        const lastItem = formattedLines.pop();
        formattedLines.push(`${lastItem}<ul class="update-sublist"><li class="sublist-item">${bulletContent}</li></ul>`);
      } else {
        formattedLines.push(`<li class="sublist-item">${bulletContent}</li>`);
      }
    }
    // Regular text
    else {
      // Close any open list
      if (inList) {
        formattedLines.push('</ul>');
        inList = false;
      }
      formattedLines.push(`<p>${line}</p>`);
    }
  }
  
  // Close any open list at the end
  if (inList) {
    formattedLines.push('</ul>');
  }
  
  return formattedLines.join('');
};

const UpdateCard = ({ update, isNew = false, onViewDetails }: UpdateCardProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  
  const formattedDate = update.date ? format(new Date(update.date), 'MMMM d, yyyy').toUpperCase() : '';
  
  // Truncate description for preview
  const getPreviewDescription = () => {
    const formatted = formatDescription(update.description);
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = formatted;
    
    // Get the text content
    let textContent = tempDiv.textContent || '';
    
    // Truncate to approximately 200 characters
    if (textContent.length > 200) {
      textContent = textContent.substring(0, 200) + '...';
    }
    
    return textContent;
  };
  
  return (
    <Card 
      className={cn(
        "overflow-hidden transition-all duration-300 animate-slide-up bg-card/60 backdrop-blur-sm hover:shadow-lg border-border/80",
        isNew && "ring-2 ring-primary/30",
        "dark:bg-gray-900/90 text-foreground",
        "cursor-pointer hover:scale-[1.01] hover:shadow-xl"
      )}
      onClick={() => onViewDetails(update)}
    >
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
        <div className="flex flex-col space-y-1">
          {formattedDate && (
            <p className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
              {formattedDate}
            </p>
          )}
          
          <div className="flex justify-between items-start mb-3">
            <h3 className="font-bold text-xl leading-tight">{update.title}</h3>
            <div className="flex space-x-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onViewDetails(update);
                }}
                className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-full hover:bg-secondary flex-shrink-0"
                aria-label="View details"
              >
                <Eye size={16} />
              </button>
              
              {update.url && (
                <a 
                  href={update.url} 
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
        </div>
        
        <div className="text-sm text-foreground/90 line-clamp-3">
          {getPreviewDescription()}
        </div>
      </div>
      
      <style>
        {`
        .update-content .section-header {
          font-weight: 600;
          margin-top: 1rem;
          margin-bottom: 0.5rem;
          color: rgb(var(--foreground-rgb) / 0.9);
        }
        
        .update-content .update-list {
          list-style-type: disc;
          padding-left: 1.5rem;
          margin-bottom: 0.75rem;
        }
        
        .update-content .update-sublist {
          list-style-type: circle;
          padding-left: 1.5rem;
          margin-top: 0.25rem;
        }
        
        .update-content .list-item {
          margin-bottom: 0.25rem;
        }
        
        .update-content .sublist-item {
          margin-bottom: 0.125rem;
        }
        
        .update-content p {
          margin-bottom: 0.5rem;
        }
        `}
      </style>
    </Card>
  );
};

export default UpdateCard;
