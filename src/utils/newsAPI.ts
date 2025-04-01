
import { UpdateData } from "@/components/UpdateCard";
import { SteamEvent, SteamResponse } from "./steam/steamTypes";
import { processHtmlContent, extractImageFromBody } from "./steam/contentProcessor";
import { parseJsonData } from "./steam/jsonParser";
import { shouldCheckForUpdate } from "./steam/schedulingUtils";
import { extractImagesFromContent } from "@/utils/updateFormatter";

const API_URL = 'https://corsproxy.io/?http://store.steampowered.com/events/ajaxgetpartnereventspageable/?clan_accountid=0&appid=730&offset=0&count=100&l=english&origin=https:%2F%2Fwww.counter-strike.net';
const DEFAULT_NEWS_IMAGE = 'https://cdn.akamai.steamstatic.com/apps/csgo/images/csgo_react/cs2/event_header.png';

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
    
    // If still no image, use the default CS2 image
    if (!imageUrl) {
      imageUrl = DEFAULT_NEWS_IMAGE;
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
        return this.cachedNews.length > 0 ? this.cachedNews : this.generateSampleNews();
      }
      
      // Filter out update events and convert to our format
      const news = data.events
        .filter(event => {
          // Exclude CS2 updates and any "Release Notes for" items
          return event.event_name !== "Counter-Strike 2 Update" && 
                 !event.event_name.includes("Release Notes for");
        })
        .map(event => this.convertEventToNews(event))
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      // If no news items found, create sample data
      if (news.length === 0) {
        console.log("No real news found, creating sample data");
        return this.generateSampleNews();
      }
      
      this.cachedNews = news;
      this.lastCheckedTime = Date.now();
      
      console.log(`Fetched ${news.length} news items.`);
      return news;
    } catch (error) {
      console.error("Error fetching news:", error);
      return this.cachedNews.length > 0 ? this.cachedNews : this.generateSampleNews();
    }
  }
  
  // Generate sample news for development/testing
  private static generateSampleNews(): UpdateData[] {
    return [
      {
        title: "CS2 World Championship Announcement",
        description: "Valve announces the first official CS2 World Championship tournament with a $2,000,000 prize pool. Teams from around the world will compete for the title of world champions.\n\n[video mp4=\"https://clan.cloudflare.steamstatic.com/images/3381077/4588bc787bb748aedab9b795d460263838d6e9f1.mp4\" webm=\"https://clan.cloudflare.steamstatic.com/images/3381077/ce6faac187287242edf8e7291dbd6e9034ed7329.webm\" poster=\"https://clan.cloudflare.steamstatic.com/images/3381077/6b695133290fa176f958a047bcdf3053b8e0ac47.png\" autoplay=\"true\" controls=\"false\"][/video]",
        date: new Date(Date.now() - 2 * 86400000).toISOString(),
        url: "https://www.counter-strike.net/newsentry/championship",
        imageUrl: "https://picsum.photos/800/400?random=1"
      },
      {
        title: "New Operation: Phoenix Rising",
        description: "Operation Phoenix Rising brings new maps, skins, and missions to CS2. [b]Available now for all players.[/b]\n\nHighlights include:\n[list][*]7 new community maps[*]New weapon case with 17 skins[*]100+ mission co-op campaign[*]Exclusive weapon finishes for operation pass holders[/list]",
        date: new Date(Date.now() - 5 * 86400000).toISOString(),
        url: "https://www.counter-strike.net/newsentry/operation",
        imageUrl: "https://picsum.photos/800/400?random=2"
      },
      {
        title: "CS2 Pro Player Spotlight: Rising Stars",
        description: "This month we're highlighting the young talents making waves in the CS2 professional scene. From 16-year-old AWP prodigies to strategic masterminds still in high school, these players represent the future of Counter-Strike.\n\n[img]https://picsum.photos/800/400?random=3[/img]\n\nRead their stories and watch exclusive interviews with their veteran teammates and coaches.",
        date: new Date(Date.now() - 8 * 86400000).toISOString(), 
        url: "https://www.counter-strike.net/newsentry/spotlight",
        imageUrl: "https://picsum.photos/800/400?random=3"
      },
      {
        title: "Community Map Workshop Update",
        description: "The CS2 Map Workshop has now been fully integrated with Steam. Map creators can now use the new CS2 lighting system and sub-tick features. We're also announcing a $100,000 prize pool for the best community maps of 2023.\n\n[quote]We believe community map makers are the lifeblood of Counter-Strike and we're committed to supporting their creativity.[/quote] - CS2 Development Team",
        date: new Date(Date.now() - 12 * 86400000).toISOString(),
        url: "https://www.counter-strike.net/newsentry/workshop",
        imageUrl: "https://picsum.photos/800/400?random=4" 
      },
      {
        title: "CS2 Gameplay Balance Patch Notes",
        description: "Today's update includes several gameplay adjustments based on community feedback and professional player input:\n\n[h2]Weapon Changes[/h2]\n[list][*]AK-47: Slightly reduced first-shot inaccuracy[*]M4A1-S: Reduced damage falloff at range[*]Desert Eagle: Increased recovery time between shots[*]SMGs: General mobility improvements while firing[/list]\n\n[h2]Economy Adjustments[/h2]\n[list][*]Adjusted kill rewards for shotguns[*]Modified loss bonus calculation[/list]",
        date: new Date(Date.now() - 15 * 86400000).toISOString(),
        url: "https://www.counter-strike.net/newsentry/balance",
        imageUrl: "https://picsum.photos/800/400?random=5"
      }
    ];
  }

  // Check if we should fetch news based on last check time
  public static shouldCheckForNews(checkFrequency: 'hourly' | 'daily' | 'weekly'): boolean {
    return shouldCheckForUpdate(this.lastCheckedTime, checkFrequency);
  }
}
