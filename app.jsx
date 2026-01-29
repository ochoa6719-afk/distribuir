function App() {
  const [showApp, setShowApp] = React.useState(false);

  // ===== NUEVO MOVIMIENTO =====
  const [inputValue, setInputValue] = React.useState(0);
  const [inputName, setInputName] = React.useState("");
  const [inputDate, setInputDate] = React.useState("");
  const [records, setRecords] = React.useState([]);

  // ===== GASTOS =====
  const [gastos, setGastos] = React.useState([]);
  const [newGastoName, setNewGastoName] = React.useState("");
  const [newGastoMonto, setNewGastoMonto] = React.useState(0);

  // ===== AHORRO =====
  const ahorroTotal = records.reduce((sum, r) => sum + Number(r.value), 0);

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
        monto: Number(newGastoMonto),
        fecha: new Date().toLocaleDateString()
      }
    ]);

    setNewGastoName("");
    setNewGastoMonto(0);
  };

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
        createdAt: new Date().toLocaleString(),
        balance: lastBalance + value
      }
    ]);

    setInputName("");
    setInputValue(0);
    setInputDate("");
  };

  // ===== PANTALLA INICIAL =====
  if (!showApp) {
    return (
      <div className="landing">
        <div className="landing-card">
          <h1>Distribuidor de Valores</h1>
          <button className="btn-primary big-btn" onClick={() => setShowApp(true)}>
            Entrar
          </button>
        </div>
      </div>
    );
  }

  // ===== APP PRINCIPAL =====
  return (
    <div className="container">
      <h2>Control de Ingresos y Gastos</h2>

      {/* NUEVO MOVIMIENTO */}
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

        <button className="btn-success" onClick={handleSubmit}>
          Guardar
        </button>
      </div>

      {/* AHORRO */}
      <div className="section ahorro">
        <strong>Ahorro disponible</strong>
        <span>${ahorroTotal.toFixed(2)}</span>
      </div>

      {/* GASTOS */}
      <div className="section">
        <h3>Gastos</h3>

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

        <button className="btn-primary" onClick={addGasto}>
          Agregar gasto
        </button>

        {gastos.length > 0 && (
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
                  <td>{g.fecha}</td>
                  <td>{g.name}</td>
                  <td>${g.monto.toFixed(2)}</td>
                  <td>
                    <span className="icon delete" onClick={() => removeGasto(g.id)}>
                      🗑️
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
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
              <th>Info</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {records.map((r, index) => (
              <RegistroFila
                key={r.id}
                registro={r}
                index={index}
                records={records}
                setRecords={setRecords}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ===== FILA EDITABLE =====
function RegistroFila({ registro, index, records, setRecords }) {
  const [editando, setEditando] = React.useState(false);
  const [temp, setTemp] = React.useState({ ...registro });

  const guardar = () => {
    if (!temp.name || Number(temp.value) === 0) {
      alert("El nombre no puede estar vacío y el valor no puede ser 0");
      return;
    }

    setRecords(prev => {
      const nuevos = [...prev];
      const saldoAnterior = index > 0 ? nuevos[index - 1].balance : 0;

      nuevos[index] = {
        ...temp,
        value: Number(temp.value),
        balance: saldoAnterior + Number(temp.value)
      };

      for (let i = index + 1; i < nuevos.length; i++) {
        nuevos[i] = {
          ...nuevos[i],
          balance: nuevos[i - 1].balance + Number(nuevos[i].value)
        };
      }

      return nuevos;
    });

    setEditando(false);
  };

  const eliminar = () => {
    if (!window.confirm("¿Eliminar este registro?")) return;

    setRecords(prevRecords => {
      const filtrados = prevRecords.filter(r => r.id !== registro.id);

      let saldo = 0;
      return filtrados.map(r => {
        saldo += Number(r.value);
        return { ...r, balance: saldo };
      });
    });
  };

  return (
    <tr>
      <td>
        {editando ? (
          <input
            type="date"
            value={temp.date}
            onChange={e => setTemp({ ...temp, date: e.target.value })}
          />
        ) : (
          registro.date
        )}
      </td>

      <td>
        {editando ? (
          <input
            value={temp.name}
            onChange={e => setTemp({ ...temp, name: e.target.value })}
          />
        ) : (
          registro.name
        )}
      </td>

      <td>
        {editando ? (
          <input
            type="number"
            value={temp.value}
            onChange={e => setTemp({ ...temp, value: e.target.value })}
          />
        ) : (
          `$${registro.value}`
        )}
      </td>

      <td>${registro.balance}</td>

      <td>
        <span title={`Registrado el: ${registro.createdAt}`}>
          ⏱️
        </span>
      </td>

      <td className="acciones">
        {editando ? (
          <>
            <span className="icon ok" onClick={guardar}>✔️</span>
            <span className="icon cancel" onClick={() => setEditando(false)}>❌</span>
          </>
        ) : (
          <>
            <span className="icon edit" onClick={() => setEditando(true)}>✏️</span>
            <span className="icon delete" onClick={eliminar}>🗑️</span>
          </>
        )}
      </td>
    </tr>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
