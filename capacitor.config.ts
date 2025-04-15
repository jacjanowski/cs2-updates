
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.58fba71791664eb78926f79dac5b6e10',
  appName: 'cs2-updates',
  webDir: 'dist',
  server: {
    url: 'https://58fba717-9166-4eb7-8926-f79dac5b6e10.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  ios: {
    contentInset: 'automatic'
  },
  android: {
    backgroundColor: "#ffffff"
  }
};

export default config;
