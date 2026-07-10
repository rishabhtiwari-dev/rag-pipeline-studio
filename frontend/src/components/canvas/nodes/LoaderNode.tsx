import { Handle, Position, NodeProps } from "reactflow";
import { FileText } from "lucide-react";
import { LoaderNodeData } from "../../../types/pipeline";
import { usePipelineStore } from "../../../store/pipelineStore";

export default function LoaderNode({ id, data, selected }: NodeProps<LoaderNodeData>) {
  const selectNode = usePipelineStore((s) => s.selectNode);

  return (
    <div
      onClick={() => selectNode(id)}
      className={`bg-white rounded-xl shadow-md border-2 w-44 cursor-pointer transition-all ${
        selected ? "border-brand-500 shadow-brand-100 shadow-lg" : "border-gray-200 hover:border-brand-300"
      }`}
    >
      <div className="bg-emerald-50 rounded-t-xl px-3 py-2 flex items-center gap-2">
        <FileText size={16} className="text-emerald-600" />
        <span className="text-xs font-bold text-emerald-700 uppercase tracking-wide">Loader</span>
      </div>
      <div className="px-3 py-2">
        <p className="text-sm font-medium text-gray-800">{data.label}</p>
        <p className="text-xs text-gray-400 mt-0.5 capitalize">{data.loader_type}</p>
      </div>
      <Handle type="source" position={Position.Right} className="!bg-emerald-500" />
    </div>
  );
}
