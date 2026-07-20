/* =====================================================================
   SERVICE WORKER — solo se usa en la versión WEB para poder mostrar
   notificaciones y reaccionar cuando el usuario las toca.
   ===================================================================== */

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (evento) => {
  evento.waitUntil(self.clients.claim());
});

self.addEventListener("notificationclick", (evento) => {
  evento.notification.close();
  const recordatorioId = evento.notification.data && evento.notification.data.recordatorioId;

  evento.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((listaClientes) => {
      for (const cliente of listaClientes) {
        cliente.postMessage({ tipo: "ABRIR_RECORDATORIO", id: recordatorioId });
        return cliente.focus();
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(`./?recordatorio=${recordatorioId}`);
      }
    })
  );
});
