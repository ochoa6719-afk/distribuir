/* =====================================================================
   NOTIFICACIONES — IMPLEMENTACIÓN ANDROID (CAPACITOR)
   ---------------------------------------------------------------------
   Usa el plugin oficial @capacitor/local-notifications a través del
   puente global `Capacitor.Plugins`, sin necesidad de bundler/import,
   igual que el resto del proyecto (todo por <script>).

   Requisitos en el proyecto Android (una sola vez):
     npm install @capacitor/local-notifications
     npx cap sync android

   Y en AndroidManifest.xml (Capacitor lo agrega solo con cap sync,
   pero conviene confirmarlo):
     - permiso POST_NOTIFICATIONS (Android 13+)
     - permiso SCHEDULE_EXACT_ALARM / USE_EXACT_ALARM si se requiere
       precisión al segundo (Android 12+)

   Comportamiento tipo "Google Calendar": las notificaciones se
   programan en el sistema operativo (AlarmManager por debajo del
   plugin), por lo que SÍ se disparan con la app cerrada, siempre que
   Android no las restrinja por ahorro de batería agresivo del
   fabricante (esto último es una limitación del OS, no del código).
   ===================================================================== */
window.NotificacionesCapacitor = (function () {
  let onAbrirRecordatorio = null;
  const ID_CANAL = "recordatorios";

  function plugin() {
    return window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.LocalNotifications;
  }

  function estaDisponible() {
    return !!plugin();
  }

  async function inicializar(callback) {
    onAbrirRecordatorio = callback;
    const LocalNotifications = plugin();
    if (!LocalNotifications) return false;

    // Al tocar la notificación (app cerrada, en segundo plano o abierta)
    LocalNotifications.addListener("localNotificationActionPerformed", (accion) => {
      const id = accion && accion.notification && accion.notification.extra
        ? accion.notification.extra.recordatorioId
        : null;
      if (id != null && onAbrirRecordatorio) onAbrirRecordatorio(id);
    });

    // Canal de notificación requerido desde Android 8 (Oreo)
    try {
      await LocalNotifications.createChannel({
        id: ID_CANAL,
        name: "Recordatorios",
        description: "Alertas de recordatorios programados",
        importance: 5,   // máxima: heads-up + sonido
        visibility: 1,
        vibration: true
      });
    } catch (err) {
      // En versiones de Android sin soporte de canales esto no aplica
      console.warn("createChannel no disponible en este dispositivo:", err);
    }

    return true;
  }

  async function solicitarPermisos() {
    const LocalNotifications = plugin();
    if (!LocalNotifications) return false;

    const estado = await LocalNotifications.checkPermissions();
    if (estado.display === "granted") return true;

    const solicitado = await LocalNotifications.requestPermissions();
    return solicitado.display === "granted";
  }

  function mapearRepeticion(repeticion) {
    switch (repeticion) {
      case "Diario": return "day";
      case "Semanal": return "week";
      case "Mensual": return "month";
      case "Anual": return "year";
      default: return null;
    }
  }

  function construirNotificacion(recordatorio) {
    const fechaHora = window.RecordatoriosService.obtenerFechaHora(recordatorio);
    const anticipacion = Number(recordatorio._anticipacionMin || 0);
    fechaHora.setMinutes(fechaHora.getMinutes() - anticipacion);

    const repiteCada = mapearRepeticion(recordatorio.repeticion);

    const schedule = repiteCada
      ? {
          at: fechaHora,
          every: repiteCada,
          count: recordatorio.cantidad_repeticiones ? Number(recordatorio.cantidad_repeticiones) : undefined,
          allowWhileIdle: true
        }
      : { at: fechaHora, allowWhileIdle: true };

    return {
      // Capacitor requiere id numérico entero (32 bits) por notificación
      id: Number(recordatorio.id),
      title: recordatorio.nombre,
      body: recordatorio.descripcion || "Tienes un recordatorio pendiente",
      channelId: ID_CANAL,
      schedule,
      extra: { recordatorioId: recordatorio.id }
    };
  }

  async function programar(recordatorio) {
    const LocalNotifications = plugin();
    if (!LocalNotifications || recordatorio.completado) return;
    await LocalNotifications.schedule({ notifications: [construirNotificacion(recordatorio)] });
  }

  async function actualizar(recordatorio) {
    await cancelar(recordatorio.id);
    await programar(recordatorio);
  }

  async function cancelar(id) {
    const LocalNotifications = plugin();
    if (!LocalNotifications) return;
    await LocalNotifications.cancel({ notifications: [{ id: Number(id) }] });
  }

  return { estaDisponible, inicializar, solicitarPermisos, programar, actualizar, cancelar };
})();
