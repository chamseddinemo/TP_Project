import React, { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import {
  FaSignInAlt,
  FaUserPlus,
  FaWarehouse,
  FaDollarSign,
  FaUsers,
  FaChartBar,
  FaCog,
  FaShieldAlt,
  FaChartLine,
  FaTools,
  FaBuilding,
  FaCheckCircle
} from "react-icons/fa";

const Home = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      switch (user.role) {
        case "admin": navigate("/dashboard/admin"); break;
        case "stock": navigate("/dashboard/stock"); break;
        case "vente": navigate("/dashboard/vente"); break;
        case "achat": navigate("/dashboard/achat"); break;
        case "rh": navigate("/dashboard/rh"); break;
        case "comptable": navigate("/dashboard/finance"); break;
        case "technicien": navigate("/dashboard/equipement"); break;
        default: break;
      }
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-2">
              <FaBuilding className="text-2xl text-[#1E3A8A]" />
              <span className="text-2xl font-bold text-[#1E3A8A]">ERP-TP</span>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/login")}
                className="px-4 py-2 text-[#1E3A8A] font-medium hover:text-[#1E3A8A]/80 transition-colors"
              >
                Se connecter
              </button>
              <button
                onClick={() => navigate("/signup")}
                className="px-6 py-2 bg-[#1E3A8A] text-white rounded-lg font-semibold hover:bg-[#1E3A8A]/90 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center gap-2"
              >
                <FaUserPlus /> Créer un compte
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#1E3A8A] via-[#2563EB] to-[#3B82F6] text-white py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto animate-fade-in">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              ERP-TP
            </h1>
            <p className="text-2xl md:text-3xl font-semibold mb-4">
              Système de gestion intégré pour Travaux Publics
            </p>
            <p className="text-xl md:text-2xl text-blue-100 mb-10 leading-relaxed">
              Optimisez vos opérations, centralisez vos données et suivez vos projets en temps réel.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={() => navigate("/login")}
                className="px-8 py-4 bg-white text-[#1E3A8A] rounded-lg font-semibold text-lg hover:bg-gray-100 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center gap-2"
              >
                <FaSignInAlt /> Se connecter
              </button>
              <button
                onClick={() => navigate("/signup")}
                className="px-8 py-4 bg-[#F59E0B] text-white rounded-lg font-semibold text-lg hover:bg-[#F59E0B]/90 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center gap-2"
              >
                <FaUserPlus /> Créer un compte
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-[#F3F4F6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Fonctionnalités principales
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Tous les outils dont vous avez besoin pour gérer efficacement votre entreprise de Travaux Publics
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <FaWarehouse className="text-4xl" />,
                title: "Gestion du Stock",
                description: "Suivez vos produits, outils et matériaux en temps réel.",
                color: "bg-blue-500"
              },
              {
                icon: <FaDollarSign className="text-4xl" />,
                title: "Ventes & Achats",
                description: "Gérez vos commandes, devis et factures efficacement.",
                color: "bg-green-500"
              },
              {
                icon: <FaUsers className="text-4xl" />,
                title: "RH & Employés",
                description: "Suivez vos équipes, paies et recrutements en un seul endroit.",
                color: "bg-purple-500"
              },
              {
                icon: <FaChartBar className="text-4xl" />,
                title: "Finance & Rapports",
                description: "Analysez vos dépenses et vos performances.",
                color: "bg-orange-500"
              }
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-8 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer group"
              >
                <div className={`${feature.color} text-white w-16 h-16 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                <div className="mt-4 text-[#1E3A8A] font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  En savoir plus →
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Pourquoi choisir ERP-TP ?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Une solution complète conçue spécialement pour les entreprises de Travaux Publics
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                icon: <FaCog className="text-5xl text-[#1E3A8A]" />,
                title: "Automatisation complète",
                description: "Gagnez du temps sur la gestion quotidienne avec des processus automatisés et des workflows intelligents."
              },
              {
                icon: <FaShieldAlt className="text-5xl text-[#1E3A8A]" />,
                title: "Sécurité des données",
                description: "Sauvegarde et confidentialité garanties. Vos données sont protégées selon les standards les plus élevés."
              },
              {
                icon: <FaChartLine className="text-5xl text-[#1E3A8A]" />,
                title: "Performance",
                description: "Suivi des KPI et rapports personnalisés pour prendre des décisions éclairées en temps réel."
              }
            ].map((benefit, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-6">
                  {benefit.icon}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{benefit.title}</h3>
                <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial/Context Section */}
      <section className="py-20 bg-[#1E3A8A] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex justify-center mb-6">
              <FaTools className="text-6xl text-[#F59E0B]" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Conçu pour les entreprises de Travaux Publics au Québec
            </h2>
            <p className="text-xl md:text-2xl text-blue-100 leading-relaxed">
              Simplifiez la gestion de vos chantiers, de vos stocks et de vos équipes.
              Un système adapté aux spécificités du marché québécois avec support des normes locales.
            </p>
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { text: "Gestion des chantiers", icon: <FaBuilding /> },
                { text: "Suivi des stocks", icon: <FaWarehouse /> },
                { text: "Gestion des équipes", icon: <FaUsers /> }
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-3 justify-center md:justify-start">
                  <div className="bg-[#F59E0B] rounded-full p-2">
                    {item.icon}
                  </div>
                  <span className="text-lg font-semibold">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Prêt à améliorer la gestion de votre entreprise ?
          </h2>
          <p className="text-xl text-blue-100 mb-10">
            Rejoignez les entreprises de Travaux Publics qui font confiance à ERP-TP
          </p>
          <button
            onClick={() => navigate("/signup")}
            className="px-10 py-5 bg-[#F59E0B] text-white rounded-lg font-bold text-xl hover:bg-[#F59E0B]/90 transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 flex items-center gap-3 mx-auto"
          >
            <FaUserPlus /> Commencez dès aujourd'hui
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <FaBuilding className="text-2xl text-[#F59E0B]" />
                <span className="text-xl font-bold text-white">ERP-TP</span>
              </div>
              <p className="text-sm">
                Système de gestion intégré pour Travaux Publics au Québec.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Navigation</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="/" className="hover:text-[#F59E0B] transition-colors">Accueil</a></li>
                <li><a href="/login" className="hover:text-[#F59E0B] transition-colors">Se connecter</a></li>
                <li><a href="/signup" className="hover:text-[#F59E0B] transition-colors">Créer un compte</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Informations</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-[#F59E0B] transition-colors">À propos</a></li>
                <li><a href="#" className="hover:text-[#F59E0B] transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-[#F59E0B] transition-colors">Politique de confidentialité</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Modules</h4>
              <ul className="space-y-2 text-sm">
                <li><span className="text-gray-400">Gestion du Stock</span></li>
                <li><span className="text-gray-400">Ventes & Achats</span></li>
                <li><span className="text-gray-400">RH & Finance</span></li>
                <li><span className="text-gray-400">Équipements</span></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>© 2025 ERP-TP — Tous droits réservés</p>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Home;
