import { useEffect } from "react";
import { Toaster } from "react-hot-toast";
import { useAuthStore } from "./store/authStore";
import { TOKEN_KEY } from "./hooks/useApi";
import AuthPage from "./pages/AuthPage";
import DashboardPage from "./pages/DashboardPage";

export default function App() {
  const { token, user, fetchMe } = useAuthStore();

  useEffect(() => {
    // Sync persisted Zustand token → direct localStorage key on page load
    if (token) localStorage.setItem(TOKEN_KEY, token);
    if (token && !user) fetchMe().catch(() => {});
  }, [token]);

  return (
    <>
      <Toaster position="top-right" toastOptions={{ className: "text-sm font-medium" }} />
      {token ? <DashboardPage /> : <AuthPage />}
    </>
  );
}
