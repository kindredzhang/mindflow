import { showToast } from '@/store/toast';
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

// API 配置接口
interface ApiConfig {
  baseURL: string;
  timeout: number;
  headers?: Record<string, string>;
  withCredentials?: boolean;
}

// 根据环境获取配置
const getConfig = (): ApiConfig => {
  return {
    baseURL: import.meta.env.VITE_API_BASE_URL,
    timeout: 120000,
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  };
};

// 使用环境配置
const defaultConfig: ApiConfig = getConfig();

export type RequestData = 
  | Record<string, any>  // 使用 any 来接受任意对象类型
  | FormData;

interface StandardResponse<T = unknown> {
  code: number;
  message: string;
  data: T;
}

// 创建 API 服务类
class ApiService {
  private static instance: ApiService;
  private api: AxiosInstance;

  private constructor(config: ApiConfig = defaultConfig) {
    this.api = axios.create(config);

    // 请求拦截器
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // 如果是 FormData，不设置 Content-Type，让浏览器自动处理
        if (config.data instanceof FormData) {
          config.headers['Content-Type'] = undefined;
        }

        // 不需要token的路径列表
        const noTokenPaths = [
          '/auth/login',
          '/auth/register',
          '/auth/send-verification',
          '/common/department/list'
        ];
        const isNoTokenPath = noTokenPaths.some(path => config.url?.includes(path));
        
        if (!isNoTokenPath) {
          const token = localStorage.getItem('access_token');
          if (!token) {
            window.location.href = '/';
            return Promise.reject('No token found');
          }
          
          if (config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        }
        
        return config;
      },
    );

    // 响应拦截器
    this.api.interceptors.response.use(
      (response) => {
        const res = response.data as StandardResponse;
        
        // 处理401登录过期的情况
        if (res.code === 401) {
          // 清除登录信息
          localStorage.removeItem('access_token');
          localStorage.removeItem('user');
          
          // 显示提示
          showToast({
            title: "登录已过期",
            description: "请重新登录",
            variant: "destructive"
          });
          
          // 跳转到登录页
          window.location.href = '/login';
          return Promise.reject(new Error(res.message));
        }
        
        // 处理其他非200的情况
        if (res.code !== 200) {
          showToast({
            title: "错误",
            description: res.message,
            variant: "destructive"
          });
          
          return Promise.reject(new Error(res.message));
        }
        
        // 成功时不显示后端返回的消息，返回数据
        return {
          ...response,
          data: res.data
        };
      },
      (error) => {
        let message = '请求失败';
        
        if (error.response) {
          // 处理401错误
          if (error.response.status === 401) {
            localStorage.removeItem('access_token');
            localStorage.removeItem('user');
            window.location.href = '/login';
            message = '登录已过期,请重新登录';
          } else {
            // 显示后端返回的错误消息
            message = error.response.data?.message || '服务器错误';
          }
        } else if (error.request) {
          message = '无法连接到服务器';
        } else {
          message = error.message || '请求配置错误';
        }

        showToast({
          title: "错误",
          description: message,
          variant: "destructive"
        });

        return Promise.reject(new Error(message));
      }
    );
  }

  public static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  // 修改请求方法
  public async request<T>(config: AxiosRequestConfig): Promise<T> {
    const response = await this.api.request(config);
    
    // 只有在配置了自定义成功消息时才显示提示
    if (config.successMessage && !config.silent) {
      showToast({
        title: "成功",
        description: config.successMessage
      });
    }
    
    return response.data;
  }

  // GET 请求
  public async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'GET', url });
  }

  // POST 请求
  public async post<T>(url: string, data?: RequestData, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'POST', url, data });
  }

  // PUT 请求
  public async put<T>(url: string, data?: RequestData, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'PUT', url, data });
  }

  // DELETE 请求
  public async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'DELETE', url });
  }
}

// 扩展 AxiosRequestConfig 类型
declare module 'axios' {
  interface AxiosRequestConfig {
    successMessage?: string;
    errorMessage?: string;
    silent?: boolean; // 是否静默请求，不显示任何提示
  }
}

export const apiService = ApiService.getInstance();