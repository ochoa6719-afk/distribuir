/********************************
  SUPABASE CONFIG (CORRECTA)
********************************/
const supabase = window.supabase.createClient(
  "https://chpvbydpaztzbxdacqwe.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNocHZieWRwYXp0emJ4ZGFjcXdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk2OTIyMjcsImV4cCI6MjA4NTI2ODIyN30.4gWLzTt8rk6LI13xSLI7rNmE21HgV9GAq8Lg_lk3SWo"
);

function App() {
  const [showApp, setShowApp] = React.useState(false);
  const [inputValue, setInputValue] = React.useState(0);
  const [inputName, setInputName] = React.useState("");
  const [inputDate, setInputDate] = React.useState("");
  const [records, setRecords] = React.useState([]);

  /********************************
    CARGAR MOVIMIENTOS
  ********************************/
  const cargarMovimientos = async () => {
    const { data, error } = await supabase
      .from("movimientos")
      .select("*")
      .order("id", { ascending: true });

    if (error) {
      console.error("Error cargando:", error);
      return;
    }

    let saldo = 0;
    const calculados = data.map(m => {
      saldo += Number(m.valor);
      return { ...m, balance: saldo };
    });

    setRecords(calculados);
  };

  React.useEffect(() => {
    cargarMovimientos();
  }, []);

  /********************************
    GUARDAR MOVIMIENTO
  ********************************/
  const handleSubmit = async () => {
    if (!inputName || !inputDate) {
      alert("Completa todos los campos");
      return;
    }

    const { error } = await supabase
      .from("movimientos")
      .insert([{
        nombre: inputName,
        valor: Number(inputValue),
        fecha: inputDate
      }]);

    if (error) {
      console.error(error);
      alert("Error al guardar");
      return;
    }

    setInputName("");
    setInputValue(0);
    setInputDate("");
    cargarMovimientos();
  };

  const ahorroTotal = records.reduce(
    (sum, r) => sum + Number(r.valor), 0
  );

  /********************************
    LANDING
  ********************************/
  if (!showApp) {
    return (
      <div className="landing">
        <div className="landing-card">
          <h1>Distribuidor de Valores</h1>
          <p>Controla tus ingresos y gastos fácilmente</p>
          <button
            className="btn-primary big-btn"
            onClick={() => setShowApp(true)}
          >
            Entrar
          </button>
        </div>
      </div>
    );
  }

  /********************************
    APP PRINCIPAL
  ********************************/
  return (
    <div className="container">
      <h2>Control de Ingresos y Gastos</h2>

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

      <div className="ahorro">
        <strong>Ahorro disponible</strong>
        <span>${ahorroTotal.toFixed(2)}</span>
      </div>

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
              <td>{r.fecha}</td>
              <td>{r.nombre}</td>
              <td>${r.valor}</td>
              <td>${r.balance}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
