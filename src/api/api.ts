// src/app/api/api.ts
// Nota: para simplificar el entorno de pruebas, usamos directamente una URL base fija.
// Si luego quieres leer VITE_API_URL desde variables de entorno/Vite, lo podemos ajustar sin romper Jest.
const API_URL = "http://localhost:8000";
export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || `HTTP ${res.status}`);
  }

  return res.json();
}