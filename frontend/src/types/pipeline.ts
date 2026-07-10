export type NodeType = "loaderNode" | "splitterNode" | "vectorStoreNode" | "llmNode";

export interface LoaderNodeData {
  label: string;
  loader_type: "auto" | "pdf" | "text" | "markdown";
}

export interface SplitterNodeData {
  label: string;
  splitter_type: "recursive" | "character" | "token";
  chunk_size: number;
  chunk_overlap: number;
}

export interface VectorStoreNodeData {
  label: string;
  store_type: "chroma" | "faiss";
  collection_name: string;
}

export interface LLMNodeData {
  label: string;
  llm_type: "gemini" | "openai" | "claude";
  model_name: string;
  temperature: number;
  max_tokens: number;
}

export type AnyNodeData = LoaderNodeData | SplitterNodeData | VectorStoreNodeData | LLMNodeData;

export interface PipelineNode {
  id: string;
  type: NodeType;
  position: { x: number; y: number };
  data: AnyNodeData;
}

export interface PipelineEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  sources?: { content: string; metadata: Record<string, unknown> }[];
  isMock?: boolean;
}
