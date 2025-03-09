import { UpdateData } from "@/components/UpdateCard";

const API_URL = 'https://corsproxy.io/?http://store.steampowered.com/events/ajaxgetpartnereventspageable/?clan_accountid=0&appid=730&offset=0&count=100&l=english&origin=https:%2F%2Fwww.counter-strike.net';

export interface SteamEvent {
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
  steamstoreitem: object[];
}

export interface SteamResponse {
  success: boolean;
  events: SteamEvent[];
  strAvatar?: string;
}

export class SteamAPI {
  private static lastCheckedTime: number = 0;
  private static cachedUpdates: UpdateData[] = [];
  private static lastUpdateId: string | null = null;

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
    
    // Replace headers with section headers
    content = content.replace(/<h[1-6]>(.*?)<\/h[1-6]>/gi, match => {
      const headerText = match.replace(/<\/?h[1-6]>/gi, '');
      return `[${headerText.toUpperCase()}]`;
    });
    
    // Extract section headers that might be in bold tags
    content = content.replace(/<strong>\[(.*?)\]<\/strong>/gi, '[$1]');
    
    // Remove remaining HTML tags
    content = content.replace(/<\/?[^>]+(>|$)/g, '');
    
    // Clean up extra whitespace
    content = content.replace(/\n\s*\n/g, '\n\n');
    
    return content.trim();
  }

  // Helper to convert Steam event to our UpdateData format
  private static convertEventToUpdate(event: SteamEvent): UpdateData {
    const body = event.announcement_body?.body || '';
    
    // Extract first image from the body if it exists
    const imageMatch = body.match(/<img[^>]+src="([^">]+)"/i);
    const imageUrl = imageMatch ? imageMatch[1] : undefined;
    
    // Process HTML content to extract formatted text
    let description = '';
    
    if (event.event_description) {
      description = this.processHtmlContent(event.event_description);
    } else if (body) {
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

  // Get updates from Steam
  public static async getUpdates(): Promise<{updates: UpdateData[], hasNewUpdate: boolean}> {
    try {
      console.log("Fetching updates from Steam API...");
      
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error(`API request failed with status: ${response.status}`);
      }
      
      const data: SteamResponse = await response.json();
      
      if (!data.success || !Array.isArray(data.events)) {
        console.error("Invalid response format:", data);
        return { updates: this.cachedUpdates, hasNewUpdate: false };
      }
      
      // Convert to our format and sort by date (newest first)
      const updates = data.events
        .filter(event => event.event_type === 12) // Filter for updates
        .map(event => this.convertEventToUpdate(event))
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      this.cachedUpdates = updates;
      this.lastCheckedTime = Date.now();
      
      // Check if there's a new update
      const hasNewUpdate = this.hasNewUpdate(updates);
      
      console.log(`Fetched ${updates.length} updates. New updates: ${hasNewUpdate}`);
      return { updates, hasNewUpdate };
    } catch (error) {
      console.error("Error fetching updates:", error);
      return { updates: this.cachedUpdates, hasNewUpdate: false };
    }
  }

  // Check if there's a new update
  private static hasNewUpdate(updates: UpdateData[]): boolean {
    if (updates.length === 0) return false;
    
    const latestUpdateDate = new Date(updates[0].date).getTime();
    const currentUpdateId = updates[0].title + updates[0].date;
    
    // First time checking
    if (!this.lastUpdateId) {
      this.lastUpdateId = currentUpdateId;
      return false;
    }
    
    // Check if the latest update is different
    const isNewUpdate = this.lastUpdateId !== currentUpdateId;
    
    if (isNewUpdate) {
      this.lastUpdateId = currentUpdateId;
    }
    
    return isNewUpdate;
  }

  // Check if we should fetch updates based on settings
  public static shouldCheckForUpdates(checkFrequency: 'hourly' | 'daily' | 'weekly'): boolean {
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
