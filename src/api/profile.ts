// src/app/api/profile.ts
import { apiRequest } from "./api";

export type UserProfile = {
  user: {
    id: string;
    email: string;
    coins: number;
    createdAt: string;
  };
  history: Array<{
    id: string;
    game: string;
    result: "win" | "lose";
    amount: number;
    createdAt: string;
  }>;
};

export async function getMyProfile() {
  return apiRequest<UserProfile>("/api/profile/me");
}