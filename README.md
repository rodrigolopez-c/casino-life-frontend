Para correr dev:
npm i
npm run dev

---PARA CREAR JUEGOS---

Cada juego esta dentro de:
src/app/components/Games/<nombreDelJuego>/
│
├── index.tsx       ← Componente principal del juego (React)
├── styles.scss      ← Estilos específicos del juego
└── config.json      ← Configuración del juego (título, descripción e imagen)

Todos los juegos deben tener un index.tsx y un config.json

La estructura del config.json:
{
  "title": "Dices",
  "description": "Lanza los dados y pon a prueba tu suerte.",
  "imageUrl": "/GamesCards/dices.png"
}

Esto es la configuracion para que se muestre cada juego con su titulo descripcion y su imagen

---PARA CREAR UN JUEGO----
npm run casino create game <nombreDelJuego>

Este comando creara la siguiente estructura dentro de src/app/components/Games/
├── index.tsx
├── styles.scss
└── config.json

no cambiar el nombre de index.tsx ni config.json

EJEMPLO:
npm run casino create game blackjack

creara:
src/app/components/Games/blackjack/
├── index.tsx
├── styles.scss
└── config.json

Y el juego aparecerá automáticamente en:
	•	La pantalla principal de juegos (/board/games)
	•	Su propia ruta individual (/board/games/blackjack)

-------------------------------------------------------

	•	Ejecuta el comando desde la raíz del proyecto (no desde src).
	•	Cada juego debe exportar un componente React por defecto desde su index.tsx.
	•	El sistema carga automáticamente todas las carpetas dentro de: /src/app/components/Games/