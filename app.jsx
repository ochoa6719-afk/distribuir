// React desde CDN
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

  const [history, setHistory] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [filterFromDate, setFilterFromDate] = useState("");
  const [filterToDate, setFilterToDate] = useState("");
  const [records, setRecords] = useState([]);

  const ahorroReal = records.reduce((sum, r) => sum + r.value, 0);

  const totalDeudasSeleccionadas = partitions
    .filter((p) => p.type === "gasto" && selectedGastos[p.id])
    .reduce((sum, p) => sum + Number(p.monto), 0);

  const handleAddPartition = () => {
    setPartitions([
      ...partitions,
      { id: Date.now(), name: "Nueva Parte", monto: 0, type: "gasto" }
    ]);
  };

  const recomputeBalances = (list) => {
    let balance = 0;
    return list.map((r) => {
      balance += r.value;
      return { ...r, balance };
    });
  };

  const handleDeleteRecord = (id) => {
    const recordExists = records.some((r) => r.id === id);
    if (!recordExists) {
      alert("El registro ya no existe o fue filtrado.");
      return;
    }

    const confirmDelete = window.confirm("¿Seguro que deseas eliminar este registro?");
    if (!confirmDelete) return;

    const filtered = records.filter((r) => r.id !== id);

    const recalculated = recomputeBalances(filtered);

    setRecords(recalculated);
    setHistory(history.filter((h) => h.id !== id));
  };

  const handleExportExcel = () => {
    if (records.length === 0) {
      alert("No hay registros para exportar");
      return;
    }

    const headers = ["Fecha", "Nombre", "Valor", "Saldo"];
    const rows = records.map((r) => [r.date, r.name, r.value, r.balance]);

    let csvContent = headers.join(",") + "\n";
    rows.forEach((row) => {
      csvContent += row.join(",") + "\n";
    });

    const encodedUri =
      "data:text/csv;charset=utf-8," + encodeURIComponent(csvContent);

    const link = document.createElement("a");
    link.href = encodedUri;
    link.download = "registros_finanzas.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleValueSubmit = () => {
    const value = Number(inputValue);

    if (!inputName.trim()) {
      alert("Debes ingresar un nombre para este registro.");
      return;
    }

    if (!inputDate) {
      alert("Debes seleccionar una fecha.");
      return;
    }

    const previousBalance =
      records.length > 0 ? records[records.length - 1].balance : 0;
    const newBalance = previousBalance + value;

    const id = Date.now();

    const newRecord = {
      id,
      name: inputName,
      value,
      date: inputDate,
      balance: newBalance
    };

    let distribution = [];

    if (value > 0 && distributeIncome) {
      let restante = value - totalDeudasSeleccionadas;
      if (restante < 0) restante = 0;

      distribution = partitions.map((p) => {
        if (p.type === "gasto" && selectedGastos[p.id]) {
          return { ...p, amount: p.monto };
        }
        if (p.type === "ahorro") return { ...p, amount: restante };
        return { ...p, amount: 0 };
      });
    }

    const newHistoryItem = {
      id,
      name: inputName,
      value,
      date: inputDate,
      distribution,
      gastosAplicados: distributeIncome
    };

    setRecords([...records, newRecord]);
    setHistory([...history, newHistoryItem]);
    setInputName("");
    setInputValue(0);
    setInputDate("");
  };

  const filteredRecords = records.filter((r) => {
    const matchName = r.name.toLowerCase().includes(searchText.toLowerCase());
    const matchFrom = filterFromDate ? r.date >= filterFromDate : true;
    const matchTo = filterToDate ? r.date <= filterToDate : true;
    return matchName && matchFrom && matchTo;
  });

  return (
    <div style={{ padding: 20 }}>
      <h1>Distribuidor de Valores</h1>
      {/* Aquí todo tu JSX original */}
    </div>
  );
}

// Render React
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
