const { useState, useEffect, useRef } = React;

/* ======================= SUPABASE CONFIG ======================= */
const supabase = window.supabase.createClient(
  "https://chpvbydpaztzbxdacqwe.supabase.co/",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNocHZieWRwYXp0emJ4ZGFjcXdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk2OTIyMjcsImV4cCI6MjA4NTI2ODIyN30.4gWLzTt8rk6LI13xSLI7rNmE21HgV9GAq8Lg_lk3SWo"
);

function App() {

  /* ======================= AUTH ======================= */
  const [session, setSession] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoadingAuth(false);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  if (loadingAuth) return <h2>Cargando...</h2>;
  if (!session) return <Login />;

  /* ======================= TU CÓDIGO ORIGINAL ======================= */

  const [inputValue, setInputValue] = useState(0);
  const [inputName, setInputName] = useState("");
  const [inputDate, setInputDate] = useState("");
  const [records, setRecords] = useState([]);
  const [editId, setEditId] = useState(null);
  const formRef = useRef(null);

  const [gastos, setGastos] = useState([]);
  const [newGastoName, setNewGastoName] = useState("");
  const [newGastoMonto, setNewGastoMonto] = useState(0);

  const [isDark, setIsDark] = useState(false);

  const cargarMovimientos = async () => {
    const { data } = await supabase
      .from("movimientos")
      .select("*")
      .order("fecha", { ascending: true });

    let saldo = 0;
    const conSaldo = (data || []).map(m => {
      saldo = Number((saldo + Number(m.valor)).toFixed(2));
      return { ...m, saldo };
    });

    setRecords(conSaldo);
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

  useEffect(() => {
    const dark = localStorage.getItem("darkMode") === "true";
    if (dark) {
      document.body.classList.add("dark");
    }
    setIsDark(dark);
  }, []);

  const ahorroTotal = records.reduce((s, r) => s + Number(r.valor), 0);

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

  const toggleDarkMode = () => {
    const newMode = !isDark;
    setIsDark(newMode);
    document.body.classList.toggle("dark", newMode);
    localStorage.setItem("darkMode", newMode);
  };

  return (
    <div className="container">
      <h2>Control de Ingresos y Gastos</h2>

      <div style={{ marginBottom: "15px" }}>
        <button onClick={() => supabase.auth.signOut()}>
          Cerrar sesión
        </button>

        <button
          style={{ marginLeft: "10px" }}
          onClick={async () => {
            const email = prompt("Correo nuevo usuario:");
            const password = prompt("Contraseña:");

            if (!email || !password) return;

            const { error } = await supabase.auth.signUp({
              email,
              password
            });

            if (error) alert(error.message);
            else alert("Usuario creado correctamente");
          }}
        >
          Crear usuario
        </button>
      </div>

      <button onClick={toggleDarkMode} className="dark-toggle">
        {isDark ? "☀️" : "🌙"}
      </button>

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
        <strong>Ahorro disponible</strong>
        <span>${ahorroTotal.toFixed(2)}</span>
      </div>
    </div>
  );
}

/* ======================= LOGIN ======================= */

function Login() {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPass, setShowPass] = React.useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      alert("Completa todos los campos");
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) alert(error.message);
  };

  return (
    <div className="container">
      <h2>Iniciar Sesión</h2>

      <input
        type="email"
        placeholder="Correo"
        value={email}
        onChange={e => setEmail(e.target.value)}
      />

      <div style={{ position: "relative" }}>
        <input
          type={showPass ? "text" : "password"}
          placeholder="Contraseña"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <button
          type="button"
          style={{
            position: "absolute",
            right: "5px",
            top: "5px",
            padding: "5px 10px"
          }}
          onClick={() => setShowPass(!showPass)}
        >
          👁
        </button>
      </div>

      <button onClick={handleLogin}>
        Entrar
      </button>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);