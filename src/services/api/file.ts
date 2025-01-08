import { apiService } from "@/services/api/axios";
import { handleRequest } from '@/utils/request';

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
    return handleRequest(
      () => apiService.get<FileUploadHistory[]>('/common/file/upload/history'),
      {
        showSuccessToast: false, // 查询类接口通常不需要成功提示
        errorMessage: '获取文件列表失败'
      }
    );
  },

  // 工作区文件夹文件树结构
  folderFileList: async (workspaceId: string) => {
    return handleRequest(
      () => apiService.get<FileTree[]>(`/folder/file/list`, {
        params: { workspace_id: workspaceId }
      }),
      {
        showSuccessToast: false,
        errorMessage: '获取文件树失败'
      }
    );
  },

  // 创建文件夹
  createFolder: async (folderName: string) => {
    return handleRequest(
      () => apiService.post<void>('/create/folder', { name: folderName }),
      {
        successMessage: '文件夹创建成功',
        errorMessage: '创建文件夹失败'
      }
    );
  },

  // 上传文件前检测
  uploadFileCheck: async (fileName: string, departmentId: string = '0') => {
    const response = await handleRequest(
      () => apiService.post<number>('/upload/check', {
        file_name: fileName,
        department_id: departmentId
      }),
      {
        showSuccessToast: false,
        errorMessage: '文件上传前检测失败'
      }
    );
    console.log('uploadFileCheck response:', response);
    return response;
  },

  // 上传文件
  uploadFile: async (formData: FormData, departmentId: string = '0') => {
    formData.append('department_id', departmentId);
    return handleRequest(
      () => apiService.post('/upload', formData),
      {
        successMessage: '文件上传成功',
        errorMessage: '文件上传失败'
      }
    );
  },

  // 将文件转换为向量 - 支持批量
  fileToEmbed: async (fileIds: string[], workspaceId: string) => {
    return handleRequest(
      () => apiService.post('/file/to/embed', {
        file_ids: fileIds,
        workspace_id: workspaceId
      }),
      {
        successMessage: '文件向量化处理成功',
        errorMessage: '文件向量化处理失败'
      }
    );
  },

  // 添加从工作区移除文件的方法
  removeFileFromWorkspace: async (workspaceId: string, fileId: string) => {
    return await apiService.post('/file/remove/embed', {
      file_ids: [fileId],
      workspace_id: workspaceId
    });
  },

  deleteFile: (fileId: string) => {
    return apiService.post('/file/delete', { file_id: fileId });
  },

};
