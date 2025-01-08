export enum ErrorCode {
    SUCCESS = 200,
    BAD_REQUEST = 400,
    UNAUTHORIZED = 401,
    FORBIDDEN = 403,
    NOT_FOUND = 404,
    SERVER_ERROR = 500,
  }
  
export interface BaseResponse<T> {
    code: ErrorCode;
    message: string;
    data: T;
}

export interface ApiError extends Error {
    code?: ErrorCode;
    response?: {
      data?: {
        message?: string;
        detail?: string;
      };
    };
}