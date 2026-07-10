import { Handle, Position, NodeProps } from "reactflow";
import { BrainCircuit } from "lucide-react";
import { LLMNodeData } from "../../../types/pipeline";
import { usePipelineStore } from "../../../store/pipelineStore";

const PROVIDER_COLORS: Record<string, { bg: string; text: string; badge: string }> = {
  gemini: { bg: "bg-blue-50", text: "text-blue-700", badge: "bg-blue-100 text-blue-700" },
  openai: { bg: "bg-green-50", text: "text-green-700", badge: "bg-gray-100 text-gray-500" },
  claude: { bg: "bg-orange-50", text: "text-orange-700", badge: "bg-gray-100 text-gray-500" },
};

export default function LLMNode({ id, data, selected }: NodeProps<LLMNodeData>) {
  const selectNode = usePipelineStore((s) => s.selectNode);
  const colors = PROVIDER_COLORS[data.llm_type] || PROVIDER_COLORS.gemini;

  return (
    <div
      onClick={() => selectNode(id)}
      className={`bg-white rounded-xl shadow-md border-2 w-44 cursor-pointer transition-all ${
        selected ? "border-brand-500 shadow-brand-100 shadow-lg" : "border-gray-200 hover:border-brand-300"
      }`}
    >
      <div className={`${colors.bg} rounded-t-xl px-3 py-2 flex items-center gap-2`}>
        <BrainCircuit size={16} className={colors.text} />
        <span className={`text-xs font-bold ${colors.text} uppercase tracking-wide`}>LLM</span>
        {data.llm_type !== "gemini" && (
          <span className={`ml-auto text-[10px] px-1.5 py-0.5 rounded-full ${colors.badge} font-semibold`}>
            Mock
          </span>
        )}
      </div>
      <div className="px-3 py-2">
        <p className="text-sm font-medium text-gray-800 capitalize">{data.llm_type}</p>
        <p className="text-xs text-gray-400 mt-0.5">{data.model_name}</p>
      </div>
      <Handle type="target" position={Position.Left} className="!bg-blue-500" />
    </div>
  );
}
