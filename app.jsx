const { useState, useEffect, useRef } = React;

/* ======================= SUPABASE CONFIG ======================= */
const supabase = window.supabase.createClient(
  "https://chpvbydpaztzbxdacqwe.supabase.co/",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNocHZieWRwYXp0emJ4ZGFjcXdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk2OTIyMjcsImV4cCI6MjA4NTI2ODIyN30.4gWLzTt8rk6LI13xSLI7rNmE21HgV9GAq8Lg_lk3SWo"
);

/* ======================= RED DE SEGURIDAD =======================
   Si por cualquier motivo la carpeta services/ no cargó (ruta rota,
   archivo faltante, error de red), esto evita que TODA la app se
   caiga con pantalla en negro. Las notificaciones simplemente
   quedarían desactivadas hasta corregir la ruta de los <script>. */
if (!window.NotificacionesService) {
  console.error(
    "⚠️ services/notificaciones.index.js no se cargó. Revisa que la carpeta " +
    "'services/' esté junto a index.html y que las rutas de los <script> sean correctas."
  );
  window.NotificacionesService = {
    estaDisponible: () => false,
    inicializar: async () => false,
    solicitarPermisos: async () => false,
    programar: async () => {},
    actualizar: async () => {},
    cancelar: async () => {}
  };
}

/* ======================= ICONOS (solo interfaz, SVG propios) ======================= */
function Icon({ name, size = 20 }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round"
  };

  switch (name) {
    case "home":
      return (
        <svg {...common}>
          <path d="M4 11.5L12 4l8 7.5" />
          <path d="M6 10v9a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-9" />
          <path d="M10 20v-5h4v5" />
        </svg>
      );
    case "list":
      return (
        <svg {...common}>
          <line x1="9" y1="6" x2="20" y2="6" />
          <line x1="9" y1="12" x2="20" y2="12" />
          <line x1="9" y1="18" x2="20" y2="18" />
          <circle cx="4.5" cy="6" r="1.3" fill="currentColor" stroke="none" />
          <circle cx="4.5" cy="12" r="1.3" fill="currentColor" stroke="none" />
          <circle cx="4.5" cy="18" r="1.3" fill="currentColor" stroke="none" />
        </svg>
      );
    case "chart":
      return (
        <svg {...common}>
          <line x1="5" y1="20" x2="5" y2="12" />
          <line x1="12" y1="20" x2="12" y2="6" />
          <line x1="19" y1="20" x2="19" y2="15" />
          <line x1="3" y1="20.5" x2="21" y2="20.5" />
        </svg>
      );
    case "users":
      return (
        <svg {...common}>
          <circle cx="9" cy="8" r="3.2" />
          <path d="M3.5 20c0-3.3 2.5-5.5 5.5-5.5s5.5 2.2 5.5 5.5" />
          <circle cx="17.2" cy="8.5" r="2.4" />
          <path d="M15.8 14.7c2.6.3 4.4 2.3 4.4 5.3" />
        </svg>
      );
    case "archive":
      return (
        <svg {...common}>
          <rect x="3" y="4" width="18" height="5" rx="1.6" />
          <rect x="3" y="11" width="18" height="9" rx="1.6" />
          <line x1="9" y1="15.3" x2="15" y2="15.3" />
        </svg>
      );
    case "bell":
      return (
        <svg {...common}>
          <path d="M12 3.5c2.4 0 4.2 1.9 4.2 4.5v3.3l1.6 2.8H6.2l1.6-2.8V8c0-2.6 1.8-4.5 4.2-4.5z" />
          <path d="M9.6 18a2.4 2.4 0 0 0 4.8 0" />
        </svg>
      );
    case "check":
      return (
        <svg {...common}>
          <polyline points="4 12.5 9 17.5 20 6.5" />
        </svg>
      );
    case "settings":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="3.2" />
          <path d="M12 3v2.4M12 18.6V21M4.9 4.9l1.7 1.7M17.4 17.4l1.7 1.7M3 12h2.4M18.6 12H21M4.9 19.1l1.7-1.7M17.4 6.6l1.7-1.7" />
        </svg>
      );
    case "logout":
      return (
        <svg {...common}>
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
      );
    case "menu":
      return (
        <svg {...common} strokeWidth={2}>
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      );
    case "close":
      return (
        <svg {...common} strokeWidth={2}>
          <line x1="5" y1="5" x2="19" y2="19" />
          <line x1="19" y1="5" x2="5" y2="19" />
        </svg>
      );
    case "sun":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="4.2" />
          <path d="M12 2.5v2.3M12 19.2v2.3M4.6 4.6l1.6 1.6M17.8 17.8l1.6 1.6M2.4 12h2.3M19.3 12h2.3M4.6 19.4l1.6-1.6M17.8 6.2l1.6-1.6" />
        </svg>
      );
    case "moon":
      return (
        <svg {...common}>
          <path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a6.8 6.8 0 0 0 10.5 10.5z" />
        </svg>
      );
    case "monitor":
      return (
        <svg {...common}>
          <rect x="3" y="4" width="18" height="12" rx="1.6" />
          <line x1="8" y1="20" x2="16" y2="20" />
          <line x1="12" y1="16" x2="12" y2="20" />
        </svg>
      );
    case "search":
      return (
        <svg {...common}>
          <circle cx="11" cy="11" r="6.5" />
          <line x1="20" y1="20" x2="15.8" y2="15.8" />
        </svg>
      );
    case "download":
      return (
        <svg {...common}>
          <path d="M12 3v12" />
          <polyline points="7 11 12 16 17 11" />
          <line x1="4" y1="20" x2="20" y2="20" />
        </svg>
      );
    case "upload":
      return (
        <svg {...common}>
          <path d="M12 21V9" />
          <polyline points="7 13 12 8 17 13" />
          <line x1="4" y1="4" x2="20" y2="4" />
        </svg>
      );
    case "restore":
      return (
        <svg {...common}>
          <path d="M4 12a8 8 0 1 1 2.6 5.9" />
          <polyline points="4 20 4 14 10 14" />
        </svg>
      );
    case "edit":
      return (
        <svg {...common}>
          <path d="M4 20h4l10-10-4-4L4 16v4z" />
          <line x1="13" y1="7" x2="17" y2="11" />
        </svg>
      );
    case "trash":
      return (
        <svg {...common}>
          <polyline points="4 7 20 7" />
          <path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
          <path d="M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13" />
          <line x1="10" y1="11" x2="10" y2="17" />
          <line x1="14" y1="11" x2="14" y2="17" />
        </svg>
      );
    case "plus":
      return (
        <svg {...common} strokeWidth={2.2}>
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      );
    case "wallet":
      return (
        <svg {...common}>
          <path d="M3 7.5A1.5 1.5 0 0 1 4.5 6h13A1.5 1.5 0 0 1 19 7.5v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 3 16.5v-9z" />
          <path d="M15.5 12.2h3a1 1 0 0 0 1-1v-1.4a1 1 0 0 0-1-1h-3a1.7 1.7 0 0 0 0 3.4z" />
        </svg>
      );
    case "arrow-up":
      return (
        <svg {...common}>
          <line x1="12" y1="19" x2="12" y2="5" />
          <polyline points="6 11 12 5 18 11" />
        </svg>
      );
    case "arrow-down":
      return (
        <svg {...common}>
          <line x1="12" y1="5" x2="12" y2="19" />
          <polyline points="6 13 12 19 18 13" />
        </svg>
      );
    case "zap":
      return (
        <svg {...common} fill="currentColor" stroke="none">
          <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8z" />
        </svg>
      );
    case "eye":
      return (
        <svg {...common}>
          <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" />
          <circle cx="12" cy="12" r="2.6" />
        </svg>
      );
    case "eye-off":
      return (
        <svg {...common}>
          <path d="M3 3l18 18" />
          <path d="M10.6 5.7A10.4 10.4 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a15.6 15.6 0 0 1-3.2 4" />
          <path d="M6.6 6.6C4 8.3 2.5 12 2.5 12S6 18.5 12 18.5a9.8 9.8 0 0 0 3.4-.6" />
          <path d="M9.5 9.8a2.6 2.6 0 0 0 3.7 3.7" />
        </svg>
      );
    case "user":
      return (
        <svg {...common}>
          <circle cx="12" cy="8.5" r="3.6" />
          <path d="M4.5 20c0-4.1 3.4-6.8 7.5-6.8s7.5 2.7 7.5 6.8" />
        </svg>
      );
    case "camera":
      return (
        <svg {...common}>
          <path d="M4 8.5A1.5 1.5 0 0 1 5.5 7h2l1-1.8A1 1 0 0 1 9.4 4.6h5.2a1 1 0 0 1 .9.6L16.5 7h2A1.5 1.5 0 0 1 20 8.5v9A1.5 1.5 0 0 1 18.5 19h-13A1.5 1.5 0 0 1 4 17.5v-9z" />
          <circle cx="12" cy="13" r="3.4" />
        </svg>
      );
    case "lock":
      return (
        <svg {...common}>
          <rect x="5" y="10.5" width="14" height="9.5" rx="1.6" />
          <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
        </svg>
      );
    case "alert-triangle":
      return (
        <svg {...common}>
          <path d="M12 4.5 21 19H3z" />
          <line x1="12" y1="10" x2="12" y2="14.3" />
          <circle cx="12" cy="17.1" r="0.15" fill="currentColor" stroke="none" />
        </svg>
      );
    case "info":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <line x1="12" y1="11" x2="12" y2="16.5" />
          <circle cx="12" cy="7.8" r="0.15" fill="currentColor" stroke="none" />
        </svg>
      );
    case "sliders":
      return (
        <svg {...common}>
          <line x1="4" y1="6" x2="20" y2="6" />
          <line x1="4" y1="12" x2="20" y2="12" />
          <line x1="4" y1="18" x2="20" y2="18" />
          <circle cx="8" cy="6" r="1.8" fill="var(--bg-surface)" />
          <circle cx="16" cy="12" r="1.8" fill="var(--bg-surface)" />
          <circle cx="10" cy="18" r="1.8" fill="var(--bg-surface)" />
        </svg>
      );
    default:
      return null;
  }
}

/* ======================= AVATARES PREDISEÑADOS DE PERFIL =======================
   Colección propia (SVG/degradados), moderna / minimalista / elegante, coherente
   con la identidad visual de M&A Finanzas. Se guardan como "preset:<id>" en avatar_url. */
const AVATARES_PREDISENADOS = [
  { id: "orquidea", colores: ["#CE7CF2", "#6d3fc0"] },
  { id: "medianoche", colores: ["#5B6EF2", "#22246B"] },
  { id: "esmeralda", colores: ["#3FC29B", "#0E5A47"] },
  { id: "coral", colores: ["#F2946E", "#B4472A"] },
  { id: "dorado", colores: ["#F2C14E", "#9C6E12"] },
  { id: "rosa", colores: ["#F27CB0", "#B23D73"] },
  { id: "grafito", colores: ["#8A8FA3", "#33364A"] },
  { id: "cielo", colores: ["#6FCBF2", "#1E5F87"] }
];

function esAvatarPredisenado(avatarUrl) {
  return typeof avatarUrl === "string" && avatarUrl.startsWith("preset:");
}

function obtenerPredisenado(avatarUrl) {
  const id = (avatarUrl || "").replace("preset:", "");
  return AVATARES_PREDISENADOS.find(a => a.id === id) || AVATARES_PREDISENADOS[0];
}

/* Avatar visual de un PERFIL (nunca del usuario autenticado). Acepta una imagen
   subida, un preset prediseñado, o cae a iniciales sobre un degradado estable. */
function PerfilAvatarVisual({ nombre, avatarUrl, tamano = 76 }) {
  const inicial = (nombre || "?").trim().charAt(0).toUpperCase() || "?";
  const estiloBase = {
    width: tamano,
    height: tamano,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    flexShrink: 0,
    fontWeight: 700,
    color: "#fff",
    fontSize: Math.round(tamano * 0.38)
  };

  if (avatarUrl && esAvatarPredisenado(avatarUrl)) {
    const preset = obtenerPredisenado(avatarUrl);
    return (
      <div style={{ ...estiloBase, background: `linear-gradient(135deg, ${preset.colores[0]}, ${preset.colores[1]})` }}>
        {inicial}
      </div>
    );
  }

  if (avatarUrl) {
    return (
      <div style={estiloBase}>
        <img src={avatarUrl} alt={nombre} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
    );
  }

  return (
    <div style={{ ...estiloBase, background: "linear-gradient(135deg, var(--primary), #6d3fc0)" }}>
      {inicial}
    </div>
  );
}

/* Selector de avatar para un perfil: permite subir una imagen (galería/archivos/
   cámara según lo soporte la plataforma) o elegir un avatar prediseñado.
   `seleccion` es { archivo, url } | { predisenado } | null.
   `avatarActual` (opcional) es la URL ya guardada en el perfil, para mostrarla
   como vista previa cuando aún no hay una selección nueva. */
function SelectorAvatarPerfil({ nombre, seleccion, onSeleccionar, avatarActual = null }) {
  const inputRef = useRef(null);
  const [mostrarPresets, setMostrarPresets] = useState(false);

  const manejarArchivo = (e) => {
    const archivo = e.target.files[0];
    if (!archivo) return;
    if (!archivo.type.startsWith("image/")) return;
    if (seleccion?.url) URL.revokeObjectURL(seleccion.url);
    onSeleccionar({ archivo, url: URL.createObjectURL(archivo) });
    setMostrarPresets(false);
  };

  const previewUrl = seleccion?.url || null;
  const previewPreset = seleccion?.predisenado ? `preset:${seleccion.predisenado}` : null;
  const avatarParaMostrar = previewPreset || avatarActual;

  return (
    <div className="selector-avatar-perfil">
      {previewUrl ? (
        <div className="perfil-avatar-preview-img">
          <img src={previewUrl} alt="Vista previa" />
        </div>
      ) : (
        <PerfilAvatarVisual nombre={nombre} avatarUrl={avatarParaMostrar} tamano={84} />
      )}

      <div className="selector-avatar-acciones">
        <button type="button" className="btn btn-secondary" onClick={() => inputRef.current.click()}>
          <Icon name="camera" size={14} /> Subir foto
        </button>
        <button type="button" className="btn btn-secondary" onClick={() => setMostrarPresets(v => !v)}>
          <Icon name="users" size={14} /> Elegir avatar
        </button>
        <input
          type="file"
          accept="image/*"
          capture="environment"
          ref={inputRef}
          onChange={manejarArchivo}
          style={{ display: "none" }}
        />
      </div>

      {mostrarPresets && (
        <div className="avatares-predisenados-grid">
          {AVATARES_PREDISENADOS.map(preset => (
            <button
              type="button"
              key={preset.id}
              className={`avatar-preset-opcion ${seleccion?.predisenado === preset.id ? "activo" : ""}`}
              title={preset.id}
              onClick={() => { onSeleccionar({ predisenado: preset.id }); setMostrarPresets(false); }}
              style={{ background: `linear-gradient(135deg, ${preset.colores[0]}, ${preset.colores[1]})` }}
            >
              {(nombre || "?").trim().charAt(0).toUpperCase() || "?"}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ======================= NAVEGACIÓN (solo interfaz) ======================= */
const NAV_ITEMS = [
  { id: "inicio", label: "Inicio", icon: "home" },
  { id: "movimientos", label: "Movimientos", icon: "list" },
  { id: "resumen", label: "Resumen", icon: "chart" },
  { id: "recordatorios", label: "Recordatorios", icon: "bell" },
  { id: "perfiles", label: "Perfiles", icon: "users" },
  { id: "respaldos", label: "Respaldos", icon: "archive" },
  { id: "configuracion", label: "Configuración", icon: "settings" }
];

const BOTTOM_NAV_ITEMS = [
  { id: "inicio", label: "Inicio", icon: "home" },
  { id: "movimientos", label: "Movs.", icon: "list" },
  { id: "resumen", label: "Resumen", icon: "chart" },
  { id: "recordatorios", label: "Alertas", icon: "bell" },
  { id: "configuracion", label: "Ajustes", icon: "settings" }
];

const OPCIONES_ANTICIPACION = [
  { valor: 0, etiqueta: "Hora exacta" },
  { valor: 5, etiqueta: "5 min antes" },
  { valor: 10, etiqueta: "10 min antes" },
  { valor: 15, etiqueta: "15 min antes" },
  { valor: 30, etiqueta: "30 min antes" },
  { valor: 60, etiqueta: "1 hora antes" },
  { valor: 1440, etiqueta: "1 día antes" }
];

const TITULOS_VISTA = {
  inicio: "Inicio",
  movimientos: "Movimientos",
  resumen: "Resumen",
  recordatorios: "Recordatorios",
  perfiles: "Perfiles",
  respaldos: "Respaldos",
  configuracion: "Configuración"
};

function App() {
  // SESIÓN / LOGIN
  const [session, setSession] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [loginUsuario, setLoginUsuario] = useState("");
  const [loginContrasena, setLoginContrasena] = useState("");
  const [loginError, setLoginError] = useState("");
  const [mostrarContrasena, setMostrarContrasena] = useState(false);

  const [inputValue, setInputValue] = useState(0);
  const [inputName, setInputName] = useState("");
  const [inputDate, setInputDate] = useState("");
  const [records, setRecords] = useState([]);
  const [editId, setEditId] = useState(null);
  const formRef = useRef(null);
  const fileInputRef = useRef(null);
  const tablaScrollRef = useRef(null);

  const [gastos, setGastos] = useState([]);
  const [newGastoName, setNewGastoName] = useState("");
  const [newGastoMonto, setNewGastoMonto] = useState(0);

  // RECORDATORIOS
  const [recordatorios, setRecordatorios] = useState([]);
  const [nombreRecordatorio, setNombreRecordatorio] = useState("");
  const [descripcionRecordatorio, setDescripcionRecordatorio] = useState("");
  const [fechaRecordatorio, setFechaRecordatorio] = useState("");
  const [horaRecordatorio, setHoraRecordatorio] = useState("");
  const [repeticionRecordatorio, setRepeticionRecordatorio] = useState("No repetir");
  const [cantidadRepeticiones, setCantidadRepeticiones] = useState("");
  const [editRecordatorioId, setEditRecordatorioId] = useState(null);
  const recordatorioFormRef = useRef(null);

  // PERFILES
  const [perfiles, setPerfiles] = useState([]);
  const [perfilActivo, setPerfilActivo] = useState(
    localStorage.getItem("perfilActivo") || ""
  );
  const [nuevoPerfilNombre, setNuevoPerfilNombre] = useState("");

  // FLUJO INTELIGENTE DE PERFILES (pantallas Crear / Seleccionar perfil)
  const [perfilesListos, setPerfilesListos] = useState(false);
  const [perfilSesionConfirmado, setPerfilSesionConfirmado] = useState(false);
  const [forzarSelectorPerfil, setForzarSelectorPerfil] = useState(false);
  const [perfilEditandoId, setPerfilEditandoId] = useState(null);
  const [perfilEditandoNombre, setPerfilEditandoNombre] = useState("");

  // MÓDULO PERFILES (administración centralizada: crear, editar, eliminar)
  const [nuevoPerfilAvatar, setNuevoPerfilAvatar] = useState(null); // { archivo, url } o { predisenado: 'id' }
  const [creandoPerfilModulo, setCreandoPerfilModulo] = useState(false);
  const [guardandoPerfilModulo, setGuardandoPerfilModulo] = useState(false);
  const [perfilAEliminar, setPerfilAEliminar] = useState(null); // perfil pendiente de confirmación de borrado
  const [eliminandoPerfilId, setEliminandoPerfilId] = useState(null);

  // APARIENCIA (Claro / Oscuro / Sistema)
  const [tema, setTema] = useState(() => localStorage.getItem("tema") || "sistema");
  const [isDark, setIsDark] = useState(false);
  const [vista, setVista] = useState("inicio");

  // CUENTA (tabla perfiles: nombres, avatar_url, etc. — perfil real del usuario autenticado)
  const [perfilUsuario, setPerfilUsuario] = useState(null);
  const [editandoNombre, setEditandoNombre] = useState(false);
  const [nombreCuentaInput, setNombreCuentaInput] = useState("");
  const [guardandoNombre, setGuardandoNombre] = useState(false);

  const [avatarPreview, setAvatarPreview] = useState(null);
  const [subiendoAvatar, setSubiendoAvatar] = useState(false);
  const avatarInputRef = useRef(null);

  const [mostrarFormPassword, setMostrarFormPassword] = useState(false);
  const [passwordActual, setPasswordActual] = useState("");
  const [passwordNueva, setPasswordNueva] = useState("");
  const [passwordConfirmar, setPasswordConfirmar] = useState("");
  const [cambiandoPassword, setCambiandoPassword] = useState(false);

  const [mostrarEliminarCuenta, setMostrarEliminarCuenta] = useState(false);
  const [confirmarEliminarTexto, setConfirmarEliminarTexto] = useState("");
  const [eliminandoCuenta, setEliminandoCuenta] = useState(false);

  // NOTIFICACIONES (preferencias locales del dispositivo)
  const [notifConfig, setNotifConfig] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("notifConfig")) || {
        activadas: false, sonido: true, vibracion: true, anticipacionMin: 0
      };
    } catch {
      return { activadas: false, sonido: true, vibracion: true, anticipacionMin: 0 };
    }
  });
  const notificacionesListas = useRef(false);
  const recordatorioResaltadoRef = useRef(null);

  // UI - navegación responsive (nuevo, solo interfaz)
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // BUSCADOR Y RESUMEN
  const [busqueda, setBusqueda] = useState("");
  const [mesSeleccionado, setMesSeleccionado] = useState(() => {
    const hoy = new Date();
    return `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, "0")}`;
  });

  // NOTIFICACIONES
  const [toast, setToast] = useState(null);

  const mostrarToast = (mensaje, tipo = "info") => {
    setToast({ mensaje, tipo });
    setTimeout(() => setToast(null), 3000);
  };

  /* ======================= AUTH ======================= */
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setCheckingSession(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (tablaScrollRef.current) {
      tablaScrollRef.current.scrollTop = tablaScrollRef.current.scrollHeight;
    }
  }, [records]);

  const iniciarSesion = async () => {
    setLoginError("");
    if (!loginUsuario || !loginContrasena) {
      setLoginError("Completa usuario y contraseña");
      return;
    }

    const valor = loginUsuario.trim().toLowerCase();
    const email = valor.includes("@") ? valor : `${valor}@tuapp.local`;

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: loginContrasena
    });

    if (error) {
      console.error("Error de login:", error.message);
      setLoginError("Usuario o contraseña incorrectos");
      return;
    }
    setLoginContrasena("");
  };

  const cerrarSesion = async () => {
    await supabase.auth.signOut();
    setPerfilesListos(false);
    setPerfilSesionConfirmado(false);
    setForzarSelectorPerfil(false);
  };

  const verificarContrasena = async () => {
    const clave = prompt("Confirma tu contraseña para continuar:");
    if (!clave) return false;

    const { error } = await supabase.auth.signInWithPassword({
      email: session.user.email,
      password: clave
    });

    if (error) {
      mostrarToast("Contraseña incorrecta.", "error");
      return false;
    }
    return true;
  };

  const cargarPerfilUsuario = async () => {
    if (!session) return;
    const { data, error } = await supabase
      .from("perfiles")
      .select("*")
      .eq("id", session.user.id)
      .maybeSingle();

    if (error) {
      console.error("Error cargando perfil de cuenta:", error);
      return;
    }

    if (data) {
      setPerfilUsuario(data);
      setNombreCuentaInput(data.nombres || "");
    } else {
      // Primera vez que este usuario entra: crea su fila en perfiles
      const { data: creado, error: errorCreando } = await supabase
        .from("perfiles")
        .insert([{
          id: session.user.id,
          nombres: session.user.email.split("@")[0],
          username: session.user.email.split("@")[0],
          email: session.user.email,
          rol: "usuario"
        }])
        .select()
        .single();

      if (!errorCreando) {
        setPerfilUsuario(creado);
        setNombreCuentaInput(creado.nombres || "");
      }
    }
  };

  const cargarPerfiles = async () => {
    const { data, error } = await supabase
      .from("perfiles_app")
      .select("*")
      .order("id", { ascending: true });

    if (error) console.error("Error cargando perfiles:", error);

    const lista = data || [];
    setPerfiles(lista);
    setPerfilesListos(true);
  };

  // Devuelve el objeto de perfil (con avatar_url, created_at, etc.) a partir del nombre activo
  const obtenerPerfilPorNombre = (nombre) => perfiles.find(p => p.nombre === nombre) || null;
  const perfilActivoObj = obtenerPerfilPorNombre(perfilActivo);

  // Devuelve el mapa de "último acceso" por perfil (guardado en este dispositivo)
  const obtenerUltimosAccesos = () => {
    try {
      return JSON.parse(localStorage.getItem("ultimoAccesoPerfiles")) || {};
    } catch {
      return {};
    }
  };

  const registrarUltimoAcceso = (nombre) => {
    const mapa = obtenerUltimosAccesos();
    mapa[nombre] = new Date().toISOString();
    localStorage.setItem("ultimoAccesoPerfiles", JSON.stringify(mapa));
  };

  const formatearUltimoAcceso = (nombre) => {
    const mapa = obtenerUltimosAccesos();
    const iso = mapa[nombre];
    if (!iso) return "Sin accesos previos";
    const diffMs = Date.now() - new Date(iso).getTime();
    const min = Math.floor(diffMs / 60000);
    if (min < 1) return "Hace un momento";
    if (min < 60) return `Hace ${min} min`;
    const horas = Math.floor(min / 60);
    if (horas < 24) return `Hace ${horas} h`;
    const dias = Math.floor(horas / 24);
    if (dias === 1) return "Ayer";
    if (dias < 30) return `Hace ${dias} días`;
    return new Date(iso).toLocaleDateString();
  };

  const formatearFechaCreacionPerfil = (iso) => {
    if (!iso) return "fecha no disponible";
    try {
      return new Date(iso).toLocaleDateString("es", { day: "numeric", month: "long", year: "numeric" });
    } catch {
      return "fecha no disponible";
    }
  };

  const cargarMovimientos = async (perfil) => {
    if (!perfil) { setRecords([]); return; }
    const { data } = await supabase
      .from("movimientos")
      .select("*")
      .eq("perfil", perfil)
      .order("fecha", { ascending: true });

    let saldo = 0;
    const conSaldo = (data || []).map(m => {
      saldo = Number((saldo + Number(m.valor)).toFixed(2));
      return { ...m, saldo };
    });

    setRecords(conSaldo);
  };

  const cargarGastos = async (perfil) => {
    if (!perfil) { setGastos([]); return; }
    const { data } = await supabase
      .from("gastos")
      .select("*")
      .eq("perfil", perfil)
      .order("fecha");

    setGastos(data || []);
  };

  const cargarRecordatorios = async (perfil) => {
    if (!perfil || !session) { setRecordatorios([]); return; }
    const { data, error } = await supabase
      .from("recordatorios")
      .select("*")
      .eq("user_id", session.user.id)
      .eq("perfil", perfil)
      .order("fecha", { ascending: true })
      .order("hora", { ascending: true });

    if (error) console.error("Error cargando recordatorios:", error);

    const lista = data || [];
    setRecordatorios(lista);

    if (notifConfig.activadas) {
      reprogramarTodosLosRecordatorios(
        lista.map(r => ({ ...r, _anticipacionMin: anticipacionActual() }))
      );
    }
  };

  useEffect(() => {
    if (session) {
      cargarPerfiles();
      cargarPerfilUsuario();
    }
  }, [session]);

  useEffect(() => {
    if (perfilActivo) {
      cargarMovimientos(perfilActivo);
      cargarGastos(perfilActivo);
      cargarRecordatorios(perfilActivo);
    }
  }, [perfilActivo]);

  // CASO 2 del flujo inteligente: si existe un único perfil, entra directo
  // al Dashboard sin preguntar nada ni mostrar pantallas intermedias.
  useEffect(() => {
    if (
      perfilesListos &&
      perfiles.length === 1 &&
      !perfilSesionConfirmado &&
      !forzarSelectorPerfil
    ) {
      cambiarPerfil(perfiles[0].nombre);
    }
  }, [perfilesListos, perfiles, perfilSesionConfirmado, forzarSelectorPerfil]);

  // APARIENCIA: resuelve 'sistema' contra prefers-color-scheme y aplica la clase .dark
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const aplicarTemaResuelto = () => {
      const oscuroResuelto = tema === "sistema" ? mediaQuery.matches : tema === "oscuro";
      document.body.classList.toggle("dark", oscuroResuelto);
      setIsDark(oscuroResuelto);
    };

    aplicarTemaResuelto();

    if (tema === "sistema") {
      mediaQuery.addEventListener("change", aplicarTemaResuelto);
      return () => mediaQuery.removeEventListener("change", aplicarTemaResuelto);
    }
  }, [tema]);

  const cambiarTema = (nuevoTema) => {
    setTema(nuevoTema);
    localStorage.setItem("tema", nuevoTema);
  };

  // NOTIFICACIONES: se inicializa una sola vez. Al tocar una notificación,
  // abre directamente el recordatorio correspondiente (web o Android).
  useEffect(() => {
    if (notificacionesListas.current) return;
    notificacionesListas.current = true;

    window.NotificacionesService.inicializar((idRecordatorio) => {
      recordatorioResaltadoRef.current = idRecordatorio;
      setVista("recordatorios");
    });
  }, []);

  const anticipacionActual = () => Number(notifConfig.anticipacionMin || 0);

  const reprogramarTodosLosRecordatorios = async (lista) => {
    if (!notifConfig.activadas) return;
    for (const rec of lista) {
      if (rec.completado) continue;
      await window.NotificacionesService.programar({ ...rec, _anticipacionMin: anticipacionActual() });
    }
  };

  const cancelarTodosLosRecordatorios = async (lista) => {
    for (const rec of lista) {
      await window.NotificacionesService.cancelar(rec.id);
    }
  };

  const actualizarNotifConfig = async (cambios) => {
    const nuevaConfig = { ...notifConfig, ...cambios };

    if (cambios.activadas === true) {
      const permitido = await window.NotificacionesService.solicitarPermisos();
      if (!permitido) {
        mostrarToast("Debes permitir las notificaciones desde los ajustes del dispositivo", "error");
        return;
      }
    }

    setNotifConfig(nuevaConfig);
    localStorage.setItem("notifConfig", JSON.stringify(nuevaConfig));

    if (nuevaConfig.activadas) {
      const listaActual = recordatorios.map(r => ({ ...r, _anticipacionMin: Number(nuevaConfig.anticipacionMin || 0) }));
      await reprogramarTodosLosRecordatorios(listaActual);
      mostrarToast("Notificaciones activadas", "success");
    } else {
      await cancelarTodosLosRecordatorios(recordatorios);
      mostrarToast("Notificaciones desactivadas", "info");
    }
  };

  const ahorroTotal = records.reduce((s, r) => s + Number(r.valor), 0);

  // RESUMEN MENSUAL
  const registrosDelMes = records.filter(r => r.fecha && r.fecha.startsWith(mesSeleccionado));
  const ingresosMes = registrosDelMes.filter(r => Number(r.valor) > 0).reduce((s, r) => s + Number(r.valor), 0);
  const gastosMes = registrosDelMes.filter(r => Number(r.valor) < 0).reduce((s, r) => s + Math.abs(Number(r.valor)), 0);
  const balanceMes = ingresosMes - gastosMes;

  // BUSCADOR
  const registrosFiltrados = records.filter(r =>
    r.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  // RECORDATORIOS (ya vienen ordenados por fecha/hora ascendente desde la consulta)
  const proximosRecordatorios = recordatorios.filter(r => !r.completado).slice(0, 5);

  const cambiarPerfil = (nombre) => {
    setPerfilActivo(nombre);
    localStorage.setItem("perfilActivo", nombre);
    setEditId(null);
    setPerfilSesionConfirmado(true);
    setForzarSelectorPerfil(false);
    registrarUltimoAcceso(nombre);
  };

  /* ======================= AVATAR DEL PERFIL (independiente del usuario) =======================
     El avatar de un PERFIL nunca se toma de la cuenta autenticada (perfilUsuario/session).
     Se guarda como URL pública en el bucket "avatars" (ruta perfiles-app/{id}/avatar.ext)
     o como referencia "preset:<id>" cuando se elige un avatar prediseñado. */
  const subirAvatarPerfil = async (perfilId, archivo) => {
    const extension = archivo.name.split(".").pop();
    const rutaArchivo = `perfiles-app/${perfilId}/avatar.${extension}`;

    const { error: errorSubida } = await supabase.storage
      .from("avatars")
      .upload(rutaArchivo, archivo, { upsert: true });

    if (errorSubida) {
      console.error("Error subiendo avatar de perfil:", errorSubida);
      mostrarToast("No se pudo subir la imagen del perfil", "error");
      return null;
    }

    const { data: urlPublica } = supabase.storage.from("avatars").getPublicUrl(rutaArchivo);
    return `${urlPublica.publicUrl}?v=${Date.now()}`;
  };

  // Resuelve la selección de avatar (imagen subida o preset) a un valor final para guardar
  const resolverAvatarSeleccionado = async (perfilId, seleccion) => {
    if (!seleccion) return undefined; // sin cambios
    if (seleccion.predisenado) return `preset:${seleccion.predisenado}`;
    if (seleccion.archivo) return await subirAvatarPerfil(perfilId, seleccion.archivo);
    return undefined;
  };

  const crearPerfil = async () => {
    const nombre = nuevoPerfilNombre.trim();
    if (!nombre) {
      mostrarToast("Escribe un nombre para el nuevo perfil", "error");
      return;
    }
    if (perfiles.some(p => p.nombre.toLowerCase() === nombre.toLowerCase())) {
      mostrarToast("Ya existe un perfil con ese nombre", "error");
      return;
    }

    setGuardandoPerfilModulo(true);

    const { data: creado, error } = await supabase
      .from("perfiles_app")
      .insert([{ nombre }])
      .select()
      .single();

    if (error) {
      console.error("Error creando perfil:", error);
      mostrarToast("No se pudo crear el perfil. Revisa la consola (F12).", "error");
      setGuardandoPerfilModulo(false);
      return;
    }

    // Si se eligió avatar (subida o preset) antes de crear, se guarda ahora que ya hay ID
    if (nuevoPerfilAvatar && creado) {
      const avatarFinal = await resolverAvatarSeleccionado(creado.id, nuevoPerfilAvatar);
      if (avatarFinal) {
        await supabase.from("perfiles_app").update({ avatar_url: avatarFinal }).eq("id", creado.id);
      }
    }

    setNuevoPerfilNombre("");
    setNuevoPerfilAvatar(null);
    setCreandoPerfilModulo(false);
    setGuardandoPerfilModulo(false);
    await cargarPerfiles();
    cambiarPerfil(nombre);
    mostrarToast(`Perfil "${nombre}" creado`, "success");
  };

  // Elimina TODA la información asociada a un perfil: movimientos, gastos,
  // recordatorios, metas (si existen) y el avatar guardado en Storage.
  const eliminarPerfilDefinitivo = async (perfil) => {
    if (!perfil) return;
    if (perfiles.length <= 1) {
      mostrarToast("Debe quedar al menos un perfil", "error");
      setPerfilAEliminar(null);
      return;
    }

    setEliminandoPerfilId(perfil.id);

    await supabase.from("movimientos").delete().eq("perfil", perfil.nombre);
    await supabase.from("gastos").delete().eq("perfil", perfil.nombre);
    await supabase.from("recordatorios").delete().eq("perfil", perfil.nombre);
    // Tabla de metas: se elimina si existe en este proyecto; se ignora si no.
    await supabase.from("metas").delete().eq("perfil", perfil.nombre).then(null, () => {});

    // Limpia el avatar del perfil en Storage (si era una imagen subida, no un preset)
    if (perfil.avatar_url && !esAvatarPredisenado(perfil.avatar_url)) {
      const carpeta = `perfiles-app/${perfil.id}`;
      const { data: archivos } = await supabase.storage.from("avatars").list(carpeta);
      if (archivos && archivos.length > 0) {
        await supabase.storage.from("avatars").remove(archivos.map(a => `${carpeta}/${a.name}`));
      }
    }

    await supabase.from("perfiles_app").delete().eq("id", perfil.id);

    const mapa = obtenerUltimosAccesos();
    delete mapa[perfil.nombre];
    localStorage.setItem("ultimoAccesoPerfiles", JSON.stringify(mapa));

    const restantes = perfiles.filter(p => p.id !== perfil.id);
    await cargarPerfiles();
    if (perfilActivo === perfil.nombre && restantes.length > 0) {
      cambiarPerfil(restantes[0].nombre);
    }

    setEliminandoPerfilId(null);
    setPerfilAEliminar(null);
    mostrarToast(`Perfil "${perfil.nombre}" y toda su información fueron eliminados`, "success");
  };

  // Mantengo el nombre anterior como alias por compatibilidad con otras llamadas existentes.
  const eliminarPerfil = (nombre) => {
    const perfil = obtenerPerfilPorNombre(nombre);
    setPerfilAEliminar(perfil);
  };

  const editarPerfil = async (perfilViejo, nombreNuevoCrudo, seleccionAvatar) => {
    const nombreNuevo = nombreNuevoCrudo.trim();
    const perfilObjetivo = obtenerPerfilPorNombre(perfilViejo);
    const cambioNombre = nombreNuevo && nombreNuevo !== perfilViejo;

    if (!nombreNuevo) {
      mostrarToast("El nombre del perfil no puede estar vacío", "error");
      return;
    }
    if (cambioNombre && perfiles.some(p => p.nombre.toLowerCase() === nombreNuevo.toLowerCase())) {
      mostrarToast("Ya existe un perfil con ese nombre", "error");
      return;
    }

    setGuardandoPerfilModulo(true);

    const cambios = {};
    if (cambioNombre) cambios.nombre = nombreNuevo;

    if (seleccionAvatar && perfilObjetivo) {
      const avatarFinal = await resolverAvatarSeleccionado(perfilObjetivo.id, seleccionAvatar);
      if (avatarFinal) cambios.avatar_url = avatarFinal;
    }

    if (Object.keys(cambios).length > 0) {
      const { error } = await supabase
        .from("perfiles_app")
        .update(cambios)
        .eq("nombre", perfilViejo);

      if (error) {
        console.error("Error editando perfil:", error);
        mostrarToast("No se pudo guardar el perfil.", "error");
        setGuardandoPerfilModulo(false);
        return;
      }
    }

    if (cambioNombre) {
      // Mantiene los movimientos, gastos y recordatorios asociados al nuevo nombre
      await supabase.from("movimientos").update({ perfil: nombreNuevo }).eq("perfil", perfilViejo);
      await supabase.from("gastos").update({ perfil: nombreNuevo }).eq("perfil", perfilViejo);
      await supabase.from("recordatorios").update({ perfil: nombreNuevo }).eq("perfil", perfilViejo);
      await supabase.from("metas").update({ perfil: nombreNuevo }).eq("perfil", perfilViejo).then(null, () => {});

      const mapa = obtenerUltimosAccesos();
      if (mapa[perfilViejo]) {
        mapa[nombreNuevo] = mapa[perfilViejo];
        delete mapa[perfilViejo];
        localStorage.setItem("ultimoAccesoPerfiles", JSON.stringify(mapa));
      }
    }

    setPerfilEditandoId(null);
    setGuardandoPerfilModulo(false);
    await cargarPerfiles();
    if (perfilActivo === perfilViejo && cambioNombre) cambiarPerfil(nombreNuevo);
    mostrarToast(`Perfil "${nombreNuevo}" actualizado`, "success");
  };

  const handleSubmit = async () => {
    if (!inputName || !inputDate) {
      mostrarToast("Completa todos los campos", "error");
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
      mostrarToast("Movimiento actualizado", "success");
    } else {
      await supabase.from("movimientos").insert([{
        nombre: inputName,
        valor: Number(inputValue),
        fecha: inputDate,
        perfil: perfilActivo,
        user_id: session.user.id
      }]);
      mostrarToast("Movimiento guardado", "success");
    }

    setInputName("");
    setInputValue(0);
    setInputDate("");
    cargarMovimientos(perfilActivo);
  };

  const eliminarMovimiento = async (id) => {
    await supabase.from("movimientos").delete().eq("id", id);
    cargarMovimientos(perfilActivo);
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
      mostrarToast("Completa nombre y monto del gasto", "error");
      return;
    }

    await supabase.from("gastos").insert([{
      nombre: newGastoName,
      monto: Number(newGastoMonto),
      fecha: new Date(),
      perfil: perfilActivo,
      user_id: session.user.id
    }]);

    setNewGastoName("");
    setNewGastoMonto(0);
    cargarGastos(perfilActivo);
    mostrarToast("Gasto agregado", "success");
  };

  const removeGasto = async (id) => {
    await supabase.from("gastos").delete().eq("id", id);
    cargarGastos(perfilActivo);
  };

  /* ======================= RECORDATORIOS ======================= */
  const handleSubmitRecordatorio = async () => {
    if (!nombreRecordatorio || !fechaRecordatorio || !horaRecordatorio) {
      mostrarToast("Completa nombre, fecha y hora", "error");
      return;
    }

    if (repeticionRecordatorio !== "No repetir" && Number(cantidadRepeticiones) <= 0) {
      mostrarToast("La cantidad de repeticiones debe ser mayor que cero", "error");
      return;
    }

    const payload = {
      nombre: nombreRecordatorio,
      descripcion: descripcionRecordatorio,
      fecha: fechaRecordatorio,
      hora: horaRecordatorio,
      repeticion: repeticionRecordatorio,
      cantidad_repeticiones: repeticionRecordatorio !== "No repetir" ? Number(cantidadRepeticiones) : null,
      perfil: perfilActivo
    };

    if (editRecordatorioId) {
      const { data: actualizado } = await supabase
        .from("recordatorios")
        .update(payload)
        .eq("id", editRecordatorioId)
        .select()
        .single();

      if (notifConfig.activadas && actualizado) {
        await window.NotificacionesService.actualizar({ ...actualizado, _anticipacionMin: anticipacionActual() });
      }

      setEditRecordatorioId(null);
      mostrarToast("Recordatorio actualizado", "success");
    } else {
      const { data: creado } = await supabase.from("recordatorios").insert([{
        ...payload,
        completado: false,
        user_id: session.user.id
      }]).select().single();

      if (notifConfig.activadas && creado) {
        await window.NotificacionesService.programar({ ...creado, _anticipacionMin: anticipacionActual() });
      }

      mostrarToast("Recordatorio guardado", "success");
    }

    setNombreRecordatorio("");
    setDescripcionRecordatorio("");
    setFechaRecordatorio("");
    setHoraRecordatorio("");
    setRepeticionRecordatorio("No repetir");
    setCantidadRepeticiones("");
    cargarRecordatorios(perfilActivo);
  };

  const eliminarRecordatorio = async (id) => {
    await window.NotificacionesService.cancelar(id);
    await supabase.from("recordatorios").delete().eq("id", id);
    cargarRecordatorios(perfilActivo);
  };

  const editarRecordatorio = (rec) => {
    setEditRecordatorioId(rec.id);
    setNombreRecordatorio(rec.nombre);
    setDescripcionRecordatorio(rec.descripcion || "");
    setFechaRecordatorio(rec.fecha);
    setHoraRecordatorio(rec.hora);
    setRepeticionRecordatorio(rec.repeticion || "No repetir");
    setCantidadRepeticiones(rec.cantidad_repeticiones || "");

    recordatorioFormRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  };

  const marcarComoCompletado = async (id) => {
    await window.NotificacionesService.cancelar(id);
    await supabase.from("recordatorios").update({ completado: true }).eq("id", id);
    cargarRecordatorios(perfilActivo);
  };

  /* ======================= EXCEL ======================= */
  const exportarExcel = () => {
    const datos = registrosFiltrados.map(r => ({
      Fecha: r.fecha,
      Detalle: r.nombre,
      Valor: r.valor,
      Saldo: r.saldo
    }));

    const hoja = XLSX.utils.json_to_sheet(datos);
    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, "Registros");

    const fechaArchivo = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(libro, `registros-${perfilActivo}-${fechaArchivo}.xlsx`);
  };

  /* ======================= RESPALDOS ======================= */
  const descargarRespaldo = async () => {
    const { data: todosMovimientos } = await supabase.from("movimientos").select("*");
    const { data: todosGastos } = await supabase.from("gastos").select("*");
    const { data: todosPerfiles } = await supabase.from("perfiles_app").select("*");

    const respaldo = {
      fecha_respaldo: new Date().toISOString(),
      perfiles: todosPerfiles || [],
      movimientos: todosMovimientos || [],
      gastos: todosGastos || []
    };

    const blob = new Blob([JSON.stringify(respaldo, null, 2)], {
      type: "application/json"
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const fechaArchivo = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `respaldo-distribuidor-${fechaArchivo}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const restaurarTodoVacio = async () => {
    const ok = confirm(
      "Esto borrará TODOS los movimientos y gastos de TODOS los perfiles. ¿Continuar?"
    );
    if (!ok) return;

    await supabase.from("movimientos").delete().neq("id", 0);
    await supabase.from("gastos").delete().neq("id", 0);

    cargarMovimientos(perfilActivo);
    cargarGastos(perfilActivo);
    mostrarToast("Toda la información fue borrada", "success");
  };

  const subirRespaldo = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const contenido = JSON.parse(event.target.result);

        const ok = confirm(
          "Esto va a REEMPLAZAR toda la información actual con la del respaldo. ¿Continuar?"
        );
        if (!ok) {
          e.target.value = "";
          return;
        }

        await supabase.from("movimientos").delete().neq("id", 0);
        await supabase.from("gastos").delete().neq("id", 0);
        await supabase.from("perfiles_app").delete().neq("id", 0);

        const perfilesLimpios = (contenido.perfiles || []).map(p => ({ nombre: p.nombre }));
        const movimientosLimpios = (contenido.movimientos || []).map(({ id, ...resto }) => resto);
        const gastosLimpios = (contenido.gastos || []).map(({ id, ...resto }) => resto);

        if (perfilesLimpios.length > 0) await supabase.from("perfiles_app").insert(perfilesLimpios);
        if (movimientosLimpios.length > 0) await supabase.from("movimientos").insert(movimientosLimpios);
        if (gastosLimpios.length > 0) await supabase.from("gastos").insert(gastosLimpios);

        await cargarPerfiles();
        cargarMovimientos(perfilActivo);
        cargarGastos(perfilActivo);
        mostrarToast("Respaldo restaurado correctamente", "success");
      } catch (err) {
        mostrarToast("El archivo no es un respaldo válido", "error");
      }
      e.target.value = "";
    };
    reader.readAsText(file);
  };

  const descargarRespaldoConfirmado = async () => {
    if (await verificarContrasena()) descargarRespaldo();
  };

  const subirRespaldoConfirmado = async () => {
    if (await verificarContrasena()) fileInputRef.current.click();
  };

  const restaurarTodoConfirmado = async () => {
    if (await verificarContrasena()) restaurarTodoVacio();
  };

  /* ======================= CUENTA: NOMBRE ======================= */
  const guardarNombreCuenta = async () => {
    const nombre = nombreCuentaInput.trim();
    if (!nombre) {
      mostrarToast("El nombre no puede estar vacío", "error");
      return;
    }

    setGuardandoNombre(true);
    const { data, error } = await supabase
      .from("perfiles")
      .update({ nombres: nombre })
      .eq("id", session.user.id)
      .select()
      .single();
    setGuardandoNombre(false);

    if (error) {
      mostrarToast("No se pudo actualizar el nombre", "error");
      return;
    }

    setPerfilUsuario(data);
    setEditandoNombre(false);
    mostrarToast("Nombre actualizado", "success");
  };

  /* ======================= CUENTA: FOTO DE PERFIL ======================= */
  const seleccionarArchivoAvatar = (e) => {
    const archivo = e.target.files[0];
    if (!archivo) return;

    if (!archivo.type.startsWith("image/")) {
      mostrarToast("Selecciona un archivo de imagen válido", "error");
      return;
    }

    setAvatarPreview({ archivo, url: URL.createObjectURL(archivo) });
  };

  const confirmarSubidaAvatar = async () => {
    if (!avatarPreview) return;
    setSubiendoAvatar(true);

    const extension = avatarPreview.archivo.name.split(".").pop();
    const rutaArchivo = `${session.user.id}/avatar.${extension}`;

    const { error: errorSubida } = await supabase.storage
      .from("avatars")
      .upload(rutaArchivo, avatarPreview.archivo, { upsert: true });

    if (errorSubida) {
      setSubiendoAvatar(false);
      mostrarToast("No se pudo subir la imagen", "error");
      return;
    }

    const { data: urlPublica } = supabase.storage.from("avatars").getPublicUrl(rutaArchivo);
    // Se agrega un parámetro de versión para forzar la actualización del caché del navegador
    const avatarUrlFinal = `${urlPublica.publicUrl}?v=${Date.now()}`;

    const { data: perfilActualizado, error: errorUpdate } = await supabase
      .from("perfiles")
      .update({ avatar_url: avatarUrlFinal })
      .eq("id", session.user.id)
      .select()
      .single();

    setSubiendoAvatar(false);

    if (errorUpdate) {
      mostrarToast("Imagen subida, pero no se pudo guardar en tu perfil", "error");
      return;
    }

    URL.revokeObjectURL(avatarPreview.url);
    setAvatarPreview(null);
    setPerfilUsuario(perfilActualizado);
    mostrarToast("Foto de perfil actualizada", "success");
  };

  const cancelarSubidaAvatar = () => {
    if (avatarPreview) URL.revokeObjectURL(avatarPreview.url);
    setAvatarPreview(null);
    if (avatarInputRef.current) avatarInputRef.current.value = "";
  };

  /* ======================= CUENTA: CONTRASEÑA ======================= */
  const cambiarContrasenaCuenta = async () => {
    if (!passwordActual || !passwordNueva || !passwordConfirmar) {
      mostrarToast("Completa los tres campos", "error");
      return;
    }
    if (passwordNueva.length < 6) {
      mostrarToast("La nueva contraseña debe tener al menos 6 caracteres", "error");
      return;
    }
    if (passwordNueva !== passwordConfirmar) {
      mostrarToast("Las contraseñas nuevas no coinciden", "error");
      return;
    }

    setCambiandoPassword(true);

    const { error: errorActual } = await supabase.auth.signInWithPassword({
      email: session.user.email,
      password: passwordActual
    });

    if (errorActual) {
      setCambiandoPassword(false);
      mostrarToast("La contraseña actual es incorrecta", "error");
      return;
    }

    const { error: errorCambio } = await supabase.auth.updateUser({ password: passwordNueva });
    setCambiandoPassword(false);

    if (errorCambio) {
      mostrarToast("No se pudo actualizar la contraseña", "error");
      return;
    }

    setPasswordActual("");
    setPasswordNueva("");
    setPasswordConfirmar("");
    setMostrarFormPassword(false);
    mostrarToast("Contraseña actualizada", "success");
  };

  /* ======================= CUENTA: ELIMINAR ======================= */
  const eliminarCuentaDefinitivamente = async () => {
    if (confirmarEliminarTexto !== "ELIMINAR") {
      mostrarToast('Escribe "ELIMINAR" para confirmar', "error");
      return;
    }

    setEliminandoCuenta(true);
    const userId = session.user.id;

    await cancelarTodosLosRecordatorios(recordatorios);

    await supabase.from("recordatorios").delete().eq("user_id", userId);
    await supabase.from("movimientos").delete().eq("user_id", userId);
    await supabase.from("gastos").delete().eq("user_id", userId);

    if (perfilUsuario?.avatar_url) {
      const extension = perfilUsuario.avatar_url.split(".").pop().split("?")[0];
      await supabase.storage.from("avatars").remove([`${userId}/avatar.${extension}`]);
    }

    await supabase.from("perfiles").delete().eq("id", userId);

    setEliminandoCuenta(false);
    mostrarToast("Tu cuenta y tus datos fueron eliminados", "success");

    // Nota: esto borra el perfil y todos sus datos. La credencial de acceso
    // (auth.users) solo puede eliminarse definitivamente con la service_role
    // key desde un entorno seguro (p. ej. una Edge Function), nunca desde el
    // cliente. Por eso se cierra la sesión inmediatamente después.
    await supabase.auth.signOut();
  };

  /* ======================= RENDER (rediseñado) ======================= */
  if (checkingSession) {
    return (
      <div className="auth-screen splash-screen">
        <div className="loading-state">
          <img className="app-splash-icon" src="./assets/icon-512.png" alt="M&A Finanzas" />
          <div className="spinner"></div>
          <p>Cargando...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="auth-screen">
        <div className="auth-card">
          <div className="auth-brand">
            <span className="auth-logo"><img src="./assets/icon-192.png" alt="M&A Finanzas" /></span>
            <h1>M&A Finanzas</h1>
            <p className="hint-text">Control de ingresos y gastos</p>
          </div>

          <h2>Iniciar sesión</h2>
          {loginError && <p className="login-error">{loginError}</p>}

          <div className="field">
            <label>Usuario</label>
            <input
              placeholder="Usuario"
              value={loginUsuario}
              onChange={e => setLoginUsuario(e.target.value)}
            />
          </div>

          <div className="field">
            <label>Contraseña</label>
            <div className="password-wrapper">
              <input
                type={mostrarContrasena ? "text" : "password"}
                placeholder="Contraseña"
                value={loginContrasena}
                onChange={e => setLoginContrasena(e.target.value)}
                onKeyDown={e => e.key === "Enter" && iniciarSesion()}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setMostrarContrasena(!mostrarContrasena)}
              >
                <Icon name={mostrarContrasena ? "eye-off" : "eye"} size={18} />
              </button>
            </div>
          </div>

          <button className="btn btn-primary btn-block" onClick={iniciarSesion}>
            Entrar
          </button>
        </div>
      </div>
    );
  }

  // CASO 1 del flujo inteligente: no existe ningún perfil todavía.
  // Única pantalla que permite crear un perfil desde fuera del módulo Perfiles,
  // porque es indispensable para poder usar la app por primera vez.
  if (perfilesListos && perfiles.length === 0) {
    return (
      <div className="auth-screen perfil-screen">
        <div className="auth-card perfil-card-crear">
          <div className="auth-brand">
            <span className="auth-logo"><img src="./assets/icon-192.png" alt="M&A Finanzas" /></span>
            <h1>Crea tu perfil</h1>
            <p className="hint-text">Necesitas un perfil para empezar a usar M&A Finanzas</p>
          </div>

          <SelectorAvatarPerfil
            nombre={nuevoPerfilNombre}
            seleccion={nuevoPerfilAvatar}
            onSeleccionar={setNuevoPerfilAvatar}
          />

          <div className="field">
            <label>Nombre del perfil</label>
            <input
              placeholder="Ej. Personal, Negocio, Familia..."
              value={nuevoPerfilNombre}
              autoFocus
              onChange={e => setNuevoPerfilNombre(e.target.value)}
              onKeyDown={e => e.key === "Enter" && crearPerfil()}
            />
          </div>

          <button className="btn btn-primary btn-block" onClick={crearPerfil} disabled={guardandoPerfilModulo}>
            <Icon name="plus" size={16} /> {guardandoPerfilModulo ? "Creando..." : "Crear perfil"}
          </button>
        </div>
      </div>
    );
  }

  // CASO 3 del flujo inteligente (y "Cambiar perfil" desde el menú):
  // dos o más perfiles, o el usuario pidió cambiar de perfil manualmente.
  // Esta pantalla es EXCLUSIVAMENTE un selector: no permite crear, editar
  // ni eliminar perfiles (eso vive únicamente en el módulo Perfiles).
  const mostrarSeleccionPerfil =
    perfilesListos &&
    perfiles.length > 0 &&
    (forzarSelectorPerfil || (perfiles.length > 1 && !perfilSesionConfirmado));

  if (mostrarSeleccionPerfil) {
    return (
      <div className="auth-screen perfil-screen">
        <div className="auth-card perfil-card-seleccionar">
          {forzarSelectorPerfil && perfilActivo && (
            <button
              className="perfil-selector-cerrar"
              title="Volver"
              onClick={() => { setForzarSelectorPerfil(false); }}
            >
              <Icon name="close" size={16} />
            </button>
          )}

          <div className="auth-brand">
            <span className="auth-logo"><img src="./assets/icon-192.png" alt="M&A Finanzas" /></span>
            <h1>¿Quién va a entrar?</h1>
            <p className="hint-text">Selecciona un perfil para continuar</p>
          </div>

          <div className="perfil-selector-grid">
            {perfiles.map(p => (
              <button
                key={p.id}
                className="perfil-selector-tarjeta perfil-selector-tarjeta-simple"
                onClick={() => cambiarPerfil(p.nombre)}
                title={`Entrar como ${p.nombre}`}
              >
                <PerfilAvatarVisual nombre={p.nombre} avatarUrl={p.avatar_url} tamano={64} />
                <span className="perfil-selector-nombre">{p.nombre}</span>
              </button>
            ))}
          </div>

          <p className="hint-text perfil-selector-hint">
            ¿Necesitas crear, editar o eliminar un perfil? Entra a uno y ve al módulo <strong>Perfiles</strong>.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <span className="sidebar-logo"><img src="./assets/icon-192.png" alt="M&A Finanzas" /></span>
          <span className="sidebar-title">M&A Finanzas</span>
          <button className="sidebar-close" onClick={() => setSidebarOpen(false)}>
            <Icon name="close" size={18} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              className={`sidebar-link ${vista === item.id ? "activo" : ""}`}
              onClick={() => { setVista(item.id); setSidebarOpen(false); }}
            >
              <Icon name={item.icon} size={18} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          {perfilUsuario && (
            <div className="sidebar-perfil-chip">
              <Icon name="user" size={14} />
              <span>{perfilUsuario.nombres}</span>
            </div>
          )}
          {perfilActivo && (
            <div className="sidebar-perfil-chip sidebar-perfil-chip-activo">
              <PerfilAvatarVisual nombre={perfilActivo} avatarUrl={perfilActivoObj?.avatar_url} tamano={22} />
              <span>{perfilActivo}</span>
            </div>
          )}
          <button
            className="sidebar-link"
            onClick={() => { setForzarSelectorPerfil(true); setSidebarOpen(false); }}
          >
            <Icon name="users" size={18} />
            <span>Cambiar perfil</span>
          </button>
          <button className="sidebar-link sidebar-logout" onClick={cerrarSesion}>
            <Icon name="logout" size={18} />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>

      <div className="main-area">
        <header className="topbar">
          <button className="hamburger" onClick={() => setSidebarOpen(true)}>
            <Icon name="menu" size={22} />
          </button>

          <h1 className="topbar-title">{TITULOS_VISTA[vista] || "M&A Finanzas"}</h1>

          <div className="topbar-right">
            <div className="user-chip">
              <span className="user-avatar">
                {perfilUsuario?.avatar_url ? (
                  <img src={perfilUsuario.avatar_url} alt="Avatar" />
                ) : (
                  (perfilUsuario?.nombres || session.user.email || "?").charAt(0).toUpperCase()
                )}
              </span>
              <span className="user-email">{perfilUsuario?.nombres || session.user.email}</span>
            </div>
          </div>
        </header>

        <main className="content">
          {toast && (
            <div className={`toast toast-${toast.tipo}`}>
              {toast.mensaje}
            </div>
          )}

          {vista === "inicio" && (
            <div className="vista-inicio">
              <div className="dash-top-grid">
                <div className="card stat-card-saldo">
                  <div className="stat-card-icon"><Icon name="wallet" size={22} /></div>
                  <div className="stat-card-texto">
                    <span className="stat-label">
                      Ahorro disponible{perfilActivo ? ` · ${perfilActivo}` : ""}
                    </span>
                    <span className="stat-value">${ahorroTotal.toFixed(2)}</span>
                  </div>
                </div>

                <div className="card stat-card-mini ingreso">
                  <Icon name="arrow-up" size={18} />
                  <div>
                    <span className="stat-label">Ingresos del mes</span>
                    <span className="stat-value-sm">${ingresosMes.toFixed(2)}</span>
                  </div>
                </div>

                <div className="card stat-card-mini gasto">
                  <Icon name="arrow-down" size={18} />
                  <div>
                    <span className="stat-label">Gastos del mes</span>
                    <span className="stat-value-sm">${gastosMes.toFixed(2)}</span>
                  </div>
                </div>

                <div className="card stat-card-mini balance">
                  <Icon name="chart" size={18} />
                  <div>
                    <span className="stat-label">Balance del mes</span>
                    <span className="stat-value-sm">${balanceMes.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="card">
                <h3><Icon name="bell" size={17} /> Próximos Recordatorios</h3>
                {proximosRecordatorios.length === 0 ? (
                  <p className="hint-text">No tienes recordatorios próximos.</p>
                ) : (
                  <ul className="ultimos-lista">
                    {proximosRecordatorios.map(r => (
                      <li key={r.id} className="ultimo-item">
                        <div className="ultimo-info">
                          <span className="ultimo-nombre">{r.nombre}</span>
                          <span className="ultimo-fecha">{r.fecha} · {r.hora}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}

          {vista === "movimientos" && (
            <div className="vista-movimientos">
              <div className="card" ref={formRef}>
                <h3>{editId ? "Editar movimiento" : "Nuevo movimiento"}</h3>

                <div className="field">
                  <label>Descripción</label>
                  <input
                    placeholder="Ej. Pago de arriendo"
                    value={inputName}
                    onChange={e => setInputName(e.target.value)}
                  />
                </div>

                <div className="form-row two-col">
                  <div className="field">
                    <label>Valor</label>
                    <input
                      type="number"
                      placeholder="+ ingreso / - gasto"
                      value={inputValue}
                      onChange={e => setInputValue(e.target.value)}
                    />
                  </div>
                  <div className="field">
                    <label>Fecha</label>
                    <input
                      type="date"
                      value={inputDate}
                      onChange={e => setInputDate(e.target.value)}
                    />
                  </div>
                </div>

                <button className="btn btn-primary" onClick={handleSubmit}>
                  {editId ? "Actualizar" : "Guardar"}
                </button>
              </div>

              <div className="card">
                <h3>Gastos / Deudas</h3>

                <div className="form-row two-col">
                  <div className="field">
                    <label>Nombre del gasto</label>
                    <input
                      placeholder="Ej. Internet, Netflix..."
                      value={newGastoName}
                      onChange={e => setNewGastoName(e.target.value)}
                    />
                  </div>
                  <div className="field">
                    <label>Monto</label>
                    <input
                      type="number"
                      placeholder="Ej. 25.00"
                      value={newGastoMonto}
                      onChange={e => setNewGastoMonto(e.target.value)}
                    />
                  </div>
                </div>

                <button className="btn btn-success" onClick={addGasto}>
                  <Icon name="plus" size={16} /> Agregar gasto
                </button>

                {gastos.length > 0 && (
                  <div className="table-wrapper">
                    <table>
                      <thead>
                        <tr>
                          <th>Fecha</th>
                          <th>Gasto</th>
                          <th>Monto</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {gastos.map(g => (
                          <tr key={g.id}>
                            <td>{g.fecha?.slice(0, 10)}</td>
                            <td>{g.nombre}</td>
                            <td>${g.monto}</td>
                            <td className="acciones-cell">
                              <button className="icon-btn danger" onClick={() => removeGasto(g.id)}>
                                <Icon name="trash" size={16} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="card">
                <div className="card-header-row">
                  <h3>Registros</h3>
                  <div className="registros-herramientas">
                    <div className="search-input-wrapper">
                      <Icon name="search" size={15} />
                      <input
                        placeholder="Buscar en registros..."
                        value={busqueda}
                        onChange={e => setBusqueda(e.target.value)}
                      />
                    </div>
                    <button className="btn btn-primary" onClick={exportarExcel}>
                      <Icon name="download" size={16} /> Exportar Excel
                    </button>
                  </div>
                </div>

                <div className="tabla-scroll" ref={tablaScrollRef}>
                  <table>
                    <thead>
                      <tr>
                        <th>Fecha</th>
                        <th>Detalle</th>
                        <th>Valor</th>
                        <th>Saldo</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {registrosFiltrados.map(r => (
                        <tr key={r.id}>
                          <td>{r.fecha}</td>
                          <td>{r.nombre}</td>
                          <td className={Number(r.valor) < 0 ? "valor-negativo" : "valor-positivo"}>
                            ${r.valor}
                          </td>
                          <td>${r.saldo}</td>
                          <td className="acciones-cell">
                            <button className="icon-btn" onClick={() => editarMovimiento(r)}>
                              <Icon name="edit" size={16} />
                            </button>
                            <button className="icon-btn danger" onClick={() => eliminarMovimiento(r.id)}>
                              <Icon name="trash" size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {vista === "resumen" && (
            <div className="vista-resumen">
              <div className="card">
                <div className="card-header-row">
                  <h3>Resumen mensual</h3>
                  <input
                    type="month"
                    value={mesSeleccionado}
                    onChange={e => setMesSeleccionado(e.target.value)}
                  />
                </div>

                <div className="resumen-stats">
                  <div className="resumen-stat ingreso">
                    <span className="resumen-label">Ingresos</span>
                    <span className="resumen-valor">${ingresosMes.toFixed(2)}</span>
                  </div>
                  <div className="resumen-stat gasto">
                    <span className="resumen-label">Gastos</span>
                    <span className="resumen-valor">${gastosMes.toFixed(2)}</span>
                  </div>
                  <div className="resumen-stat balance">
                    <span className="resumen-label">Balance del mes</span>
                    <span className="resumen-valor">${balanceMes.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {vista === "recordatorios" && (
            <div className="vista-recordatorios">
              <div className="card" ref={recordatorioFormRef}>
                <h3>{editRecordatorioId ? "Editar recordatorio" : "Nuevo recordatorio"}</h3>

                <div className="field">
                  <label>Nombre del recordatorio</label>
                  <input
                    placeholder="Ej. Pagar tarjeta de crédito"
                    value={nombreRecordatorio}
                    onChange={e => setNombreRecordatorio(e.target.value)}
                  />
                </div>

                <div className="field">
                  <label>Descripción (opcional)</label>
                  <input
                    placeholder="Detalles adicionales"
                    value={descripcionRecordatorio}
                    onChange={e => setDescripcionRecordatorio(e.target.value)}
                  />
                </div>

                <div className="form-row two-col">
                  <div className="field">
                    <label>Fecha</label>
                    <input
                      type="date"
                      value={fechaRecordatorio}
                      onChange={e => setFechaRecordatorio(e.target.value)}
                    />
                  </div>
                  <div className="field">
                    <label>Hora</label>
                    <input
                      type="time"
                      value={horaRecordatorio}
                      onChange={e => setHoraRecordatorio(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-row two-col">
                  <div className="field">
                    <label>Repetición</label>
                    <select
                      value={repeticionRecordatorio}
                      onChange={e => setRepeticionRecordatorio(e.target.value)}
                    >
                      <option value="No repetir">No repetir</option>
                      <option value="Diario">Diario</option>
                      <option value="Semanal">Semanal</option>
                      <option value="Mensual">Mensual</option>
                      <option value="Anual">Anual</option>
                    </select>
                  </div>

                  {repeticionRecordatorio !== "No repetir" && (
                    <div className="field">
                      <label>Cantidad de repeticiones</label>
                      <input
                        type="number"
                        placeholder="Ej. 12"
                        value={cantidadRepeticiones}
                        onChange={e => setCantidadRepeticiones(e.target.value)}
                      />
                    </div>
                  )}
                </div>

                <button className="btn btn-primary" onClick={handleSubmitRecordatorio}>
                  {editRecordatorioId ? "Actualizar" : "Guardar"}
                </button>
              </div>

              <div className="card">
                <h3>Recordatorios</h3>

                {recordatorios.length === 0 ? (
                  <p className="hint-text">Aún no tienes recordatorios registrados.</p>
                ) : (
                  <div className="table-wrapper">
                    <table>
                      <thead>
                        <tr>
                          <th>Nombre</th>
                          <th>Fecha</th>
                          <th>Hora</th>
                          <th>Repetición</th>
                          <th>Estado</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {recordatorios.map(r => (
                          <tr key={r.id}>
                            <td>{r.nombre}</td>
                            <td>{r.fecha}</td>
                            <td>{r.hora}</td>
                            <td>{r.repeticion}</td>
                            <td>
                              <span className={r.completado ? "estado-completado" : "estado-pendiente"}>
                                {r.completado ? "Completado" : "Pendiente"}
                              </span>
                            </td>
                            <td className="acciones-cell">
                              {!r.completado && (
                                <button
                                  className="icon-btn"
                                  title="Marcar como completado"
                                  onClick={() => marcarComoCompletado(r.id)}
                                >
                                  <Icon name="check" size={16} />
                                </button>
                              )}
                              <button className="icon-btn" onClick={() => editarRecordatorio(r)}>
                                <Icon name="edit" size={16} />
                              </button>
                              <button className="icon-btn danger" onClick={() => eliminarRecordatorio(r.id)}>
                                <Icon name="trash" size={16} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {vista === "perfiles" && (
            <div className="vista-perfiles">
              <div className="card">
                <h3>Perfiles</h3>
                <p className="hint-text">
                  Administra todos los perfiles de esta cuenta: crea, edita el nombre o la foto,
                  y elimina los que ya no necesites. Este es el único lugar para hacerlo.
                </p>

                {perfiles.length === 0 && (
                  <p className="hint-text">Crea tu primer perfil para empezar.</p>
                )}

                <div className="perfiles-lista-admin">
                  {perfiles.map(p => (
                    <div key={p.id} className="perfil-admin-card">
                      {perfilEditandoId === p.id ? (
                        <div className="perfil-admin-editando">
                          <SelectorAvatarPerfil
                            nombre={perfilEditandoNombre}
                            seleccion={nuevoPerfilAvatar}
                            onSeleccionar={setNuevoPerfilAvatar}
                            avatarActual={p.avatar_url}
                          />
                          <div className="field">
                            <label>Nombre del perfil</label>
                            <input
                              autoFocus
                              value={perfilEditandoNombre}
                              onChange={e => setPerfilEditandoNombre(e.target.value)}
                              onKeyDown={e => {
                                if (e.key === "Enter") editarPerfil(p.nombre, perfilEditandoNombre, nuevoPerfilAvatar);
                                if (e.key === "Escape") { setPerfilEditandoId(null); setNuevoPerfilAvatar(null); }
                              }}
                            />
                          </div>
                          <div className="perfil-admin-editando-acciones">
                            <button
                              className="btn btn-primary"
                              disabled={guardandoPerfilModulo}
                              onClick={() => editarPerfil(p.nombre, perfilEditandoNombre, nuevoPerfilAvatar)}
                            >
                              <Icon name="check" size={15} /> {guardandoPerfilModulo ? "Guardando..." : "Guardar"}
                            </button>
                            <button
                              className="btn btn-secondary"
                              disabled={guardandoPerfilModulo}
                              onClick={() => { setPerfilEditandoId(null); setNuevoPerfilAvatar(null); }}
                            >
                              Cancelar
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <PerfilAvatarVisual nombre={p.nombre} avatarUrl={p.avatar_url} tamano={56} />
                          <div className="perfil-admin-info">
                            <span className="perfil-admin-nombre">
                              {p.nombre}
                              {p.nombre === perfilActivo && <span className="perfil-admin-badge">Activo</span>}
                            </span>
                            <span className="perfil-admin-fecha">
                              Creado el {formatearFechaCreacionPerfil(p.created_at)}
                            </span>
                          </div>
                          <div className="perfil-admin-acciones">
                            <button
                              className="icon-btn"
                              title="Editar perfil"
                              onClick={() => {
                                setPerfilEditandoId(p.id);
                                setPerfilEditandoNombre(p.nombre);
                                setNuevoPerfilAvatar(null);
                              }}
                            >
                              <Icon name="edit" size={15} />
                            </button>
                            <button
                              className="icon-btn danger"
                              title="Eliminar perfil"
                              onClick={() => setPerfilAEliminar(p)}
                            >
                              <Icon name="trash" size={15} />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>

                {creandoPerfilModulo ? (
                  <div className="perfil-admin-crear-panel">
                    <SelectorAvatarPerfil
                      nombre={nuevoPerfilNombre}
                      seleccion={nuevoPerfilAvatar}
                      onSeleccionar={setNuevoPerfilAvatar}
                    />
                    <div className="perfil-nuevo-row">
                      <input
                        placeholder="Nombre del nuevo perfil (ej. Persona 2)"
                        value={nuevoPerfilNombre}
                        autoFocus
                        onChange={e => setNuevoPerfilNombre(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && crearPerfil()}
                      />
                      <button className="btn btn-primary" onClick={crearPerfil} disabled={guardandoPerfilModulo}>
                        <Icon name="plus" size={16} /> {guardandoPerfilModulo ? "Creando..." : "Crear"}
                      </button>
                      <button
                        className="btn btn-secondary"
                        disabled={guardandoPerfilModulo}
                        onClick={() => { setCreandoPerfilModulo(false); setNuevoPerfilAvatar(null); setNuevoPerfilNombre(""); }}
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <button className="btn btn-primary perfil-admin-crear-btn" onClick={() => setCreandoPerfilModulo(true)}>
                    <Icon name="plus" size={16} /> Crear nuevo perfil
                  </button>
                )}
              </div>
            </div>
          )}

          {perfilAEliminar && (
            <div className="modal-overlay" onClick={() => !eliminandoPerfilId && setPerfilAEliminar(null)}>
              <div className="modal-card modal-perfil-eliminar" onClick={e => e.stopPropagation()}>
                <div className="modal-icono-alerta">
                  <Icon name="alert-triangle" size={22} />
                </div>
                <h3>Eliminar perfil "{perfilAEliminar.nombre}"</h3>
                <p className="hint-text">
                  Esta acción es permanente y también eliminará <strong>todos los datos asociados</strong> a
                  este perfil: ingresos, gastos, metas, recordatorios y cualquier otra información guardada
                  bajo este perfil, incluida su foto o avatar.
                </p>
                <div className="modal-acciones">
                  <button
                    className="btn btn-secondary"
                    disabled={!!eliminandoPerfilId}
                    onClick={() => setPerfilAEliminar(null)}
                  >
                    Cancelar
                  </button>
                  <button
                    className="btn btn-danger"
                    disabled={!!eliminandoPerfilId}
                    onClick={() => eliminarPerfilDefinitivo(perfilAEliminar)}
                  >
                    <Icon name="trash" size={15} /> {eliminandoPerfilId ? "Eliminando..." : "Eliminar todo"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {vista === "respaldos" && (
            <div className="vista-respaldos">
              <div className="card">
                <h3>Respaldo de información</h3>
                <p className="hint-text">
                  Guarda una copia de tus datos o restáurala desde un archivo.
                </p>

                <div className="respaldo-botones">
                  <button className="btn-respaldo btn-bajar" onClick={descargarRespaldoConfirmado}>
                    <Icon name="download" size={22} />
                    <span>Bajar respaldo</span>
                  </button>

                  <button className="btn-respaldo btn-subir" onClick={subirRespaldoConfirmado}>
                    <Icon name="upload" size={22} />
                    <span>Subir respaldo</span>
                  </button>

                  <button className="btn-respaldo btn-restaurar" onClick={restaurarTodoConfirmado}>
                    <Icon name="restore" size={22} />
                    <span>Restaurar todo</span>
                  </button>
                </div>

                <input
                  type="file"
                  accept=".json"
                  ref={fileInputRef}
                  onChange={subirRespaldo}
                  style={{ display: "none" }}
                />
              </div>
            </div>
          )}

          {vista === "configuracion" && (
            <div className="vista-configuracion">

              {/* ======================= CUENTA ======================= */}
              <div>
                <p className="settings-categoria-titulo">Cuenta</p>
                <div className="card">
                  <div className="avatar-picker">
                    <div className="avatar-grande">
                      {avatarPreview ? (
                        <img src={avatarPreview.url} alt="Vista previa" />
                      ) : perfilUsuario?.avatar_url ? (
                        <img src={perfilUsuario.avatar_url} alt="Avatar" />
                      ) : (
                        (perfilUsuario?.nombres || "?").charAt(0).toUpperCase()
                      )}
                    </div>

                    <div className="avatar-picker-acciones">
                      {avatarPreview ? (
                        <>
                          <button className="btn btn-primary" onClick={confirmarSubidaAvatar} disabled={subiendoAvatar}>
                            <Icon name="check" size={14} /> {subiendoAvatar ? "Subiendo..." : "Guardar foto"}
                          </button>
                          <button className="btn btn-secondary" onClick={cancelarSubidaAvatar} disabled={subiendoAvatar}>
                            Cancelar
                          </button>
                        </>
                      ) : (
                        <button className="btn btn-secondary" onClick={() => avatarInputRef.current.click()}>
                          <Icon name="camera" size={14} /> Cambiar foto
                        </button>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        ref={avatarInputRef}
                        onChange={seleccionarArchivoAvatar}
                        style={{ display: "none" }}
                      />
                    </div>
                  </div>

                  <div className="settings-lista">
                    <div className="settings-item">
                      <span className="settings-item-icono"><Icon name="user" size={17} /></span>
                      <div className="settings-item-texto">
                        <span className="settings-item-titulo">Nombre</span>
                        {editandoNombre ? (
                          <input
                            style={{ marginTop: 6 }}
                            value={nombreCuentaInput}
                            onChange={e => setNombreCuentaInput(e.target.value)}
                            onKeyDown={e => e.key === "Enter" && guardarNombreCuenta()}
                            autoFocus
                          />
                        ) : (
                          <span className="settings-item-subtitulo">{perfilUsuario?.nombres || "—"}</span>
                        )}
                      </div>
                      <div className="settings-item-control">
                        {editandoNombre ? (
                          <button className="btn btn-primary" style={{ padding: "8px 14px", fontSize: 13 }} onClick={guardarNombreCuenta} disabled={guardandoNombre}>
                            {guardandoNombre ? "..." : "Guardar"}
                          </button>
                        ) : (
                          <button className="icon-btn" onClick={() => setEditandoNombre(true)}>
                            <Icon name="edit" size={16} />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="settings-item">
                      <span className="settings-item-icono"><Icon name="lock" size={17} /></span>
                      <div className="settings-item-texto">
                        <span className="settings-item-titulo">Contraseña</span>
                        <span className="settings-item-subtitulo">Actualiza tu contraseña de acceso</span>
                      </div>
                      <button className="link-btn" onClick={() => setMostrarFormPassword(v => !v)}>
                        {mostrarFormPassword ? "Cerrar" : "Cambiar"}
                      </button>
                    </div>

                    {mostrarFormPassword && (
                      <div style={{ padding: "4px 4px 14px" }}>
                        <div className="field">
                          <label>Contraseña actual</label>
                          <input type="password" value={passwordActual} onChange={e => setPasswordActual(e.target.value)} />
                        </div>
                        <div className="form-row two-col">
                          <div className="field">
                            <label>Nueva contraseña</label>
                            <input type="password" value={passwordNueva} onChange={e => setPasswordNueva(e.target.value)} />
                          </div>
                          <div className="field">
                            <label>Confirmar</label>
                            <input type="password" value={passwordConfirmar} onChange={e => setPasswordConfirmar(e.target.value)} />
                          </div>
                        </div>
                        <button className="btn btn-primary" onClick={cambiarContrasenaCuenta} disabled={cambiandoPassword}>
                          {cambiandoPassword ? "Actualizando..." : "Actualizar contraseña"}
                        </button>
                      </div>
                    )}

                    <div className="settings-item">
                      <span className="settings-item-icono"><Icon name="logout" size={17} /></span>
                      <div className="settings-item-texto">
                        <span className="settings-item-titulo">Cerrar sesión</span>
                        <span className="settings-item-subtitulo">{session.user.email}</span>
                      </div>
                      <button className="btn btn-secondary" onClick={cerrarSesion}>Salir</button>
                    </div>
                  </div>
                </div>

                {/* ---- Zona peligrosa: eliminar cuenta ---- */}
                <div className="card danger-zone" style={{ marginTop: 14 }}>
                  <h3 style={{ color: "var(--danger)" }}><Icon name="alert-triangle" size={17} /> Eliminar cuenta</h3>
                  <p>
                    Esta acción es <strong>irreversible</strong>. Se eliminarán tu perfil, tus movimientos,
                    gastos, recordatorios y tu foto de perfil.
                  </p>

                  {!mostrarEliminarCuenta ? (
                    <button className="btn btn-danger" onClick={() => setMostrarEliminarCuenta(true)}>
                      <Icon name="trash" size={16} /> Eliminar mi cuenta
                    </button>
                  ) : (
                    <>
                      <div className="field">
                        <label>Escribe ELIMINAR para confirmar</label>
                        <input value={confirmarEliminarTexto} onChange={e => setConfirmarEliminarTexto(e.target.value)} placeholder="ELIMINAR" />
                      </div>
                      <div style={{ display: "flex", gap: 10 }}>
                        <button
                          className="btn btn-danger"
                          onClick={eliminarCuentaDefinitivamente}
                          disabled={eliminandoCuenta || confirmarEliminarTexto !== "ELIMINAR"}
                        >
                          {eliminandoCuenta ? "Eliminando..." : "Confirmar eliminación"}
                        </button>
                        <button className="btn btn-secondary" onClick={() => { setMostrarEliminarCuenta(false); setConfirmarEliminarTexto(""); }}>
                          Cancelar
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* ======================= APARIENCIA ======================= */}
              <div>
                <p className="settings-categoria-titulo">Apariencia</p>
                <div className="card">
                  <h3>Tema</h3>
                  <p className="hint-text" style={{ marginTop: -8 }}>
                    "Sistema" sigue automáticamente el tema de tu dispositivo.
                  </p>
                  <div className="segmented-control">
                    <button className={tema === "claro" ? "activo" : ""} onClick={() => cambiarTema("claro")}>
                      <Icon name="sun" size={14} /> Claro
                    </button>
                    <button className={tema === "oscuro" ? "activo" : ""} onClick={() => cambiarTema("oscuro")}>
                      <Icon name="moon" size={14} /> Oscuro
                    </button>
                    <button className={tema === "sistema" ? "activo" : ""} onClick={() => cambiarTema("sistema")}>
                      <Icon name="monitor" size={14} /> Sistema
                    </button>
                  </div>
                </div>
              </div>

              {/* ======================= NOTIFICACIONES ======================= */}
              <div>
                <p className="settings-categoria-titulo">Notificaciones</p>
                <div className="card">
                  <div className="settings-lista">
                    <div className="settings-item">
                      <span className="settings-item-icono"><Icon name="bell" size={17} /></span>
                      <div className="settings-item-texto">
                        <span className="settings-item-titulo">Activar notificaciones</span>
                        <span className="settings-item-subtitulo">Avisos de recordatorios como alarma</span>
                      </div>
                      <label className="switch">
                        <input
                          type="checkbox"
                          checked={notifConfig.activadas}
                          onChange={e => actualizarNotifConfig({ activadas: e.target.checked })}
                        />
                        <span className="switch-track"></span>
                      </label>
                    </div>

                    <div className="settings-item">
                      <span className="settings-item-icono"><Icon name="zap" size={17} /></span>
                      <div className="settings-item-texto">
                        <span className="settings-item-titulo">Sonido</span>
                      </div>
                      <label className="switch">
                        <input
                          type="checkbox"
                          checked={notifConfig.sonido}
                          disabled={!notifConfig.activadas}
                          onChange={e => actualizarNotifConfig({ sonido: e.target.checked })}
                        />
                        <span className="switch-track"></span>
                      </label>
                    </div>

                    <div className="settings-item">
                      <span className="settings-item-icono"><Icon name="sliders" size={17} /></span>
                      <div className="settings-item-texto">
                        <span className="settings-item-titulo">Vibración</span>
                      </div>
                      <label className="switch">
                        <input
                          type="checkbox"
                          checked={notifConfig.vibracion}
                          disabled={!notifConfig.activadas}
                          onChange={e => actualizarNotifConfig({ vibracion: e.target.checked })}
                        />
                        <span className="switch-track"></span>
                      </label>
                    </div>
                  </div>

                  <p className="hint-text" style={{ marginTop: 14, marginBottom: 8 }}>Tiempo de anticipación</p>
                  <div className="chips-row">
                    {OPCIONES_ANTICIPACION.map(op => (
                      <button
                        key={op.valor}
                        className={`chip ${Number(notifConfig.anticipacionMin) === op.valor ? "activo" : ""}`}
                        disabled={!notifConfig.activadas}
                        onClick={() => actualizarNotifConfig({ anticipacionMin: op.valor })}
                      >
                        {op.etiqueta}
                      </button>
                    ))}
                  </div>

                  {!window.NotificacionesService.estaDisponible() && (
                    <p className="hint-text" style={{ marginTop: 12 }}>
                      Este dispositivo o navegador no soporta notificaciones locales.
                    </p>
                  )}
                </div>
              </div>

              {/* ======================= ACERCA DE ======================= */}
              <div>
                <p className="settings-categoria-titulo">Acerca de</p>
                <div className="card">
                  <div className="about-header">
                    <span className="about-logo"><img src="./assets/icon-192.png" alt="M&A Finanzas" /></span>
                    <div>
                      <div className="about-nombre">M&A Finanzas</div>
                      <div className="about-version">Versión 2.0.0</div>
                    </div>
                  </div>

                  <p style={{ marginTop: 14 }}>
                    M&A Finanzas es una aplicación diseñada para administrar ingresos, gastos,
                    ahorro y recordatorios de forma sencilla, rápida y segura. Permite mantener un mejor
                    control de las finanzas personales mediante sincronización con Supabase y una interfaz
                    moderna e intuitiva.
                  </p>

                  <div className="status-lista">
                    <div className="status-fila">
                      <span>React</span>
                      <span className="status-badge"><span className="status-dot ok"></span>Cargado</span>
                    </div>
                    <div className="status-fila">
                      <span>Supabase</span>
                      <span className="status-badge">
                        <span className={`status-dot ${session ? "ok" : "error"}`}></span>
                        {session ? "Conectado" : "Sin sesión"}
                      </span>
                    </div>
                    <div className="status-fila">
                      <span>Notificaciones</span>
                      <span className="status-badge">
                        <span className={`status-dot ${window.NotificacionesService.estaDisponible() ? "ok" : "error"}`}></span>
                        {window.NotificacionesService.estaDisponible() ? "Disponibles" : "No disponibles"}
                      </span>
                    </div>
                    <div className="status-fila">
                      <span>Desarrollador</span>
                      <span style={{ fontWeight: 650 }}>Mauro Ochoa</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>

        <nav className="bottom-nav">
          {BOTTOM_NAV_ITEMS.map(item => (
            <button
              key={item.id}
              className={`bottom-nav-item ${vista === item.id ? "activo" : ""}`}
              onClick={() => setVista(item.id)}
            >
              <Icon name={item.icon} size={20} />
              <span>{item.label}</span>
              <span className="bottom-nav-dot"></span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
