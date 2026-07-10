import { Handle, Position, NodeProps } from "reactflow";
import { Database } from "lucide-react";
import { VectorStoreNodeData } from "../../../types/pipeline";
import { usePipelineStore } from "../../../store/pipelineStore";

export default function VectorStoreNode({ id, data, selected }: NodeProps<VectorStoreNodeData>) {
  const selectNode = usePipelineStore((s) => s.selectNode);

  return (
    <div
      onClick={() => selectNode(id)}
      className={`bg-white rounded-xl shadow-md border-2 w-44 cursor-pointer transition-all ${
        selected ? "border-brand-500 shadow-brand-100 shadow-lg" : "border-gray-200 hover:border-brand-300"
      }`}
    >
      <div className="bg-violet-50 rounded-t-xl px-3 py-2 flex items-center gap-2">
        <Database size={16} className="text-violet-600" />
        <span className="text-xs font-bold text-violet-700 uppercase tracking-wide">Vector Store</span>
      </div>
      <div className="px-3 py-2">
        <p className="text-sm font-medium text-gray-800">{data.label}</p>
        <p className="text-xs text-gray-400 mt-0.5 uppercase">{data.store_type}</p>
      </div>
      <Handle type="target" position={Position.Left} className="!bg-violet-500" />
      <Handle type="source" position={Position.Right} className="!bg-violet-500" />
    </div>
  );
}
