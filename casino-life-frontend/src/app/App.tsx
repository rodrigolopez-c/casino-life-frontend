import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './login/Login' 
import MainBoard from './Board/MainBoard';
import GamesBoard from './Board/GamesBoard/GamesBoard';
import { PageProvider } from './contexts/BoardNavigation';
import ProfileBoard from './Board/ProfileBoard/ProfileBoard';
import RankingBoard from './Board/RankingBoard/RankingBoard';
import DicesGame from './components/Dices/DicesGame';


const App: React.FC = () => {
  return (
    <Router>
      <PageProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
          <Route path='/board' element={<MainBoard/>}>
           <Route index element={<Navigate to="games" replace />} />
           <Route path='games' element={<GamesBoard/>}/>
           <Route path='dices' element={<DicesGame/>}/>
           <Route path='profile' element={<ProfileBoard/>}/>
           <Route path='ranking' element={<RankingBoard/>}/>
        </Route>
        <Route path="*" element={<h2>Página no encontrada</h2>} />
      </Routes>
      </PageProvider>
    </Router>
  );
}

export default App;