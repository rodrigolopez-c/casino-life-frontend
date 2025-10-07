import React, {useState } from "react";
import "./GameCard.scss";

type GameCardProps = {
  imageUrl: string; 
  title:string;
  description:string;
  widthRem?: number;
  heightRem?: number;
  onClick?: () => void;
  children?: React.ReactNode; 
};

const GameCard: React.FC<GameCardProps> = ({
  imageUrl,
  widthRem = 20,
  heightRem = 12,
  onClick,
  children,
  title,
  description
}) => {

    const [isHovered, setIsHovered] = useState(false);

  return (
    <div className='GameCard'
    onMouseEnter={()=>{setIsHovered(true)}} 
    onMouseLeave={()=>{setIsHovered(false)}}
    >
        <div
      className="GameCardImage"
      style={{
        backgroundImage: `url(${imageUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        width: `${widthRem}rem`,
        height: `${heightRem}rem`,
        borderRadius: "1rem",
        cursor: "pointer",
      }}
      onClick={onClick}
    >
      {children}
    </div>
    <div className={`GameCardDescription ${isHovered ? "hovered" : ""}`}>
        <span>{title}</span>
        <div className={`Description ${isHovered ? "hovered" : ""}`}>
            <p>{description}</p>
        </div>
    </div>
    </div>
  );
};

export default GameCard;
