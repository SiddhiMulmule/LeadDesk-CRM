import { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { FaChartLine, FaHome, FaSignInAlt, FaSignOutAlt, FaUserShield } from "react-icons/fa";
import "../styles/Navbar.css";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  const sync = () => {
    const raw = localStorage.getItem("user");
    try { setUser(raw ? JSON.parse(raw) : null); } catch { setUser(null); }
  };

  useEffect(sync, [location.pathname]);

  useEffect(() => {
    window.addEventListener("storage", sync);
    window.addEventListener("leaddesk:auth", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("leaddesk:auth", sync);
    };
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.dispatchEvent(new Event("leaddesk:auth"));
    navigate("/", { replace: true });
  };

  const firstName = user?.name?.split(" ")[0] || "Admin";

  return (
    <header className="nav-shell">
      <div className="nav-inner">
        <NavLink to="/" className="brand">
          <span className="brand-mark"><FaChartLine /></span>
          <span className="brand-copy">
            <strong>LeadDesk</strong>
            <small>CRM INTELLIGENCE</small>
          </span>
        </NavLink>

        <nav className="nav-links">
          <NavLink to="/" end className="nav-link"><FaHome /> Home</NavLink>

          {user ? (
            <>
              <NavLink to="/admin" className="nav-link"><FaChartLine /> Dashboard</NavLink>
              <div className="nav-user">
                <span className="nav-user-icon"><FaUserShield /></span>
                <span><b>{firstName}</b><small>Administrator</small></span>
              </div>
              <button className="nav-logout" onClick={logout}><FaSignOutAlt /> Logout</button>
            </>
          ) : (
            <NavLink to="/login" className="nav-login"><FaSignInAlt /> Admin Login</NavLink>
          )}
        </nav>
      </div>
    </header>
  );
}
