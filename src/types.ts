export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: number;
  quotedMessage?: {
    id: string;
    content: string;
  };
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