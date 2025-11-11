import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './login/login';
import MainBoard from './Board/MainBoard';
import GamesBoard from './Board/GamesBoard/GamesBoard';
import ProfileBoard from './Board/ProfileBoard/ProfileBoard';
import RankingBoard from './Board/RankingBoard/RankingBoard';
import { PageProvider } from './contexts/BoardNavigation';
import { BalanceProvider } from './contexts/BalanceContext';
import { games } from './routes/dynamicGames'; // 👈 Importa el sistema dinámico

const App: React.FC = () => {
  return (
    <Router>
      <BalanceProvider>
        <PageProvider>
          <Routes>
            {/* Redirección inicial */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />

            {/* Estructura principal */}
            <Route path="/board" element={<MainBoard />}>
              <Route index element={<Navigate to="games" replace />} />
              <Route path="games" element={<GamesBoard />} />
              <Route path="profile" element={<ProfileBoard />} />
              <Route path="ranking" element={<RankingBoard />} />

              {/* 🔥 Aquí generamos dinámicamente todos los juegos */}
              {games.map(({ id, Component }) => (
                <Route key={id} path={`games/${id}`} element={<Component />} />
              ))}
            </Route>

            {/* 404 */}
            <Route path="*" element={<h2>Página no encontrada</h2>} />
          </Routes>
        </PageProvider>
      </BalanceProvider>
    </Router>
  );
};

export default App;