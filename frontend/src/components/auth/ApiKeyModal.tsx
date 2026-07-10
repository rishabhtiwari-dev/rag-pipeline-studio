import { useState } from "react";
import { useAuthStore } from "../../store/authStore";
import toast from "react-hot-toast";
import { Key, X, Eye, EyeOff } from "lucide-react";

interface Props {
  onClose: () => void;
}

export default function ApiKeyModal({ onClose }: Props) {
  const [key, setKey] = useState("");
  const [show, setShow] = useState(false);
  const { updateApiKey } = useAuthStore();

  const handleSave = async () => {
    if (!key.trim()) { toast.error("Enter an API key"); return; }
    try {
      await updateApiKey(key.trim());
      toast.success("Gemini API key saved");
      onClose();
    } catch {
      toast.error("Failed to save key");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <X size={20} />
        </button>
        <div className="flex items-center gap-2 mb-4">
          <Key className="text-brand-500" size={22} />
          <h2 className="text-lg font-bold text-gray-900">Set Gemini API Key</h2>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          Required to build and query RAG pipelines. Get yours at{" "}
          <span className="text-brand-500 font-medium">aistudio.google.com</span>.
          Keys are stored AES-256 encrypted.
        </p>
        <div className="relative">
          <input
            type={show ? "text" : "password"}
            value={key}
            onChange={(e) => setKey(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm font-mono"
            placeholder="AIzaSy..."
          />
          <button type="button" onClick={() => setShow(!show)} className="absolute right-2 top-2 text-gray-400">
            {show ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        <button
          onClick={handleSave}
          className="mt-4 w-full bg-brand-500 hover:bg-brand-600 text-white font-semibold py-2 rounded-lg"
        >
          Save Key
        </button>
      </div>
    </div>
  );
}
