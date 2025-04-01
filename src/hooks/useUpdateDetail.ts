
import { useState, useEffect } from 'react';
import { UpdateData } from "@/components/UpdateCard";
import { SteamAPI } from "@/utils/steamAPI";
import { NewsAPI } from "@/utils/newsAPI";
import { extractImagesFromContent } from "@/utils/updateFormatter";
import { compareUpdateSlugs } from "@/utils/urlHelpers";

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
        
        // Use our new slug comparison function
        let foundItem = updates.find(u => compareUpdateSlugs(id, getUpdateSlug(u.title)));
        
        // If not found in updates, check the news
        if (!foundItem) {
          console.log("Item not found in updates, checking news...");
          const newsItems = await NewsAPI.getNews();
          
          // Use the same comparison function for news items
          foundItem = newsItems.find(n => compareUpdateSlugs(id, getUpdateSlug(n.title)));
          
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
