
import Header from "@/components/Header";
import SettingsCard, { SettingsData } from "@/components/SettingsCard";
import notificationService from "@/utils/notificationService";
import { useEffect, useState } from "react";

const Settings = () => {
  const [settings, setSettings] = useState<SettingsData>({
    notifications: false,
    checkFrequency: 'daily',
  });

  // Load settings on component mount
  useEffect(() => {
    const currentSettings = notificationService.getSettings();
    setSettings(currentSettings);
  }, []);

  // Save settings
  const handleSaveSettings = (newSettings: SettingsData) => {
    setSettings(newSettings);
    notificationService.updateSettings(newSettings);
  };

  return (
    <div className="min-h-screen bg-background pt-20 pb-10 px-4">
      <Header />
      
      <main className="max-w-md mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-medium tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Configure your notification preferences
          </p>
        </div>
        
        <div className="space-y-4">
          <SettingsCard
            initialSettings={settings}
            onSave={handleSaveSettings}
          />
          
          <div className="bg-secondary/50 rounded-lg p-4 text-sm text-muted-foreground">
            <p className="font-medium mb-2">About notifications</p>
            <p>
              Push notifications will be sent when new CS2 updates are available. 
              The app will check for updates according to your selected frequency.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Settings;
