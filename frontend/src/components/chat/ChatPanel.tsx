import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, ChevronDown, ChevronUp, AlertCircle, Loader2 } from "lucide-react";
import { useChatStore } from "../../store/chatStore";
import { usePipelineStore } from "../../store/pipelineStore";
import { ChatMessage } from "../../types/pipeline";
import api from "../../hooks/useApi";
import toast from "react-hot-toast";

export default function ChatPanel() {
  const [input, setInput] = useState("");
  const [expandedSources, setExpandedSources] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { messages, isLoading, addMessage, setLoading, clear } = useChatStore();
  const isBuilt = usePipelineStore((s) => s.isBuilt);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    const q = input.trim();
    if (!q) return;
    if (!isBuilt) { toast.error("Build the pipeline first!"); return; }

    const userMsg: ChatMessage = { role: "user", content: q };
    addMessage(userMsg);
    setInput("");
    setLoading(true);

    try {
      const { data } = await api.post("/chat/query", { question: q });
      const assistantMsg: ChatMessage = {
        role: "assistant",
        content: data.answer,
        sources: data.sources,
        isMock: data.is_mock,
      };
      addMessage(assistantMsg);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || "Query failed";
      toast.error(msg);
      addMessage({ role: "assistant", content: `Error: ${msg}` });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-2">
          <Bot size={18} className="text-brand-500" />
          <h2 className="font-bold text-gray-800 text-sm">RAG Chat</h2>
          {!isBuilt && (
            <span className="text-xs bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
              <AlertCircle size={11} /> Build pipeline first
            </span>
          )}
        </div>
        {messages.length > 0 && (
          <button onClick={clear} className="text-xs text-gray-400 hover:text-gray-600">Clear</button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center text-gray-400">
            <Bot size={40} className="mb-3 text-gray-200" />
            <p className="text-sm font-medium">No messages yet</p>
            <p className="text-xs mt-1">Build your pipeline and start asking questions</p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            {msg.role === "assistant" && (
              <div className="w-7 h-7 rounded-full bg-brand-500 flex items-center justify-center flex-shrink-0 mt-1">
                <Bot size={14} className="text-white" />
              </div>
            )}
            <div className={`max-w-[80%] ${msg.role === "user" ? "order-first" : ""}`}>
              <div
                className={`rounded-2xl px-4 py-3 text-sm ${
                  msg.role === "user"
                    ? "bg-brand-500 text-white rounded-tr-sm"
                    : "bg-gray-100 text-gray-800 rounded-tl-sm"
                }`}
              >
                <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
              </div>

              {msg.isMock && (
                <p className="text-xs text-amber-500 mt-1 px-1">Mock response — activate a real provider for live answers</p>
              )}

              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-1.5 px-1">
                  <button
                    onClick={() => setExpandedSources(expandedSources === i ? null : i)}
                    className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600"
                  >
                    {expandedSources === i ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    {msg.sources.length} source chunk(s)
                  </button>
                  {expandedSources === i && (
                    <div className="mt-1 space-y-1">
                      {msg.sources.slice(0, 3).map((s, j) => (
                        <div key={j} className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-600 line-clamp-3">
                          {s.content}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            {msg.role === "user" && (
              <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 mt-1">
                <User size={14} className="text-gray-600" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-full bg-brand-500 flex items-center justify-center flex-shrink-0">
              <Bot size={14} className="text-white" />
            </div>
            <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-2">
              <Loader2 size={14} className="animate-spin text-gray-400" />
              <span className="text-sm text-gray-500">Thinking…</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder={isBuilt ? "Ask a question about your documents…" : "Build the pipeline first…"}
            disabled={!isBuilt || isLoading}
            className="flex-1 border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:bg-gray-50 disabled:text-gray-400"
          />
          <button
            onClick={handleSend}
            disabled={!isBuilt || isLoading || !input.trim()}
            className="btn-primary px-4 disabled:opacity-50"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
