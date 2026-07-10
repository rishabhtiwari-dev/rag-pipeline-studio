import { useState } from "react";
import LoginForm from "../components/auth/LoginForm";
import SignupForm from "../components/auth/SignupForm";
import { BrainCircuit } from "lucide-react";

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "signup">("signup");

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-violet-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-brand-500 rounded-2xl shadow-lg mb-4">
            <BrainCircuit size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">RAG Pipeline Studio</h1>
          <p className="text-gray-500 mt-1 text-sm">Visual drag-and-drop RAG pipeline builder</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex mb-6 bg-gray-100 rounded-xl p-1">
            {(["signup", "login"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                  mode === m ? "bg-white text-gray-900 shadow" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {m === "signup" ? "Sign Up" : "Sign In"}
              </button>
            ))}
          </div>

          {mode === "signup" ? (
            <SignupForm onSwitch={() => setMode("login")} />
          ) : (
            <LoginForm onSwitch={() => setMode("signup")} />
          )}
        </div>
      </div>
    </div>
  );
}
