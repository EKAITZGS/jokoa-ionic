# Jokoa — App Ionic (Reto 2)

App de la tienda de videojuegos y móviles Jokoa hecha con Ionic 9, Angular 22 y Capacitor 8. Usa la misma API
(`https://jokoa.duckdns.org/ws`) y el mismo diseño que la app Android nativa (repositorio `jokoa-android`).

- Splash, login y registro con JWT (si el token caduca vuelve al login)
- Juegos y Móviles, ficha con compra y alquiler
- Tiendas con mapa (Leaflet y mosaicos grises de Esri)
- Pedidos (compras y alquileres con devolución), perfil y soporte técnico

## Ejecutar

```bash
npm install
npx ng serve                        # http://localhost:4200, /ws se redirige a la API con proxy.conf.js
npx ng build --configuration app    # web para el APK (apiUrl absoluta)
npx cap add android && npx cap sync android
```

Tokens de diseño en `src/theme/variables.scss`; componentes en `src/theme/jokoa.scss`.
