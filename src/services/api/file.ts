import { apiService } from "@/services/api/axios";
import { showToast } from '@/store/toast';

export interface FileUploadHistory {
  id: string | number;
  file_name: string;
  file_size: number;
  file_type: string;
  created_at: Date;
  can_delete: boolean;
}

export interface FileTree {
  folder_id: string;
  folder_name: string;
  files: File[];
}

export interface File {
  file_id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  is_cached: boolean;
  is_selected: boolean;
  file_upload_time: string;
  file_upload_man: string;
}

export const fileApi = {

  // 获取最近上传的文件列表
  fileUploadHistory: async () => {
    try {
      const response = await apiService.get<FileUploadHistory[]>('/common/file/upload/history');
      return response;
    } catch (error) {
      showToast({
        title: "获取失败",
        description: error instanceof Error ? error.message : '获取文件列表失败',
        variant: "destructive",
      });
      throw error;
    }
  },

  // 工作区文件夹文件树结构
  folderFileList: async (workspaceId: string) => {
    try {
      const response = await apiService.get<FileTree[]>(`/folder/file/list`, {
        params: { workspace_id: workspaceId }
      });
      return response;
    } catch (error) {
      showToast({
        title: "获取失败",
        description: error instanceof Error ? error.message : '获取文件树失败',
        variant: "destructive",
      });
      throw error;
    }
  },

  // 创建文件夹
  createFolder: async (folderName: string) => {
    try {
      const response = await apiService.post<void>('/create/folder', { name: folderName });
      showToast({
        title: "创建成功",
        description: "文件夹创建成功",
        variant: "default",
      });
      return response;
    } catch (error) {
      showToast({
        title: "创建失败",
        description: error instanceof Error ? error.message : '创建文件夹失败',
        variant: "destructive",
      });
      throw error;
    }
  },

  // 上传文件前检测
  uploadFileCheck: async (fileName: string, departmentId: string = '0') => {
    return await apiService.post<number>('/upload/check', {
      file_name: fileName,
      department_id: departmentId
    });
  },

  // 上传文件
  uploadFile: async (formData: FormData, departmentId: string = '0') => {
    try {
      formData.append('department_id', departmentId);
      const response = await apiService.post('/upload', formData);
      showToast({
        title: "上传成功",
        description: "文件上传成功",
        variant: "default",
      });
      return response;
    } catch (error) {
      showToast({
        title: "上传失败",
        description: error instanceof Error ? error.message : '文件上传失败',
        variant: "destructive",
      });
      throw error;
    }
  },

  // 将文件转换为向量 - 支持批量
  fileToEmbed: async (fileIds: string[], workspaceId: string) => {
    try {
      const response = await apiService.post('/file/to/embed', {
        file_ids: fileIds,
        workspace_id: workspaceId
      });
      showToast({
        title: "处理成功",
        description: "文件向量化处理成功",
        variant: "default",
      });
      return response;
    } catch (error) {
      showToast({
        title: "处理失败",
        description: error instanceof Error ? error.message : '文件向量化处理失败',
        variant: "destructive",
      });
      throw error;
    }
  },

  // 添加从工作区移除文件的方法
  removeFileFromWorkspace: async (workspaceId: string, fileId: string) => {
    try {
      const response = await apiService.post('/file/remove/embed', {
        file_ids: [fileId],
        workspace_id: workspaceId
      });
      showToast({
        title: "移除成功",
        description: "文件已从工作区移除",
        variant: "default",
      });
      return response;
    } catch (error) {
      showToast({
        title: "移除失败",
        description: error instanceof Error ? error.message : '从工作区移除文件失败',
        variant: "destructive",
      });
      throw error;
    }
  },

  deleteFile: async (fileId: string) => {
    try {
      const response = await apiService.post('/file/delete', { file_id: fileId });
      showToast({
        title: "删除成功",
        description: "文件已删除",
        variant: "default",
      });
      return response;
    } catch (error) {
      showToast({
        title: "删除失败",
        description: error instanceof Error ? error.message : '删除文件失败',
        variant: "destructive",
      });
      throw error;
    }
  },

};
