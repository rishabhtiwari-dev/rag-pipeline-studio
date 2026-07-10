/**
 * Pipeline canvas state — owns nodes, edges, and selected-node config.
 *
 * Why Zustand over Redux?
 * React Flow mutates its internal viewport state on every pan/zoom. Zustand
 * handles fine-grained subscriptions cheaply: components select exactly the
 * slice they care about, so only the relevant sub-tree re-renders. Redux
 * would require normalised state + selectors for the same effect, at 3x the
 * boilerplate.
 */
import { create } from "zustand";
import {
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  Connection,
  NodeChange,
  EdgeChange,
} from "reactflow";
import { PipelineNode, PipelineEdge, NodeType, AnyNodeData } from "../types/pipeline";

const DEFAULT_NODES: PipelineNode[] = [
  {
    id: "loader-1",
    type: "loaderNode",
    position: { x: 80, y: 200 },
    data: { label: "Document Loader", loader_type: "auto" },
  },
  {
    id: "splitter-1",
    type: "splitterNode",
    position: { x: 340, y: 200 },
    data: { label: "Text Splitter", splitter_type: "recursive", chunk_size: 1000, chunk_overlap: 200 },
  },
  {
    id: "vectorstore-1",
    type: "vectorStoreNode",
    position: { x: 600, y: 200 },
    data: { label: "Vector Store", store_type: "chroma", collection_name: "rag_collection" },
  },
  {
    id: "llm-1",
    type: "llmNode",
    position: { x: 860, y: 200 },
    data: { label: "LLM", llm_type: "gemini", model_name: "gemini-1.5-flash", temperature: 0.3, max_tokens: 2048 },
  },
];

const DEFAULT_EDGES: PipelineEdge[] = [
  { id: "e1", source: "loader-1", target: "splitter-1" },
  { id: "e2", source: "splitter-1", target: "vectorstore-1" },
  { id: "e3", source: "vectorstore-1", target: "llm-1" },
];

interface PipelineState {
  nodes: PipelineNode[];
  edges: PipelineEdge[];
  selectedNodeId: string | null;
  isBuilding: boolean;
  isBuilt: boolean;

  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  addNode: (type: NodeType) => void;
  selectNode: (id: string | null) => void;
  updateNodeData: (id: string, data: Partial<AnyNodeData>) => void;
  setIsBuilding: (v: boolean) => void;
  setIsBuilt: (v: boolean) => void;
  loadFromServer: (nodes: PipelineNode[], edges: PipelineEdge[]) => void;
  reset: () => void;
}

let nodeCounter = 10;

const defaultDataForType = (type: NodeType): AnyNodeData => {
  switch (type) {
    case "loaderNode": return { label: "Document Loader", loader_type: "auto" };
    case "splitterNode": return { label: "Text Splitter", splitter_type: "recursive", chunk_size: 1000, chunk_overlap: 200 };
    case "vectorStoreNode": return { label: "Vector Store", store_type: "chroma", collection_name: "rag_collection" };
    case "llmNode": return { label: "LLM", llm_type: "gemini", model_name: "gemini-1.5-flash", temperature: 0.3, max_tokens: 2048 };
  }
};

export const usePipelineStore = create<PipelineState>((set) => ({
  nodes: DEFAULT_NODES,
  edges: DEFAULT_EDGES,
  selectedNodeId: null,
  isBuilding: false,
  isBuilt: false,

  onNodesChange: (changes) =>
    set((s) => ({ nodes: applyNodeChanges(changes, s.nodes) as PipelineNode[] })),

  onEdgesChange: (changes) =>
    set((s) => ({ edges: applyEdgeChanges(changes, s.edges) as PipelineEdge[] })),

  onConnect: (connection) =>
    set((s) => ({ edges: addEdge({ ...connection, id: `e${Date.now()}` }, s.edges) as PipelineEdge[] })),

  addNode: (type) => {
    nodeCounter++;
    const newNode: PipelineNode = {
      id: `${type}-${nodeCounter}`,
      type,
      position: { x: 200 + Math.random() * 300, y: 100 + Math.random() * 200 },
      data: defaultDataForType(type),
    };
    set((s) => ({ nodes: [...s.nodes, newNode] }));
  },

  selectNode: (id) => set({ selectedNodeId: id }),

  updateNodeData: (id, data) =>
    set((s) => ({
      nodes: s.nodes.map((n) =>
        n.id === id ? { ...n, data: { ...n.data, ...data } } : n
      ),
    })),

  setIsBuilding: (v) => set({ isBuilding: v }),
  setIsBuilt: (v) => set({ isBuilt: v }),

  loadFromServer: (nodes, edges) => set({ nodes, edges, isBuilt: true }),

  reset: () => set({ nodes: DEFAULT_NODES, edges: DEFAULT_EDGES, isBuilt: false, selectedNodeId: null }),
}));
