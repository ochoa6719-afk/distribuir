/* =====================================================================
   SELECTOR DE PLATAFORMA
   ---------------------------------------------------------------------
   Punto único que usa app.jsx: window.NotificacionesService.
   Elige automáticamente la implementación real según dónde corre la app,
   sin que la UI tenga que saber nada de Capacitor ni del navegador.

   IMPORTANTE: este objeto NUNCA debe quedar en `undefined`. Si por algún
   motivo notificaciones.web.js o notificaciones.capacitor.js no llegaron
   a cargar (ruta incorrecta, 404, orden de <script> alterado), se usa un
   "stub" inofensivo en su lugar para que el resto de la aplicación
   (Movimientos, Gastos, Resumen, Perfiles, etc.) siga funcionando con
   normalidad — solo las notificaciones quedarían desactivadas.
   ===================================================================== */
window.NotificacionesService = (function () {
  const STUB_INOFENSIVO = {
    estaDisponible: () => false,
    inicializar: async () => false,
    solicitarPermisos: async () => false,
    programar: async () => {},
    actualizar: async () => {},
    cancelar: async () => {}
  };

  const esAndroidNativo =
    typeof window.Capacitor !== "undefined" &&
    typeof window.Capacitor.isNativePlatform === "function" &&
    window.Capacitor.isNativePlatform();

  const implementacion = esAndroidNativo
    ? window.NotificacionesCapacitor
    : window.NotificacionesWeb;

  if (!implementacion) {
    console.error(
      "⚠️ No se pudo cargar la implementación de notificaciones " +
      `(${esAndroidNativo ? "notificaciones.capacitor.js" : "notificaciones.web.js"}). ` +
      "Verifica que la carpeta 'services/' esté junto a index.html y que las rutas " +
      "en los <script> coincidan exactamente (mayúsculas/minúsculas incluidas). " +
      "Se usará un modo sin notificaciones para no romper el resto de la app."
    );
  }

  console.log(`NotificacionesService → usando implementación: ${esAndroidNativo ? "Capacitor (Android)" : "Web"}`);

  return implementacion || STUB_INOFENSIVO;
})();
