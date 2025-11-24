import { apiRequest } from "./api";
import type { UserDTO } from "./auth";

export async function getRanking() {
  return apiRequest<{ count: number; results: UserDTO[] }>("/api/ranking");
}