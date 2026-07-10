import { useState, useEffect } from "react";
import { useAuthStore } from "../store/authStore";
import PipelineCanvas from "../components/canvas/PipelineCanvas";
import DocumentUpload from "../components/documents/DocumentUpload";
import ChatPanel from "../components/chat/ChatPanel";
import ApiKeyModal from "../components/auth/ApiKeyModal";
import { BrainCircuit, LogOut, Key, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";

type Tab = "canvas" | "documents" | "chat";

export default function DashboardPage() {
  const { user, logout, fetchMe } = useAuthStore();
  const [tab, setTab] = useState<Tab>("documents");
  const [showKeyModal, setShowKeyModal] = useState(false);

  useEffect(() => {
    fetchMe();
  }, []);

  useEffect(() => {
    if (user && !user.has_gemini_key) {
      toast("Set your Gemini API key to get started", { icon: "🔑", duration: 5000 });
    }
  }, [user]);

  const TABS: { id: Tab; label: string }[] = [
    { id: "documents", label: "1. Upload Docs" },
    { id: "canvas", label: "2. Build Pipeline" },
    { id: "chat", label: "3. Chat" },
  ];

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Top Nav */}
      <header className="bg-white border-b border-gray-200 flex items-center px-4 py-2 gap-3 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-brand-500 rounded-lg flex items-center justify-center">
            <BrainCircuit size={15} className="text-white" />
          </div>
          <span className="font-bold text-gray-900 text-sm">RAG Pipeline Studio</span>
        </div>

        {/* Tabs */}
        <div className="flex ml-4 gap-1 bg-gray-100 rounded-lg p-0.5">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                tab === t.id ? "bg-white text-brand-600 shadow" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-2">
          {!user?.has_gemini_key && (
            <button
              onClick={() => setShowKeyModal(true)}
              className="flex items-center gap-1.5 text-xs bg-amber-50 border border-amber-200 text-amber-600 px-3 py-1.5 rounded-lg hover:bg-amber-100 transition-colors font-medium"
            >
              <AlertTriangle size={13} /> Set Gemini Key
            </button>
          )}
          {user?.has_gemini_key && (
            <button
              onClick={() => setShowKeyModal(true)}
              className="text-gray-400 hover:text-gray-600 p-1.5"
              title="Update API key"
            >
              <Key size={16} />
            </button>
          )}
          <span className="text-xs text-gray-400 hidden sm:block">{user?.email}</span>
          <button
            onClick={() => { logout(); toast.success("Signed out"); }}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-700 transition-colors"
          >
            <LogOut size={15} /> Sign out
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 min-h-0 flex flex-col">
        {tab === "documents" && (
          <div className="flex-1 overflow-hidden">
            <div className="h-full max-w-2xl mx-auto">
              <DocumentUpload />
            </div>
          </div>
        )}
        {tab === "canvas" && <PipelineCanvas />}
        {tab === "chat" && (
          <div className="flex-1 min-h-0 max-w-3xl w-full mx-auto flex flex-col">
            <ChatPanel />
          </div>
        )}
      </main>

      {showKeyModal && <ApiKeyModal onClose={() => setShowKeyModal(false)} />}
    </div>
  );
}
