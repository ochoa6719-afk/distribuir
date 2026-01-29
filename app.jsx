const { useState } = React;

function App() {
  const [inputValue, setInputValue] = useState(0);
  const [inputName, setInputName] = useState("");
  const [inputDate, setInputDate] = useState("");

  const [records, setRecords] = useState([]);

  // ===== GASTOS =====
  const [gastos, setGastos] = useState([]);
  const [newGastoName, setNewGastoName] = useState("");
  const [newGastoMonto, setNewGastoMonto] = useState(0);

  // ===== AHORRO TOTAL =====
  const ahorroTotal = records.reduce((sum, r) => sum + r.value, 0);

  // ===== AGREGAR GASTO =====
  const addGasto = () => {
    if (!newGastoName || !newGastoMonto) {
      alert("Completa nombre y monto del gasto");
      return;
    }

    setGastos([
      ...gastos,
      {
        id: Date.now(),
        name: newGastoName,
        monto: Number(newGastoMonto)
      }
    ]);

    setNewGastoName("");
    setNewGastoMonto(0);
  };

  // ===== ELIMINAR GASTO =====
  const removeGasto = (id) => {
    setGastos(gastos.filter(g => g.id !== id));
  };

  // ===== REGISTRAR MOVIMIENTO =====
  const handleSubmit = () => {
    if (!inputName || !inputDate) {
      alert("Completa todos los campos");
      return;
    }

    const value = Number(inputValue);
    const lastBalance = records.length
      ? records[records.length - 1].balance
      : 0;

    setRecords([
      ...records,
      {
        id: Date.now(),
        name: inputName,
        value,
        date: inputDate,
        balance: lastBalance + value
      }
    ]);

    setInputName("");
    setInputValue(0);
    setInputDate("");
  };

  return (
    <div className="container">

      <h2>Control de Ingresos y Gastos</h2>

      {/* REGISTRO */}
      <div className="section">
        <h3>Nuevo movimiento</h3>

        <input
          placeholder="Descripción"
          value={inputName}
          onChange={e => setInputName(e.target.value)}
        />

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

        <button onClick={handleSubmit}>Guardar</button>
      </div>

      {/* GASTOS */}
      <div className="section">
        <h3>Gastos</h3>

        <div className="gasto-form">
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
          <button onClick={addGasto}>Agregar</button>
        </div>

        {gastos.length === 0 && (
          <p className="muted">No hay gastos registrados</p>
        )}

        {gastos.map(g => (
          <div key={g.id} className="gasto-item">
            <span>{g.name}</span>
            <div className="gasto-right">
              <strong>${g.monto}</strong>
              <button onClick={() => removeGasto(g.id)}>✕</button>
            </div>
          </div>
        ))}
      </div>

      {/* AHORRO */}
      <div className="section ahorro">
        <strong>Ahorro disponible:</strong>
        <span>${ahorroTotal.toFixed(2)}</span>
      </div>

      {/* REGISTROS */}
      <div className="section">
        <h3>Registros</h3>

        <table>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Detalle</th>
              <th>Valor</th>
              <th>Saldo</th>
            </tr>
          </thead>
          <tbody>
            {records.map(r => (
              <tr key={r.id}>
                <td>{r.date}</td>
                <td>{r.name}</td>
                <td>${r.value}</td>
                <td>${r.balance}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
