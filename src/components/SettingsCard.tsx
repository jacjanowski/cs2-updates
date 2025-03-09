
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { useEffect, useState } from "react";

interface SettingsCardProps {
  onSave: (settings: SettingsData) => void;
  initialSettings: SettingsData;
}

export interface SettingsData {
  notifications: boolean;
  checkFrequency: 'hourly' | 'daily' | 'weekly';
}

const SettingsCard = ({ onSave, initialSettings }: SettingsCardProps) => {
  const [settings, setSettings] = useState<SettingsData>(initialSettings);
  const { toast } = useToast();

  // Handle notifications toggle
  const handleNotificationsChange = (enabled: boolean) => {
    const newSettings = {
      ...settings,
      notifications: enabled
    };
    setSettings(newSettings);
    onSave(newSettings);
    
    toast({
      title: enabled ? "Notifications enabled" : "Notifications disabled",
      description: enabled 
        ? "You'll receive notifications for new updates" 
        : "You won't receive notifications for new updates",
      duration: 3000,
    });
  };

  // Handle frequency change
  const handleFrequencyChange = (value: 'hourly' | 'daily' | 'weekly') => {
    const newSettings = {
      ...settings,
      checkFrequency: value
    };
    setSettings(newSettings);
    onSave(newSettings);
    
    const frequencyText = {
      'hourly': 'hour',
      'daily': 'day',
      'weekly': 'week'
    };
    
    toast({
      title: "Frequency updated",
      description: `Updates will be checked every ${frequencyText[value]}`,
      duration: 3000,
    });
  };

  return (
    <Card className="shadow-sm animate-slide-up bg-card/60 backdrop-blur-sm border-border/80">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl">Notification Settings</CardTitle>
        <CardDescription>
          Configure how you want to be notified about CS2 updates
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="notifications">Enable notifications</Label>
            <p className="text-sm text-muted-foreground">
              Receive push notifications when updates are available
            </p>
          </div>
          <Switch
            id="notifications"
            checked={settings.notifications}
            onCheckedChange={handleNotificationsChange}
          />
        </div>
        
        <Separator className="my-4" />
        
        <div className="space-y-3">
          <Label htmlFor="frequency">Check frequency</Label>
          <RadioGroup 
            id="frequency" 
            value={settings.checkFrequency}
            onValueChange={(value) => handleFrequencyChange(value as 'hourly' | 'daily' | 'weekly')}
            className="space-y-3"
          >
            <div className="flex items-center space-x-2 rounded-md border p-3 cursor-pointer hover:bg-accent transition-colors">
              <RadioGroupItem value="hourly" id="hourly" />
              <Label htmlFor="hourly" className="flex-1 cursor-pointer">
                <div className="font-medium mb-0.5">Hourly</div>
                <div className="text-sm text-muted-foreground">Check every hour for new updates</div>
              </Label>
            </div>
            
            <div className="flex items-center space-x-2 rounded-md border p-3 cursor-pointer hover:bg-accent transition-colors">
              <RadioGroupItem value="daily" id="daily" />
              <Label htmlFor="daily" className="flex-1 cursor-pointer">
                <div className="font-medium mb-0.5">Daily</div>
                <div className="text-sm text-muted-foreground">Check once per day for new updates</div>
              </Label>
            </div>
            
            <div className="flex items-center space-x-2 rounded-md border p-3 cursor-pointer hover:bg-accent transition-colors">
              <RadioGroupItem value="weekly" id="weekly" />
              <Label htmlFor="weekly" className="flex-1 cursor-pointer">
                <div className="font-medium mb-0.5">Weekly</div>
                <div className="text-sm text-muted-foreground">Check once per week for new updates</div>
              </Label>
            </div>
          </RadioGroup>
        </div>
      </CardContent>
    </Card>
  );
};

export default SettingsCard;
