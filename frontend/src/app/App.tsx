import { useState, useEffect, useRef, useCallback } from "react";
import { Clock, LogIn, LogOut, CheckCircle2, AlertCircle, Timer, User, RotateCcw, Briefcase, X, Loader2 } from "lucide-react";
import { workSessionService } from "../services/workSessionService";

// ─── Types ───────────────────────────────────────────────────────────────────

type AppState = "idle" | "active" | "completed";

interface ShiftRecord {
  workerCode: string;
  workerName: string;
  startTime: Date;
  endTime?: Date;
  totalSeconds?: number;
}

interface AlertMessage {
  id: number;
  type: "error" | "warning";
  message: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatTime(date: Date) {
  return date.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

function formatDuration(seconds: number) {
  const h = Math.floor(seconds / 3600).toString().padStart(2, "0");
  const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${h}:${m}:${s}`;
}

function formatDurationReadable(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const parts = [];
  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}m`);
  parts.push(`${s}s`);
  return parts.join(" ");
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Alert({ alert, onDismiss }: { alert: AlertMessage; onDismiss: (id: number) => void }) {
  return (
    <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-red-50 border border-red-200 shadow-sm animate-in">
      <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={18} />
      <p className="text-sm text-red-700 flex-1 font-medium">{alert.message}</p>
      <button
        onClick={() => onDismiss(alert.id)}
        className="text-red-400 hover:text-red-600 transition-colors shrink-0"
      >
        <X size={16} />
      </button>
    </div>
  );
}

function Badge({ variant }: { variant: "active" | "completed" | "idle" }) {
  const config = {
    active: { label: "Jornada activa", cls: "bg-emerald-100 text-emerald-700 border-emerald-200" },
    completed: { label: "Jornada completada", cls: "bg-blue-100 text-blue-700 border-blue-200" },
    idle: { label: "Sin jornada activa", cls: "bg-gray-100 text-gray-500 border-gray-200" },
  }[variant];

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${config.cls}`}>
      <span className={`size-1.5 rounded-full ${variant === "active" ? "bg-emerald-500 animate-pulse" : variant === "completed" ? "bg-blue-500" : "bg-gray-400"}`} />
      {config.label}
    </span>
  );
}

// ─── Screens ──────────────────────────────────────────────────────────────────

function IdleScreen({
  code,
  setCode,
  onStart,
  alerts,
  dismissAlert,
  isLoading,
}: {
  code: string;
  setCode: (v: string) => void;
  onStart: () => void;
  alerts: AlertMessage[];
  dismissAlert: (id: number) => void;
  isLoading: boolean;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-center">
        <Badge variant="idle" />
      </div>

      {alerts.length > 0 && (
        <div className="flex flex-col gap-2">
          {alerts.map((a) => <Alert key={a.id} alert={a} onDismiss={dismissAlert} />)}
        </div>
      )}

      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-foreground/70 uppercase tracking-wider" htmlFor="worker-code">
          Código de trabajador
        </label>
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
            <User size={18} />
          </div>
          <input
            id="worker-code"
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === "Enter" && onStart()}
            placeholder="Ejemplo: EMP001"
            maxLength={10}
            className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-border bg-input-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all font-mono text-base tracking-widest"
          />
        </div>
      </div>

      <button
        onClick={onStart}
        disabled={!code.trim() || isLoading}
        className="flex items-center justify-center gap-2 w-full py-4 rounded-xl bg-primary text-primary-foreground font-semibold text-base shadow-md hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {isLoading ? <Loader2 size={20} className="animate-spin" /> : <LogIn size={20} />}
        {isLoading ? "Iniciando..." : "Iniciar Jornada"}
      </button>

      <p className="text-center text-sm text-muted-foreground leading-relaxed">
        Tu jornada quedará registrada con hora de entrada, hora de salida y tiempo total laborado.
      </p>
    </div>
  );
}

function ActiveScreen({
  shift,
  elapsed,
  onEnd,
  alerts,
  dismissAlert,
  isLoading,
}: {
  shift: ShiftRecord;
  elapsed: number;
  onEnd: () => void;
  alerts: AlertMessage[];
  dismissAlert: (id: number) => void;
  isLoading: boolean;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-center">
        <Badge variant="active" />
      </div>

      {alerts.length > 0 && (
        <div className="flex flex-col gap-2">
          {alerts.map((a) => <Alert key={a.id} alert={a} onDismiss={dismissAlert} />)}
        </div>
      )}

      <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-secondary border border-border">
        <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <User size={20} className="text-primary" />
        </div>
        <div>
          <p className="font-semibold text-foreground">{shift.workerName}</p>
          <p className="text-sm text-muted-foreground font-mono">{shift.workerCode}</p>
        </div>
      </div>

      <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-input-background border border-border">
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <Clock size={16} />
          <span>Hora de entrada</span>
        </div>
        <span className="font-semibold font-mono text-foreground">{formatTime(shift.startTime)}</span>
      </div>

      <div className="flex flex-col items-center gap-2 py-6 px-4 rounded-2xl bg-primary/5 border border-primary/15">
        <div className="flex items-center gap-2 text-muted-foreground text-xs font-semibold uppercase tracking-widest mb-1">
          <Timer size={14} />
          Tiempo transcurrido
        </div>
        <span className="text-6xl font-mono font-semibold text-primary tracking-tight tabular-nums">
          {formatDuration(elapsed)}
        </span>
        <p className="text-xs text-muted-foreground mt-1">Tu tiempo laborado se está registrando en tiempo real</p>
      </div>

      <button
        onClick={onEnd}
        disabled={isLoading}
        className="flex items-center justify-center gap-2 w-full py-4 rounded-xl bg-red-500 text-white font-semibold text-base shadow-md hover:bg-red-600 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {isLoading ? <Loader2 size={20} className="animate-spin" /> : <LogOut size={20} />}
        {isLoading ? "Terminando..." : "Terminar Jornada"}
      </button>
    </div>
  );
}

function CompletedScreen({
  shift,
  onReset,
}: {
  shift: ShiftRecord;
  onReset: () => void;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-center">
        <Badge variant="completed" />
      </div>

      <div className="flex justify-center">
        <div className="size-16 rounded-full bg-emerald-100 flex items-center justify-center">
          <CheckCircle2 size={36} className="text-emerald-600" />
        </div>
      </div>

      <div className="rounded-2xl border border-border overflow-hidden">
        <div className="px-5 py-4 bg-primary text-primary-foreground">
          <p className="text-sm font-semibold opacity-70 uppercase tracking-wider mb-0.5">Trabajador</p>
          <p className="text-xl font-bold">{shift.workerName}</p>
          <p className="text-sm font-mono opacity-60">{shift.workerCode}</p>
        </div>
        <div className="divide-y divide-border">
          <SummaryRow icon={<LogIn size={15} />} label="Hora de entrada" value={formatTime(shift.startTime)} />
          <SummaryRow icon={<LogOut size={15} />} label="Hora de salida" value={formatTime(shift.endTime!)} />
          <div className="px-5 py-4 flex items-center justify-between bg-emerald-50">
            <div className="flex items-center gap-2 text-emerald-700">
              <Timer size={15} />
              <span className="text-sm font-semibold">Tiempo total laborado</span>
            </div>
            <span className="font-mono font-bold text-emerald-700">{formatDurationReadable(shift.totalSeconds!)}</span>
          </div>
        </div>
      </div>

      <button
        onClick={onReset}
        className="flex items-center justify-center gap-2 w-full py-4 rounded-xl bg-secondary text-secondary-foreground font-semibold text-base border border-border hover:bg-muted active:scale-[0.98] transition-all"
      >
        <RotateCcw size={18} />
        Registrar otra jornada
      </button>
    </div>
  );
}

function SummaryRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="px-5 py-4 flex items-center justify-between">
      <div className="flex items-center gap-2 text-muted-foreground">
        {icon}
        <span className="text-sm">{label}</span>
      </div>
      <span className="font-mono font-semibold text-foreground">{value}</span>
    </div>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [appState, setAppState] = useState<AppState>("idle");
  const [code, setCode] = useState("");
  const [shift, setShift] = useState<ShiftRecord | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [alerts, setAlerts] = useState<AlertMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const alertIdRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const addAlert = useCallback((message: string) => {
    const id = ++alertIdRef.current;
    setAlerts((prev) => [...prev, { id, type: "error", message }]);
    setTimeout(() => setAlerts((prev) => prev.filter((a) => a.id !== id)), 6000);
  }, []);

  const dismissAlert = useCallback((id: number) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  }, []);

  // Restaurar sesión activa si existe
  useEffect(() => {
    const checkActiveSession = async () => {
      const savedCode = localStorage.getItem('workerCode');
      if (!savedCode) return;
      
      try {
        const session = await workSessionService.getActiveSession(savedCode);
        if (session) {
          const start = new Date(session.startTime);
          setShift({
            workerCode: session.worker.code,
            workerName: session.worker.name,
            startTime: start,
          });
          setCode(session.worker.code);
          setElapsed(Math.floor((new Date().getTime() - start.getTime()) / 1000));
          setAppState("active");
        } else {
          localStorage.removeItem('workerCode');
        }
      } catch (error: any) {
        console.error("Error comprobando sesión activa:", error);
      }
    };
    
    checkActiveSession();
  }, []);

  // Timer
  useEffect(() => {
    if (appState === "active") {
      timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [appState]);

  const handleStart = async () => {
    const trimmed = code.trim().toUpperCase();

    if (!trimmed) {
      addAlert("Por favor, ingresa tu código de trabajador.");
      return;
    }

    setIsLoading(true);
    setAlerts([]);
    
    try {
      const session = await workSessionService.startSession(trimmed);
      
      setShift({
        workerCode: session.worker.code,
        workerName: session.worker.name,
        startTime: new Date(session.startTime),
      });
      setElapsed(0);
      setAppState("active");
      localStorage.setItem('workerCode', trimmed);
    } catch (error: any) {
      addAlert(error.message || "Error al iniciar la jornada");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnd = async () => {
    if (!shift) return;
    
    setIsLoading(true);
    try {
      const session = await workSessionService.endSession(shift.workerCode);
      
      setShift({
        ...shift,
        endTime: new Date(session.endTime!),
        totalSeconds: session.totalSeconds!,
      });
      setAppState("completed");
      localStorage.removeItem('workerCode');
    } catch (error: any) {
      addAlert(error.message || "Error al terminar la jornada");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setShift(null);
    setCode("");
    setElapsed(0);
    setAlerts([]);
    setAppState("idle");
  };

  return (
    <div
      className="min-h-screen bg-background flex flex-col"
      style={{ fontFamily: "'Outfit', 'Inter', sans-serif" }}
    >
      <header className="bg-primary shadow-sm">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-lg bg-white/15 flex items-center justify-center">
              <Briefcase size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-white font-bold text-lg leading-tight">Jornada Laboral</h1>
              <p className="text-white/50 text-xs">Control de asistencia</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20">
            <Clock size={13} className="text-white/60" />
            <LiveClock />
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <div className="mb-5 text-center">
            <h2 className="text-2xl font-bold text-foreground">Registro de Jornada Laboral</h2>
            <p className="text-muted-foreground text-sm mt-1 leading-relaxed">
              Ingresa tu código de trabajador para iniciar o finalizar tu jornada
            </p>
          </div>

          <div className="flex items-center justify-center gap-2 mb-6">
            {(["idle", "active", "completed"] as AppState[]).map((s, i) => {
              const labels = ["Inicio", "En curso", "Finalizada"];
              const isActive = appState === s;
              const isPast = ["idle", "active", "completed"].indexOf(appState) > i;
              return (
                <div key={s} className="flex items-center gap-2">
                  {i > 0 && <div className={`h-px w-8 ${isPast || isActive ? "bg-primary" : "bg-border"} transition-colors`} />}
                  <div className={`flex items-center gap-1.5 text-xs font-semibold transition-colors ${isActive ? "text-primary" : isPast ? "text-primary/60" : "text-muted-foreground"}`}>
                    <span className={`size-5 rounded-full flex items-center justify-center text-xs ${isActive ? "bg-primary text-white" : isPast ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"} transition-colors`}>
                      {i + 1}
                    </span>
                    <span className="hidden sm:inline">{labels[i]}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-card rounded-2xl shadow-lg border border-border p-6 sm:p-8">
            {appState === "idle" && (
              <IdleScreen
                code={code}
                setCode={setCode}
                onStart={handleStart}
                alerts={alerts}
                dismissAlert={dismissAlert}
                isLoading={isLoading}
              />
            )}
            {appState === "active" && shift && (
              <ActiveScreen
                shift={shift}
                elapsed={elapsed}
                onEnd={handleEnd}
                alerts={alerts}
                dismissAlert={dismissAlert}
                isLoading={isLoading}
              />
            )}
            {appState === "completed" && shift && (
              <CompletedScreen shift={shift} onReset={handleReset} />
            )}
          </div>

          <p className="text-center text-xs text-muted-foreground mt-5">
            Códigos de prueba: EMP001, EMP002, EMP003, EMP004, EMP005
          </p>
        </div>
      </main>

      <footer className="py-4 border-t border-border">
        <p className="text-center text-xs text-muted-foreground">
          Jornada Laboral App &mdash; Sistema de control de asistencia &copy; {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
}

function LiveClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <span className="text-white/80 text-xs font-mono tabular-nums">
      {now.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
    </span>
  );
}
