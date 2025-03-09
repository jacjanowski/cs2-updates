
import { UpdateData } from "@/components/UpdateCard";

const API_URL = 'https://corsproxy.io/?http://store.steampowered.com/events/ajaxgetpartnereventspageable/?clan_accountid=0&appid=730&offset=0&count=100&l=english&origin=https:%2F%2Fwww.counter-strike.net';

interface SteamEvent {
  announcement_body: {
    gid: string;
    clanid: string;
    posterid: string;
    headline: string;
    posttime: number;
    updatetime: number;
    body: string;
  };
  event_description: string;
  event_name: string;
  event_type: number;
  rtime32_start_time: number;
  rtime32_end_time: number;
  display_event: boolean;
  event_gid: string;
  left_icon_text: string;
  jsondata: string;
  steamstoreitem: object[];
}

interface SteamResponse {
  success: boolean;
  events: SteamEvent[];
  strAvatar?: string;
}

export class NewsAPI {
  private static lastCheckedTime: number = 0;
  private static cachedNews: UpdateData[] = [];

  // Parse JSON data for image URL
  private static parseJsonData(jsonDataString: string): string | undefined {
    try {
      // Extract the capsule image path from the JSON string
      const imagePathMatch = jsonDataString.match(/"localized_capsule_image":\s*\[\s*"([^"]+)"/);
      if (imagePathMatch && imagePathMatch[1]) {
        return `https://cdn.cloudflare.steamstatic.com/steamcommunity/public/images/clanevent/${imagePathMatch[1]}`;
      }
      return undefined;
    } catch (error) {
      console.error("Error parsing JSON data:", error);
      return undefined;
    }
  }

  // Process HTML content to extract structured information (reused from SteamAPI)
  private static processHtmlContent(htmlContent: string): string {
    // Replace HTML line breaks with newlines
    let content = htmlContent.replace(/<br\s*\/?>/gi, '\n');
    
    // Replace HTML lists with formatted bullet points
    content = content.replace(/<ul>(.*?)<\/ul>/gis, (match, listContent) => {
      // Extract list items and format them with bullet points
      const items = listContent.match(/<li>(.*?)<\/li>/gis) || [];
      return items
        .map(item => '• ' + item.replace(/<li>(.*?)<\/li>/i, '$1'))
        .join('\n');
    });
    
    // Remove remaining HTML tags
    content = content.replace(/<\/?[^>]+(>|$)/g, '');
    
    // Clean up extra whitespace
    content = content.replace(/\n\s*\n/g, '\n\n');
    
    return content.trim();
  }

  // Helper to convert Steam event to our UpdateData format for news
  private static convertEventToNews(event: SteamEvent): UpdateData {
    const body = event.announcement_body?.body || '';
    
    // Get image URL from jsondata field
    const imageUrl = this.parseJsonData(event.jsondata);
    
    // Process HTML content to extract formatted text
    let description = '';
    
    if (body) {
      description = this.processHtmlContent(body);
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
    if (this.lastCheckedTime === 0) return true;
    
    const now = Date.now();
    const timeSinceLastCheck = now - this.lastCheckedTime;
    
    // Convert frequency to milliseconds
    const frequencyMs = {
      hourly: 60 * 60 * 1000,
      daily: 24 * 60 * 60 * 1000,
      weekly: 7 * 24 * 60 * 60 * 1000
    };
    
    return timeSinceLastCheck >= frequencyMs[checkFrequency];
  }
}
