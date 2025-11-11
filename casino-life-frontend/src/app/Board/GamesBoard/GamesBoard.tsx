import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { games } from "../../routes/dynamicGames";
import GameCard from "../../components/MainBoard/GameCard/GameCard";
import { usePage } from "../../contexts/BoardNavigation";
import "./GamesBoard.scss";

export default function GamesBoard() {
  const { setCurrentPage } = usePage();
  const navigate = useNavigate();

  useEffect(() => {
    setCurrentPage("games");
  }, []);

  return (
    <div className="GamesBoard">
      {games.map(({ id, config }) => (
        <GameCard
          key={id}
          imageUrl={config.imageUrl}
          title={config.title}
          description={config.description}
          onClick={() => navigate(`/board/games/${id}`)}
        />
      ))}
    </div>
  );
}