export interface Module {
  id: string;
  title: string;
  summary: string;
}

export interface Assignment {
  chunk_id: string;
  module_id: string;
  confidence: number;
}

export interface Chunk {
  id: string;
  text: string;
}

export interface ModulesResult {
  modules: Module[];
}

export interface AssignmentsResult {
  assignments: Assignment[];
}
