import { useNavigate } from 'react-router-dom';
import { useBalance } from '../../../contexts/BalanceContext';
import { usePage } from '../../../contexts/BoardNavigation';
import { MoneyIcon } from '../../Icons';
import './Header.scss'

export default function Header() {

  const {currentPage} = usePage();
  const { balance } = useBalance();
  const navigate = useNavigate();

  const handleNavigation = (page: string) => { 
    navigate(`/board/${page}`);
  };

  return (
    <header>
      <div className="LeftSide">
        <img src="/logo.png" alt="logo" />
        <div className="HeaderButtons">
            <span className={currentPage === 'games' ? 'active' : ''} onClick={() => handleNavigation("games")}>Games</span>
            <span className={currentPage === 'profile' ? 'active' : ''} onClick={() => handleNavigation("profile")} >Profile</span>
            <span className={currentPage === 'ranking' ? 'active' : ''} onClick={() => handleNavigation("ranking")}>Ranking</span>
        </div>
      </div>
      <div className="RightSide">
        <div className="score">
          <MoneyIcon />
          <span>{balance}</span>
        </div>
      </div>
    </header>
  );
}
