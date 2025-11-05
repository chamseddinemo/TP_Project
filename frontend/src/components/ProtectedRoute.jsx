import React, { useContext, memo } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const ProtectedRoute = memo(({ children, roles }) => {
  const { user } = useContext(AuthContext);

  if (!user) return <Navigate to="/login" replace />;

  if (roles && !roles.includes(user.role)) {
    return <div>Accès refusé : vous n'avez pas la permission</div>;
  }

  return children;
});

ProtectedRoute.displayName = "ProtectedRoute";

export default ProtectedRoute;
