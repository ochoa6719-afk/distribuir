const { useState, useEffect } = React;

/* =======================
   SUPABASE CONFIG
======================= */
const supabase = window.supabase.createClient(
  "https://chpvbydpaztzbxdacqwe.supabase.co/",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNocHZieWRwYXp0emJ4ZGFjcXdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk2OTIyMjcsImV4cCI6MjA4NTI2ODIyN30.4gWLzTt8rk6LI13xSLI7rNmE21HgV9GAq8Lg_lk3SWo"
);

function App() {
  const [inputValue, setInputValue] = useState(0);
  const [inputName, setInputName] = useState("");
  const [inputDate, setInputDate] = useState("");

  const [records, setRecords] = useState([]);
  const [editId, setEditId] = useState(null); // 👈 NUEVO

  // ===== GASTOS =====
  const [gastos, setGastos] = useState([]);
  const [newGastoName, setNewGastoName] = useState("");
  const [newGastoMonto, setNewGastoMonto] = useState(0);

  /* =======================
     CARGAR DATOS
  ======================= */
  const cargarMovimientos = async () => {
    const { data } = await supabase
      .from("movimientos")
      .select("*")
      .order("fecha");

    setRecords(data || []);
  };

  const cargarGastos = async () => {
    const { data } = await supabase
      .from("gastos")
      .select("*")
      .order("fecha");

    setGastos(data || []);
  };

  useEffect(() => {
    cargarMovimientos();
    cargarGastos();
  }, []);

  /* =======================
     AHORRO TOTAL
  ======================= */
  const ahorroTotal =
    records.reduce((s, r) => s + Number(r.valor), 0) -
    gastos.reduce((s, g) => s + Number(g.monto), 0);

  /* =======================
     MOVIMIENTOS
  ======================= */
  const handleSubmit = async () => {
    if (!inputName || !inputDate) {
      alert("Completa todos los campos");
      return;
    }

    if (editId) {
      // ===== ACTUALIZAR =====
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
      // ===== INSERTAR =====
      await supabase.from("movimientos").insert([{
        nombre: inputName,
        valor: Number(inputValue),
        fecha: inputDate
      }]);
    }

    setInputName("");
    setInputValue(0);
    setInputDate("");

    cargarMovimientos();
  };

  const eliminarMovimiento = async (id) => {
    await supabase.from("movimientos").delete().eq("id", id);
    cargarMovimientos();
  };

  const editarMovimiento = (mov) => {
    setEditId(mov.id);
    setInputName(mov.nombre);
    setInputValue(mov.valor);
    setInputDate(mov.fecha);
  };

  /* =======================
     GASTOS
  ======================= */
  const addGasto = async () => {
    if (!newGastoName || !newGastoMonto) {
      alert("Completa nombre y monto del gasto");
      return;
    }

    await supabase.from("gastos").insert([{
      nombre: newGastoName,
      monto: Number(newGastoMonto),
      fecha: new Date()
    }]);

    setNewGastoName("");
    setNewGastoMonto(0);

    cargarGastos();
  };

  const removeGasto = async (id) => {
    await supabase.from("gastos").delete().eq("id", id);
    cargarGastos();
  };

  return (
    <div className="container">

      <h2>Control de Ingresos y Gastos</h2>

      {/* ===== NUEVO MOVIMIENTO ===== */}
      <div className="card">
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

      {/* ===== AHORRO ===== */}
      <div className="ahorro">
        <strong>Ahorro disponible</strong>
        <span>${ahorroTotal.toFixed(2)}</span>
      </div>

      {/* ===== GASTOS ===== */}
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
                  <button
                    className="btn-danger"
                    onClick={() => removeGasto(g.id)}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ===== REGISTROS ===== */}
      <div className="card">
        <h3>Registros</h3>

        <table>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Detalle</th>
              <th>Valor</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {records.map(r => (
              <tr key={r.id}>
                <td>{r.fecha}</td>
                <td>{r.nombre}</td>
                <td>${r.valor}</td>
                <td>
                  <button
                    className="btn-warning"
                    onClick={() => editarMovimiento(r)}
                  >
                    Editar
                  </button>
                  <button
                    className="btn-danger"
                    onClick={() => eliminarMovimiento(r.id)}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
