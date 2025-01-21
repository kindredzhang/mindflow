export const FILE_SIZE_LIMIT = 10 * 1024 * 1024; // 10MB in bytes
export const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain'
] as const;

export const ALLOWED_FILE_EXTENSIONS = ['.pdf', '.doc', '.docx', '.txt'] as const;

export class FileUtils {
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  }

  static validateFileSize(file: File): boolean {
    return file.size <= FILE_SIZE_LIMIT;
  }

  static validateFileType(file: File): boolean {
    // 检查文件类型
    if (ALLOWED_FILE_TYPES.includes(file.type as any)) {
      return true;
    }
    // 如果 type 检查失败，再检查文件扩展名
    const extension = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));
    return ALLOWED_FILE_EXTENSIONS.includes(extension as any);
  }

  static getErrorMessage(file: File): string | null {
    if (!this.validateFileSize(file)) {
      return `文件 ${file.name} 超过大小限制 ${this.formatFileSize(FILE_SIZE_LIMIT)}`;
    }
    if (!this.validateFileType(file)) {
      return `文件 ${file.name} 格式不支持，仅支持 PDF、Word、Docx、Txt 格式`;
    }
    return null;
  }
} 