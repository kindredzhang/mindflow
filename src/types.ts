export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: number;
  quoted_message?: QuotedMessage;
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