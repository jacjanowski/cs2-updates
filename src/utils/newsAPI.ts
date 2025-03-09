
import { UpdateData } from "@/components/UpdateCard";
import { SteamEvent, SteamResponse } from "./steam/steamTypes";
import { processHtmlContent, extractImageFromBody } from "./steam/contentProcessor";
import { parseJsonData } from "./steam/jsonParser";
import { shouldCheckForUpdate } from "./steam/schedulingUtils";
import { extractImagesFromContent } from "@/utils/updateFormatter";

const API_URL = 'https://corsproxy.io/?http://store.steampowered.com/events/ajaxgetpartnereventspageable/?clan_accountid=0&appid=730&offset=0&count=100&l=english&origin=https:%2F%2Fwww.counter-strike.net';

export class NewsAPI {
  private static lastCheckedTime: number = 0;
  private static cachedNews: UpdateData[] = [];

  // Helper to convert Steam event to our UpdateData format for news
  private static convertEventToNews(event: SteamEvent): UpdateData {
    const body = event.announcement_body?.body || '';
    
    // Process HTML content first to extract formatted text and images
    let description = '';
    
    if (body) {
      description = processHtmlContent(body);
    }
    
    // Try multiple sources for images, prioritizing content images first as they are more reliable
    const contentImages = extractImagesFromContent(description);
    let imageUrl = contentImages.length > 0 ? contentImages[0] : undefined;
    
    // If no image found in content, try JSON data
    if (!imageUrl) {
      imageUrl = parseJsonData(event.jsondata);
    }
    
    // If still no image, try extracting directly from body
    if (!imageUrl && body) {
      imageUrl = extractImageFromBody(body);
    }
    
    // If still no image, use a placeholder for news items
    if (!imageUrl) {
      // Use placeholder images for demo purposes - in production you'd want to leave this undefined
      const placeholders = [
        'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=800&h=400&fit=crop',
        'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=400&fit=crop',
        'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=400&fit=crop',
        'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&h=400&fit=crop'
      ];
      // Use a consistent image based on the event name to avoid random changes on refresh
      const imageIndex = event.event_name.length % placeholders.length;
      imageUrl = placeholders[imageIndex];
    }
    
    return {
      title: event.event_name,
      description: description,
      date: new Date(event.rtime32_start_time * 1000).toISOString(),
      url: `https://www.counter-strike.net/newsentry/${event.announcement_body?.gid || ''}`,
      imageUrl
    };
  }

  // Get news from Steam
  public static async getNews(): Promise<UpdateData[]> {
    try {
      console.log("Fetching news from Steam API...");
      
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error(`API request failed with status: ${response.status}`);
      }
      
      const data: SteamResponse = await response.json();
      
      if (!data.success || !Array.isArray(data.events)) {
        console.error("Invalid response format:", data);
        return this.cachedNews;
      }
      
      // Filter out update events and convert to our format
      const news = data.events
        .filter(event => event.event_name !== "Counter-Strike 2 Update") // Exclude CS2 updates
        .map(event => this.convertEventToNews(event))
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      this.cachedNews = news;
      this.lastCheckedTime = Date.now();
      
      console.log(`Fetched ${news.length} news items.`);
      return news;
    } catch (error) {
      console.error("Error fetching news:", error);
      return this.cachedNews;
    }
  }

  // Check if we should fetch news based on last check time
  public static shouldCheckForNews(checkFrequency: 'hourly' | 'daily' | 'weekly'): boolean {
    return shouldCheckForUpdate(this.lastCheckedTime, checkFrequency);
  }
}
