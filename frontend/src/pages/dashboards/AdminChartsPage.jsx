import React, { useState, useEffect } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { AuthContext } from "../../context/AuthContext";
import { useContext } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const AdminChartsPage = () => {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);

  // Données simulées pour les graphiques
  const [ventesMensuelles, setVentesMensuelles] = useState([]);
  const [achatsFournisseurs, setAchatsFournisseurs] = useState([]);
  const [stockCategories, setStockCategories] = useState([]);
  const [employesServices, setEmployesServices] = useState([]);
  const [equipementsDisponibilite, setEquipementsDisponibilite] = useState([]);

  // Couleurs pour les graphiques
  const COLORS = {
    primary: "#1E3A8A", // Bleu acier
    secondary: "#10B981", // Vert
    accent: "#FACC15", // Jaune chantier
    danger: "#EF4444", // Rouge
    purple: "#8B5CF6", // Violet
    orange: "#F59E0B", // Orange
  };

  const PIE_COLORS = [
    COLORS.primary,
    COLORS.secondary,
    COLORS.accent,
    COLORS.danger,
    COLORS.purple,
    COLORS.orange,
  ];

  useEffect(() => {
    // Simuler le chargement des données
    const loadData = async () => {
      setLoading(true);
      
      // Simuler un délai de chargement
      await new Promise(resolve => setTimeout(resolve, 500));

      // Données simulées - Évolution des ventes mensuelles
      setVentesMensuelles([
        { mois: "Janvier", ventes: 12000 },
        { mois: "Février", ventes: 13500 },
        { mois: "Mars", ventes: 14200 },
        { mois: "Avril", ventes: 15800 },
        { mois: "Mai", ventes: 16500 },
        { mois: "Juin", ventes: 17200 },
        { mois: "Juillet", ventes: 14500 },
        { mois: "Août", ventes: 15200 },
        { mois: "Septembre", ventes: 16800 },
        { mois: "Octobre", ventes: 17500 },
        { mois: "Novembre", ventes: 18000 },
        { mois: "Décembre", ventes: 19500 },
      ]);

      // Données simulées - Achats par fournisseur
      setAchatsFournisseurs([
        { fournisseur: "Lafarge", montant: 8500 },
        { fournisseur: "Ciment Québec", montant: 7200 },
        { fournisseur: "Groupe CRH", montant: 6300 },
        { fournisseur: "Béton Provincial", montant: 5400 },
        { fournisseur: "Vicat", montant: 4800 },
      ]);

      // Données simulées - Répartition du stock par catégorie
      setStockCategories([
        { categorie: "Matériaux", valeur: 45 },
        { categorie: "Engins", valeur: 25 },
        { categorie: "Outillage", valeur: 18 },
        { categorie: "Pièces détachées", valeur: 12 },
      ]);

      // Données simulées - Répartition des employés par service
      setEmployesServices([
        { service: "RH", nombre: 6 },
        { service: "TP", nombre: 12 },
        { service: "Finance", nombre: 4 },
        { service: "Vente", nombre: 8 },
        { service: "Achat", nombre: 5 },
        { service: "Maintenance", nombre: 7 },
      ]);

      // Données simulées - Taux de disponibilité des équipements
      setEquipementsDisponibilite([
        { name: "En service", value: 80 },
        { name: "En maintenance", value: 20 },
      ]);

      setLoading(false);
    };

    loadData();
  }, []);

  const ChartCard = ({ title, children, delay = 0 }) => {
    return (
      <div
        className="bg-white rounded-2xl shadow-md p-6 border border-gray-100"
        style={{
          animation: `fadeInUp 0.6s ease-out ${delay}s both`,
        }}
      >
        <h3 className="text-xl font-bold text-gray-800 mb-6">{title}</h3>
        <div className="h-[350px]">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-gray-500">Chargement...</div>
            </div>
          ) : (
            children
          )}
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout role={user?.role}>
      <div className="p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Graphiques et Visualisations
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Graphique 1 - Évolution des ventes mensuelles */}
          <ChartCard title="Évolution des ventes mensuelles" delay={0.1}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={ventesMensuelles}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis 
                  dataKey="mois" 
                  stroke="#6B7280"
                  style={{ fontSize: "12px" }}
                />
                <YAxis 
                  stroke="#6B7280"
                  style={{ fontSize: "12px" }}
                  tickFormatter={(value) => `${value / 1000}k`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #E5E7EB",
                    borderRadius: "8px",
                  }}
                  formatter={(value) => [`${value.toLocaleString("fr-CA")} $`, "Ventes"]}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="ventes" 
                  stroke={COLORS.primary} 
                  strokeWidth={3}
                  dot={{ fill: COLORS.primary, r: 5 }}
                  activeDot={{ r: 8 }}
                  name="Ventes (CAD)"
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Graphique 2 - Achats par fournisseur */}
          <ChartCard title="Achats par fournisseur" delay={0.2}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={achatsFournisseurs}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis 
                  type="number"
                  stroke="#6B7280"
                  style={{ fontSize: "12px" }}
                  tickFormatter={(value) => `${value / 1000}k`}
                />
                <YAxis 
                  type="category"
                  dataKey="fournisseur"
                  stroke="#6B7280"
                  style={{ fontSize: "12px" }}
                  width={120}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #E5E7EB",
                    borderRadius: "8px",
                  }}
                  formatter={(value) => [`${value.toLocaleString("fr-CA")} $`, "Montant"]}
                />
                <Bar 
                  dataKey="montant" 
                  fill={COLORS.secondary}
                  radius={[0, 8, 8, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Graphique 3 - Répartition du stock par catégorie */}
          <ChartCard title="Répartition du stock par catégorie" delay={0.3}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stockCategories}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ categorie, valeur }) => `${categorie}: ${valeur}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="valeur"
                >
                  {stockCategories.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #E5E7EB",
                    borderRadius: "8px",
                  }}
                  formatter={(value) => `${value}%`}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Graphique 4 - Répartition des employés par service */}
          <ChartCard title="Répartition des employés par service" delay={0.4}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={employesServices}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis 
                  dataKey="service" 
                  stroke="#6B7280"
                  style={{ fontSize: "12px" }}
                />
                <YAxis 
                  stroke="#6B7280"
                  style={{ fontSize: "12px" }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #E5E7EB",
                    borderRadius: "8px",
                  }}
                  formatter={(value) => [`${value} employés`, "Nombre"]}
                />
                <Bar 
                  dataKey="nombre" 
                  fill={COLORS.accent}
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Graphique 5 - Taux de disponibilité des équipements */}
          <ChartCard title="Taux de disponibilité des équipements" delay={0.5}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={equipementsDisponibilite}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {equipementsDisponibilite.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={index === 0 ? COLORS.secondary : COLORS.danger} 
                    />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #E5E7EB",
                    borderRadius: "8px",
                  }}
                  formatter={(value) => `${value}%`}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminChartsPage;

