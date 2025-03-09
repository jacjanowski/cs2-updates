
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { X } from "lucide-react";
import { format } from 'date-fns';
import { UpdateData } from "./UpdateCard";
import { cn } from "@/lib/utils";

interface UpdateDetailsModalProps {
  update: UpdateData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const UpdateDetailsModal = ({ update, open, onOpenChange }: UpdateDetailsModalProps) => {
  if (!update) return null;
  
  const formattedDate = update.date ? format(new Date(update.date), 'MMMM d, yyyy').toUpperCase() : '';
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-start justify-between space-y-0">
          <div>
            {formattedDate && (
              <p className="text-xs font-medium tracking-wider text-muted-foreground uppercase mb-1">
                {formattedDate}
              </p>
            )}
            <DialogTitle className="text-2xl font-bold">{update.title}</DialogTitle>
          </div>
          <DialogClose className="rounded-full hover:bg-secondary p-2 text-muted-foreground hover:text-foreground transition-colors">
            <X size={20} />
          </DialogClose>
        </DialogHeader>
        
        {update.imageUrl && (
          <div className="w-full relative h-[300px] rounded-lg overflow-hidden mb-4">
            <img 
              src={update.imageUrl} 
              alt={update.title} 
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        <div 
          className={cn(
            "text-foreground/90 space-y-2 update-content",
            "prose dark:prose-invert max-w-none"
          )}
          dangerouslySetInnerHTML={{ __html: formatDescription(update.description) }}
        />
        
        {update.url && (
          <div className="mt-6 flex justify-end">
            <a
              href={update.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              View on Steam
            </a>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

// Copy the formatDescription function from UpdateCard to avoid circular dependencies
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

export default UpdateDetailsModal;
