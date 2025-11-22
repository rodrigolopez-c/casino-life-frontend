import { useNavigate } from "react-router-dom";
import { useState } from "react";

import { useBalance } from "../../../contexts/BalanceContext";
import { usePage } from "../../../contexts/BoardNavigation";
import { MoneyIcon } from "../../Icons";
import "./Header.scss";
import { updateCoins } from "@/api/coins";

import RewardedAdModal from "./RewardedAdModal";

// --- Modal de éxito ---
function RewardSuccessModal({ amount, onClose }: { amount: number; onClose: () => void }) {
  return (
    <div className="CoinsModalOverlay" onClick={onClose}>
      <div className="CoinsModal" onClick={(e) => e.stopPropagation()}>
        <h2>¡Recompensa obtenida! 🎉</h2>
        <p>Ganaste <strong>+{amount} coins</strong>.</p>

        <button className="CloseModalBtn" onClick={onClose}>
          Cerrar
        </button>
      </div>
    </div>
  );
}

// --- Modal de error ---
function RewardErrorModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="CoinsModalOverlay" onClick={onClose}>
      <div className="CoinsModal" onClick={(e) => e.stopPropagation()}>
        <h2>No completaste el anuncio</h2>
        <p>Debes verlo completo para recibir la recompensa.</p>

        <button className="CloseModalBtn" onClick={onClose}>
          Entendido
        </button>
      </div>
    </div>
  );
}

function RewardLimitModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="CoinsModalOverlay" onClick={onClose}>
      <div className="CoinsModal" onClick={(e) => e.stopPropagation()}>
        <h2>Límite diario alcanzado</h2>
        <p>
          Solo puedes ver <strong>2 anuncios por día</strong> para ganar coins.
          <br />
          Vuelve mañana para reclamar más recompensas.
        </p>

        <button className="CloseModalBtn" onClick={onClose}>
          Entendido
        </button>
      </div>
    </div>
  );
}

export default function Header() {
  const { currentPage } = usePage();
  const { balance, refreshBalance } = useBalance();
  const navigate = useNavigate();

  const [showModal, setShowModal] = useState(false);
  const [showRewarded, setShowRewarded] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [showLimit, setShowLimit] = useState(false);

  const rewardAmount = 50;

  // ───────────────
  // LÓGICA DIARIA
  // ───────────────
  const canWatchAd = () => {
    const today = new Date().toISOString().split("T")[0];
    const savedDate = localStorage.getItem("rewarded_date");
    const count = Number(localStorage.getItem("rewarded_count") || 0);

    if (savedDate !== today) {
      localStorage.setItem("rewarded_date", today);
      localStorage.setItem("rewarded_count", "0");
      return true;
    }

    return count < 2;
  };

  const incrementDailyCount = () => {
    const today = new Date().toISOString().split("T")[0];
    const savedDate = localStorage.getItem("rewarded_date");
    let count = Number(localStorage.getItem("rewarded_count") || 0);

    if (savedDate !== today) {
      localStorage.setItem("rewarded_date", today);
      count = 0;
    }

    localStorage.setItem("rewarded_count", String(count + 1));
  };

  return (
    <>
      <header>
        <div className="LeftSide">
          <img src="/logo.png" alt="logo" />
          <div className="HeaderButtons">
            <span className={currentPage === "games" ? "active" : ""} onClick={() => navigate("/board/games")}>
              Games
            </span>
            <span className={currentPage === "profile" ? "active" : ""} onClick={() => navigate("/board/profile")}>
              Profile
            </span>
            <span className={currentPage === "ranking" ? "active" : ""} onClick={() => navigate("/board/ranking")}>
              Ranking
            </span>
          </div>
        </div>

        <div className="RightSide">
          <div className="score">
            <MoneyIcon />
            <span>{balance}</span>
          </div>

          <button className="AddCoinsBtn" onClick={() => setShowModal(true)}>
            +
          </button>
        </div>
      </header>

      {/* ─────────── Modal principal ─────────── */}
      {showModal && (
        <div className="CoinsModalOverlay" onClick={() => setShowModal(false)}>
          <div className="CoinsModal" onClick={(e) => e.stopPropagation()}>
            <h2>Gana coins</h2>
            <p>Mira un anuncio para ganar <strong>+{rewardAmount} coins</strong>.</p>

            <button
              className="WatchAdBtn"
              onClick={() => {
                if (!canWatchAd()) {
                  setShowModal(false);
                  setShowLimit(true);
                  return;
                }

                setShowModal(false);
                setShowRewarded(true);
              }}
            >
              Ver anuncio
            </button>

            <button className="CloseModalBtn" onClick={() => setShowModal(false)}>
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* ─────────── Modal del anuncio ─────────── */}
      {showRewarded && (
        <RewardedAdModal
          // Usuario cierra → error SOLO si no terminó el video
          onClose={() => {
            setShowRewarded(false);
            setShowError(true);
          }}
          // Usuario termina → éxito
          onReward={async () => {
            incrementDailyCount();
            await updateCoins("rewarded-ad", "win", rewardAmount);
            await refreshBalance();

            setShowRewarded(false);
            setShowSuccess(true);
          }}
        />
      )}

      {/* ─────────── Modal éxito ─────────── */}
      {showSuccess && <RewardSuccessModal amount={rewardAmount} onClose={() => setShowSuccess(false)} />}

      {/* ─────────── Modal error ─────────── */}
      {showError && <RewardErrorModal onClose={() => setShowError(false)} />}

      {showLimit && <RewardLimitModal onClose={() => setShowLimit(false)} />}
    </>
  );
}