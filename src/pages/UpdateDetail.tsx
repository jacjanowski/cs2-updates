
import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Header from "@/components/Header";
import { format } from 'date-fns';
import { UpdateData } from "@/components/UpdateCard";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SteamAPI } from "@/utils/steamAPI";

const UpdateDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [update, setUpdate] = useState<UpdateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUpdate = async () => {
      try {
        setLoading(true);
        // Get all updates and find the one with matching ID
        const { updates } = await SteamAPI.getUpdates();
        
        let foundUpdate;
        if (updates.length > 0) {
          // Find by encoded title in URL
          foundUpdate = updates.find(u => encodeURIComponent(u.title.toLowerCase().replace(/\s+/g, '-')) === id);
        } else {
          // If no updates from API, generate a sample one for demo
          foundUpdate = {
            title: id ? decodeURIComponent(id).replace(/-/g, ' ') : 'Sample Update',
            description: `This is a sample CS2 update with some description text.
            
[MAPS]
* Updated Dust2 textures
* Fixed lighting on Inferno
  * Improved visibility in apartments
  * Fixed shadow artifacts
            
[GAMEPLAY]
* Adjusted recoil patterns for AK-47
* Increased movement speed with knife
            
[MISC]
* Various bug fixes and performance improvements`,
            date: new Date().toISOString(),
            url: `https://example.com/update-${id}`,
            imageUrl: 'https://picsum.photos/800/400?random=1'
          };
        }
        
        if (foundUpdate) {
          setUpdate(foundUpdate);
          setError(null);
        } else {
          setError('Update not found');
        }
      } catch (err) {
        console.error('Error fetching update:', err);
        setError('Failed to load update details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUpdate();
  }, [id]);

  const formattedDate = update?.date ? format(new Date(update.date), 'MMMM d, yyyy').toUpperCase() : '';
  
  const formatDescription = (description: string) => {
    const lines = description.split('\n');
    const formattedLines = [];
    let inList = false;
    let inUnorderedList = false;
    
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
          inUnorderedList = false;
        }
        formattedLines.push(`<div class="section-header">${line}</div>`);
      }
      // Check for [list] tags
      else if (line.toLowerCase() === '[list]') {
        // Start a new ordered list
        formattedLines.push('<ol class="update-list">');
        inList = true;
        inUnorderedList = false;
      }
      // Check for [/list] tags
      else if (line.toLowerCase() === '[/list]') {
        if (inList) {
          formattedLines.push('</ol>');
          inList = false;
        }
      }
      // Check for [ul] tags
      else if (line.toLowerCase() === '[ul]') {
        // Start a new unordered list
        formattedLines.push('<ul class="update-list">');
        inList = true;
        inUnorderedList = true;
      }
      // Check for [/ul] tags
      else if (line.toLowerCase() === '[/ul]') {
        if (inList && inUnorderedList) {
          formattedLines.push('</ul>');
          inList = false;
          inUnorderedList = false;
        }
      }
      // Check for bullet points
      else if (line.startsWith('•') || line.startsWith('-') || line.startsWith('*')) {
        const bulletContent = line.substring(1).trim();
        
        // Start a new list if not already in one
        if (!inList) {
          formattedLines.push('<ul class="update-list">');
          inList = true;
          inUnorderedList = true;
        }
        
        formattedLines.push(`<li class="list-item">${bulletContent}</li>`);
      }
      // Check for sub-bullet points (usually indented with spaces or tabs)
      else if (line.match(/^\s+[•\-*]/) || line.startsWith('○')) {
        const bulletContent = line.replace(/^\s+[•\-*○]/, '').trim();
        
        // If we're not in a list or we're in a main list, we need to handle differently
        if (!inList || inUnorderedList) {
          if (!inList) {
            formattedLines.push('<ul class="update-list">');
            inList = true;
            inUnorderedList = true;
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
          formattedLines.push(inUnorderedList ? '</ul>' : '</ol>');
          inList = false;
          inUnorderedList = false;
        }
        formattedLines.push(`<p>${line}</p>`);
      }
    }
    
    // Close any open list at the end
    if (inList) {
      formattedLines.push(inUnorderedList ? '</ul>' : '</ol>');
    }
    
    return formattedLines.join('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-20 pb-10 px-4">
        <Header />
        <main className="max-w-4xl mx-auto mt-8 animate-pulse">
          <div className="h-8 w-48 bg-muted rounded mb-2"></div>
          <div className="h-12 w-3/4 bg-muted rounded mb-6"></div>
          <div className="h-72 w-full bg-muted rounded mb-6"></div>
          <div className="space-y-4">
            <div className="h-4 w-full bg-muted rounded"></div>
            <div className="h-4 w-full bg-muted rounded"></div>
            <div className="h-4 w-5/6 bg-muted rounded"></div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !update) {
    return (
      <div className="min-h-screen bg-background pt-20 pb-10 px-4">
        <Header />
        <main className="max-w-4xl mx-auto mt-8">
          <Button
            variant="ghost"
            className="mb-6"
            onClick={() => navigate('/')}
          >
            <ArrowLeft size={16} className="mr-2" />
            Back to updates
          </Button>
          <div className="p-6 rounded-lg bg-destructive/10 text-destructive">
            {error || 'Update not found'}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20 pb-10 px-4">
      <Header />
      <main className="max-w-4xl mx-auto mt-8">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate('/')}
        >
          <ArrowLeft size={16} className="mr-2" />
          Back to updates
        </Button>
        
        <article className="bg-card rounded-lg shadow-sm overflow-hidden border">
          {formattedDate && (
            <p className="text-xs font-medium tracking-wider text-muted-foreground uppercase px-6 pt-6 pb-1">
              {formattedDate}
            </p>
          )}
          
          <h1 className="text-3xl font-bold px-6 pb-4">{update.title}</h1>
          
          {update.imageUrl && (
            <div className="w-full relative h-[400px] overflow-hidden mb-6">
              <img 
                src={update.imageUrl} 
                alt={update.title} 
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          <div className="px-6 pb-6">
            <div 
              className={cn(
                "text-foreground/90 space-y-2 update-content",
                "prose dark:prose-invert max-w-none"
              )}
              dangerouslySetInnerHTML={{ __html: formatDescription(update.description) }}
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
      </main>
      
      <style>
        {`
        .update-content .section-header {
          font-weight: 600;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
          color: rgb(var(--foreground-rgb) / 0.9);
        }
        
        .update-content .update-list {
          padding-left: 1.5rem;
          margin-bottom: 1rem;
        }
        
        .update-content .update-sublist {
          list-style-type: circle;
          padding-left: 1.5rem;
          margin-top: 0.25rem;
        }
        
        .update-content .list-item {
          margin-bottom: 0.5rem;
        }
        
        .update-content .sublist-item {
          margin-bottom: 0.25rem;
        }
        
        .update-content p {
          margin-bottom: 1rem;
        }
        `}
      </style>
    </div>
  );
};

export default UpdateDetail;
