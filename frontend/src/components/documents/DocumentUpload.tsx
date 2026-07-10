import { useState, useRef, useEffect } from "react";
import { Upload, FileText, Trash2, Loader2, FileCheck } from "lucide-react";
import api from "../../hooks/useApi";
import toast from "react-hot-toast";

interface Doc {
  id: number;
  filename: string;
  file_type: string;
  uploaded_at: string;
}

export default function DocumentUpload() {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const fetchDocs = async () => {
    try {
      const { data } = await api.get("/documents/");
      setDocs(data);
    } catch {
      /* ignore */
    }
  };

  useEffect(() => { fetchDocs(); }, []);

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    const form = new FormData();
    Array.from(files).forEach((f) => form.append("files", f));
    try {
      await api.post("/documents/upload", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success(`${files.length} file(s) uploaded`);
      fetchDocs();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || "Upload failed";
      toast.error(msg);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/documents/${id}`);
      setDocs((prev) => prev.filter((d) => d.id !== id));
      toast.success("Deleted");
    } catch {
      toast.error("Delete failed");
    }
  };

  const extIcon = (type: string) => {
    const colors: Record<string, string> = { pdf: "text-red-500", txt: "text-gray-500", md: "text-blue-500" };
    return colors[type] || "text-gray-400";
  };

  return (
    <div className="flex flex-col h-full p-4 space-y-4">
      <div>
        <h2 className="font-bold text-gray-800">Knowledge Base</h2>
        <p className="text-xs text-gray-500 mt-0.5">Upload PDF, TXT, or MD files to build your RAG knowledge base.</p>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); handleUpload(e.dataTransfer.files); }}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl flex flex-col items-center justify-center py-10 cursor-pointer transition-all ${
          dragOver ? "border-brand-500 bg-brand-50" : "border-gray-300 hover:border-brand-400 hover:bg-gray-50"
        }`}
      >
        {uploading ? (
          <Loader2 size={32} className="text-brand-500 animate-spin mb-2" />
        ) : (
          <Upload size={32} className={`mb-2 ${dragOver ? "text-brand-500" : "text-gray-400"}`} />
        )}
        <p className="text-sm font-medium text-gray-600">
          {uploading ? "Uploading…" : "Drop files here or click to browse"}
        </p>
        <p className="text-xs text-gray-400 mt-1">PDF, TXT, MD supported</p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".pdf,.txt,.md"
          className="hidden"
          onChange={(e) => handleUpload(e.target.files)}
        />
      </div>

      {/* Document list */}
      {docs.length > 0 && (
        <div className="flex-1 overflow-y-auto space-y-2">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{docs.length} document(s)</p>
          {docs.map((doc) => (
            <div key={doc.id} className="flex items-center gap-3 bg-gray-50 rounded-lg px-3 py-2.5 group">
              <FileText size={16} className={extIcon(doc.file_type)} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-700 truncate">{doc.filename}</p>
                <p className="text-xs text-gray-400 uppercase">{doc.file_type}</p>
              </div>
              <FileCheck size={14} className="text-emerald-400 flex-shrink-0" />
              <button
                onClick={() => handleDelete(doc.id)}
                className="text-gray-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {docs.length === 0 && !uploading && (
        <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
          No documents uploaded yet
        </div>
      )}
    </div>
  );
}
