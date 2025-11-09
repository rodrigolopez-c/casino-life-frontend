import React from "react";
import "./GameCard.scss";

type GameCardProps = {
  imageUrl: string;
  title: string;
  description: string;
  onClick?: () => void;
};

const GameCard: React.FC<GameCardProps> = ({
  imageUrl,
  title,
  description,
  onClick,
}) => {
  return (
    <div className="GameCard" onClick={onClick}>
      <div
        className="GameCardImage"
        style={{ backgroundImage: `url(${imageUrl})` }}
      />
      <div className="GameCardDescription">
        <span>{title}</span>
        <p>{description}</p>
      </div>
    </div>
  );
};

export default GameCard;