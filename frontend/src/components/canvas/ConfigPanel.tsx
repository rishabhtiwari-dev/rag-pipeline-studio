import { usePipelineStore } from "../../store/pipelineStore";
import { X } from "lucide-react";

export default function ConfigPanel() {
  const { nodes, selectedNodeId, selectNode, updateNodeData } = usePipelineStore();
  const node = nodes.find((n) => n.id === selectedNodeId);

  if (!node) return null;

  const update = (key: string, value: unknown) => updateNodeData(node.id, { [key]: value } as never);

  return (
    <div className="absolute right-0 top-0 h-full w-72 bg-white border-l border-gray-200 shadow-xl z-10 flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <h3 className="font-bold text-gray-800 text-sm">Configure Node</h3>
        <button onClick={() => selectNode(null)} className="text-gray-400 hover:text-gray-600">
          <X size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {node.type === "loaderNode" && (
          <div>
            <label className="config-label">Loader Type</label>
            <select
              value={(node.data as { loader_type: string }).loader_type}
              onChange={(e) => update("loader_type", e.target.value)}
              className="config-select"
            >
              <option value="auto">Auto (by extension)</option>
              <option value="pdf">PDF</option>
              <option value="text">Plain Text</option>
              <option value="markdown">Markdown</option>
            </select>
          </div>
        )}

        {node.type === "splitterNode" && (
          <>
            <div>
              <label className="config-label">Splitter Type</label>
              <select
                value={(node.data as { splitter_type: string }).splitter_type}
                onChange={(e) => update("splitter_type", e.target.value)}
                className="config-select"
              >
                <option value="recursive">Recursive Character</option>
                <option value="character">Character</option>
                <option value="token">Token</option>
              </select>
            </div>
            <div>
              <label className="config-label">Chunk Size</label>
              <input
                type="number"
                value={(node.data as { chunk_size: number }).chunk_size}
                onChange={(e) => update("chunk_size", Number(e.target.value))}
                className="config-input"
                min={100}
                max={8000}
                step={100}
              />
            </div>
            <div>
              <label className="config-label">Chunk Overlap</label>
              <input
                type="number"
                value={(node.data as { chunk_overlap: number }).chunk_overlap}
                onChange={(e) => update("chunk_overlap", Number(e.target.value))}
                className="config-input"
                min={0}
                max={1000}
                step={50}
              />
            </div>
          </>
        )}

        {node.type === "vectorStoreNode" && (
          <>
            <div>
              <label className="config-label">Store Type</label>
              <select
                value={(node.data as { store_type: string }).store_type}
                onChange={(e) => update("store_type", e.target.value)}
                className="config-select"
              >
                <option value="chroma">ChromaDB (active)</option>
                <option value="faiss">FAISS (coming soon)</option>
              </select>
            </div>
            <div>
              <label className="config-label">Collection Name</label>
              <input
                type="text"
                value={(node.data as { collection_name: string }).collection_name}
                onChange={(e) => update("collection_name", e.target.value)}
                className="config-input"
              />
            </div>
          </>
        )}

        {node.type === "llmNode" && (
          <>
            <div>
              <label className="config-label">Provider</label>
              <select
                value={(node.data as { llm_type: string }).llm_type}
                onChange={(e) => {
                  const t = e.target.value;
                  update("llm_type", t);
                  update("model_name", t === "gemini" ? "gemini-1.5-flash" : t === "openai" ? "gpt-4o" : "claude-3-5-sonnet");
                }}
                className="config-select"
              >
                <option value="gemini">Google Gemini (active)</option>
                <option value="openai">OpenAI (mock)</option>
                <option value="claude">Anthropic Claude (mock)</option>
              </select>
            </div>
            <div>
              <label className="config-label">Model</label>
              <input
                type="text"
                value={(node.data as { model_name: string }).model_name}
                onChange={(e) => update("model_name", e.target.value)}
                className="config-input"
              />
            </div>
            <div>
              <label className="config-label">Temperature: {(node.data as { temperature: number }).temperature}</label>
              <input
                type="range"
                min={0}
                max={1}
                step={0.1}
                value={(node.data as { temperature: number }).temperature}
                onChange={(e) => update("temperature", Number(e.target.value))}
                className="w-full accent-brand-500"
              />
            </div>
            <div>
              <label className="config-label">Max Tokens</label>
              <input
                type="number"
                value={(node.data as { max_tokens: number }).max_tokens}
                onChange={(e) => update("max_tokens", Number(e.target.value))}
                className="config-input"
                min={256}
                max={8192}
                step={256}
              />
            </div>
            {(node.data as { llm_type: string }).llm_type !== "gemini" && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-700">
                This provider is a UI mock. Only Gemini is wired to a live backend.
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
