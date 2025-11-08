import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { FaLock, FaEnvelope } from "react-icons/fa";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  // Réinitialiser le mot de passe au montage pour éviter l'autocomplétion
  React.useEffect(() => {
    setPassword("");
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const data = await login(email, password);
      switch (data.role) {
        case "admin": navigate("/dashboard/admin"); break;
        case "stock": navigate("/dashboard/stock"); break;
        case "vente": navigate("/dashboard/vente"); break;
        case "achat": navigate("/dashboard/achat"); break;
        case "rh": navigate("/dashboard/rh"); break;
        case "comptable": navigate("/dashboard/finance"); break;
        case "technicien": navigate("/dashboard/equipement"); break;
        default: navigate("/"); break;
      }
    } catch (error) {
      setError(error.response?.data?.message || "Erreur de connexion");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">ERP-TP</h1>
          <h2 className="text-xl text-gray-600">Connexion</h2>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <div className="relative">
              <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                placeholder="votre@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mot de passe
            </label>
            <div className="relative">
              <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="off"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            Se connecter
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Pas encore de compte ?{" "}
            <button
              onClick={() => navigate("/signup")}
              className="text-blue-600 hover:text-blue-800 font-semibold"
            >
              Créer un compte
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
