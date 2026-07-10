import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
} from "reactflow";
import "reactflow/dist/style.css";
import { useMemo } from "react";
import { usePipelineStore } from "../../store/pipelineStore";
import LoaderNode from "./nodes/LoaderNode";
import SplitterNode from "./nodes/SplitterNode";
import VectorStoreNode from "./nodes/VectorStoreNode";
import LLMNode from "./nodes/LLMNode";
import NodeSidebar from "./NodeSidebar";
import ConfigPanel from "./ConfigPanel";
import { Play, Save, RotateCcw, CheckCircle2, Loader2 } from "lucide-react";
import api from "../../hooks/useApi";
import toast from "react-hot-toast";

const nodeTypes = {
  loaderNode: LoaderNode,
  splitterNode: SplitterNode,
  vectorStoreNode: VectorStoreNode,
  llmNode: LLMNode,
};

export default function PipelineCanvas() {
  const {
    nodes, edges,
    onNodesChange, onEdgesChange, onConnect,
    selectedNodeId, selectNode,
    isBuilding, setIsBuilding, isBuilt, setIsBuilt,
  } = usePipelineStore();

  const memoNodeTypes = useMemo(() => nodeTypes, []);

  const handleSave = async () => {
    try {
      await api.post("/pipeline/save", { name: "My Pipeline", nodes, edges });
      toast.success("Pipeline saved");
    } catch {
      toast.error("Save failed");
    }
  };

  const handleBuild = async () => {
    setIsBuilding(true);
    try {
      await api.post("/pipeline/build", { nodes, edges });
      setIsBuilt(true);
      toast.success("Pipeline built! You can now chat.");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || "Build failed";
      toast.error(msg);
    } finally {
      setIsBuilding(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-4 py-2 bg-white border-b border-gray-200">
        <span className="text-xs text-gray-500 font-medium mr-2">Pipeline Editor</span>
        <div className="flex-1" />
        {isBuilt && (
          <span className="flex items-center gap-1 text-xs text-emerald-600 font-semibold bg-emerald-50 px-2 py-1 rounded-full">
            <CheckCircle2 size={12} /> Ready
          </span>
        )}
        <button onClick={handleSave} className="btn-secondary flex items-center gap-1 text-xs">
          <Save size={13} /> Save
        </button>
        <button
          onClick={handleBuild}
          disabled={isBuilding}
          className="btn-primary flex items-center gap-1.5 text-xs disabled:opacity-60"
        >
          {isBuilding ? <Loader2 size={13} className="animate-spin" /> : <Play size={13} />}
          {isBuilding ? "Building…" : "Build Pipeline"}
        </button>
      </div>

      {/* Canvas area */}
      <div className="flex flex-1 min-h-0 relative">
        <NodeSidebar />
        <div className="flex-1 relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={memoNodeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onPaneClick={() => selectNode(null)}
            fitView
            fitViewOptions={{ padding: 0.3 }}
          >
            <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#e2e8f0" />
            <Controls />
            <MiniMap
              nodeColor={(n) => {
                const colors: Record<string, string> = {
                  loaderNode: "#10b981",
                  splitterNode: "#f59e0b",
                  vectorStoreNode: "#8b5cf6",
                  llmNode: "#3b82f6",
                };
                return colors[n.type || ""] || "#94a3b8";
              }}
              className="!bg-white !border-gray-200"
            />
          </ReactFlow>
          {selectedNodeId && <ConfigPanel />}
        </div>
      </div>
    </div>
  );
}
