const { useState } = React;

function App() {
  const [inputValue, setInputValue] = useState(0);
  const [inputName, setInputName] = useState("");
  const [inputDate, setInputDate] = useState("");
  const [distributeIncome, setDistributeIncome] = useState(true);
  const [selectedGastos, setSelectedGastos] = useState({});

  const [partitions, setPartitions] = useState([
    { id: 1, name: "Ahorro", monto: 0, type: "ahorro" },
    { id: 2, name: "Deuda 1", monto: 99, type: "gasto" },
    { id: 3, name: "Deuda 2", monto: 75, type: "gasto" }
  ]);

  const [records, setRecords] = useState([]);

  const totalDeudasSeleccionadas = partitions
    .filter(p => p.type === "gasto" && selectedGastos[p.id])
    .reduce((sum, p) => sum + Number(p.monto), 0);

  const handleValueSubmit = () => {
    if (!inputName || !inputDate) {
      alert("Completa todos los campos");
      return;
    }

    const value = Number(inputValue);
    const lastBalance = records.length
      ? records[records.length - 1].balance
      : 0;

    const newRecord = {
      id: Date.now(),
      name: inputName,
      value,
      date: inputDate,
      balance: lastBalance + value
    };

    setRecords([...records, newRecord]);
    setInputName("");
    setInputValue(0);
    setInputDate("");
  };

  return (
    <div style={{ padding: "20px", maxWidth: 600, margin: "auto" }}>
      <h1>💰 Distribuidor de Valores</h1>

      <input
        placeholder="Nombre"
        value={inputName}
        onChange={e => setInputName(e.target.value)}
      />

      <input
        type="number"
        placeholder="Valor"
        value={inputValue}
        onChange={e => setInputValue(e.target.value)}
      />

      <input
        type="date"
        value={inputDate}
        onChange={e => setInputDate(e.target.value)}
      />

      <label>
        <input
          type="checkbox"
          checked={distributeIncome}
          onChange={() => setDistributeIncome(!distributeIncome)}
        />
        Distribuir ingreso
      </label>

      <h3>Gastos</h3>
      {partitions
        .filter(p => p.type === "gasto")
        .map(p => (
          <label key={p.id}>
            <input
              type="checkbox"
              checked={selectedGastos[p.id] || false}
              onChange={() =>
                setSelectedGastos({
                  ...selectedGastos,
                  [p.id]: !selectedGastos[p.id]
                })
              }
            />
            {p.name} (${p.monto})
          </label>
        ))}

      <button onClick={handleValueSubmit}>Guardar</button>

      <h3>📊 Registros</h3>
      <ul>
        {records.map(r => (
          <li key={r.id}>
            {r.date} | {r.name} | ${r.value} → Saldo: ${r.balance}
          </li>
        ))}
      </ul>
    </div>
  );
}

// Render
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
