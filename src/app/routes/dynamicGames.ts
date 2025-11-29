import React from "react";
import type { ComponentType } from "react";

import CoinFlipComponent from "../components/Games/CoinFlip";
import coinFlipConfig from "../components/Games/CoinFlip/config.json";

import RouletteComponent from "../components/Games/Roulette";
import rouletteConfig from "../components/Games/Roulette/config.json";

import BlackjackComponent from "../components/Games/blackjack";
import blackjackConfig from "../components/Games/blackjack/config.json";

import DicesComponent from "../components/Games/dices";
import dicesConfig from "../components/Games/dices/config.json";

import HigherLowerComponent from "../components/Games/higher-lower";
import higherLowerConfig from "../components/Games/higher-lower/config.json";

import SlotsComponent from "../components/Games/slots";
import slotsConfig from "../components/Games/slots/config.json";

export type GameModule = {
  id: string;
  Component: ComponentType;
  config: {
    title: string;
    description: string;
    imageUrl: string;
  };
};

export const games: GameModule[] = [
  { id: "CoinFlip", Component: CoinFlipComponent, config: coinFlipConfig },
  { id: "Roulette", Component: RouletteComponent, config: rouletteConfig },
  { id: "blackjack", Component: BlackjackComponent, config: blackjackConfig },
  { id: "dices", Component: DicesComponent, config: dicesConfig },
  { id: "higher-lower", Component: HigherLowerComponent, config: higherLowerConfig },
  { id: "slots", Component: SlotsComponent, config: slotsConfig },
];
