import { useEffect, useState } from "react";
import "./styles.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const demoCredentials = {
  email: "admin@assetflow.local",
  password: "password123",
};

const navItems = [
  "Dashboard",
  "Organization Setup",
  "Assets",
  "Allocation & Transfer",
  "Resource Booking",
  "Maintenance",
  "Audit",
  "Reports",
  "Notifications",
];

function App() {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({
    name: "",
    email: demoCredentials.email,
    password: demoCredentials.password,
  });
  const [authState, setAuthState] = useState({
    loading: false,
    error: "",
    user: null,
  });
  const [session, setSession] = useState(null);

  const isSignup = mode === "signup";

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function submitAuth(event) {
    event.preventDefault();
    setAuthState({ loading: true, error: "", user: null });

    const endpoint = isSignup ? "/api/auth/signup" : "/api/auth/login";
    const payload = isSignup
      ? { name: form.name, email: form.email, password: form.password }
      : { email: form.email, password: form.password };

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || "Authentication failed");
      }

      setSession({ user: data.user, token: data.token });
      setAuthState({ loading: false, error: "", user: data.user });
    } catch (error) {
      setAuthState({
        loading: false,
        error: error.message,
        user: null,
      });
    }
  }

  if (session) {
    return <DashboardShell session={session} onLogout={() => setSession(null)} />;
  }

  return (
    <main className="auth-page">
      <section className="auth-panel" aria-labelledby="auth-title">
        <header className="panel-title">
          <h1 id="auth-title">AssetFlow - {isSignup ? "signup" : "login"}</h1>
        </header>

        <div className="brand-mark" aria-hidden="true">
          AF
        </div>

        <form className="auth-form" onSubmit={submitAuth}>
          {isSignup && (
            <label>
              Name
              <input
                name="name"
                value={form.name}
                onChange={updateField}
                placeholder="Priya Shah"
                autoComplete="name"
                required
              />
            </label>
          )}

          <label>
            Email
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={updateField}
              placeholder="name@company.com"
              autoComplete="email"
              required
            />
          </label>

          <label>
            Password
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={updateField}
              placeholder="********"
              autoComplete={isSignup ? "new-password" : "current-password"}
              required
              minLength={8}
            />
          </label>

          {!isSignup && (
            <button className="text-action" type="button">
              Forgot password
            </button>
          )}

          {authState.error && <p className="form-error">{authState.error}</p>}

          {authState.user && (
            <div className="success-card">
              <strong>{authState.user.name}</strong>
              <span>{authState.user.role}</span>
              {isSignup && <span>Signup created an Employee account.</span>}
            </div>
          )}

          <button className="primary-action" type="submit" disabled={authState.loading}>
            {authState.loading
              ? "Please wait..."
              : isSignup
                ? "Create Account"
                : "Login"}
          </button>
        </form>

        <footer className="auth-footer">
          <span>{isSignup ? "Already have an account?" : "New here?"}</span>
          <button
            className="secondary-action"
            type="button"
            onClick={() => {
              setMode(isSignup ? "login" : "signup");
              setAuthState({ loading: false, error: "", user: null });
            }}
          >
            {isSignup
              ? "Back to Login"
              : "Sign up creates an employee account admin roles assigned later"}
          </button>
        </footer>
      </section>
    </main>
  );
}

function DashboardShell({ session, onLogout }) {
  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function loadDashboard() {
      try {
        const response = await fetch(`${API_BASE_URL}/api/dashboard/summary`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.detail || "Unable to load dashboard");
        }

        if (!ignore) {
          setDashboard(data);
        }
      } catch (loadError) {
        if (!ignore) {
          setError(loadError.message);
        }
      }
    }

    loadDashboard();

    return () => {
      ignore = true;
    };
  }, []);

  const kpis = dashboard?.kpis ?? [];
  const activity = dashboard?.recent_activity ?? [];

  return (
    <main className="app-frame">
      <aside className="sidebar" aria-label="Main navigation">
        <div className="sidebar-brand">AssetFlow</div>
        <nav className="nav-list">
          {navItems.map((item) => (
            <button
              className={item === "Dashboard" ? "nav-item active" : "nav-item"}
              key={item}
              type="button"
            >
              {item}
            </button>
          ))}
        </nav>
      </aside>

      <section className="workspace" aria-labelledby="dashboard-title">
        <header className="workspace-header">
          <div>
            <p className="screen-kicker">Dashboard</p>
            <h1 id="dashboard-title">Today's Overview</h1>
          </div>
          <div className="user-chip">
            <span>{session.user.name}</span>
            <strong>{session.user.role}</strong>
            <button type="button" onClick={onLogout}>
              Logout
            </button>
          </div>
        </header>

        {error && <p className="form-error dashboard-error">{error}</p>}

        <section className="kpi-grid" aria-label="Dashboard KPIs">
          {kpis.map((card) => (
            <article className="kpi-card" key={card.label}>
              <span>{card.label}</span>
              <strong>{card.value}</strong>
            </article>
          ))}
        </section>

        <div className="alert-strip">
          {dashboard ? `${dashboard.overdue_returns} assets overdue for return - flagged for follow-up` : "Loading overdue returns..."}
        </div>

        <section className="quick-actions" aria-label="Quick actions">
          <button type="button">+ Register Asset</button>
          <button type="button">Book Resource</button>
          <button type="button">Raise Request</button>
        </section>

        <section className="recent-activity" aria-labelledby="recent-activity-title">
          <h2 id="recent-activity-title">Recent Activity</h2>
          <div className="activity-list">
            {activity.map((item) => (
              <article className="activity-item" key={`${item.message}-${item.meta}`}>
                <span>{item.message}</span>
                <small>{item.meta}</small>
              </article>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}

export default App;
