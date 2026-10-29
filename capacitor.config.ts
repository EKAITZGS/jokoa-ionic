import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.jokoa.app.ionic',
  appName: 'Jokoa',
  webDir: 'www',
  plugins: {
    // Las peticiones salen por el sistema, no por el WebView: así no hay problemas de CORS con la API
    CapacitorHttp: { enabled: true },
  },
};

export default config;
