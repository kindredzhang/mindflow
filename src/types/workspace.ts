// 工作区相关类型定义
export interface Session {
  session_id: string;
  session_title: string;
  session_created_at: string;
}

export interface Workspace {
  workspace_id: string;
  workspace_title: string;
  workspace_created_at: string;
  sessions: Session[];
}

export interface FileMetadata {
  file_id: string;
  file_name: string;
  file_upload_time: string;
  is_selected: boolean;
}

export interface FolderData {
  folder_id: string;
  folder_name: string;
  files: FileMetadata[];
} 