#!/usr/bin/env node
import fs from "fs";
import path from "path";
import chalk from "chalk";

const log = {
  success: (msg: string) => console.log(chalk.green("✔ ") + msg),
  info: (msg: string) => console.log(chalk.cyan("ℹ ") + msg),
  error: (msg: string) => console.log(chalk.red("✖ ") + msg),
};

// --- Utilidad para capitalizar ---
function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// --- CLI principal ---
function main() {
  const args = process.argv.slice(2);

  if (args[0] !== "create" || args[1] !== "game" || !args[2]) {
    log.error("Uso correcto: npm run casino create game <nombre>");
    process.exit(1);
  }

  const gameName = args[2].toLowerCase();
  const basePath = path.resolve("src/app/components/Games", gameName);

  if (fs.existsSync(basePath)) {
    log.error(`El juego "${gameName}" ya existe.`);
    process.exit(1);
  }

  fs.mkdirSync(basePath, { recursive: true });

  // index.tsx
  const componentContent = `
import './styles.scss';

export default function ${capitalize(gameName)}Game() {
  return (
    <div className="${gameName}-game">
      <h1>${capitalize(gameName)} Game</h1>
      <p>This is a new game. Modify this file to implement your logic!</p>
    </div>
  );
}
`;
  fs.writeFileSync(path.join(basePath, "index.tsx"), componentContent.trimStart());

  // config.json
  const configContent = {
    title: capitalize(gameName),
    description: `A brand new game called ${capitalize(gameName)}!`,
    imageUrl: "/GamesCards/default.png",
  };
  fs.writeFileSync(path.join(basePath, "config.json"), JSON.stringify(configContent, null, 2));

  // styles.scss
  const styleContent = `
.${gameName}-game {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: white;
  font-family: system-ui, sans-serif;

  h1 {
    font-size: 2.5rem;
    margin-bottom: 1rem;
  }

  p {
    font-size: 1.2rem;
    opacity: 0.8;
  }
}
`;
  fs.writeFileSync(path.join(basePath, "styles.scss"), styleContent.trimStart());

  log.success(`Juego "${gameName}" creado correctamente 🎮`);
  log.info(`Ruta: ${basePath}`);
  log.info(`Archivos: index.tsx, config.json, styles.scss`);
}

main();