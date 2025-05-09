"use client";

import { loginApi } from "@/services/authService";
import { useAuthStore } from "@/services/authStore";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Login() {
  const [loginError, setLoginError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const { login } = useAuthStore();
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    try {
      const { user, accessToken } = await loginApi(username, password);
      login(user, accessToken);

      router.push("/dashboard");
    } catch (error) {
      if (error instanceof Error) {
        setLoginError(error.message);
      } else {
        setLoginError("Une erreur est survenue lors de la connexion.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="rpgui-container framed flex justify-center items-center py-20!">
      <div className="rpgui-container framed-golden max-w-md w-full p-6">
        <h1 className="!text-2xl text-center">RPG Adventure</h1>
        <hr className="golden mb-8" />

        <div className="flex justify-center mb-6">
          <div className="rpgui-icon shield-slot" style={{ width: "80px", height: "80px" }}></div>
        </div>

        <div className="mb-4 p-3 rpgui-container framed-grey-sm text-red-500 text-center">{loginError}</div>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block mb-2">Nom d&apos;aventurier</label>
            <input
              type="text"
              className="rpgui-input mb-1 w-full"
              placeholder="Entrez votre nom d'aventurier"
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="mb-6">
            <label className="block mb-2">Mot de passe</label>
            <input
              type="password"
              className="rpgui-input mb-1 w-full"
              placeholder="Entrez votre mot de passe"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-3">
            {isLoading ? (
              <button className="rpgui-button golden" disabled>
                <p>Chargement...</p>
              </button>
            ) : (
              <button type="submit" className="rpgui-button golden">
                <p>SE CONNECTER</p>
              </button>
            )}
          </div>
        </form>

        <hr className="golden my-6" />

        <div className="text-center">
          <p className="mb-4">Pas encore de compte?</p>
          <a href="/register" className="rpgui-button golden">
            <p>CRÉER UN COMPTE</p>
          </a>
        </div>
      </div>
    </main>
  );
}
