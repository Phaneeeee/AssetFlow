import React, { useEffect, useState } from "react";
import "./styles.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
const ORGANIZATION_NAME_STORAGE_KEY = "assetflow.organizationName";

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

function getStoredOrganizationName() {
  return localStorage.getItem(ORGANIZATION_NAME_STORAGE_KEY) || "";
}

function App() {
  const [mode, setMode] = useState("login");
  const [loginRole, setLoginRole] = useState("Admin");
  const [organizationName, setOrganizationName] = useState(getStoredOrganizationName);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    organizationName,
  });
  const [showPassword, setShowPassword] = useState(false);
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

      const roleMatchesLogin =
        isSignup ||
        (loginRole === "Admin" ? data.user.role === "Admin" : data.user.role !== "Admin");
      if (!roleMatchesLogin) {
        throw new Error(`Use the ${data.user.role === "Admin" ? "Admin" : "Employee"} login option for this account.`);
      }

      const nextOrganizationName =
        form.organizationName.trim() || organizationName || "Organization";

      if (isSignup && form.organizationName.trim()) {
        localStorage.setItem(ORGANIZATION_NAME_STORAGE_KEY, form.organizationName.trim());
        setOrganizationName(form.organizationName.trim());
      }

      setSession({
        user: data.user,
        token: data.token,
        organizationName: nextOrganizationName,
      });
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
          <div className="brand-mark" aria-hidden="true">
            AF
          </div>
          <div>
            <h1 id="auth-title">AssetFlow</h1>
            <p>
              {isSignup
                ? "Create the first organization account"
                : `${loginRole} login`}
            </p>
          </div>
        </header>

        {!isSignup && (
          <div className="login-role-tabs" aria-label="Choose login type">
            {["Admin", "Employee"].map((role) => (
              <button
                className={role === loginRole ? "login-role-tab active" : "login-role-tab"}
                key={role}
                onClick={() => setLoginRole(role)}
                type="button"
              >
                {role} Login
              </button>
            ))}
          </div>
        )}

        <form className="auth-form" onSubmit={submitAuth}>
          {isSignup && (
            <>
              <label>
                Organization name
                <input
                  name="organizationName"
                  value={form.organizationName}
                  onChange={updateField}
                  placeholder="Organization name"
                  autoComplete="organization"
                  required
                />
              </label>
              <label>
                Name
                <input
                  name="name"
                  value={form.name}
                  onChange={updateField}
                  placeholder="Full name"
                  autoComplete="name"
                  required
                />
              </label>
            </>
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
            <span className="password-field">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={updateField}
                placeholder="Enter your password"
                autoComplete={isSignup ? "new-password" : "current-password"}
                required
                minLength={8}
              />
              <button
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="password-toggle"
                type="button"
                onClick={() => setShowPassword((current) => !current)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </span>
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
              {isSignup && (
                <span>
                  {authState.user.role === "Admin"
                    ? "Organization admin account created."
                    : "Employee account created."}
                </span>
              )}
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
              setForm({
                name: "",
                email: "",
                password: "",
                organizationName: organizationName || "",
              });
              setShowPassword(false);
              setAuthState({ loading: false, error: "", user: null });
            }}
          >
            {isSignup
              ? "Back to Login"
              : "Create Organization Account"}
          </button>
        </footer>
      </section>
    </main>
  );
}

function AppShell({ session, onLogout }) {
  const [activeView, setActiveView] = useState("Dashboard");
  const isAdmin = session.user.role === "Admin";
  const organizationName = session.organizationName || "Organization";

  return (
    <main className="app-frame">
      <aside className="sidebar" aria-label="Main navigation">
        <div className="sidebar-brand">
          <strong>{organizationName}</strong>
          <span>AssetFlow</span>
        </div>
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
            <p className="organization-kicker">{organizationName}</p>
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

        {activeView === "Dashboard" && <DashboardHome onNavigate={setActiveView} />}
        {activeView === "Organization Setup" && (
          <OrganizationSetup isAdmin={isAdmin} />
        )}
        {activeView === "Assets" && <AssetDirectory />}
        {activeView === "Allocation & Transfer" && <AllocationTransfer />}
        {activeView === "Resource Booking" && <ResourceBooking />}
        {activeView === "Maintenance" && <MaintenanceManagement />}
        {activeView === "Audit" && <AssetAudit />}
        {activeView === "Reports" && <ReportsAnalytics />}
        {activeView === "Notifications" && <NotificationsLog />}
        {activeView !== "Dashboard" &&
          activeView !== "Organization Setup" &&
          activeView !== "Assets" &&
          activeView !== "Allocation & Transfer" &&
          activeView !== "Resource Booking" &&
          activeView !== "Maintenance" &&
          activeView !== "Audit" &&
          activeView !== "Reports" &&
          activeView !== "Notifications" && (
          <EmptyModule title={activeView} />
        )}
      </section>
    </main>
  );
}

function DashboardHome({ onNavigate }) {
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

  function getKpiTone(label) {
    const normalizedLabel = label.toLowerCase();
    if (normalizedLabel.includes("allocated")) return "allocated";
    if (normalizedLabel.includes("available")) return "available";
    if (normalizedLabel.includes("upcoming")) return "returns";
    if (normalizedLabel.includes("pending")) return "transfers";
    if (normalizedLabel.includes("maintenance")) return "maintenance";
    if (normalizedLabel.includes("booking")) return "bookings";
    return "default";
  }

  return (
    <>
      {error && <p className="form-error dashboard-error">{error}</p>}

      <section className="kpi-grid" aria-label="Dashboard KPIs">
        {kpis.map((card) => (
          <article className={`kpi-card kpi-card-${getKpiTone(card.label)}`} key={card.label}>
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
        <button type="button" onClick={() => onNavigate("Assets")}>
          + Register Asset
        </button>
        <button type="button" onClick={() => onNavigate("Resource Booking")}>
          Book Resource
        </button>
        <button type="button" onClick={() => onNavigate("Maintenance")}>
          Raise Request
        </button>
      </section>

      <section className="recent-activity" aria-labelledby="recent-activity-title">
        <h2 id="recent-activity-title">Recent Activity</h2>
        <div className="activity-list">
          {activity.length > 0 ? (
            activity.map((item) => (
              <article className="activity-item" key={`${item.message}-${item.meta}`}>
                <span>{item.message}</span>
                <small>{item.meta}</small>
              </article>
            ))
          ) : (
            <EmptyState message="No activity yet." />
          )}
        </div>
      </section>
    </>
  );
}

function MaintenanceManagement() {
  const [workspace, setWorkspace] = useState(null);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    asset_tag: "",
    asset_name: "",
    issue: "",
    priority: "High",
    raised_by: "",
  });

  useEffect(() => {
    let ignore = false;

    async function loadMaintenance() {
      try {
        const response = await fetch(`${API_BASE_URL}/api/maintenance`);
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.detail || "Unable to load maintenance board");
        }
        if (!ignore) {
          setWorkspace(data);
        }
      } catch (error) {
        if (!ignore) {
          setMessage(error.message);
        }
      }
    }

    loadMaintenance();

    return () => {
      ignore = true;
    };
  }, []);

  function updateForm(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function raiseMaintenanceRequest() {
    setMessage("");
    try {
      const response = await fetch(`${API_BASE_URL}/api/maintenance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || "Unable to raise maintenance request");
      }
      setWorkspace((current) => ({
        ...current,
        requests: [...(current?.requests ?? []), data],
      }));
      setMessage(`${data.asset_tag} maintenance request added to Pending.`);
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function moveRequest(request, status) {
    setMessage("");
    try {
      const response = await fetch(`${API_BASE_URL}/api/maintenance/${request.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          technician: request.technician,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || "Unable to update maintenance request");
      }
      setWorkspace((current) => ({
        ...current,
        requests: current.requests.map((item) => (item.id === data.id ? data : item)),
      }));
      setMessage(`${data.asset_tag} moved to ${data.status}.`);
    } catch (error) {
      setMessage(error.message);
    }
  }

  const statuses = workspace?.statuses ?? [
    "Pending",
    "Approved",
    "Technician Assigned",
    "In Progress",
    "Resolved",
  ];

  return (
    <section className="maintenance-module">
      <div className="maintenance-form">
        <input name="asset_tag" value={form.asset_tag} onChange={updateForm} placeholder="Asset tag" />
        <input name="asset_name" value={form.asset_name} onChange={updateForm} placeholder="Asset name" />
        <select name="priority" value={form.priority} onChange={updateForm}>
          {["Low", "Medium", "High", "Critical"].map((priority) => (
            <option key={priority}>{priority}</option>
          ))}
        </select>
        <input name="raised_by" value={form.raised_by} onChange={updateForm} placeholder="Raised by" />
        <input name="issue" value={form.issue} onChange={updateForm} placeholder="Issue summary" />
        <button type="button" onClick={raiseMaintenanceRequest}>
          Raise Request
        </button>
      </div>

      {message && <p className="inline-message">{message}</p>}

      <section className="kanban-board" aria-label="Maintenance workflow">
        {statuses
          .filter((status) => status !== "Rejected")
          .map((status) => (
            <div className="kanban-column" key={status}>
              <h2>{status}</h2>
              {(() => {
                const requests = (workspace?.requests ?? []).filter(
                  (request) => request.status === status,
                );
                return requests.length > 0 ? (
                  requests.map((request) => (
                  <article className="kanban-card" key={request.id}>
                    <strong>{request.asset_tag}</strong>
                    <span>{request.asset_name}</span>
                    <small>{request.issue}</small>
                    <em>{request.priority}</em>
                    {status !== "Resolved" && (
                      <button
                        type="button"
                        onClick={() => moveRequest(request, nextMaintenanceStatus(status))}
                      >
                        Move
                      </button>
                    )}
                  </article>
                  ))
                ) : (
                  <EmptyState message="No requests." />
                );
              })()}
            </div>
          ))}
      </section>
      <p className="setup-note">
        Approving a card moves the asset to Under Maintenance; resolving returns it to Available.
      </p>
    </section>
  );
}

function nextMaintenanceStatus(status) {
  const flow = {
    Pending: "Approved",
    Approved: "Technician Assigned",
    "Technician Assigned": "In Progress",
    "In Progress": "Resolved",
  };
  return flow[status] ?? "Resolved";
}

function AssetAudit() {
  const [workspace, setWorkspace] = useState(null);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    name: "",
    scope: "",
    date_range: "",
    auditors: "",
  });

  useEffect(() => {
    let ignore = false;

    async function loadAudit() {
      try {
        const response = await fetch(`${API_BASE_URL}/api/audits`);
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.detail || "Unable to load audits");
        }
        if (!ignore) {
          setWorkspace(data);
        }
      } catch (error) {
        if (!ignore) {
          setMessage(error.message);
        }
      }
    }

    loadAudit();

    return () => {
      ignore = true;
    };
  }, []);

  function updateAuditForm(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function createAuditCycle() {
    setMessage("");
    try {
      const response = await fetch(`${API_BASE_URL}/api/audits`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          auditors: form.auditors.split(",").map((auditor) => auditor.trim()).filter(Boolean),
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || "Unable to create audit cycle");
      }
      setWorkspace((current) => ({
        ...current,
        cycles: [...(current?.cycles ?? []), data],
      }));
      setMessage(`${data.name} created and ready for auditors.`);
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function closeAuditCycle(cycleId) {
    setMessage("");
    try {
      const response = await fetch(`${API_BASE_URL}/api/audits/${cycleId}/close`, {
        method: "PATCH",
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || "Unable to close audit cycle");
      }
      setWorkspace((current) => ({
        ...current,
        cycles: current.cycles.map((cycle) => (cycle.id === data.id ? data : cycle)),
      }));
      setMessage(`${data.name} closed. Flagged missing items can update asset statuses.`);
    } catch (error) {
      setMessage(error.message);
    }
  }

  const activeCycle = workspace?.cycles?.[0];

  return (
    <section className="audit-module">
      <div className="audit-form">
        <input name="name" value={form.name} onChange={updateAuditForm} placeholder="Cycle name" />
        <input name="scope" value={form.scope} onChange={updateAuditForm} placeholder="Scope" />
        <input name="date_range" value={form.date_range} onChange={updateAuditForm} placeholder="Date range" />
        <input name="auditors" value={form.auditors} onChange={updateAuditForm} placeholder="Auditors" />
        <button type="button" onClick={createAuditCycle}>
          Create Audit Cycle
        </button>
      </div>

      {message && <p className="inline-message">{message}</p>}

      {activeCycle ? (
        <>
          <section className="audit-summary">
            <strong>
              {activeCycle.name}: {activeCycle.scope} - {activeCycle.date_range}
            </strong>
            <span>Auditors: {activeCycle.auditors.join(", ")}</span>
            <em>{activeCycle.status}</em>
          </section>

          <div className="audit-table">
            <div className="audit-row audit-head">
              <span>Asset</span>
              <span>Expected Location</span>
              <span>Verification</span>
            </div>
            {activeCycle.assets.map((asset) => (
              <article className="audit-row" key={asset.asset_tag}>
                <span>
                  {asset.asset_tag} {asset.asset_name}
                </span>
                <span>{asset.expected_location}</span>
                <strong className={verificationClassName(asset.verification)}>
                  {asset.verification}
                </strong>
              </article>
            ))}
          </div>

          <div className="discrepancy-strip">
            {workspace.discrepancy_count} assets flagged - discrepancy report generated automatically
          </div>

          <button
            className="close-cycle"
            type="button"
            onClick={() => closeAuditCycle(activeCycle.id)}
          >
            Close Audit Cycle
          </button>
        </>
      ) : (
        <EmptyState message="No audit cycles yet." />
      )}
    </section>
  );
}

function verificationClassName(verification) {
  if (verification === "Verified") {
    return "status-pill active";
  }
  if (verification === "Missing") {
    return "status-pill danger";
  }
  return "status-pill warning";
}

function ReportsAnalytics() {
  const [reports, setReports] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let ignore = false;

    async function loadReports() {
      try {
        const response = await fetch(`${API_BASE_URL}/api/reports`);
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.detail || "Unable to load reports");
        }
        if (!ignore) {
          setReports(data);
        }
      } catch (error) {
        if (!ignore) {
          setMessage(error.message);
        }
      }
    }

    loadReports();

    return () => {
      ignore = true;
    };
  }, []);

  return (
    <section className="reports-module">
      {message && <p className="inline-message">{message}</p>}
      <div className="report-chart-grid">
        <BarChart title="Utilization by Department" points={reports?.utilization_by_department ?? []} />
        <LineChart title="Maintenance Frequency" points={reports?.maintenance_frequency ?? []} />
        <Heatmap title="Resource Booking Heatmap" points={reports?.booking_heatmap ?? []} />
      </div>

      <section className="insight-grid">
        <InsightList title="Most Used Assets" items={reports?.most_used_assets ?? []} />
        <InsightList title="Idle Assets" items={reports?.idle_assets ?? []} />
        <InsightList title="Due for Maintenance / Retirement" items={reports?.due_for_maintenance ?? []} />
      </section>

      <button className="export-button" type="button">
        Export Report
      </button>
    </section>
  );
}

function BarChart({ title, points }) {
  const max = Math.max(...points.map((point) => point.value), 1);

  return (
    <article className="report-card">
      <h2>{title}</h2>
      <div className="bar-chart">
        {points.length > 0 ? points.map((point) => (
          <div className="bar-item" key={point.label}>
            <span style={{ height: `${Math.max((point.value / max) * 100, 8)}%` }} />
            <small>{point.label}</small>
          </div>
        )) : <EmptyState message="No chart data yet." />}
      </div>
    </article>
  );
}

function LineChart({ title, points }) {
  const max = Math.max(...points.map((point) => point.value), 1);

  return (
    <article className="report-card">
      <h2>{title}</h2>
      <div className="line-chart">
        {points.length > 0 ? points.map((point, index) => (
          <span
            key={point.label}
            style={{
              left: `${(index / Math.max(points.length - 1, 1)) * 100}%`,
              bottom: `${8 + (point.value / max) * 84}%`,
            }}
            title={`${point.label}: ${point.value}`}
          />
        )) : <EmptyState message="No chart data yet." />}
      </div>
    </article>
  );
}

function Heatmap({ title, points }) {
  const max = Math.max(...points.map((point) => point.value), 1);

  return (
    <article className="report-card">
      <h2>{title}</h2>
      <div className="heatmap">
        {points.length > 0 ? points.map((point) => (
          <div
            key={point.label}
            style={{ opacity: 0.25 + (point.value / max) * 0.75 }}
          >
            <strong>{point.label}</strong>
            <span>{point.value}</span>
          </div>
        )) : <EmptyState message="No booking data yet." />}
      </div>
    </article>
  );
}

function InsightList({ title, items }) {
  return (
    <article className="insight-card">
      <h2>{title}</h2>
      {items.length > 0 ? items.map((item) => (
        <p key={item.title}>
          <strong>{item.title}</strong>
          <span>{item.detail}</span>
        </p>
      )) : <EmptyState message="No insights yet." />}
    </article>
  );
}

function NotificationsLog() {
  const [workspace, setWorkspace] = useState(null);
  const [message, setMessage] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  useEffect(() => {
    let ignore = false;

    async function loadNotifications() {
      try {
        const response = await fetch(`${API_BASE_URL}/api/notifications`);
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.detail || "Unable to load notifications");
        }
        if (!ignore) {
          setWorkspace(data);
        }
      } catch (error) {
        if (!ignore) {
          setMessage(error.message);
        }
      }
    }

    loadNotifications();

    return () => {
      ignore = true;
    };
  }, []);

  const filters = ["All", "Alerts", "Approvals", "Bookings"];
  const notifications = (workspace?.notifications ?? []).filter((item) => {
    if (activeFilter === "All") {
      return true;
    }
    if (activeFilter === "Alerts") {
      return item.type === "Alert";
    }
    if (activeFilter === "Approvals") {
      return item.type === "Approval";
    }
    return item.type === "Booking";
  });

  return (
    <section className="notifications-module">
      {message && <p className="inline-message">{message}</p>}
      <div className="notification-tabs" role="tablist" aria-label="Notification filters">
        {filters.map((filter) => (
          <button
            className={filter === activeFilter ? "notification-tab active" : "notification-tab"}
            key={filter}
            onClick={() => setActiveFilter(filter)}
            type="button"
          >
            {filter}
          </button>
        ))}
      </div>

      <div className="notification-list">
        {notifications.length > 0 ? notifications.map((item) => (
          <article className="notification-row" key={item.id}>
            <span />
            <strong>{item.message}</strong>
            <small>{item.age}</small>
          </article>
        )) : <EmptyState message="No notifications yet." />}
      </div>

      <section className="activity-log-panel">
        <h2>Activity Log</h2>
        {(workspace?.activity_log ?? []).length > 0 ? (
          (workspace?.activity_log ?? []).map((entry) => (
            <article key={entry.id}>
              <strong>{entry.actor}</strong>
              <span>
                {entry.action} - {entry.target}
              </span>
              <small>{entry.timestamp}</small>
            </article>
          ))
        ) : (
          <EmptyState message="No activity log entries yet." />
        )}
      </section>
    </section>
  );
}

function AllocationTransfer() {
  const [workspace, setWorkspace] = useState(null);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    asset_tag: "",
    holder: "",
    holder_type: "Employee",
    department: "",
    expected_return_date: "",
    reason: "",
  });

  useEffect(() => {
    let ignore = false;

    async function loadAllocations() {
      try {
        const response = await fetch(`${API_BASE_URL}/api/allocations`);
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.detail || "Unable to load allocations");
        }
        if (!ignore) {
          setWorkspace(data);
        }
      } catch (error) {
        if (!ignore) {
          setMessage(error.message);
        }
      }
    }

    loadAllocations();

    return () => {
      ignore = true;
    };
  }, []);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function allocateAsset() {
    setMessage("");
    try {
      const response = await fetch(`${API_BASE_URL}/api/allocations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          asset_tag: form.asset_tag,
          holder: form.holder,
          holder_type: form.holder_type,
          department: form.department,
          expected_return_date: form.expected_return_date || null,
        }),
      });
      const data = await response.json();

      if (response.status === 409) {
        setMessage(
          `${data.detail.message} Currently held by ${data.detail.current_holder}.`,
        );
        return;
      }

      if (!response.ok) {
        throw new Error(data.detail || "Unable to allocate asset");
      }

      setWorkspace((current) => ({
        ...current,
        allocations: [...(current?.allocations ?? []), data],
      }));
      setMessage(`${data.asset_tag} allocated to ${data.holder}.`);
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function requestTransfer() {
    setMessage("");
    try {
      const response = await fetch(`${API_BASE_URL}/api/allocations/transfer-requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          asset_tag: form.asset_tag,
          to_holder: form.holder,
          reason: form.reason,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Unable to request transfer");
      }

      setWorkspace((current) => ({
        ...current,
        transfer_requests: [...(current?.transfer_requests ?? []), data],
      }));
      setMessage(`Transfer request created for ${data.asset_tag}.`);
    } catch (error) {
      setMessage(error.message);
    }
  }

  return (
    <section className="allocation-module">
      <div className="conflict-panel">
        <label>
          Asset
          <input name="asset_tag" value={form.asset_tag} onChange={updateField} placeholder="Asset tag" />
        </label>
        <div className="conflict-alert">
          Allocation conflicts will appear here after an asset is selected.
        </div>
      </div>

      <section className="transfer-card" aria-label="Transfer request">
        <label>
          From
          <input value="Current holder appears after allocation" readOnly />
        </label>
        <label>
          To
          <input name="holder" value={form.holder} onChange={updateField} placeholder="Employee or holder" />
        </label>
        <label>
          Department
          <input name="department" value={form.department} onChange={updateField} placeholder="Department" />
        </label>
        <label>
          Expected return
          <input
            name="expected_return_date"
            type="date"
            value={form.expected_return_date}
            onChange={updateField}
          />
        </label>
        <label className="wide-field">
          Reason
          <textarea name="reason" value={form.reason} onChange={updateField} placeholder="Reason for allocation or transfer" />
        </label>
        <div className="button-row">
          <button type="button" onClick={allocateAsset}>
            Try Allocate
          </button>
          <button type="button" onClick={requestTransfer}>
            Submit Request
          </button>
        </div>
      </section>

      {message && <p className="inline-message">{message}</p>}

      <section className="split-lists">
        <div>
          <h2>Allocation History</h2>
          <div className="mini-list">
            {(workspace?.allocations ?? []).length > 0 ? (
              (workspace?.allocations ?? []).map((allocation) => (
                <article key={allocation.id}>
                  <strong>{allocation.asset_tag}</strong>
                  <span>
                    {allocation.asset_name} allocated to {allocation.holder}
                  </span>
                  <small>{allocation.status}</small>
                </article>
              ))
            ) : (
              <EmptyState message="No allocations yet." />
            )}
          </div>
        </div>
        <div>
          <h2>Transfer Requests</h2>
          <div className="mini-list">
            {(workspace?.transfer_requests ?? []).length > 0 ? (
              (workspace?.transfer_requests ?? []).map((request) => (
                <article key={request.id}>
                  <strong>{request.asset_tag}</strong>
                  <span>
                    {request.from_holder} to {request.to_holder}
                  </span>
                  <small>{request.status}</small>
                </article>
              ))
            ) : (
              <EmptyState message="No transfer requests yet." />
            )}
          </div>
        </div>
      </section>
    </section>
  );
}

function ResourceBooking() {
  const [workspace, setWorkspace] = useState(null);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    resource_name: "",
    booked_by: "",
    start_time: "",
    end_time: "",
    note: "",
  });

  useEffect(() => {
    let ignore = false;

    async function loadBookings() {
      try {
        const response = await fetch(`${API_BASE_URL}/api/bookings`);
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.detail || "Unable to load bookings");
        }
        if (!ignore) {
          setWorkspace(data);
        }
      } catch (error) {
        if (!ignore) {
          setMessage(error.message);
        }
      }
    }

    loadBookings();

    return () => {
      ignore = true;
    };
  }, []);

  function updateBooking(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function bookSlot() {
    setMessage("");
    try {
      const response = await fetch(`${API_BASE_URL}/api/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();

      if (response.status === 409) {
        setMessage(
          `${data.detail.message}: ${formatTime(data.detail.conflicting_booking.start_time)} to ${formatTime(data.detail.conflicting_booking.end_time)} is unavailable.`,
        );
        return;
      }

      if (!response.ok) {
        throw new Error(data.detail || "Unable to book resource");
      }

      setWorkspace((current) => ({
        ...current,
        bookings: [...(current?.bookings ?? []), data],
      }));
      setMessage(`Booking confirmed for ${data.resource_name}.`);
    } catch (error) {
      setMessage(error.message);
    }
  }

  const bookings = workspace?.bookings ?? [];

  return (
    <section className="booking-module">
      <div className="booking-form">
        <label>
          Resource
          {(workspace?.resources ?? []).length > 0 ? (
            <select name="resource_name" value={form.resource_name} onChange={updateBooking}>
              <option value="">Select resource</option>
              {(workspace?.resources ?? []).map((resource) => (
                <option key={resource}>{resource}</option>
              ))}
            </select>
          ) : (
            <input
              name="resource_name"
              value={form.resource_name}
              onChange={updateBooking}
              placeholder="Resource name"
            />
          )}
        </label>
        <label>
          Booked by
          <input name="booked_by" value={form.booked_by} onChange={updateBooking} placeholder="Booked by" />
        </label>
        <label>
          Start
          <input
            name="start_time"
            type="datetime-local"
            value={form.start_time}
            onChange={updateBooking}
          />
        </label>
        <label>
          End
          <input
            name="end_time"
            type="datetime-local"
            value={form.end_time}
            onChange={updateBooking}
          />
        </label>
        <label className="wide-field">
          Note
          <input name="note" value={form.note} onChange={updateBooking} placeholder="Optional note" />
        </label>
        <button type="button" onClick={bookSlot}>
          Book a Slot
        </button>
      </div>

      {message && <p className="inline-message">{message}</p>}

      <section className="timeline" aria-label="Resource bookings">
        {bookings.length > 0 ? (
          bookings.map((booking) => (
            <article
              className={booking.status === "Cancelled" ? "time-block cancelled" : "time-block"}
              key={booking.id}
            >
              <span>
                {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
              </span>
              <strong>{booking.resource_name}</strong>
              <small>
                {booking.status} by {booking.booked_by}
              </small>
            </article>
          ))
        ) : (
          <EmptyState message="No resource bookings yet." />
        )}
      </section>
    </section>
  );
}

function formatTime(value) {
  return new Date(value).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function AssetDirectory() {
  const [directory, setDirectory] = useState(null);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    query: "",
    category: "All",
    status: "All",
    department: "All",
  });
  const [form, setForm] = useState({
    name: "",
    category: "",
    serial_number: "",
    acquisition_date: "",
    acquisition_cost: "",
    condition: "Good",
    location: "",
    department: "",
    shared_bookable: false,
  });

  useEffect(() => {
    let ignore = false;

    async function loadAssets() {
      try {
        const response = await fetch(`${API_BASE_URL}/api/assets`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.detail || "Unable to load assets");
        }

        if (!ignore) {
          setDirectory(data);
        }
      } catch (assetError) {
        if (!ignore) {
          setError(assetError.message);
        }
      }
    }

    loadAssets();

    return () => {
      ignore = true;
    };
  }, []);

  const assets = directory?.assets ?? [];
  const categories = uniqueValues(assets.map((asset) => asset.category));
  const departments = uniqueValues(assets.map((asset) => asset.department).filter(Boolean));

  const visibleAssets = assets.filter((asset) => {
    const query = filters.query.trim().toLowerCase();
    const matchesQuery =
      !query ||
      [asset.tag, asset.name, asset.serial_number, asset.location]
        .join(" ")
        .toLowerCase()
        .includes(query);

    return (
      matchesQuery &&
      (filters.category === "All" || asset.category === filters.category) &&
      (filters.status === "All" || asset.status === filters.status) &&
      (filters.department === "All" || asset.department === filters.department)
    );
  });

  function updateFilter(event) {
    const { name, value } = event.target;
    setFilters((current) => ({ ...current, [name]: value }));
  }

  function updateAssetForm(event) {
    const { checked, name, type, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function registerAsset(event) {
    event.preventDefault();
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/assets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          acquisition_cost: Number(form.acquisition_cost),
          department: form.department || null,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Unable to register asset");
      }

      setDirectory((current) => ({
        ...current,
        assets: [...(current?.assets ?? []), data],
      }));
      setForm((current) => ({
        ...current,
        name: "",
        serial_number: "",
        acquisition_cost: "",
        location: "",
        department: "",
        shared_bookable: false,
      }));
    } catch (registerError) {
      setError(registerError.message);
    }
  }

  return (
    <section className="asset-module">
      {error && <p className="form-error dashboard-error">{error}</p>}

      <div className="asset-toolbar">
        <input
          name="query"
          value={filters.query}
          onChange={updateFilter}
          placeholder="Search by tag, serial, or QR code..."
          aria-label="Search assets"
        />
        <select name="category" value={filters.category} onChange={updateFilter}>
          <option>All</option>
          {categories.map((category) => (
            <option key={category}>{category}</option>
          ))}
        </select>
        <select name="status" value={filters.status} onChange={updateFilter}>
          <option>All</option>
          {(directory?.statuses ?? []).map((status) => (
            <option key={status}>{status}</option>
          ))}
        </select>
        <select name="department" value={filters.department} onChange={updateFilter}>
          <option>All</option>
          {departments.map((department) => (
            <option key={department}>{department}</option>
          ))}
        </select>
        <button type="button" onClick={registerAsset}>
          + Register Asset
        </button>
      </div>

      <section className="register-panel" aria-label="Register asset">
        <input
          name="name"
          value={form.name}
          onChange={updateAssetForm}
          placeholder="Asset name"
          required
        />
        <select name="category" value={form.category} onChange={updateAssetForm}>
          <option value="">Select category</option>
          {["Electronics", "Furniture", "Vehicles"].map((category) => (
            <option key={category}>{category}</option>
          ))}
        </select>
        <input
          name="serial_number"
          value={form.serial_number}
          onChange={updateAssetForm}
          placeholder="Serial number"
          required
        />
        <input
          name="acquisition_date"
          type="date"
          value={form.acquisition_date}
          onChange={updateAssetForm}
          required
        />
        <input
          name="acquisition_cost"
          type="number"
          min="0"
          value={form.acquisition_cost}
          onChange={updateAssetForm}
          placeholder="Acquisition cost"
          required
        />
        <select name="condition" value={form.condition} onChange={updateAssetForm}>
          {["Excellent", "Good", "Fair", "Needs Repair"].map((condition) => (
            <option key={condition}>{condition}</option>
          ))}
        </select>
        <input
          name="location"
          value={form.location}
          onChange={updateAssetForm}
          placeholder="Location"
          required
        />
        <input
          name="department"
          value={form.department}
          onChange={updateAssetForm}
          placeholder="Department optional"
        />
        <label className="checkbox-field">
          <input
            name="shared_bookable"
            type="checkbox"
            checked={form.shared_bookable}
            onChange={updateAssetForm}
          />
          Shared/bookable
        </label>
      </section>

      <div className="asset-table">
        <div className="asset-row asset-head">
          <span>Tag</span>
          <span>Name</span>
          <span>Category</span>
          <span>Status</span>
          <span>Location</span>
          <span>History</span>
        </div>
        {visibleAssets.length > 0 ? (
          visibleAssets.map((asset) => (
            <article className="asset-row" key={asset.tag}>
              <span>{asset.tag}</span>
              <span>
                {asset.name}
                {asset.shared_bookable && <small>Bookable</small>}
              </span>
              <span>{asset.category}</span>
              <span>
                <strong className={statusClassName(asset.status)}>{asset.status}</strong>
              </span>
              <span>{asset.location}</span>
              <span>{asset.history?.[0]?.detail ?? "No history yet"}</span>
            </article>
          ))
        ) : (
          <EmptyState message="No assets registered yet." />
        )}
      </div>
    </section>
  );
}

function uniqueValues(values) {
  return [...new Set(values)].sort();
}

function statusClassName(status) {
  if (status === "Available") {
    return "status-pill active";
  }
  if (status === "Under Maintenance") {
    return "status-pill warning";
  }
  return "status-pill";
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
      {rows.length > 0 ? (
        rows.map((row) => (
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
        ))
      ) : (
        <EmptyState message="No records yet." />
      )}
    </div>
  );
}

function EmptyState({ message }) {
  return <p className="empty-state">{message}</p>;
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
