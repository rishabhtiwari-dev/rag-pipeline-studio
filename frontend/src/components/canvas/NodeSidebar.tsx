import { usePipelineStore } from "../../store/pipelineStore";
import { NodeType } from "../../types/pipeline";
import { FileText, Scissors, Database, BrainCircuit, Plus } from "lucide-react";

const NODE_TYPES: { type: NodeType; label: string; icon: React.ReactNode; color: string }[] = [
  { type: "loaderNode", label: "Document Loader", icon: <FileText size={16} />, color: "text-emerald-600 bg-emerald-50" },
  { type: "splitterNode", label: "Text Splitter", icon: <Scissors size={16} />, color: "text-amber-600 bg-amber-50" },
  { type: "vectorStoreNode", label: "Vector Store", icon: <Database size={16} />, color: "text-violet-600 bg-violet-50" },
  { type: "llmNode", label: "LLM Node", icon: <BrainCircuit size={16} />, color: "text-blue-600 bg-blue-50" },
];

export default function NodeSidebar() {
  const addNode = usePipelineStore((s) => s.addNode);

  return (
    <div className="w-52 bg-white border-r border-gray-200 flex flex-col">
      <div className="px-4 py-3 border-b border-gray-100">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Components</h3>
        <p className="text-xs text-gray-400 mt-0.5">Drag or click to add</p>
      </div>
      <div className="flex-1 p-3 space-y-2 overflow-y-auto">
        {NODE_TYPES.map(({ type, label, icon, color }) => (
          <button
            key={type}
            onClick={() => addNode(type)}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg border border-gray-200 hover:border-brand-300 hover:bg-brand-50 transition-all text-left group"
          >
            <span className={`p-1.5 rounded-lg ${color}`}>{icon}</span>
            <span className="text-sm font-medium text-gray-700 group-hover:text-brand-700">{label}</span>
            <Plus size={14} className="ml-auto text-gray-300 group-hover:text-brand-500" />
          </button>
        ))}
      </div>
    </div>
  );
}
