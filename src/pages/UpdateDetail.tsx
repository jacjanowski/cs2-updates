
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
* Inferno
  * Fixed roof geometry at church that was visible from boiler entrance.
            
[MISC]
* Fixed a case where voice chat would break after unloading a Steam Workshop map.
* Fixed a case where game client would crash if certain community server plugins were restricting networking of player entities.
* Fixed several bugs in applying patches UI.`,
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

  const formattedDate = update?.date 
    ? format(new Date(update.date), 'MMMM d, yyyy').toUpperCase() 
    : '';
  
  const formatDescription = (description: string) => {
    if (!description) return '';
    
    const lines = description.split('\n');
    let htmlOutput = '';
    let inList = false;
    let currentListType = '';
    let indentLevel = 0;
    
    lines.forEach(line => {
      const trimmedLine = line.trim();
      if (!trimmedLine) return; // Skip empty lines
      
      // Check for section headers like [MAPS], [MISC]
      if (/^\[(.*)\]$/.test(trimmedLine)) {
        // Close any open list
        if (inList) {
          htmlOutput += '</ul>';
          inList = false;
          indentLevel = 0;
        }
        
        const sectionName = trimmedLine.match(/^\[(.*)\]$/)?.[1] || '';
        htmlOutput += `<div class="section-header">[${sectionName}]</div>`;
      }
      // Check for explicit list tags
      else if (trimmedLine.toLowerCase() === '[list]') {
        htmlOutput += '<ol>';
        inList = true;
        currentListType = 'ol';
      }
      else if (trimmedLine.toLowerCase() === '[/list]') {
        if (inList && currentListType === 'ol') {
          htmlOutput += '</ol>';
          inList = false;
        }
      }
      else if (trimmedLine.toLowerCase() === '[ul]') {
        htmlOutput += '<ul>';
        inList = true;
        currentListType = 'ul';
      }
      else if (trimmedLine.toLowerCase() === '[/ul]') {
        if (inList && currentListType === 'ul') {
          htmlOutput += '</ul>';
          inList = false;
        }
      }
      // Check for bullet points at the start of a line (* or - or •)
      else if (/^[•\-*]\s/.test(trimmedLine)) {
        const lineContent = trimmedLine.replace(/^[•\-*]\s/, '');
        
        // Check if we're not already in a list
        if (!inList) {
          htmlOutput += '<ul>';
          inList = true;
          currentListType = 'ul';
          indentLevel = 0;
        }
        
        // If we were in a nested list at a deeper level, close the deeper lists
        if (indentLevel > 0) {
          for (let i = 0; i < indentLevel; i++) {
            htmlOutput += '</ul>';
          }
          indentLevel = 0;
        }
        
        htmlOutput += `<li>${lineContent}`;
        
        // Check if the next line is a sub-bullet
        const nextLineIndex = lines.indexOf(line) + 1;
        if (nextLineIndex < lines.length && /^\s+[•\-*○]\s/.test(lines[nextLineIndex].trim())) {
          htmlOutput += '<ul>';
          indentLevel++;
        } else {
          htmlOutput += '</li>';
        }
      }
      // Check for indented sub-bullets (circles in the image)
      else if (/^\s+[•\-*○]\s/.test(trimmedLine)) {
        const lineContent = trimmedLine.replace(/^\s+[•\-*○]\s/, '');
        
        if (!inList) {
          // This shouldn't happen, but just in case
          htmlOutput += '<ul><li><ul>';
          inList = true;
          currentListType = 'ul';
          indentLevel = 1;
        }
        
        htmlOutput += `<li>${lineContent}</li>`;
        
        // Check if the next line is not a sub-bullet (to close the sublist)
        const nextLineIndex = lines.indexOf(line) + 1;
        if (nextLineIndex >= lines.length || !/^\s+[•\-*○]\s/.test(lines[nextLineIndex].trim())) {
          htmlOutput += '</ul></li>';
          indentLevel--;
        }
      }
      // Regular text
      else {
        // Close any open list
        if (inList) {
          // Close nested lists if any
          for (let i = 0; i <= indentLevel; i++) {
            htmlOutput += '</ul>';
          }
          inList = false;
          indentLevel = 0;
        }
        htmlOutput += `<p>${trimmedLine}</p>`;
      }
    });
    
    // Close any open list at the end
    if (inList) {
      for (let i = 0; i <= indentLevel; i++) {
        htmlOutput += currentListType === 'ul' ? '</ul>' : '</ol>';
      }
    }
    
    return htmlOutput;
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
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="max-w-4xl mx-auto pt-20 pb-10 px-4">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate('/')}
        >
          <ArrowLeft size={16} className="mr-2" />
          Back to updates
        </Button>
        
        <article className="bg-card/70 backdrop-blur-sm rounded-lg shadow-sm overflow-hidden border">
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
                "text-foreground/90 space-y-2 update-content dark:text-gray-300",
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
          font-size: 1.1rem;
          color: rgb(var(--foreground-rgb) / 0.9);
        }
        
        .update-content ul {
          list-style-type: disc;
          padding-left: 1.5rem;
          margin-bottom: 1rem;
        }
        
        .update-content ul ul {
          list-style-type: circle;
          padding-left: 1.5rem;
          margin-top: 0.25rem;
        }
        
        .update-content li {
          margin-bottom: 0.5rem;
        }
        
        .update-content p {
          margin-bottom: 1rem;
        }
        
        /* Dark mode specific styles */
        .dark .update-content {
          color: #e0e0e0;
        }
        
        .dark .update-content .section-header {
          color: #f0f0f0;
        }
        
        .dark .update-content ul li {
          color: #c0c0c0;
        }
        `}
      </style>
    </div>
  );
};

export default UpdateDetail;
