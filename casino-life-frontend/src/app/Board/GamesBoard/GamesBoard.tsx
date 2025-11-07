import { useEffect } from 'react';
import GameCard from '../../components/MainBoard/GameCard/GameCard'
import { usePage } from '../../contexts/BoardNavigation';
import './GamesBoard.scss';
import { useNavigate } from 'react-router-dom';

type GameCardData = {
  imageUrl: string;
  title: string;
  description: string;
};

const games: GameCardData[] = [
  {
    imageUrl: "/GamesCards/game1.png",
    title: "Dices",
    description: "Dices is a quick casino game where you roll the dice and hope to land the highest total possible amount.",
  },
  {
    imageUrl: "/GamesCards/game2.png",
    title: "High-Low?",
    description: "is a simple casino card game where you guess whether the next card drawn will be higher or lower than the current one.",
  },
  {
    imageUrl: "/GamesCards/game4.png",
    title: "BlackJack",
    description: "Blackjack is a classic casino card game where you aim to reach 21 or get closer to it than the dealer without going over.",
  },
  {
    imageUrl: "/GamesCards/game6.png",
    title: "Coin Flip",
    description: "Coin Flip is a quick casino game of chance where you simply guess whether the coin will land on heads or tails — a 50/50 shot to win.",
  },
  {
    imageUrl: "/GamesCards/game3.png",
    title: "BlackJack",
    description: "Reach 21 without going over — beat the dealer to win.",
  },
]

export default function GamesBoard(){

    const { setCurrentPage } = usePage();
    const navigate = useNavigate();

    useEffect(()=>{
        setCurrentPage('games')
    },[])

    return (
      <div className='GamesBoard'>
        {games.map((game, index) => (
          <GameCard
            key={game.title}
            imageUrl={game.imageUrl}
            widthRem={23}
            heightRem={40}
            title={game.title}
            description={game.description}
            onClick={index === 0 ? () => navigate('/board/dices') : undefined} // AÑADE ESTO
          >
          </GameCard>
        ))}
      </div>
    )
}
