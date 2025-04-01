
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { UpdateData } from "@/components/UpdateCard";
import { SteamAPI } from "@/utils/steamAPI";
import { NewsAPI } from "@/utils/newsAPI";
import { extractImagesFromContent } from "@/utils/updateFormatter";
import { compareUpdateSlugs, getUpdateSlug, getUpdateUniqueId } from "@/utils/urlHelpers";

interface UseUpdateDetailResult {
  update: UpdateData | null;
  loading: boolean;
  error: string | null;
  isNewsItem: boolean;
}

interface LocationState {
  updateData?: UpdateData;
  isNewsItem?: boolean;
  uniqueId?: string;
}

export const useUpdateDetail = (id: string | undefined): UseUpdateDetailResult => {
  const [update, setUpdate] = useState<UpdateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isNewsItem, setIsNewsItem] = useState(false);
  const [contentImages, setContentImages] = useState<string[]>([]);
  
  // Get location state if available (passed from the card click)
  const location = useLocation();
  const locationState = location.state as LocationState | undefined;

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
        
        // If we have location state with the update data, use it directly
        if (locationState?.updateData) {
          console.log("[useUpdateDetail] Using data from navigation state:", locationState.updateData.title);
          setUpdate(locationState.updateData);
          setIsNewsItem(locationState.isNewsItem || false);
          
          if (locationState.updateData.description) {
            const extractedImages = extractImagesFromContent(locationState.updateData.description);
            setContentImages(extractedImages);
          }
          
          setLoading(false);
          return;
        }
        
        // First try to find in updates
        const { updates } = await SteamAPI.getUpdates();
        
        // Debug info for troubleshooting
        console.log(`[useUpdateDetail] Looking for slug "${id}" in ${updates.length} updates`);
        
        // Find the update with a matching slug
        let foundItem = null;
        for (const update of updates) {
          const updateSlug = getUpdateSlug(update.title);
          console.log(`[useUpdateDetail] Comparing update: "${updateSlug}" with "${id}"`);
          
          if (compareUpdateSlugs(id, updateSlug)) {
            console.log(`[useUpdateDetail] Found matching update: "${update.title}"`);
            foundItem = update;
            setIsNewsItem(false);
            break;
          }
        }
        
        // If not found in updates, check news items
        if (!foundItem) {
          console.log("[useUpdateDetail] Update not found, checking news items...");
          const newsItems = await NewsAPI.getNews();
          
          console.log(`[useUpdateDetail] Looking for slug "${id}" in ${newsItems.length} news items`);
          
          // Check each news item for a match
          for (const newsItem of newsItems) {
            const newsSlug = getUpdateSlug(newsItem.title);
            console.log(`[useUpdateDetail] Comparing news: "${newsSlug}" with "${id}"`);
            
            if (compareUpdateSlugs(id, newsSlug)) {
              console.log(`[useUpdateDetail] Found matching news item: "${newsItem.title}"`);
              foundItem = newsItem;
              setIsNewsItem(true);
              break;
            }
          }
        }
        
        if (foundItem) {
          console.log("[useUpdateDetail] Content found:", {
            title: foundItem.title,
            date: foundItem.date,
            type: isNewsItem ? 'News' : 'Update'
          });
          
          // Extract images from content for display
          if (foundItem.description) {
            const extractedImages = extractImagesFromContent(foundItem.description);
            setContentImages(extractedImages);
          }
          
          setUpdate(foundItem);
          setError(null);
        } else {
          console.error("[useUpdateDetail] No matching content found for ID:", id);
          setError('Content not found');
        }
      } catch (err) {
        console.error('[useUpdateDetail] Error fetching content:', err);
        setError('Failed to load content details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id, locationState]);

  return { update, loading, error, isNewsItem };
};
