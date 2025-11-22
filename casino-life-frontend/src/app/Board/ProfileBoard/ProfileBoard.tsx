import React, { useEffect, useState } from "react";
import { usePage } from "../../contexts/BoardNavigation";
import { getMyProfile, type UserProfile } from "@/api/profile";

// Lucide icons
import {
  User,
  Mail,
  Coins,
  CalendarDays,
  Gamepad2,
  Clock,
  TrendingUp,
  TrendingDown,
  LogOut,
} from "lucide-react";

export default function ProfileBoard() {
  const { setCurrentPage } = usePage();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setCurrentPage("profile");
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await getMyProfile();
      setProfile(data);
    } catch (e) {
      console.error("Error loading profile:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.reload();
  };

  if (loading) {
    return <div style={{ padding: "2rem", color: "white" }}>Cargando perfil...</div>;
  }

  if (!profile) {
    return <div style={{ padding: "2rem", color: "white" }}>Error cargando perfil</div>;
  }

  const { user, history } = profile;

  return (
    <div
      style={{
        height: "42rem",
        width: "98%",
        marginTop: "5rem",
        padding: "2rem",
        color: "white",
        borderRadius: "16px",
        overflowY: "auto",
        background:
          "linear-gradient(160deg, rgba(11,15,26,0.9) 0%, rgba(6,9,20,0.95) 100%)",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(255,255,255,0.05)",
        boxShadow: "0 0 20px rgba(0,0,0,0.5)",
        position: "relative",
      }}
    >
      {/* 🔐 LOGOUT BUTTON */}
      <button
        onClick={handleLogout}
        style={{
          position: "absolute",
          right: "20px",
          top: "20px",
          padding: "8px 14px",
          background: "rgba(239,68,68,0.15)",
          border: "1px solid rgba(239,68,68,0.4)",
          borderRadius: "8px",
          color: "#ef4444",
          fontWeight: 600,
          display: "flex",
          alignItems: "center",
          gap: "6px",
          cursor: "pointer",
          backdropFilter: "blur(4px)",
          transition: "0.2s",
        }}
      >
        <LogOut size={18} />
        Logout
      </button>

      {/* HEADER */}
      <h2
        style={{
          fontSize: "2rem",
          fontWeight: 700,
          marginBottom: "1.5rem",
          letterSpacing: "0.5px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <User size={28} /> Tu Perfil
      </h2>

      {/* USER CARD */}
      <div
        style={{
          background: "rgba(255,255,255,0.05)",
          padding: "1.8rem",
          borderRadius: "14px",
          marginBottom: "2.5rem",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
        }}
      >
        {/* EMAIL */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Mail size={20} opacity={0.8} />
          <p style={{ fontSize: "1.2rem", fontWeight: 600 }}>{user.email}</p>
        </div>

        <div
          style={{
            marginTop: "1.5rem",
            display: "flex",
            gap: "2.5rem",
            alignItems: "center",
          }}
        >
          {/* BALANCE */}
          <div>
            <p style={{ marginBottom: ".3rem", fontSize: ".9rem", opacity: 0.7 }}>
              Balance actual
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Coins size={22} color="#34d399" />
              <p
                style={{
                  fontSize: "1.8rem",
                  fontWeight: 700,
                  color: "#34d399",
                }}
              >
                ${user.coins}
              </p>
            </div>
          </div>

          {/* MEMBER SINCE */}
          <div>
            <p style={{ marginBottom: ".3rem", fontSize: ".9rem", opacity: 0.7 }}>
              Miembro desde
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <CalendarDays size={20} opacity={0.9} />
              <p style={{ fontSize: "1.2rem", opacity: 0.9 }}>
                {new Date(user.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* HISTORY */}
      <h3
        style={{
          fontSize: "1.6rem",
          fontWeight: 700,
          marginBottom: "1.2rem",
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <Gamepad2 size={24} /> Historial de Juegos
      </h3>

      {history.length === 0 ? (
        <p style={{ opacity: 0.6 }}>Aún no tienes actividad registrada.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
          {history.map((record) => (
            <div
              key={record.id}
              style={{
                padding: "1.2rem",
                borderRadius: "12px",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                boxShadow: "0 4px 10px rgba(0,0,0,0.25)",
                display: "flex",
                flexDirection: "column",
                gap: "0.6rem",
              }}
            >
              {/* TITLE + RESULT */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <Gamepad2 size={18} opacity={0.9} />
                  <p style={{ fontSize: "1.2rem", fontWeight: 600 }}>
                    {record.game.toUpperCase()}
                  </p>
                </div>

                <span
                  style={{
                    padding: "0.3rem 0.7rem",
                    borderRadius: "8px",
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    color: record.result === "win" ? "#22c55e" : "#ef4444",
                    background:
                      record.result === "win"
                        ? "rgba(34,197,94,0.15)"
                        : "rgba(239,68,68,0.15)",
                    border:
                      record.result === "win"
                        ? "1px solid rgba(34,197,94,0.4)"
                        : "1px solid rgba(239,68,68,0.4)",
                  }}
                >
                  {record.result === "win" ? (
                    <>
                      <TrendingUp size={16} /> GANADO
                    </>
                  ) : (
                    <>
                      <TrendingDown size={16} /> PERDIDO
                    </>
                  )}
                </span>
              </div>

              {/* AMOUNT */}
              <p style={{ fontSize: "1rem", opacity: 0.85 }}>
                Monto: <strong>${record.amount}</strong>
              </p>

              {/* DATE */}
              <p
                style={{
                  fontSize: ".9rem",
                  opacity: 0.6,
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <Clock size={16} opacity={0.6} />
                {new Date(record.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}