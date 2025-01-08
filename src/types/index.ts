export interface User {
  email: string;
  id: string;
}

export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: number;
}

export interface Conversation {
  id: number;
  title: string;
  created_at: string;
  updated_at: string;
  knowledgeBase: 'department' | 'enterprise';
}

export interface KnowledgeBase {
  id: string;
  name: string;
  type: 'department' | 'enterprise';
  documents: Document[];
}

export interface Document {
  id: string;
  name: string;
  type: string;
  uploadedAt: number;
  url: string;
}



