const { useState, useEffect, useRef } = React;

const supabase = window.supabase.createClient(
  "https://chpvbydpaztzbxdacqwe.supabase.co/",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNocHZieWRwYXp0emJ4ZGFjcXdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk2OTIyMjcsImV4cCI6MjA4NTI2ODIyN30.4gWLzTt8rk6LI13xSLI7rNmE21HgV9GAq8Lg_lk3SWo"
);

function App() {

  /* ================= AUTH ================= */
  const [session, setSession] = useState(null);
  const [nombres, setNombres] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  /* ================= SISTEMA ================= */
  const [inputValue, setInputValue] = useState(0);
  const [inputName, setInputName] = useState("");
  const [inputDate, setInputDate] = useState("");
  const [records, setRecords] = useState([]);
  const [editId, setEditId] = useState(null);
  const [gastos, setGastos] = useState([]);
  const [newGastoName, setNewGastoName] = useState("");
  const [newGastoMonto, setNewGastoMonto] = useState(0);
  const formRef = useRef(null);

  /* ================= SESSION ================= */
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => setSession(session)
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  /* ================= LOGIN ================= */
  const signIn = async () => {
    const { data } = await supabase
      .from("perfiles")
      .select("email")
      .eq("username", username)
      .single();

    if (!data) {
      alert("Usuario no encontrado");
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password,
    });

    if (error) alert(error.message);
  };

  /* ================= REGISTRO ================= */
  const signUp = async () => {

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      alert(error.message);
      return;
    }

    if (data.user) {
      await supabase.from("perfiles").insert([{
        id: data.user.id,
        nombres,
        username,
        email
      }]);
    }

    alert("Usuario creado correctamente");
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  /* ================= CARGAR DATOS ================= */
  const cargarMovimientos = async () => {
    const { data } = await supabase
      .from("movimientos")
      .select("*")
      .eq("user_id", session.user.id)
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
      .eq("user_id", session.user.id)
      .order("fecha");

    setGastos(data || []);
  };

  useEffect(() => {
    if (session) {
      cargarMovimientos();
      cargarGastos();
    }
  }, [session]);

  const ahorroTotal = records.reduce((s, r) => s + Number(r.valor), 0);

  /* ================= MOVIMIENTOS ================= */
  const handleSubmit = async () => {

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
        user_id: session.user.id
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

  const addGasto = async () => {
    await supabase.from("gastos").insert([{
      nombre: newGastoName,
      monto: Number(newGastoMonto),
      fecha: new Date(),
      user_id: session.user.id
    }]);

    setNewGastoName("");
    setNewGastoMonto(0);
    cargarGastos();
  };

  const removeGasto = async (id) => {
    await supabase.from("gastos").delete().eq("id", id);
    cargarGastos();
  };

  /* ================= LOGIN SCREEN ================= */
  if (!session) {
    return (
      <div className="container">
        <h2>Acceso al Sistema</h2>

        <input placeholder="Nombres" value={nombres}
          onChange={e => setNombres(e.target.value)} />

        <input placeholder="Correo" value={email}
          onChange={e => setEmail(e.target.value)} />

        <input placeholder="Nombre de usuario" value={username}
          onChange={e => setUsername(e.target.value)} />

        <input type="password" placeholder="Contraseña"
          value={password}
          onChange={e => setPassword(e.target.value)} />

        <button onClick={signIn}>Ingresar</button>
        <button onClick={signUp}>Crear cuenta</button>
      </div>
    );
  }

  /* ================= SISTEMA ================= */
  return (
    <div className="container">

      <button onClick={signOut}>Cerrar sesión</button>

      <h2>Control de Ingresos y Gastos</h2>

      <div className="ahorro">
        <strong>Ahorro disponible</strong>
        <span>${ahorroTotal.toFixed(2)}</span>
      </div>

    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);