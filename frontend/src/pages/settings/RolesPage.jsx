import React, { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import { AuthContext } from "../../context/AuthContext";
import { useContext } from "react";
import api from "../../services/api";
import { FaPlus, FaEdit, FaTrash, FaSearch, FaUserShield, FaLock } from "react-icons/fa";

const RolesPage = () => {
  const { user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "vente"
  });

  const roles = [
    { value: "admin", label: "Administrateur" },
    { value: "stock", label: "Stock" },
    { value: "achat", label: "Achat" },
    { value: "vente", label: "Vente" },
    { value: "rh", label: "Ressources Humaines" },
    { value: "comptable", label: "Comptable" },
    { value: "technicien", label: "Technicien" }
  ];

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data } = await api.get("/auth/users");
      setUsers(data);
    } catch (error) {
      console.error("Erreur récupération utilisateurs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        // Mise à jour utilisateur (sans changer le mot de passe si vide)
        const updateData = {
          name: formData.name,
          email: formData.email,
          role: formData.role
        };
        if (formData.password) {
          updateData.password = formData.password;
        }
        await api.put(`/auth/users/${editingUser._id}`, updateData);
      } else {
        // Création utilisateur
        await api.post("/auth/signup", formData);
      }
      setShowModal(false);
      resetForm();
      fetchUsers();
    } catch (error) {
      alert(error.response?.data?.message || "Erreur lors de la sauvegarde");
    }
  };

  const handleEdit = (userData) => {
    setEditingUser(userData);
    setFormData({
      name: userData.name || "",
      email: userData.email || "",
      password: "",
      role: userData.role || "vente"
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")) return;
    try {
      await api.delete(`/auth/users/${id}`);
      fetchUsers();
    } catch (error) {
      alert(error.response?.data?.message || "Erreur lors de la suppression");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      role: "vente"
    });
    setEditingUser(null);
  };

  const filteredUsers = users.filter(u =>
    `${u.name} ${u.email} ${u.role}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleColor = (role) => {
    const colors = {
      admin: "bg-purple-100 text-purple-800",
      stock: "bg-yellow-100 text-yellow-800",
      achat: "bg-orange-100 text-orange-800",
      vente: "bg-blue-100 text-blue-800",
      rh: "bg-green-100 text-green-800",
      comptable: "bg-teal-100 text-teal-800",
      technicien: "bg-gray-100 text-gray-800"
    };
    return colors[role] || "bg-gray-100 text-gray-800";
  };

  const roleStats = roles.reduce((acc, role) => {
    acc[role.value] = users.filter(u => u.role === role.value).length;
    return acc;
  }, {});

  return (
    <div className="dashboard-wrapper">
      <Sidebar role={user?.role} />
      <div className="main-content">
        <Navbar />
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Gestion des Rôles</h1>
            <button
              onClick={() => { resetForm(); setShowModal(true); }}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <FaPlus /> Nouvel utilisateur
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {roles.map(role => (
              <div key={role.value} className="bg-white rounded-lg shadow-md p-4">
                <div className="text-sm text-gray-600">{role.label}</div>
                <div className="text-2xl font-bold">{roleStats[role.value] || 0}</div>
              </div>
            ))}
          </div>

          <div className="mb-4">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un utilisateur..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8">Chargement...</div>
          ) : (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rôle</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date création</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((userData) => (
                    <tr key={userData._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap font-semibold flex items-center gap-2">
                        <FaUserShield className="text-blue-500" />
                        {userData.name}
                      </td>
                      <td className="px-6 py-4">{userData.email}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${getRoleColor(userData.role)}`}>
                          {roles.find(r => r.value === userData.role)?.label || userData.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {new Date(userData.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleEdit(userData)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          <FaEdit />
                        </button>
                        {userData._id !== user?._id && (
                          <button
                            onClick={() => handleDelete(userData._id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <FaTrash />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {showModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h2 className="text-2xl font-bold mb-4">
                  {editingUser ? "Modifier l'utilisateur" : "Nouvel utilisateur"}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Nom *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Email *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                      disabled={!!editingUser}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      {editingUser ? "Nouveau mot de passe (laisser vide pour ne pas changer)" : "Mot de passe *"}
                    </label>
                    <input
                      type="password"
                      required={!editingUser}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Rôle *</label>
                    <select
                      required
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                    >
                      {roles.map(role => (
                        <option key={role.value} value={role.value}>{role.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => { setShowModal(false); resetForm(); }}
                      className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      {editingUser ? "Modifier" : "Créer"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RolesPage;

