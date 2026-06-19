const { useState, useEffect, useRef } = React;

/* ======================= SUPABASE CONFIG ======================= */
const supabase = window.supabase.createClient(
  "https://chpvbydpaztzbxdacqwe.supabase.co/",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNocHZieWRwYXp0emJ4ZGFjcXdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk2OTIyMjcsImV4cCI6MjA4NTI2ODIyN30.4gWLzTt8rk6LI13xSLI7rNmE21HgV9GAq8Lg_lk3SWo"
);

function App() {
  const [inputValue, setInputValue] = useState(0);
  const [inputName, setInputName] = useState("");
  const [inputDate, setInputDate] = useState("");
  const [records, setRecords] = useState([]);
  const [editId, setEditId] = useState(null);
  const formRef = useRef(null);
  const fileInputRef = useRef(null);

  const [gastos, setGastos] = useState([]);
  const [newGastoName, setNewGastoName] = useState("");
  const [newGastoMonto, setNewGastoMonto] = useState(0);

  // PERFILES
  const [perfiles, setPerfiles] = useState([]);
  const [perfilActivo, setPerfilActivo] = useState(
    localStorage.getItem("perfilActivo") || ""
  );
  const [nuevoPerfilNombre, setNuevoPerfilNombre] = useState("");

  //MODO OSCURO
  const [isDark, setIsDark] = useState(false);

const cargarPerfiles = async () => {
  const { data, error } = await supabase
    .from("perfiles_app")
    .select("*")
    .order("id", { ascending: true });

  if (error) {
    console.error("Error cargando perfiles:", error);
    return;
  }

  const lista = data || [];
  setPerfiles(lista);

  if (!perfilActivo && lista.length > 0) {
    setPerfilActivo(lista[0].nombre);
    localStorage.setItem("perfilActivo", lista[0].nombre);
  }
};

  const cargarMovimientos = async (perfil) => {
    if (!perfil) { setRecords([]); return; }
    const { data } = await supabase
      .from("movimientos")
      .select("*")
      .eq("perfil", perfil)
      .order("fecha", { ascending: true });

    let saldo = 0;
    const conSaldo = (data || []).map(m => {
      saldo = Number((saldo + Number(m.valor)).toFixed(2));
      return { ...m, saldo };
    });

    setRecords(conSaldo);
  };

  const cargarGastos = async (perfil) => {
    if (!perfil) { setGastos([]); return; }
    const { data } = await supabase
      .from("gastos")
      .select("*")
      .eq("perfil", perfil)
      .order("fecha");

    setGastos(data || []);
  };

  useEffect(() => {
    cargarPerfiles();
  }, []);

  useEffect(() => {
    if (perfilActivo) {
      cargarMovimientos(perfilActivo);
      cargarGastos(perfilActivo);
    }
  }, [perfilActivo]);

  //MODO OSCURO
  useEffect(() => {
    const dark = localStorage.getItem("darkMode") === "true";
    if (dark) {
      document.body.classList.add("dark");
    }
    setIsDark(dark);
  }, []);

  const ahorroTotal = records.reduce((s, r) => s + Number(r.valor), 0);

  const cambiarPerfil = (nombre) => {
    setPerfilActivo(nombre);
    localStorage.setItem("perfilActivo", nombre);
    setEditId(null);
  };

const crearPerfil = async () => {
  const nombre = nuevoPerfilNombre.trim();

  if (!nombre) {
    alert("Escribe un nombre para el nuevo perfil");
    return;
  }

  if (perfiles.some(p => p.nombre.toLowerCase() === nombre.toLowerCase())) {
    alert("Ya existe un perfil con ese nombre");
    return;
  }

  const { error } = await supabase
    .from("perfiles_app")
    .insert([{ nombre }]);

  if (error) {
    console.error("Error creando perfil:", error);
    alert(
      "No se pudo crear el perfil. Revisa la consola (F12) para ver el error exacto."
    );
    return;
  }

  setNuevoPerfilNombre("");
  await cargarPerfiles();
  cambiarPerfil(nombre);
};

  const eliminarPerfil = async (nombre) => {
    if (perfiles.length <= 1) {
      alert("Debe quedar al menos un perfil");
      return;
    }
    const ok = confirm(
      `¿Eliminar el perfil "${nombre}"? Esto borrará TODOS sus movimientos y gastos.`
    );
    if (!ok) return;

    await supabase.from("movimientos").delete().eq("perfil", nombre);
    await supabase.from("gastos").delete().eq("perfil", nombre);
    await supabase.from("perfiles_app").delete().eq("nombre", nombre);

    const restantes = perfiles.filter(p => p.nombre !== nombre);
    await cargarPerfiles();
    if (restantes.length > 0) cambiarPerfil(restantes[0].nombre);
  };

  const handleSubmit = async () => {
    if (!inputName || !inputDate) {
      alert("Completa todos los campos");
      return;
    }

    if (editId) {
      await supabase
        .from("movimientos")
        .update({
          nombre: inputName,
          valor: Number(inputValue),
          fecha: inputDate
        })
        .eq("id", editId);

      setEditId(null);
    } else {
      await supabase.from("movimientos").insert([{
        nombre: inputName,
        valor: Number(inputValue),
        fecha: inputDate,
        perfil: perfilActivo
      }]);
    }

    setInputName("");
    setInputValue(0);
    setInputDate("");
    cargarMovimientos(perfilActivo);
  };

  const eliminarMovimiento = async (id) => {
    await supabase.from("movimientos").delete().eq("id", id);
    cargarMovimientos(perfilActivo);
  };

  const editarMovimiento = (mov) => {
    setEditId(mov.id);
    setInputName(mov.nombre);
    setInputValue(mov.valor);
    setInputDate(mov.fecha);

    formRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  };

  const addGasto = async () => {
    if (!newGastoName || !newGastoMonto) {
      alert("Completa nombre y monto del gasto");
      return;
    }

    await supabase.from("gastos").insert([{
      nombre: newGastoName,
      monto: Number(newGastoMonto),
      fecha: new Date(),
      perfil: perfilActivo
    }]);

    setNewGastoName("");
    setNewGastoMonto(0);
    cargarGastos(perfilActivo);
  };

  const removeGasto = async (id) => {
    await supabase.from("gastos").delete().eq("id", id);
    cargarGastos(perfilActivo);
  };

  //MODO OSCURO
  const toggleDarkMode = () => {
    const newMode = !isDark;
    setIsDark(newMode);
    document.body.classList.toggle("dark", newMode);
    localStorage.setItem("darkMode", newMode);
  };

  /* ======================= RESPALDOS ======================= */
  const descargarRespaldo = async () => {
    const { data: todosMovimientos } = await supabase.from("movimientos").select("*");
    const { data: todosGastos } = await supabase.from("gastos").select("*");
    const { data: todosPerfiles } = await supabase.from("perfiles_app").select("*");

    const respaldo = {
      fecha_respaldo: new Date().toISOString(),
      perfiles: todosPerfiles || [],
      movimientos: todosMovimientos || [],
      gastos: todosGastos || []
    };

    const blob = new Blob([JSON.stringify(respaldo, null, 2)], {
      type: "application/json"
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const fechaArchivo = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `respaldo-distribuidor-${fechaArchivo}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const restaurarTodoVacio = async () => {
    const ok = confirm(
      "⚠️ Esto va a BORRAR todos los movimientos y gastos de TODOS los perfiles. Esta acción no se puede deshacer.\n\n¿Estás seguro?"
    );
    if (!ok) return;

    const ok2 = confirm("Última confirmación: ¿de verdad quieres dejar todo sin información?");
    if (!ok2) return;

    await supabase.from("movimientos").delete().neq("id", 0);
    await supabase.from("gastos").delete().neq("id", 0);

    cargarMovimientos(perfilActivo);
    cargarGastos(perfilActivo);
    alert("Listo, toda la información fue borrada.");
  };

  const subirRespaldo = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const contenido = JSON.parse(event.target.result);

        const ok = confirm(
          "Esto va a REEMPLAZAR toda la información actual con la del respaldo. ¿Continuar?"
        );
        if (!ok) {
          e.target.value = "";
          return;
        }

        await supabase.from("movimientos").delete().neq("id", 0);
        await supabase.from("gastos").delete().neq("id", 0);
        await supabase.from("perfiles_app").delete().neq("id", 0);

        const perfilesLimpios = (contenido.perfiles || []).map(p => ({ nombre: p.nombre }));
        const movimientosLimpios = (contenido.movimientos || []).map(({ id, ...resto }) => resto);
        const gastosLimpios = (contenido.gastos || []).map(({ id, ...resto }) => resto);

        if (perfilesLimpios.length > 0) {
          await supabase.from("perfiles_app").insert(perfilesLimpios);
        }
        if (movimientosLimpios.length > 0) {
          await supabase.from("movimientos").insert(movimientosLimpios);
        }
        if (gastosLimpios.length > 0) {
          await supabase.from("gastos").insert(gastosLimpios);
        }

        await cargarPerfiles();
        cargarMovimientos(perfilActivo);
        cargarGastos(perfilActivo);
        alert("Respaldo restaurado correctamente.");
      } catch (err) {
        alert("El archivo no es un respaldo válido.");
      }
      e.target.value = "";
    };
    reader.readAsText(file);
  };

  return (
    <div className="container">
      <h2>Control de Ingresos y Gastos</h2>

      <button onClick={toggleDarkMode} className="dark-toggle">
        {isDark ? "☀️" : "🌙"}
      </button>

      <div className="card perfiles-card">
        <h3>Perfil</h3>

        {perfiles.length === 0 && <p>Crea tu primer perfil para empezar 👆</p>}

        <div className="perfiles-tabs">
          {perfiles.map(p => (
            <button
              key={p.id}
              className={`perfil-tab ${p.nombre === perfilActivo ? "activo" : ""}`}
              onClick={() => cambiarPerfil(p.nombre)}
            >
              {p.nombre}
            </button>
          ))}
        </div>

        <div className="row">
          <input
            placeholder="Nombre del nuevo perfil (ej. Persona 2)"
            value={nuevoPerfilNombre}
            onChange={e => setNuevoPerfilNombre(e.target.value)}
          />
          <button className="btn-primary" onClick={crearPerfil}>
            + Crear perfil
          </button>
        </div>

        {perfilActivo && (
          <button
            className="btn-danger btn-eliminar-perfil"
            onClick={() => eliminarPerfil(perfilActivo)}
          >
            🗑️ Eliminar perfil "{perfilActivo}"
          </button>
        )}
      </div>

      <div className="card respaldo-card">
        <h3>Respaldo de información</h3>
        <div className="respaldo-botones">
          <button className="btn-success" onClick={descargarRespaldo}>
            ⬇️ Bajar respaldo
          </button>

          <button className="btn-primary" onClick={() => fileInputRef.current.click()}>
            ⬆️ Subir respaldo
          </button>
          <input
            type="file"
            accept=".json"
            ref={fileInputRef}
            onChange={subirRespaldo}
            style={{ display: "none" }}
          />

          <button className="btn-danger" onClick={restaurarTodoVacio}>
            ♻️ Restaurar todo (dejar vacío)
          </button>
        </div>
      </div>

      <div className="card" ref={formRef}>
        <h3>{editId ? "Editar movimiento" : "Nuevo movimiento"}</h3>

        <div className="row">
          <input
            placeholder="Descripción"
            value={inputName}
            onChange={e => setInputName(e.target.value)}
          />
        </div>

        <div className="row">
          <input
            type="number"
            placeholder="Valor (+ ingreso / - gasto)"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
          />

          <input
            type="date"
            value={inputDate}
            onChange={e => setInputDate(e.target.value)}
          />
        </div>

        <button className="btn-primary" onClick={handleSubmit}>
          {editId ? "Actualizar" : "Guardar"}
        </button>
      </div>

      <div className="ahorro">
        <strong>Ahorro disponible {perfilActivo ? `(${perfilActivo})` : ""}</strong>
        <span>${ahorroTotal.toFixed(2)}</span>
      </div>

      <div className="card">
        <h3>Gastos / Deudas</h3>

        <div className="row">
          <input
            placeholder="Nombre del gasto"
            value={newGastoName}
            onChange={e => setNewGastoName(e.target.value)}
          />

          <input
            type="number"
            placeholder="Monto"
            value={newGastoMonto}
            onChange={e => setNewGastoMonto(e.target.value)}
          />
        </div>

        <button className="btn-success" onClick={addGasto}>
          Agregar gasto
        </button>

        <table>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Gasto</th>
              <th>Monto</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {gastos.map(g => (
              <tr key={g.id}>
                <td>{g.fecha?.slice(0,10)}</td>
                <td>{g.nombre}</td>
                <td>${g.monto}</td>
                <td>
                  <button className="btn-danger" onClick={() => removeGasto(g.id)}>
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card">
        <h3>Registros</h3>

        <div className="tabla-scroll">
          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Detalle</th>
                <th>Valor</th>
                <th>Saldo</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {records.map(r => (
                <tr key={r.id}>
                  <td>{r.fecha}</td>
                  <td>{r.nombre}</td>
                  <td>${r.valor}</td>
                  <td>${r.saldo}</td>
                  <td>
                    <button className="btn-warning" onClick={() => editarMovimiento(r)}>
                      ✏️
                    </button>
                    <button className="btn-danger" onClick={() => eliminarMovimiento(r.id)}>
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);