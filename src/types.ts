export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: number;
  quoted_message?: QuotedMessage;
  related_files?: RelatedFile[];
}

export interface SendMessageRequest {
  question: string;
  session_id?: string;
  file?: File;
  quoted_message?: QuotedMessage;
} 

export interface QuotedMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export interface RelatedFile {
  file_id: number;
  file_name: string;
  file_contents: string;
  similarity: number;
  source_type: 'Knowledge Base';
  created_at: string;
  file_type: string;
}