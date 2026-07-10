import { create } from "zustand";
import { persist } from "zustand/middleware";
import api, { TOKEN_KEY } from "../hooks/useApi";

interface User {
  id: number;
  email: string;
  has_gemini_key: boolean;
}

interface AuthState {
  token: string | null;
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, geminiKey?: string) => Promise<void>;
  logout: () => void;
  fetchMe: () => Promise<void>;
  updateApiKey: (key: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isLoading: false,

      login: async (email, password) => {
        set({ isLoading: true });
        const { data } = await api.post("/auth/login", { email, password });
        localStorage.setItem(TOKEN_KEY, data.access_token);
        set({ token: data.access_token, isLoading: false });
        await get().fetchMe();
      },

      signup: async (email, password, geminiKey) => {
        set({ isLoading: true });
        const { data } = await api.post("/auth/signup", {
          email,
          password,
          gemini_api_key: geminiKey || undefined,
        });
        localStorage.setItem(TOKEN_KEY, data.access_token);
        set({ token: data.access_token, isLoading: false });
        await get().fetchMe();
      },

      logout: () => {
        localStorage.removeItem(TOKEN_KEY);
        set({ token: null, user: null });
      },

      fetchMe: async () => {
        const { data } = await api.get("/auth/me");
        set({ user: data });
      },

      updateApiKey: async (key) => {
        await api.put("/auth/api-key", { gemini_api_key: key });
        await get().fetchMe();
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({ token: state.token }),
    }
  )
);
