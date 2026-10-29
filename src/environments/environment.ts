// Web en desarrollo: `ng serve` redirige /ws a la API (proxy.conf.json), así que no hay CORS
export const environment = {
  production: false,
  apiUrl: '/ws',
};
