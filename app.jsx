const { useState, useEffect, useRef } = React;

/* ======================= SUPABASE CONFIG ======================= */
const supabase = window.supabase.createClient(
  "https://chpvbydpaztzbxdacqwe.supabase.co/",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNocHZieWRwYXp0emJ4ZGFjcXdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk2OTIyMjcsImV4cCI6MjA4NTI2ODIyN30.4gWLzTt8rk6LI13xSLI7rNmE21HgV9GAq8Lg_lk3SWo"
);

function App() {
  const [session, setSession] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    // Obtener sesión actual
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoadingAuth(false);
    });

    // Escuchar cambios de sesión
    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  if (loadingAuth) return <h2>Cargando...</h2>;

  if (!session) return <Login />;

  return <MainApp session={session} />;
}

/* ======================= LOGIN ======================= */
function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(true);

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
          style={{ position: "absolute", right: 5, top: 5 }}
          onClick={() => setShowPass(!showPass)}
        >
          👁
        </button>
      </div>

      <label style={{ fontSize: "14px" }}>
        <input
          type="checkbox"
          checked={remember}
          onChange={() => setRemember(!remember)}
        />
        Recordarme
      </label>

      <button className="btn-primary" onClick={handleLogin}>
        Entrar
      </button>
    </div>
  );
}

/* ======================= APP PRINCIPAL ======================= */
function MainApp({ session }) {

  // TU APP ORIGINAL VA AQUÍ (no cambia nada)
  // Solo agregamos botón cerrar sesión y crear usuario

  const cerrarSesion = async () => {
    await supabase.auth.signOut();
  };

  const crearUsuario = async () => {
    const email = prompt("Correo nuevo usuario:");
    const password = prompt("Contraseña:");

    if (!email || !password) return;

    const { error } = await supabase.auth.signUp({
      email,
      password
    });

    if (error) alert(error.message);
    else alert("Usuario creado correctamente");
  };

  return (
    <div>
      <button onClick={cerrarSesion}>Cerrar sesión</button>
      <button onClick={crearUsuario}>Crear usuario</button>

      {/* AQUÍ PEGAS TODO TU COMPONENTE ACTUAL */}
      {/* Puedes mover tu código actual aquí */}
      <h2>App protegida 🔐</h2>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);