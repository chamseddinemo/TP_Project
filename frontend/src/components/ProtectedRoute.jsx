import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const ProtectedRoute = ({ children, roles }) => {
  const { user } = useContext(AuthContext);

  if (!user) return <Navigate to="/login" />;

  if (roles && !roles.includes(user.role)) {
    return <div>Accès refusé : vous n'avez pas la permission</div>;
  }

  return children;
};

export default ProtectedRoute;
