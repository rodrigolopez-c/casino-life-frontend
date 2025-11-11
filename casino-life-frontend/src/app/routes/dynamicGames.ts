export type GameModule = {
  id: string;
  Component: React.ComponentType;
  config: {
    title: string;
    description: string;
    imageUrl: string;
  };
};

// 🧩 Escaneo de todos los juegos dentro de app/components/Games/
const gameModules = import.meta.glob('/src/app/components/Games/*/index.tsx', { eager: true });
const gameConfigs = import.meta.glob('/src/app/components/Games/*/config.json', { eager: true });

// Debug: verifica detección
console.log('🎮 Detected game modules:', Object.keys(gameModules));
console.log('🧩 Detected game configs:', Object.keys(gameConfigs));

export const games: GameModule[] = Object.entries(gameModules).map(([path, mod]) => {
  const match = path.match(/\/Games\/([^/]+)\/index\.tsx$/);
  const id = match?.[1] ?? 'unknown';

  const Component = (mod as any).default;
  const configPath = Object.keys(gameConfigs).find((p) => p.includes(`/Games/${id}/config.json`));

  const config = configPath
    ? (gameConfigs[configPath] as any).default
    : {
        title: id,
        description: 'No description provided.',
        imageUrl: '/GamesCards/default.png',
      };

  return { id, Component, config };
});

console.log('✅ Loaded games:', games);