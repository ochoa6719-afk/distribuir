# Notificaciones locales en Android (Capacitor)

La app ya trae `services/notificaciones.capacitor.js`, que habla directo con
`Capacitor.Plugins.LocalNotifications` (sin bundler, igual que el resto del
proyecto). Para que funcione dentro del proyecto Android:

## 1. Instalar el plugin (una sola vez, en la carpeta del proyecto Capacitor)
```
npm install @capacitor/local-notifications
npx cap sync android
```

## 2. Permisos (Capacitor los agrega solo con `cap sync`, pero conviene revisar)
En `android/app/src/main/AndroidManifest.xml` deberían quedar:
- `POST_NOTIFICATIONS` (obligatorio desde Android 13)
- `SCHEDULE_EXACT_ALARM` o `USE_EXACT_ALARM` si se necesita precisión al
  segundo tipo "alarma" (Android 12+). Sin esto, Android puede retrasar
  la notificación unos minutos en modo ahorro de batería agresivo — esto
  es una limitación del sistema operativo, no del código.

## 3. Cómo detecta la app que está en Android
`services/notificaciones.index.js` revisa `Capacitor.isNativePlatform()`.
Si es `true`, usa `notificaciones.capacitor.js`. Si es `false` (navegador),
usa `notificaciones.web.js`. La UI (`app.jsx`) nunca elige una u otra
directamente — siempre llama a `window.NotificacionesService`.

## 4. Qué NO tuviste que tocar
`services/recordatorios.service.js` (persistencia en Supabase) y toda la
lógica de `app.jsx` son 100% compartidas entre web y Android. Lo único que
cambia entre plataformas es la implementación de notificaciones.

## 5. Probar
En un dispositivo/emulador Android real (no en el navegador del WebView de
escritorio) crea un recordatorio a 1-2 minutos en el futuro, cierra la app
por completo y verifica que la notificación llegue igual.
