import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.tecnomovil.app',
  appName: 'TecnoMovil',
  webDir: 'dist/frontend/browser',
  server: {
    androidScheme: 'http'
  }
};

export default config;
