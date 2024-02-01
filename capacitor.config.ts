import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'de.hippocal.app',
  appName: 'HippoCal',
  webDir: 'www',
  server: {
    androidScheme: 'https'
  }
};

export default config;
