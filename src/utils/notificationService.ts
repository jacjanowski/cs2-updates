import { UpdateData } from "@/components/UpdateCard";
import { SettingsData } from "@/components/SettingsCard";

export class NotificationService {
  private static instance: NotificationService;
  private notificationsEnabled: boolean = false;
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

  // Show notification for new update
  public async showNotification(update: UpdateData): Promise<void> {
    if (!this.notificationsEnabled) return;
    
    const hasPermission = await this.requestNotificationPermission();
    if (!hasPermission) return;

    try {
      const notification = new Notification('New CS2 Update', {
        body: update.title,
        icon: '/favicon.ico',
        badge: '/favicon.ico'
      });

      notification.onclick = () => {
        window.focus();
        if (update.url) {
          window.open(update.url, '_blank');
        }
        notification.close();
      };
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
