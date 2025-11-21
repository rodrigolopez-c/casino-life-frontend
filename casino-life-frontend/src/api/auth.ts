// src/app/api/auth.ts
import { apiRequest } from "./api";

export type UserDTO = {
  id: number;
  email: string;
  coins: number;
};

export async function login(email: string, password: string) {
  return apiRequest<{ token: string; user: UserDTO }>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function register(email: string, password: string) {
  return apiRequest<{ message: string }>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function getProfile() {
  return apiRequest<{ user: UserDTO }>("/api/profile/me");
}