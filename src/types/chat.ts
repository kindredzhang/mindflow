import { RelatedFile } from "@/types";

// 聊天相关类型定义
export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: number;
  related_files?: RelatedFile[];
}

export interface SendMessageRequest {
  question: string;
  chat_history?: Message[];
  file?: File;
  session_id?: string;
  quoted_message_id?: string;
} 