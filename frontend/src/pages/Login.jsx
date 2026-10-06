import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaArrowRight, FaChartLine, FaEye, FaEyeSlash, FaLock, FaShieldAlt, FaUserShield } from "react-icons/fa";
import API from "../services/api";
import "../styles/Login.css";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (localStorage.getItem("token")) navigate("/admin", { replace: true });
  }, [navigate]);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password) return setError("Enter your email and password.");

    setLoading(true);
    try {
      const { data } = await API.post("/auth/login", {
        email: email.trim().toLowerCase(),
        password,
      });

      if (!data?.token) throw new Error("Authentication token was not received.");

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user || {}));
      window.dispatchEvent(new Event("leaddesk:auth"));

      const from = location.state?.from?.pathname;
      navigate(from && from !== "/login" ? from : "/admin", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">
      <div className="login-orb login-orb-a" />
      <div className="login-orb login-orb-b" />

      <section className="login-card">
        <div className="login-visual">
          <div className="login-logo"><FaChartLine /></div>
          <span className="login-kicker">LEADDESK CRM • ADMIN CONTROL</span>
          <h1>Command your<br /><span>sales pipeline.</span></h1>
          <p>Capture every opportunity, prioritize high-value prospects and keep your entire lead lifecycle under control.</p>

          <div className="login-points">
            <div><span><FaUserShield /></span><div><b>Protected workspace</b><small>JWT-secured administrator access</small></div></div>
            <div><span><FaChartLine /></span><div><b>Live intelligence</b><small>Pipeline, scoring and conversion insights</small></div></div>
            <div><span><FaShieldAlt /></span><div><b>Centralized CRM</b><small>One source of truth for every enquiry</small></div></div>
          </div>

          <div className="login-status"><i /> System ready for authorized access</div>
        </div>

        <div className="login-panel">
          <Link to="/" className="login-back">← Back to LeadDesk</Link>
          <span className="login-label">ADMIN PORTAL</span>
          <h2>Welcome back.</h2>
          <p>Sign in to continue to your CRM workspace.</p>

          {error && <div className="login-error"><b>!</b>{error}</div>}

          <form onSubmit={submit}>
            <label>Email address</label>
            <div className="login-input">
              <FaUserShield />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@leaddesk.local" autoComplete="username" disabled={loading} />
            </div>

            <label>Password</label>
            <div className="login-input">
              <FaLock />
              <input type={show ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" autoComplete="current-password" disabled={loading} />
              <button type="button" onClick={() => setShow((v) => !v)}>{show ? <FaEyeSlash /> : <FaEye />}</button>
            </div>

            <button className="login-submit" disabled={loading}>
              {loading ? "Authenticating..." : "Enter Dashboard"} {!loading && <FaArrowRight />}
            </button>
          </form>

          <div className="login-foot"><FaShieldAlt /> Secure administrator session</div>
        </div>
      </section>
    </main>
  );
}
