const { useState, useEffect, useRef } = React;

/* ======================= SUPABASE CONFIG ======================= */
const supabase = window.supabase.createClient(
  "https://chpvbydpaztzbxdacqwe.supabase.co/",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNocHZieWRwYXp0emJ4ZGFjcXdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk2OTIyMjcsImV4cCI6MjA4NTI2ODIyN30.4gWLzTt8rk6LI13xSLI7rNmE21HgV9GAq8Lg_lk3SWo"
);

function App() {

  /* ======================= AUTH STATES ======================= */
  const [session, setSession] = useState(null);
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  /* ======================= APP STATES ======================= */
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

  /* ======================= AUTH EFFECT ======================= */
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  /* ======================= LOGIN ======================= */
  const handleLogin = async () => {

    if (!loginUsername || !loginPassword) {
      alert("Completa usuario y contraseña");
      return;
    }

    const { data: userData, error: userError } = await supabase
      .from("perfiles")
      .select("email")
      .eq("username", loginUsername)
      .single();

    if (userError || !userData) {
      alert("Usuario no encontrado");
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: userData.email,
      password: loginPassword,
    });

    if (error) {
      alert("Contraseña incorrecta");
    }
  };

  const cerrarSesion = async () => {
    await supabase.auth.signOut();
  };

  /* ======================= DATA LOAD ======================= */
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
    if (session) {
      cargarMovimientos();
      cargarGastos();
    }
  }, [session]);

  useEffect(() => {
    const dark = localStorage.getItem("darkMode") === "true";
    if (dark) document.body.classList.add("dark");
    setIsDark(dark);
  }, []);

  const ahorroTotal = records.reduce((s, r) => s + Number(r.valor), 0);

  /* ======================= CRUD ======================= */
  const handleSubmit = async () => {
    if (!inputName || !inputDate) {
      alert("Completa todos los campos");
      return;
    }

    if (editId) {
      await supabase.from("movimientos")
        .update({ nombre: inputName, valor: Number(inputValue), fecha: inputDate })
        .eq("id", editId);
      setEditId(null);
    } else {
      await supabase.from("movimientos")
        .insert([{ nombre: inputName, valor: Number(inputValue), fecha: inputDate }]);
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
    formRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const addGasto = async () => {
    if (!newGastoName || !newGastoMonto) {
      alert("Completa nombre y monto");
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

  /* ======================= LOGIN SCREEN ======================= */
  if (!session) {
    return (
      <div className="container">
        <h2>Iniciar Sesión</h2>
        <input
          placeholder="Usuario"
          value={loginUsername}
          onChange={e => setLoginUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={loginPassword}
          onChange={e => setLoginPassword(e.target.value)}
        />
        <button onClick={handleLogin}>Ingresar</button>
      </div>
    );
  }

  /* ======================= MAIN APP ======================= */
  return (
    <div className="container">

      <button onClick={cerrarSesion}>Cerrar sesión</button>

      <h2>Control de Ingresos y Gastos</h2>

      <button onClick={toggleDarkMode} className="dark-toggle">
        {isDark ? "☀️" : "🌙"}
      </button>

      {/* AQUÍ SIGUE TODO TU SISTEMA IGUAL */}
      
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);