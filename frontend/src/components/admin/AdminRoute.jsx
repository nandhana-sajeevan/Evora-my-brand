import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading || user === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-eyebrow opacity-60">Authenticating...</div>
      </div>
    );
  }
  if (!user || user.role !== "admin") {
    return <Navigate to="/login" replace />;
  }
  return children;
}
