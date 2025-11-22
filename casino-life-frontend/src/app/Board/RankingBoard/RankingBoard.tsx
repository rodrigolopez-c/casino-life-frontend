import React, { useEffect, useState } from "react";
import { usePage } from "../../contexts/BoardNavigation";
import { getRanking } from "@/api/ranking";

// Lucide icons
import { Trophy, Medal, Mail, Coins, Crown } from "lucide-react";

export default function RankingBoard() {
  const { setCurrentPage } = usePage();
  const [ranking, setRanking] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setCurrentPage("ranking");
    loadRanking();
  }, []);

  const loadRanking = async () => {
    try {
      const res = await getRanking();
      setRanking(res.results ?? []);
    } catch (e) {
      console.error("Error loading ranking:", e);
    } finally {
      setLoading(false);
    }
  };

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
          "linear-gradient(180deg, rgba(6,9,20,0.95) 0%, rgba(3,6,12,1) 100%)",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(255,255,255,0.05)",
        boxShadow: "0 0 20px rgba(0,0,0,0.5)",
      }}
    >
      {/* HEADER */}
      <h2
        style={{
          fontSize: "2rem",
          fontWeight: 700,
          marginBottom: "2rem",
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <Trophy size={28} color="#fcd34d" /> Ranking de Jugadores
      </h2>

      {/* LOADING */}
      {loading && <p>Cargando ranking...</p>}

      {/* NO DATA */}
      {!loading && ranking.length === 0 && (
        <p style={{ opacity: 0.6 }}>No hay jugadores registrados aún.</p>
      )}

      {/* RANKING LIST */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {ranking.map((user, index) => {
          const isTop1 = index === 0;
          const isTop2 = index === 1;
          const isTop3 = index === 2;

          return (
            <div
              key={user.id}
              style={{
                background: "rgba(255,255,255,0.05)",
                padding: "1.2rem",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                border: isTop1
                  ? "2px solid gold"
                  : isTop2
                  ? "2px solid silver"
                  : isTop3
                  ? "2px solid #cd7f32"
                  : "1px solid rgba(255,255,255,0.1)",
                boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
              }}
            >
              {/* MEDAL */}
              <div style={{ width: "40px", textAlign: "center" }}>
                {isTop1 && <Crown size={32} color="gold" />}
                {isTop2 && <Medal size={28} color="silver" />}
                {isTop3 && <Medal size={28} color="#cd7f32" />}
                {!isTop1 && !isTop2 && !isTop3 && (
                  <p style={{ fontSize: "1.5rem", opacity: 0.7 }}>
                    #{index + 1}
                  </p>
                )}
              </div>

              {/* USER INFO */}
              <div style={{ flex: 1 }}>
                <p
                  style={{
                    fontSize: "1.2rem",
                    fontWeight: 600,
                    marginBottom: ".3rem",
                  }}
                >
                  {user.email}
                </p>
                <p style={{ fontSize: ".9rem", opacity: 0.7 }}>
                  Miembro desde: {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>

              {/* COINS */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  background: "rgba(255,255,255,0.07)",
                  padding: "0.5rem 1rem",
                  borderRadius: "10px",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <Coins size={20} color="#34d399" />
                <p
                  style={{
                    fontSize: "1.2rem",
                    color: "#34d399",
                    fontWeight: 700,
                  }}
                >
                  {user.coins}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
