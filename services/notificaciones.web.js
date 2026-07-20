/* =====================================================================
   NOTIFICACIONES — IMPLEMENTACIÓN WEB
   ---------------------------------------------------------------------
   Usa la Notification API del navegador + un Service Worker para poder
   mostrar la notificación y reaccionar al toque.

   LIMITACIÓN HONESTA: a diferencia de Android nativo, un navegador NO
   puede despertarse a sí mismo si está completamente cerrado. Esta
   implementación programa un temporizador (setTimeout) que dispara
   mientras la pestaña/PWA siga viva (abierta o en segundo plano). Es
   el máximo que permiten las APIs web estándar sin backend propio.
   Para alarmas garantizadas con la app cerrada, ver
   notificaciones.capacitor.js (Android).
   ===================================================================== */
window.NotificacionesWeb = (function () {
  let registroSW = null;
  let onAbrirRecordatorio = null;
  const temporizadores = new Map(); // id recordatorio -> timeoutId

  function estaDisponible() {
    return typeof Notification !== "undefined";
  }

  async function inicializar(callback) {
    onAbrirRecordatorio = callback;

    if ("serviceWorker" in navigator) {
      try {
        registroSW = await navigator.serviceWorker.register("./sw.js");
      } catch (err) {
        console.error("No se pudo registrar el service worker:", err);
      }

      navigator.serviceWorker.addEventListener("message", (evento) => {
        if (evento.data && evento.data.tipo === "ABRIR_RECORDATORIO" && onAbrirRecordatorio) {
          onAbrirRecordatorio(evento.data.id);
        }
      });
    }

    // Fallback: si el navegador abrió una ventana nueva desde la notificación
    const params = new URLSearchParams(window.location.search);
    const idDesdeUrl = params.get("recordatorio");
    if (idDesdeUrl && onAbrirRecordatorio) {
      onAbrirRecordatorio(Number(idDesdeUrl));
    }

    return estaDisponible();
  }

  async function solicitarPermisos() {
    if (!estaDisponible()) return false;
    if (Notification.permission === "granted") return true;
    if (Notification.permission === "denied") return false;
    const respuesta = await Notification.requestPermission();
    return respuesta === "granted";
  }

  function calcularMsHastaDisparo(recordatorio) {
    const fechaHora = window.RecordatoriosService.obtenerFechaHora(recordatorio);
    const anticipacion = Number(recordatorio._anticipacionMin || 0);
    fechaHora.setMinutes(fechaHora.getMinutes() - anticipacion);
    return fechaHora.getTime() - Date.now();
  }

  function mostrarNotificacion(recordatorio) {
    if (!estaDisponible() || Notification.permission !== "granted") return;

    const opciones = {
      body: recordatorio.descripcion || "Tienes un recordatorio pendiente",
      tag: `recordatorio-${recordatorio.id}`,
      data: { recordatorioId: recordatorio.id },
      requireInteraction: true,
      icon: "./assets/icon-192.png",
      badge: "./assets/icon-96.png"
    };

    if (registroSW) {
      registroSW.showNotification(recordatorio.nombre, opciones);
    } else {
      const notif = new Notification(recordatorio.nombre, opciones);
      notif.onclick = () => onAbrirRecordatorio && onAbrirRecordatorio(recordatorio.id);
    }
  }

  function programarTemporizador(recordatorio) {
    cancelar(recordatorio.id);

    const ms = calcularMsHastaDisparo(recordatorio);
    if (ms <= 0 || recordatorio.completado) return; // ya pasó o ya está completado

    const idTimeout = setTimeout(() => {
      mostrarNotificacion(recordatorio);
      temporizadores.delete(recordatorio.id);
    }, ms);

    temporizadores.set(recordatorio.id, idTimeout);
  }

  async function programar(recordatorio) {
    programarTemporizador(recordatorio);
  }

  async function actualizar(recordatorio) {
    programarTemporizador(recordatorio);
  }

  async function cancelar(id) {
    if (temporizadores.has(id)) {
      clearTimeout(temporizadores.get(id));
      temporizadores.delete(id);
    }
  }

  return { estaDisponible, inicializar, solicitarPermisos, programar, actualizar, cancelar };
})();
