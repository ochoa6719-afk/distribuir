/* =====================================================================
   RECORDATORIOS SERVICE
   ---------------------------------------------------------------------
   Capa de LÓGICA DE NEGOCIO + PERSISTENCIA (Supabase) para Recordatorios.

   Reglas de esta capa:
   - No sabe nada de React, del DOM ni de notificaciones.
   - No sabe si corre en un navegador o dentro de Capacitor/Android.
   - Es la ÚNICA parte de la app que habla con la tabla `recordatorios`.

   Tanto app.jsx (web) como una futura pantalla nativa/Capacitor pueden
   reutilizar este mismo archivo tal cual, siempre que reciban un
   cliente de Supabase ya inicializado.
   ===================================================================== */
window.RecordatoriosService = (function () {

  /**
   * Arma un objeto Date real a partir de los campos fecha/hora que guarda
   * la tabla (fecha: 'YYYY-MM-DD', hora: 'HH:MM').
   */
  function obtenerFechaHora(recordatorio) {
    return new Date(`${recordatorio.fecha}T${recordatorio.hora}:00`);
  }

  /**
   * Valida los campos mínimos de un recordatorio antes de guardarlo.
   * Devuelve { valido, mensaje }.
   */
  function validar(recordatorio) {
    if (!recordatorio.nombre || !recordatorio.fecha || !recordatorio.hora) {
      return { valido: false, mensaje: "Completa nombre, fecha y hora" };
    }
    if (
      recordatorio.repeticion &&
      recordatorio.repeticion !== "No repetir" &&
      Number(recordatorio.cantidad_repeticiones) <= 0
    ) {
      return { valido: false, mensaje: "La cantidad de repeticiones debe ser mayor que cero" };
    }
    return { valido: true, mensaje: "" };
  }

  async function listar(supabase, { userId, perfil }) {
    const { data, error } = await supabase
      .from("recordatorios")
      .select("*")
      .eq("user_id", userId)
      .eq("perfil", perfil)
      .order("fecha", { ascending: true })
      .order("hora", { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async function crear(supabase, payload) {
    const { data, error } = await supabase
      .from("recordatorios")
      .insert([payload])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async function actualizar(supabase, id, payload) {
    const { data, error } = await supabase
      .from("recordatorios")
      .update(payload)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async function eliminar(supabase, id) {
    const { error } = await supabase.from("recordatorios").delete().eq("id", id);
    if (error) throw error;
  }

  async function marcarCompletado(supabase, id) {
    const { error } = await supabase
      .from("recordatorios")
      .update({ completado: true })
      .eq("id", id);
    if (error) throw error;
  }

  return {
    obtenerFechaHora,
    validar,
    listar,
    crear,
    actualizar,
    eliminar,
    marcarCompletado
  };
})();
