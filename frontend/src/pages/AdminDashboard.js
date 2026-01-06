import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import LogoutButton from "../components/LogoutButton";

const Dashboard = () => {
  const [users, setUsers] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/");
      toast.error("Accès refusé");
    }
  }, [user, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, metricsRes] = await Promise.all([
          axios.get("http://localhost:5000/api/admin/users", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:5000/api/admin/metrics", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        setUsers(usersRes.data);
        setMetrics(metricsRes.data);
      } catch (error) {
        toast.error("Impossible de charger les données");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer cet utilisateur ?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers((prev) => prev.filter((u) => u._id !== id));
      toast.success("Utilisateur supprimé !");
    } catch (error) {
      toast.error("Erreur lors de la suppression");
    }
  };

  const handleRoleChange = async (id, role) => {
    try {
      await axios.put(
        `http://localhost:5000/api/admin/users/${id}/role`,
        { role },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Rôle mis à jour !");
      setUsers((prev) => prev.map((u) => (u._id === id ? { ...u, role } : u)));
    } catch (error) {
      toast.error("Erreur lors de la mise à jour du rôle");
    }
  };

  const stats = useMemo(() => {
    const base = { admin: 0, organisateur: 0, visiteur: 0 };
    users.forEach((u) => {
      if (base[u.role] !== undefined) {
        base[u.role] += 1;
      }
    });
    return [
      { label: "Membres actifs", value: users.length, icon: "👥" },
      { label: "Organisateurs", value: base.organisateur, icon: "🎭" },
      { label: "Visiteurs", value: base.visiteur, icon: "🎫" },
    ];
  }, [users]);

  const platformStats = useMemo(() => {
    if (!metrics) return [];
    return [
      { label: "Billets vendus", value: metrics.ticketsSold, icon: "🎟️" },
      { label: "Revenus totaux", value: `${metrics.totalRevenue.toFixed(2)} €`, icon: "💰" },
      { label: "Taux de participation", value: `${metrics.participationRate}%`, icon: "📊" },
    ];
  }, [metrics]);

  if (loading) return <div className="text-center mt-20 text-dusk/60">Chargement...</div>;

  return (
    <section className="min-h-screen bg-gradient-to-b from-white via-[#fff5f9] to-[#ffe1ee] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-10">
        <div className="rounded-[32px] border border-white/60 bg-white/90 p-8 shadow-2xl shadow-primary/20 backdrop-blur">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Administration</p>
              <h1 className="mt-4 text-4xl font-bold text-ink">Bonjour {user?.name} 👋</h1>
              <p className="mt-3 text-dusk/70">
                Supervisez les membres, pilotez les rôles et gardez un contrôle élégant sur la plateforme.
              </p>
            </div>
            <LogoutButton />
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-pink-50 bg-secondary p-4 shadow-md shadow-primary/10">
                <p className="text-sm font-semibold text-dusk/70">{stat.label}</p>
                <p className="mt-2 text-3xl font-bold text-primary">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[32px] border border-white/60 bg-white/95 p-8 shadow-2xl shadow-primary/15 backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Métriques de plateforme</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {platformStats.map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-pink-50 bg-secondary p-4 shadow-md shadow-primary/10">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{stat.icon}</span>
                  <div>
                    <p className="text-sm font-semibold text-dusk/70">{stat.label}</p>
                    <p className="mt-1 text-2xl font-bold text-primary">{stat.value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[32px] border border-white/60 bg-white/95 p-0 shadow-2xl shadow-primary/15 backdrop-blur">
          <div className="border-b border-pink-50 px-6 py-4">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-dusk/60">Gestion des accès</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-pink-50 text-left text-sm text-dusk">
              <thead className="bg-primary/5 text-xs font-semibold uppercase tracking-wide text-dusk/70">
                <tr>
                  <th className="px-6 py-3">Nom</th>
                  <th className="px-6 py-3">Email</th>
                  <th className="px-6 py-3">Rôle</th>
                  <th className="px-6 py-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pink-50">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-primary/5">
                    <td className="px-6 py-4 font-semibold text-ink">{u.name}</td>
                    <td className="px-6 py-4">{u.email}</td>
                    <td className="px-6 py-4">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u._id, e.target.value)}
                        className="rounded-full border border-dusk/10 bg-secondary px-3 py-1 text-sm font-semibold text-dusk focus:border-primary focus:ring-2 focus:ring-primary/30"
                      >
                        <option value="visiteur">Visiteur</option>
                        <option value="organisateur">Organisateur</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleDelete(u._id)}
                        className="rounded-full border border-red-100 px-3 py-1 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Dashboard;
