import { Handle, Position, NodeProps } from "reactflow";
import { Scissors } from "lucide-react";
import { SplitterNodeData } from "../../../types/pipeline";
import { usePipelineStore } from "../../../store/pipelineStore";

export default function SplitterNode({ id, data, selected }: NodeProps<SplitterNodeData>) {
  const selectNode = usePipelineStore((s) => s.selectNode);

  return (
    <div
      onClick={() => selectNode(id)}
      className={`bg-white rounded-xl shadow-md border-2 w-44 cursor-pointer transition-all ${
        selected ? "border-brand-500 shadow-brand-100 shadow-lg" : "border-gray-200 hover:border-brand-300"
      }`}
    >
      <div className="bg-amber-50 rounded-t-xl px-3 py-2 flex items-center gap-2">
        <Scissors size={16} className="text-amber-600" />
        <span className="text-xs font-bold text-amber-700 uppercase tracking-wide">Splitter</span>
      </div>
      <div className="px-3 py-2">
        <p className="text-sm font-medium text-gray-800">{data.label}</p>
        <p className="text-xs text-gray-400 mt-0.5">
          {data.chunk_size} / {data.chunk_overlap}
        </p>
      </div>
      <Handle type="target" position={Position.Left} className="!bg-amber-500" />
      <Handle type="source" position={Position.Right} className="!bg-amber-500" />
    </div>
  );
}
