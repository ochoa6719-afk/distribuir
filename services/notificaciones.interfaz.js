/* =====================================================================
   CONTRATO DEL SERVICIO DE NOTIFICACIONES
   ---------------------------------------------------------------------
   Este archivo no ejecuta nada: documenta la interfaz que TODA
   implementación de notificaciones debe cumplir, para que app.jsx
   pueda usar cualquiera de ellas sin cambiar una sola línea de UI.

   Implementaciones disponibles:
     - notificaciones.web.js        → navegador (Notification API + SW)
     - notificaciones.capacitor.js  → Android empaquetado con Capacitor

   window.NotificacionesService (ver notificaciones.index.js) selecciona
   automáticamente la implementación correcta según la plataforma.

   Métodos requeridos:

   estaDisponible(): boolean
       Indica si esta plataforma soporta notificaciones locales.

   async inicializar(onAbrirRecordatorio: (id) => void): Promise<boolean>
       Prepara la plataforma (registra service worker / listeners nativos)
       y guarda el callback que se debe invocar cuando el usuario toca
       una notificación. Debe llamarse una sola vez al montar la app.

   async solicitarPermisos(): Promise<boolean>
       Pide permiso de notificaciones al usuario si aún no lo dio.

   async programar(recordatorio): Promise<void>
       Programa la notificación de un recordatorio nuevo. El objeto
       recordatorio debe incluir además el campo interno
       `_anticipacionMin` (minutos de anticipación, según la
       configuración del usuario) inyectado por la UI antes de llamar.

   async actualizar(recordatorio): Promise<void>
       Reemplaza la notificación programada de un recordatorio editado
       (equivale a cancelar + programar, usando el mismo id).

   async cancelar(id): Promise<void>
       Cancela la notificación programada de un recordatorio (al
       eliminarlo o al marcarlo como completado).
   ===================================================================== */
