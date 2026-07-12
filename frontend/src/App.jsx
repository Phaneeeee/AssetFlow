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
    return <AppShell session={session} onLogout={() => setSession(null)} />;
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

function AppShell({ session, onLogout }) {
  const [activeView, setActiveView] = useState("Dashboard");
  const isAdmin = session.user.role === "Admin";

  return (
    <main className="app-frame">
      <aside className="sidebar" aria-label="Main navigation">
        <div className="sidebar-brand">AssetFlow</div>
        <nav className="nav-list">
          {navItems.map((item) => (
            <button
              className={item === activeView ? "nav-item active" : "nav-item"}
              key={item}
              onClick={() => setActiveView(item)}
              type="button"
            >
              {item}
            </button>
          ))}
        </nav>
      </aside>

      <section className="workspace" aria-labelledby="workspace-title">
        <header className="workspace-header">
          <div>
            <p className="screen-kicker">{activeView}</p>
            <h1 id="workspace-title">
              {activeView === "Dashboard" ? "Today's Overview" : activeView}
            </h1>
          </div>
          <div className="user-chip">
            <span>{session.user.name}</span>
            <strong>{session.user.role}</strong>
            <button type="button" onClick={onLogout}>
              Logout
            </button>
          </div>
        </header>

        {activeView === "Dashboard" && <DashboardHome />}
        {activeView === "Organization Setup" && (
          <OrganizationSetup isAdmin={isAdmin} />
        )}
        {activeView !== "Dashboard" && activeView !== "Organization Setup" && (
          <EmptyModule title={activeView} />
        )}
      </section>
    </main>
  );
}

function DashboardHome() {
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
    <>
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
        {dashboard
          ? `${dashboard.overdue_returns} assets overdue for return - flagged for follow-up`
          : "Loading overdue returns..."}
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
    </>
  );
}

function OrganizationSetup({ isAdmin }) {
  const [activeTab, setActiveTab] = useState("Departments");
  const [setup, setSetup] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function loadSetup() {
      try {
        const response = await fetch(`${API_BASE_URL}/api/organization/setup`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.detail || "Unable to load organization setup");
        }

        if (!ignore) {
          setSetup(data);
        }
      } catch (setupError) {
        if (!ignore) {
          setError(setupError.message);
        }
      }
    }

    loadSetup();

    return () => {
      ignore = true;
    };
  }, []);

  if (!isAdmin) {
    return (
      <section className="empty-module">
        <h2>Admin access required</h2>
        <p>Only Admin users can manage departments, categories, and role assignments.</p>
      </section>
    );
  }

  return (
    <section className="setup-module">
      <div className="setup-tabs" role="tablist" aria-label="Organization setup tabs">
        {["Departments", "Categories", "Employees"].map((tab) => (
          <button
            className={tab === activeTab ? "setup-tab active" : "setup-tab"}
            key={tab}
            onClick={() => setActiveTab(tab)}
            role="tab"
            type="button"
          >
            {tab}
          </button>
        ))}
        <button className="setup-add" type="button">
          + Add
        </button>
      </div>

      {error && <p className="form-error dashboard-error">{error}</p>}

      {activeTab === "Departments" && (
        <DataTable
          columns={["Department", "Head", "Parent Dept", "Status"]}
          rows={(setup?.departments ?? []).map((department) => [
            department.name,
            department.head ?? "-",
            department.parent_department ?? "-",
            department.status,
          ])}
          statusColumn={3}
        />
      )}

      {activeTab === "Categories" && (
        <DataTable
          columns={["Category", "Optional Field", "Status"]}
          rows={(setup?.categories ?? []).map((category) => [
            category.name,
            category.field ?? "-",
            category.status,
          ])}
          statusColumn={2}
        />
      )}

      {activeTab === "Employees" && (
        <DataTable
          columns={["Name", "Email", "Department", "Role", "Status"]}
          rows={(setup?.employees ?? []).map((employee) => [
            employee.name,
            employee.email,
            employee.department,
            employee.role,
            employee.status,
          ])}
          statusColumn={4}
        />
      )}

      <p className="setup-note">
        Editing a department here also drives picklists used by Assets and Allocation screens.
      </p>
    </section>
  );
}

function DataTable({ columns, rows, statusColumn }) {
  return (
    <div className="data-table" role="table">
      <div className="table-row table-head" role="row">
        {columns.map((column) => (
          <span key={column} role="columnheader">
            {column}
          </span>
        ))}
      </div>
      {rows.map((row) => (
        <div className="table-row" key={row.join("-")} role="row">
          {row.map((cell, index) => (
            <span key={`${cell}-${index}`} role="cell">
              {index === statusColumn ? (
                <strong className={cell === "Active" ? "status-pill active" : "status-pill"}>
                  {cell}
                </strong>
              ) : (
                cell
              )}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}

function EmptyModule({ title }) {
  return (
    <section className="empty-module">
      <h2>{title}</h2>
      <p>This module will be built in a later feature slice.</p>
    </section>
  );
}

export default App;
