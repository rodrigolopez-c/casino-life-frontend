import React, { useState } from "react";
import "./RewardedAdModal.scss";

type RewardedAdProps = {
  onClose: () => void;        // se dispara si el usuario cierra antes de tiempo
  onReward: () => void | Promise<void>; // se dispara si el video termina
};

const VIDEO_SOURCES = [
  "https://samplelib.com/lib/preview/mp4/sample-5s.mp4",
  "https://samplelib.com/lib/preview/mp4/sample-10s.mp4",
  "https://filesamples.com/samples/video/mp4/sample_640x360.mp4",
];

export default function RewardedAdModal({ onClose, onReward }: RewardedAdProps) {
  const [finished, setFinished] = useState(false);

  const videoSrc = VIDEO_SOURCES[Math.floor(Math.random() * VIDEO_SOURCES.length)];

  return (
    <div className="AdOverlay">
      <div className="AdContent" onClick={(e) => e.stopPropagation()}>
        <h2>Mira el anuncio completo</h2>

        <video
          src={videoSrc}
          autoPlay
          className="AdVideo"
          controls={false}
          onEnded={async () => {
            setFinished(true);
            await onReward();    // recompensa ✔️
            // NO se llama onClose aquí → lo controla el Header
          }}
        />

        <p className="AdNote">Debes ver el anuncio completo para recibir tu recompensa.</p>

        {/* Si terminó el video → permitir cerrar */}
        {finished && (
          <button className="CloseBtn" onClick={onClose}>
            Cerrar
          </button>
        )}
      </div>
    </div>
  );
}