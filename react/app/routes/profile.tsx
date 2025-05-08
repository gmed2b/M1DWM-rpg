import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { getProfileApi } from "../services/authService";
import { useAuthStore } from "../services/authStore";

const Profile: React.FC = () => {
  const { user, token, logout } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    if (!user && token) {
      setLoading(true);
      getProfileApi(token)
        .then((u) => useAuthStore.getState().login(u, token))
        .catch(() => setError("Erreur de chargement du profil"))
        .finally(() => setLoading(false));
    }
  }, [user, token, navigate]);

  if (!token) return <div>Non connecté</div>;
  if (loading) return <div>Chargement...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;
  if (!user) return null;

  return (
    <div style={{ maxWidth: 320, margin: "auto", padding: 32 }}>
      <h2>Profil</h2>
      <div>
        <b>Nom d'utilisateur :</b> {user.username}
      </div>
      <div>
        <b>Email :</b> {user.email}
      </div>
      <button onClick={logout} style={{ marginTop: 16 }}>
        Se déconnecter
      </button>
    </div>
  );
};

export default Profile;
