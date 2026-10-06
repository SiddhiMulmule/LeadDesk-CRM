import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import API from "../services/api";

export default function ProtectedRoute({ children }) {
  const location = useLocation();
  const [checking, setChecking] = useState(true);
  const [valid, setValid] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setValid(false);
      setChecking(false);
      return;
    }

    API.get("/auth/me")
      .then(({ data }) => {
        if (data?.success && data.user) {
          localStorage.setItem("user", JSON.stringify(data.user));
          setValid(true);
        } else {
          setValid(false);
        }
      })
      .catch(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setValid(false);
      })
      .finally(() => setChecking(false));
  }, []);

  if (checking) {
    return (
      <div className="route-loading">
        <div className="loading-ring" />
        <span>Securing workspace...</span>
      </div>
    );
  }

  if (!valid) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}
