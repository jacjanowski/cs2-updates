
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
        
        // First try to find the update in CS2 updates
        const { updates } = await SteamAPI.getUpdates();
        
        // Debug: log all updates to see what we're comparing against
        console.log("Available updates:", updates.map(u => ({ 
          title: u.title, 
          slug: getUpdateSlug(u.title),
          date: u.date
        })));
        console.log("Looking for slug:", id);
        
        // Use our slug comparison function
        let foundItem = updates.find(u => {
          const updateSlug = getUpdateSlug(u.title);
          const matches = compareUpdateSlugs(id, updateSlug);
          console.log(`Comparing: "${id}" with "${updateSlug}" - Match: ${matches}`);
          return matches;
        });
        
        // If not found in updates, check the news
        if (!foundItem) {
          console.log("Item not found in updates, checking news...");
          const newsItems = await NewsAPI.getNews();
          
          // Debug the available news items
          console.log("Available news items:", newsItems.map(n => ({ 
            title: n.title, 
            slug: getUpdateSlug(n.title),
            date: n.date
          })));
          
          // Use the same comparison function for news items
          foundItem = newsItems.find(n => {
            const newsSlug = getUpdateSlug(n.title);
            const matches = compareUpdateSlugs(id, newsSlug);
            console.log(`Comparing news: "${id}" with "${newsSlug}" - Match: ${matches}`);
            return matches;
          });
          
          if (foundItem) {
            console.log("Found item in news:", foundItem.title);
            setIsNewsItem(true);
          }
        } else {
          console.log("Found item in updates:", foundItem.title);
        }
        
        if (foundItem) {
          console.log("Item details:", {
            title: foundItem.title,
            date: foundItem.date,
            hasImage: !!foundItem.imageUrl,
            imageUrl: foundItem.imageUrl
          });
          
          // Extract images from content
          const extractedImages = extractImagesFromContent(foundItem.description);
          console.log("Extracted images from content:", extractedImages);
          setContentImages(extractedImages);
          
          setUpdate(foundItem);
          setError(null);
        } else {
          // If still not found, show an error
          console.error("Content not found for ID:", id);
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
