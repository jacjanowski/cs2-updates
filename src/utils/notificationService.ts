
import { UpdateData } from "@/components/UpdateCard";
import { SettingsData } from "@/components/SettingsCard";

export class NotificationService {
  private static instance: NotificationService;
  private notificationsEnabled: boolean = true; // Set default to true for testing
  private checkFrequency: 'hourly' | 'daily' | 'weekly' = 'daily';
  private checkInterval: number | null = null;
  private onUpdate: ((updates: UpdateData[]) => void) | null = null;
  
  private constructor() {
    // Private constructor to enforce singleton
    this.loadSettings();
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  // Initialize notification service
  public init(onUpdate: (updates: UpdateData[]) => void): void {
    this.onUpdate = onUpdate;
    this.requestNotificationPermission();
    this.setupCheckInterval();
  }

  // Request notification permission
  private async requestNotificationPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  }

  // Show notification for new update - this triggers a Windows notification
  public async showNotification(update: UpdateData): Promise<void> {
    // Request permission first
    const hasPermission = await this.requestNotificationPermission();
    if (!hasPermission) {
      console.log('No notification permission granted');
      return;
    }

    try {
      // Format the title to make it more attractive in Windows notifications
      const title = "CS2 Update Available";
      
      // Create a more detailed body that includes the update title and part of description
      let description = update.description || "";
      // Truncate the description if it's too long for a notification
      if (description.length > 100) {
        description = description.substring(0, 100) + "...";
      }
      
      const body = `${update.title}\n${description}`;
      
      // This creates a Windows 10 Toast notification
      const notification = new Notification(title, {
        body: body,
        icon: '/favicon.ico', // Use app favicon to match app identity
        badge: '/favicon.ico',
        tag: 'cs2-update', // Group similar notifications
        requireInteraction: true, // Keep the notification visible until user interacts with it
        silent: false, // Play sound to alert user
        // Windows 10 specific options (though these are not standard and may be ignored)
        // These help with replicating the Windows 10 native notification style
        actions: [
          {
            action: 'view',
            title: 'View Update'
          }
        ]
      });

      notification.onclick = () => {
        window.focus();
        if (update.url) {
          window.open(update.url, '_blank');
        }
        notification.close();
      };
      
      console.log('Windows notification shown:', update.title);
    } catch (error) {
      console.error('Error showing notification:', error);
    }
  }

  // Setup background check interval based on frequency
  private setupCheckInterval(): void {
    // Clear existing interval if any
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }

    // Don't setup interval if notifications are disabled
    if (!this.notificationsEnabled) return;

    const intervalMap = {
      hourly: 60 * 60 * 1000,      // 1 hour
      daily: 24 * 60 * 60 * 1000,  // 24 hours
      weekly: 7 * 24 * 60 * 60 * 1000 // 7 days
    };

    // For development, use shorter intervals
    const isDev = process.env.NODE_ENV === 'development';
    const multiplier = isDev ? 0.01 : 1; // 1% of the time in development

    const interval = intervalMap[this.checkFrequency] * multiplier;
    
    // Use a minimum interval of 10 seconds in development
    const minInterval = isDev ? 10 * 1000 : interval;
    
    this.checkInterval = window.setInterval(() => {
      this.triggerUpdateCheck();
    }, Math.max(interval, minInterval));

    console.log(`Notification check interval set to ${this.checkFrequency} (${interval}ms)`);
  }

  // Trigger the update check callback
  private triggerUpdateCheck(): void {
    if (this.onUpdate) {
      this.onUpdate([]);
    }
  }

  // Update settings and reconfigure service
  public updateSettings(settings: SettingsData): void {
    this.notificationsEnabled = settings.notifications;
    this.checkFrequency = settings.checkFrequency;
    
    // Save settings
    this.saveSettings();
    
    // Reconfigure interval
    this.setupCheckInterval();
  }

  // Save settings to localStorage
  private saveSettings(): void {
    const settings = {
      notifications: this.notificationsEnabled,
      checkFrequency: this.checkFrequency
    };
    localStorage.setItem('cs2UpdateSettings', JSON.stringify(settings));
  }

  // Load settings from localStorage
  private loadSettings(): void {
    try {
      const savedSettings = localStorage.getItem('cs2UpdateSettings');
      if (savedSettings) {
        const settings = JSON.parse(savedSettings) as SettingsData;
        this.notificationsEnabled = settings.notifications;
        this.checkFrequency = settings.checkFrequency;
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  }

  // Get current settings
  public getSettings(): SettingsData {
    return {
      notifications: this.notificationsEnabled,
      checkFrequency: this.checkFrequency
    };
  }
}

export default NotificationService.getInstance();
