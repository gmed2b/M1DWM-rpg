import type { AuthResponse, User } from "../types/auth.types";

const API_URL = "http://localhost:9000/api"; // À adapter selon le backend

export async function loginApi(username: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) throw new Error("Login failed");
  return res.json();
}

export async function getProfileApi(token: string): Promise<User> {
  const res = await fetch(`${API_URL}/auth/profile`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Profile fetch failed");
  return res.json();
}

export function logoutApi() {
  // Optionnel: appeler un endpoint de logout si besoin
}
