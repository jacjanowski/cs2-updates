
import { UpdateData } from "@/components/UpdateCard";
import { SteamEvent, SteamResponse } from "./steam/steamTypes";
import { processHtmlContent, extractImageFromBody } from "./steam/contentProcessor";
import { parseJsonData } from "./steam/jsonParser";
import { shouldCheckForUpdate } from "./steam/schedulingUtils";

const API_URL = 'https://corsproxy.io/?http://store.steampowered.com/events/ajaxgetpartnereventspageable/?clan_accountid=0&appid=730&offset=0&count=100&l=english&origin=https:%2F%2Fwww.counter-strike.net';

export class NewsAPI {
  private static lastCheckedTime: number = 0;
  private static cachedNews: UpdateData[] = [];

  // Helper to convert Steam event to our UpdateData format for news
  private static convertEventToNews(event: SteamEvent): UpdateData {
    const body = event.announcement_body?.body || '';
    
    // Try multiple sources for images
    let imageUrl = parseJsonData(event.jsondata);
    
    // If no image found in jsondata, try extracting from body
    if (!imageUrl && body) {
      imageUrl = extractImageFromBody(body);
    }
    
    // Process HTML content to extract formatted text
    let description = '';
    
    if (body) {
      description = processHtmlContent(body);
    }
    
    // Log the extracted data for debugging
    console.log("Extracted news item:", {
      title: event.event_name,
      hasImage: !!imageUrl,
      imageUrl: imageUrl?.substring(0, 100) + (imageUrl && imageUrl.length > 100 ? '...' : '')
    });
    
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
      
      // Debug the structure of the first event
      if (data.events.length > 0) {
        const sampleEvent = data.events[0];
        console.log("Sample event structure:", {
          title: sampleEvent.event_name,
          hasJsonData: !!sampleEvent.jsondata,
          jsonDataLength: sampleEvent.jsondata?.length,
          hasBody: !!sampleEvent.announcement_body?.body,
          bodyLength: sampleEvent.announcement_body?.body?.length
        });
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
