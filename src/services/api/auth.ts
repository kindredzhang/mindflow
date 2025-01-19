import { apiService } from '@/services/api/axios';
import { showToast } from '@/store/toast';
import { BaseResponse } from '@/types/auth';

interface Department {
  id: string;
  name: string;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterCredentials {
  email: string;
  password: string;
  confirm_password: string;
  verification_code: string;
  department_id: number;
  name: string;
}

interface LoginResponse {
  access_token: string;
  token_type: string;
  user: {
    id: string;
    email: string;
    name: string;
    department_id: string;
    is_enterprise_user: boolean;
  };
}

export const authApi = {
  // 登录
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await apiService.post<LoginResponse>('/auth/login', credentials);
    return response;
  },

  // 注册
  register: async (credentials: RegisterCredentials): Promise<BaseResponse<string>> => {
    const response = await apiService.post<BaseResponse<string>>('/auth/register', credentials);
    return response;
  },
    
  // 登出
  logout: async () => {
    return await apiService.post('/auth/logout');
  },

  // 获取当前用户信息
  getCurrentUser: async () => {
    return await apiService.get<LoginResponse>('/auth/me');
  },

  // 发送验证码
  sendVerificationCode: async (email: string) => {
    try {
      await apiService.post<void>('/auth/send-verification', { email }, {
        customError: true
      });
      showToast({
        title: "验证码已发送",
        description: "请查看邮箱获取验证码",
        variant: "default",
      });
    } catch (error) {
      showToast({
        title: "发送失败",
        description: error instanceof Error ? error.message : '发送验证码失败',
        variant: "destructive",
      });
      throw error;
    }
  },

  // 获取部门列表
  getDepartments: async () => {
    const response = await apiService.get<Department[]>('/common/department/list');
    return response;
  },

  // 获取当前用户部门id
  getDepartmentId: () => {
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : {};
    return user.department_id;
  }
}; 
