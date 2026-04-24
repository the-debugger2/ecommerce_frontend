import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { AuthContext } from "../context/AuthContext";

   
// ─── Login Sub-component ───────────────────────────────────────────────────
const LoginForm = ({ onSwitch }) => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submitHandler = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data } = await API.post("/auth/login", { email, password });
      login(data);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form-wrapper">
      <div className="auth-header">
        <span className="auth-label">Welcome back</span>
        <h1 className="auth-title">Sign In</h1>
      </div>

      {error && <div className="auth-error">{error}</div>}

      <form className="auth-form" onSubmit={submitHandler}>
        <div className="field-group">
          <label className="field-label" htmlFor="login-email">Email</label>
          <input
            id="login-email"
            className="field-input"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="field-group">
          <label className="field-label" htmlFor="login-password">Password</label>
          <input
            id="login-password"
            className="field-input"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button className="auth-btn" type="submit" disabled={loading}>
          {loading ? <span className="btn-spinner" /> : "Sign In"}
        </button>
      </form>

      <p className="auth-switch">
        Don't have an account?{" "}
        <button className="switch-link" onClick={onSwitch}>
          Register
        </button>
      </p>
    </div>
  );
};

// ─── Register Sub-component ────────────────────────────────────────────────
const RegisterForm = ({ onSwitch }) => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submitHandler = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const { data } = await API.post("/auth/register", { name, email, password });
      login(data);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form-wrapper">
      <div className="auth-header">
        <span className="auth-label">Get started</span>
        <h1 className="auth-title">Create Account</h1>
      </div>

      {error && <div className="auth-error">{error}</div>}

      <form className="auth-form" onSubmit={submitHandler}>
        <div className="field-group">
          <label className="field-label" htmlFor="reg-name">Full Name</label>
          <input
            id="reg-name"
            className="field-input"
            type="text"
            placeholder="Jane Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="field-group">
          <label className="field-label" htmlFor="reg-email">Email</label>
          <input
            id="reg-email"
            className="field-input"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="field-group">
          <label className="field-label" htmlFor="reg-password">Password</label>
          <input
            id="reg-password"
            className="field-input"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div className="field-group">
          <label className="field-label" htmlFor="reg-confirm">Confirm Password</label>
          <input
            id="reg-confirm"
            className="field-input"
            type="password"
            placeholder="••••••••"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />
        </div>

        <button className="auth-btn" type="submit" disabled={loading}>
          {loading ? <span className="btn-spinner" /> : "Create Account"}
        </button>
      </form>

      <p className="auth-switch">
        Already have an account?{" "}
        <button className="switch-link" onClick={onSwitch}>
          Sign In
        </button>
      </p>
    </div>
  );
};

// ─── AuthPage Shell ────────────────────────────────────────────────────────
const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
// Inside the AuthPage component, before the return:
const { userInfo } = useContext(AuthContext);
if (userInfo) return <Navigate to="/" replace />;
  return (
    <div className="auth-page">
      {/* Decorative background elements */}
      <div className="auth-bg">
        <div className="bg-circle bg-circle--1" />
        <div className="bg-circle bg-circle--2" />
        <div className="bg-grid" />
      </div>

      <div className="auth-card">
        {/* Tab toggle */}
        <div className="auth-tabs">
          <button
            className={`auth-tab ${isLogin ? "auth-tab--active" : ""}`}
            onClick={() => setIsLogin(true)}
          >
            Sign In
          </button>
          <button
            className={`auth-tab ${!isLogin ? "auth-tab--active" : ""}`}
            onClick={() => setIsLogin(false)}
          >
            Register
          </button>
          <div className={`tab-indicator ${isLogin ? "" : "tab-indicator--right"}`} />
        </div>

        {/* Animated form area */}
        <div className="auth-body">
          <div className={`form-slide ${isLogin ? "form-slide--visible" : "form-slide--hidden"}`}>
            <LoginForm onSwitch={() => setIsLogin(false)} />
          </div>
          <div className={`form-slide ${!isLogin ? "form-slide--visible" : "form-slide--hidden"}`}>
            <RegisterForm onSwitch={() => setIsLogin(true)} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;