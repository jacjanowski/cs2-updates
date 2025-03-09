
import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Header from "@/components/Header";
import { format } from 'date-fns';
import { UpdateData } from "@/components/UpdateCard";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SteamAPI } from "@/utils/steamAPI";
import { formatDescription } from "@/utils/updateFormatter";
import UpdateContent from "@/components/UpdateContent";
import UpdateLoadingSkeleton from "@/components/UpdateLoadingSkeleton";
import UpdateError from "@/components/UpdateError";
import "@/styles/updateContent.css";

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
  
  const formattedHtml = update?.description 
    ? formatDescription(update.description)
    : '';

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
        
        {loading ? (
          <UpdateLoadingSkeleton />
        ) : error ? (
          <UpdateError error={error} />
        ) : update && (
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
              <UpdateContent 
                description={update.description} 
                formattedHtml={formattedHtml} 
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
        )}
      </main>
    </div>
  );
};

export default UpdateDetail;
