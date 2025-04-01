
import { useState, useEffect } from 'react';
import { UpdateData } from "@/components/UpdateCard";
import { SteamAPI } from "@/utils/steamAPI";
import { NewsAPI } from "@/utils/newsAPI";

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
        // First try to find the update in regular updates
        const { updates } = await SteamAPI.getUpdates();
        
        let foundUpdate = updates.find(update => {
          const updateSlug = update.title.toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-');
          return updateSlug === id;
        });

        // If not found in updates, check news items
        if (!foundUpdate) {
          const news = await NewsAPI.getNews();
          foundUpdate = news.find(newsItem => {
            const newsSlug = newsItem.title.toLowerCase()
              .replace(/[^\w\s-]/g, '')
              .replace(/\s+/g, '-');
            return newsSlug === id;
          });
          
          if (foundUpdate) {
            setIsNewsItem(true);
          }
        }

        if (foundUpdate) {
          setUpdate(foundUpdate);
        } else {
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
