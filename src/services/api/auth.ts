import { apiService } from '@/services/api/axios';
import { showToast } from '@/store/toast';
import { BaseResponse } from '@/types/auth';

interface Department {
  id: number;
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
    try {
      const response = await apiService.post<LoginResponse>('/auth/login', credentials);
      showToast({
        title: "登录成功",
        description: "欢迎回来！",
        variant: "default",
      });
      return response;
    } catch (error) {
      showToast({
        title: "登录失败",
        description: error instanceof Error ? error.message : '登录失败',
        variant: "destructive",
      });
      throw error;
    }
  },

  // 注册
  register: async (credentials: RegisterCredentials): Promise<BaseResponse<string>> => {
    try {
      const response = await apiService.post<BaseResponse<string>>('/auth/register', credentials, {
        customError: true
      });
      showToast({
        title: "注册成功",
        description: "即将跳转到登录页面...",
        variant: "default",
      });
      return response;
    } catch (error) {
      showToast({
        title: "注册失败",
        description: error instanceof Error ? error.message : '注册失败',
        variant: "destructive",
      });
      throw error;
    }
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
