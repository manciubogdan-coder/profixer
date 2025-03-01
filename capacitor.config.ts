
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.fe03c270892948ca8215c47fd6d9f416',
  appName: 'masterconnect-hub',
  webDir: 'dist',
  server: {
    url: 'https://fe03c270-8929-48ca-8215-c47fd6d9f416.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  ios: {
    contentInset: 'automatic'
  },
  android: {
    backgroundColor: "#ffffff",
    compileSdkVersion: 33,
    targetSdkVersion: 33,
    minSdkVersion: 22,
    buildToolsVersion: "33.0.0"
  }
};

export default config;
