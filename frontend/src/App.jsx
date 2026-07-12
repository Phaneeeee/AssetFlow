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
        {activeView === "Assets" && <AssetDirectory />}
        {activeView === "Allocation & Transfer" && <AllocationTransfer />}
        {activeView === "Resource Booking" && <ResourceBooking />}
        {activeView !== "Dashboard" &&
          activeView !== "Organization Setup" &&
          activeView !== "Assets" &&
          activeView !== "Allocation & Transfer" &&
          activeView !== "Resource Booking" && (
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

function AllocationTransfer() {
  const [workspace, setWorkspace] = useState(null);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    asset_tag: "AF-0012",
    holder: "Raj Mehta",
    holder_type: "Employee",
    department: "Engineering",
    expected_return_date: "2026-07-30",
    reason: "Needs asset for upcoming client demo",
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
          <input name="asset_tag" value={form.asset_tag} onChange={updateField} />
        </label>
        <div className="conflict-alert">
          Already allocated to Priya Shah (Engineering). Direct re-allocation is blocked.
        </div>
      </div>

      <section className="transfer-card" aria-label="Transfer request">
        <label>
          From
          <input value="Priya Shah" readOnly />
        </label>
        <label>
          To
          <input name="holder" value={form.holder} onChange={updateField} />
        </label>
        <label>
          Department
          <input name="department" value={form.department} onChange={updateField} />
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
          <textarea name="reason" value={form.reason} onChange={updateField} />
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
            {(workspace?.allocations ?? []).map((allocation) => (
              <article key={allocation.id}>
                <strong>{allocation.asset_tag}</strong>
                <span>
                  {allocation.asset_name} allocated to {allocation.holder}
                </span>
                <small>{allocation.status}</small>
              </article>
            ))}
          </div>
        </div>
        <div>
          <h2>Transfer Requests</h2>
          <div className="mini-list">
            {(workspace?.transfer_requests ?? []).map((request) => (
              <article key={request.id}>
                <strong>{request.asset_tag}</strong>
                <span>
                  {request.from_holder} to {request.to_holder}
                </span>
                <small>{request.status}</small>
              </article>
            ))}
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
    resource_name: "Conference Room B2",
    booked_by: "Raj Mehta",
    start_time: "2026-07-12T09:30",
    end_time: "2026-07-12T10:30",
    note: "Planning session",
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
          <select name="resource_name" value={form.resource_name} onChange={updateBooking}>
            {(workspace?.resources ?? ["Conference Room B2"]).map((resource) => (
              <option key={resource}>{resource}</option>
            ))}
          </select>
        </label>
        <label>
          Booked by
          <input name="booked_by" value={form.booked_by} onChange={updateBooking} />
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
          <input name="note" value={form.note} onChange={updateBooking} />
        </label>
        <button type="button" onClick={bookSlot}>
          Book a Slot
        </button>
      </div>

      {message && <p className="inline-message">{message}</p>}

      <section className="timeline" aria-label="Resource bookings">
        {bookings.map((booking) => (
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
        ))}
        <div className="blocked-slot">
          Requested 9:30 to 10:30 conflicts with the existing room booking.
        </div>
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
    category: "Electronics",
    serial_number: "",
    acquisition_date: "2026-07-12",
    acquisition_cost: "0",
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
        acquisition_cost: "0",
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
        {visibleAssets.map((asset) => (
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
        ))}
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
