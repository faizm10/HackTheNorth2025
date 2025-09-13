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

export interface Requirement {
  id: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
  module_id: string; // related module id (or 'none')
  chunk_id: string;  // related chunk id
}

export interface RequirementsResult {
  requirements: Requirement[];
}
