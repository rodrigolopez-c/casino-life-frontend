// src/app/api/ranking.ts
import { apiRequest } from "./api";
import type { UserDTO } from "./auth";

export async function getRanking() {
  return apiRequest<{ ranking: UserDTO[] }>("/api/ranking");
}