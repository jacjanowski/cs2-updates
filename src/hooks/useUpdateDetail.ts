
import { useState, useEffect } from 'react';
import { UpdateData } from "@/components/UpdateCard";
import { SteamAPI } from "@/utils/steamAPI";
import { NewsAPI } from "@/utils/newsAPI";
import { getUpdateSlug } from "@/utils/urlHelpers";

export const useUpdateDetail = (id: string | undefined): {
  update: UpdateData | null;
  loading: boolean;
  error: string | null;
  isNewsItem: boolean;
} => {
  const [update, setUpdate] = useState<UpdateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isNewsItem, setIsNewsItem] = useState(false);

  useEffect(() => {
    const fetchUpdateDetail = async () => {
      if (!id) {
        setError("Update ID is missing");
        setLoading(false);
        return;
      }

      try {
        console.log(`Looking for update with slug: ${id}`);
        
        // First try to find the update in regular updates
        const { updates } = await SteamAPI.getUpdates();
        
        let foundUpdate = updates.find(update => {
          const updateSlug = getUpdateSlug(update.title);
          console.log(`Comparing ${updateSlug} with ${id}`);
          return updateSlug === id;
        });

        // If not found in updates, check news items
        if (!foundUpdate) {
          console.log("Not found in updates, checking news items...");
          const news = await NewsAPI.getNews();
          foundUpdate = news.find(newsItem => {
            const newsSlug = getUpdateSlug(newsItem.title);
            console.log(`Comparing ${newsSlug} with ${id}`);
            return newsSlug === id;
          });
          
          if (foundUpdate) {
            console.log("Found in news items");
            setIsNewsItem(true);
          }
        } else {
          console.log("Found in updates");
        }

        if (foundUpdate) {
          console.log("Found update:", foundUpdate.title);
          setUpdate(foundUpdate);
        } else {
          console.log("Update not found");
          setError("Update not found");
        }
      } catch (err) {
        console.error("Error fetching update detail:", err);
        setError("Failed to load update. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchUpdateDetail();
  }, [id]);

  return { update, loading, error, isNewsItem };
};
