
import { useState, useEffect } from 'react';
import { UpdateData } from "@/components/UpdateCard";
import { SteamAPI } from "@/utils/steamAPI";
import { NewsAPI } from "@/utils/newsAPI";
import { extractImagesFromContent } from "@/utils/updateFormatter";
import { compareUpdateSlugs, getUpdateSlug } from "@/utils/urlHelpers";

interface UseUpdateDetailResult {
  update: UpdateData | null;
  loading: boolean;
  error: string | null;
  isNewsItem: boolean;
}

export const useUpdateDetail = (id: string | undefined): UseUpdateDetailResult => {
  const [update, setUpdate] = useState<UpdateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isNewsItem, setIsNewsItem] = useState(false);
  const [contentImages, setContentImages] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) {
        setError('Invalid update ID');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log("Fetching data for update ID:", id);
        
        // Fetch all updates from CS2
        const { updates } = await SteamAPI.getUpdates();
        
        // Debug: List all available updates with slugs for comparison
        console.log("All updates:", updates.map(u => ({ 
          title: u.title, 
          slug: getUpdateSlug(u.title),
          date: u.date
        })));
        
        // Find the update with a matching slug
        let foundItem = null;
        for (const update of updates) {
          const updateSlug = getUpdateSlug(update.title);
          if (compareUpdateSlugs(id, updateSlug)) {
            console.log("Found matching update:", update.title);
            foundItem = update;
            break;
          }
        }
        
        // If not found in updates, check news items
        if (!foundItem) {
          console.log("Update not found, checking news items...");
          const newsItems = await NewsAPI.getNews();
          
          // Debug: List all news items with slugs
          console.log("All news items:", newsItems.map(n => ({ 
            title: n.title, 
            slug: getUpdateSlug(n.title),
            date: n.date
          })));
          
          // Check each news item for a match
          for (const newsItem of newsItems) {
            const newsSlug = getUpdateSlug(newsItem.title);
            if (compareUpdateSlugs(id, newsSlug)) {
              console.log("Found matching news item:", newsItem.title);
              foundItem = newsItem;
              setIsNewsItem(true);
              break;
            }
          }
        }
        
        if (foundItem) {
          console.log("Content found:", {
            title: foundItem.title,
            date: foundItem.date,
            type: isNewsItem ? 'News' : 'Update'
          });
          
          // Extract images from content for display
          if (foundItem.description) {
            const extractedImages = extractImagesFromContent(foundItem.description);
            console.log("Content images:", extractedImages);
            setContentImages(extractedImages);
          }
          
          setUpdate(foundItem);
          setError(null);
        } else {
          console.error("No matching content found for ID:", id);
          setError('Content not found');
        }
      } catch (err) {
        console.error('Error fetching content:', err);
        setError('Failed to load content details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id]);

  return { update, loading, error, isNewsItem };
};
