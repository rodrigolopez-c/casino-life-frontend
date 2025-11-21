// src/app/api/profile.ts
import { apiRequest } from "./api";

export type GameRecord = {
  id: number;
  game: string;
  result: "win" | "lost";
  amount: number;
  createdAt: string;
};

export async function getUserHistory() {
  return apiRequest<{ records: GameRecord[] }>("/api/profile/history");
}