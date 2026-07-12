import { useState } from "react";
import "./styles.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const demoCredentials = {
  email: "admin@assetflow.local",
  password: "password123",
};

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

      setAuthState({ loading: false, error: "", user: data.user });
    } catch (error) {
      setAuthState({
        loading: false,
        error: error.message,
        user: null,
      });
    }
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

export default App;

