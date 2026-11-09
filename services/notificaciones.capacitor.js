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

  function diasDelMes(anio, mes) {
    return new Date(anio, mes + 1, 0).getDate();
  }

  // Suma n unidades a una fecha sin desbordar meses (31 ene + 1 mes = 28/29 feb)
  function avanzar(fecha, unidad, n) {
    const d = new Date(fecha.getTime());
    if (unidad === "day") {
      d.setDate(d.getDate() + n);
    } else if (unidad === "week") {
      d.setDate(d.getDate() + 7 * n);
    } else {
      const dia = d.getDate();
      d.setDate(1);
      if (unidad === "month") d.setMonth(d.getMonth() + n);
      else d.setFullYear(d.getFullYear() + n);
      d.setDate(Math.min(dia, diasDelMes(d.getFullYear(), d.getMonth())));
    }
    return d;
  }

  /**
   * Devuelve la próxima ocasión FUTURA en que debe sonar, o null si ya no
   * queda ninguna. IMPORTANTE: Android dispara de inmediato cualquier
   * notificación programada con una fecha pasada, así que nunca se debe
   * enviar al plugin una fecha que ya venció.
   */
  function proximaOcurrencia(inicio, unidad, total, ahora) {
    const margen = ahora.getTime() + 1000;
    if (inicio.getTime() > margen) return { at: inicio, restantes: total };
    if (!unidad) return null;

    let n = 0;
    let fecha = inicio;
    while (fecha.getTime() <= margen) {
      n++;
      if (total && n >= total) return null;   // ya se cumplieron todas
      if (n > 5000) return null;              // salvaguarda
      fecha = avanzar(inicio, unidad, n);
    }
    return { at: fecha, restantes: total ? total - n : undefined };
  }

  function construirNotificacion(recordatorio) {
    const fechaHora = window.RecordatoriosService.obtenerFechaHora(recordatorio);
    if (isNaN(fechaHora.getTime())) return null;
    const anticipacion = Number(recordatorio._anticipacionMin || 0);
    fechaHora.setMinutes(fechaHora.getMinutes() - anticipacion);

    const repiteCada = mapearRepeticion(recordatorio.repeticion);
    const total = recordatorio.cantidad_repeticiones ? Number(recordatorio.cantidad_repeticiones) : undefined;
    const proxima = proximaOcurrencia(fechaHora, repiteCada, total, new Date());
    if (!proxima) return null;   // ya venció: no se programa (evita disparos inmediatos)

    const schedule = repiteCada
      ? { at: proxima.at, every: repiteCada, count: proxima.restantes, allowWhileIdle: true }
      : { at: proxima.at, allowWhileIdle: true };

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
    if (!LocalNotifications) return;
    // Siempre se limpia primero: así, reprogramar nunca duplica ni deja
    // restos de una programación anterior.
    await cancelar(recordatorio.id);
    if (recordatorio.completado) return;
    const notificacion = construirNotificacion(recordatorio);
    if (!notificacion) return;
    await LocalNotifications.schedule({ notifications: [notificacion] });
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

  return { estaDisponible, inicializar, solicitarPermisos, programar, actualizar, cancelar, _proximaOcurrencia: proximaOcurrencia };
})();
