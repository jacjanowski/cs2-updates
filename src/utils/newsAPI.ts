
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
      // First try to parse the JSON string properly
      let jsonData;
      try {
        jsonData = JSON.parse(jsonDataString);
      } catch (e) {
        // If parsing fails, use regex as fallback
        console.log("Falling back to regex for JSON parsing");
      }

      // If we successfully parsed the JSON
      if (jsonData) {
        // Try to get the image from the parsed JSON structure
        if (jsonData.localized_capsule_image && jsonData.localized_capsule_image.length > 0) {
          return `https://cdn.cloudflare.steamstatic.com/steamcommunity/public/images/clanevent/${jsonData.localized_capsule_image[0]}`;
        } else if (jsonData.localized_title_image && jsonData.localized_title_image.length > 0) {
          return `https://cdn.cloudflare.steamstatic.com/steamcommunity/public/images/clanevent/${jsonData.localized_title_image[0]}`;
        }
      }

      // Fallback to regex matching if JSON parsing didn't work or images weren't found
      const imagePathMatch = jsonDataString.match(/"localized_capsule_image":\s*\[\s*"([^"]+)"/);
      const titleImageMatch = jsonDataString.match(/"localized_title_image":\s*\[\s*"([^"]+)"/);
      
      // Use capsule image first, fall back to title image
      if (imagePathMatch && imagePathMatch[1]) {
        return `https://cdn.cloudflare.steamstatic.com/steamcommunity/public/images/clanevent/${imagePathMatch[1]}`;
      } else if (titleImageMatch && titleImageMatch[1]) {
        return `https://cdn.cloudflare.steamstatic.com/steamcommunity/public/images/clanevent/${titleImageMatch[1]}`;
      }
      
      // Try matching header image as last resort
      const headerImageMatch = jsonDataString.match(/"header_image":\s*"([^"]+)"/);
      if (headerImageMatch && headerImageMatch[1]) {
        return headerImageMatch[1]; // This might already be a full URL
      }

      console.log("No image found in JSON data");
      return undefined;
    } catch (error) {
      console.error("Error parsing JSON data:", error);
      return undefined;
    }
  }

  // Process HTML content to extract structured information
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

  // Look for image URLs embedded in the body content
  private static extractImageFromBody(body: string): string | undefined {
    // Look for img tags in the body
    const imgMatch = body.match(/<img\s+[^>]*src=["']([^"']+)["'][^>]*>/i);
    if (imgMatch && imgMatch[1]) {
      return imgMatch[1];
    }
    
    // Try to find images in custom formats like [img]{URL}
    const customImgMatch = body.match(/\[img\]\{([^}]+)\}/i);
    if (customImgMatch && customImgMatch[1]) {
      return customImgMatch[1];
    }
    
    return undefined;
  }

  // Helper to convert Steam event to our UpdateData format for news
  private static convertEventToNews(event: SteamEvent): UpdateData {
    const body = event.announcement_body?.body || '';
    
    // Try multiple sources for images
    let imageUrl = this.parseJsonData(event.jsondata);
    
    // If no image found in jsondata, try extracting from body
    if (!imageUrl && body) {
      imageUrl = this.extractImageFromBody(body);
    }
    
    // Process HTML content to extract formatted text
    let description = '';
    
    if (body) {
      description = this.processHtmlContent(body);
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
