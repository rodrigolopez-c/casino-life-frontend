// src/app/api/coins.ts
import { apiRequest } from "./api";

export async function updateCoins(game: string, result: "win" | "lost", amount: number) {
  return apiRequest<{ message: string; newBalance: number }>("/api/profile/update-coins", {
    method: "POST",
    body: JSON.stringify({ game, result, amount }),
  });
}