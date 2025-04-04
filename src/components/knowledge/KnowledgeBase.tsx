import { DeleteButton } from '@/components/common/DeleteButton';
import Navigation from '@/components/layout/Navigation';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Toaster } from "@/components/ui/toaster";
import { useUserInfo } from '@/hooks/use-user-info';
import type { FileUploadHistory } from '@/services/api/file';
import { fileApi } from '@/services/api/file';
import { showToast } from '@/store/toast';
import { FILE_SIZE_LIMIT, FileUtils } from '@/utils/file';
import { AlertCircle, FileText, Upload } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { TruncatedFileName } from '../common/TruncatedFileName';

interface FileToConfirm {
  file: File;
  departmentId: string;
}

export default function KnowledgeBase() {
  const userInfo = useUserInfo();
  const [dragActive, setDragActive] = useState(false);
  const [recentFiles, setRecentFiles] = useState<FileUploadHistory[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedScope, setSelectedScope] = useState<'enterprise' | 'department'>('enterprise');
  const [showOverwriteDialog, setShowOverwriteDialog] = useState(false);
  const [filesToConfirm, setFilesToConfirm] = useState<FileToConfirm[]>([]);

  // 如果没有部门信息，默认只显示企业知识库选项
  const showDepartmentOption = Boolean(userInfo?.department_id);

  useEffect(() => {
    fetchRecentFiles();
  }, []);

  const fetchRecentFiles = async () => {
    try {
      const response = await fileApi.fileUploadHistory();
      setRecentFiles(response);
    } catch (error) {
      console.error('Failed to fetch recent files:', error);
    }
  };

  const handleFileCheck = async (file: File, departmentId: string) => {
    try {
      const response = await fileApi.uploadFileCheck(file.name, departmentId);
      const fileStatus = response;

      switch (fileStatus) {
        case -1:
          // 文件已存在且已向量化
          showToast({
            title: "上传失败",
            description: "该文件已存在且已完成向量化处理，不能重复上传",
            variant: "destructive",
          });
          return false;

        case 0:
          // 文件已存在但未向量化，添加到待确认列表
          return { needConfirm: true, file, departmentId };

        case 1:
          // 文件不存在，可以直接上传
          return { needConfirm: false, file, departmentId };

        default:
          showToast({
            title: "检查失败",
            description: "文件状态检查失败",
            variant: "destructive",
          });
          return false;
      }
    } catch (error) {
      console.error('File check failed:', error);
      return false;
    }
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    // 只取第一个文件
    const file = files[0];

    // 验证文件
    const errorMessage = FileUtils.getErrorMessage(file);
    if (errorMessage) {
      showToast({
        title: "文件验证失败",
        description: errorMessage,
        variant: "destructive"
      });
      return;
    }

    setUploading(true);

    try {
      const departmentId = selectedScope === 'enterprise' ? '0' : userInfo?.department_id ?? '0';
      const result = await handleFileCheck(file, departmentId);
      
      if (!result) {
        setUploading(false);
        return;
      }

      if (result.needConfirm) {
        setFilesToConfirm([{ file: result.file, departmentId: result.departmentId }]);
        setShowOverwriteDialog(true);
      } else {
        await uploadFiles([{ file: result.file, departmentId: result.departmentId }]);
      }
      
    } catch (error) {
      console.error('Failed to upload file:', error);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files.length > 0) {
      handleFileUpload(e.target.files);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    try {
      await fileApi.deleteFile(fileId);
      await fetchRecentFiles();
    } catch (error) {
      console.error('Failed to delete file:', error);
    }
  };

  // 处理覆盖确认
  const handleOverwriteConfirm = async () => {
    setShowOverwriteDialog(false);
    setUploading(true);
    
    try {
      await uploadFiles(filesToConfirm);
      setFilesToConfirm([]);
    } catch (error) {
      console.error('File upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  // 抽取上传文件的公共方法
  const uploadFiles = async (files: FileToConfirm[]) => {
    if (files.length === 0) return;

    for (const { file, departmentId } of files) {
      const formData = new FormData();
      formData.append('file', file);
      await fileApi.uploadFile(formData, departmentId);
    }
    await fetchRecentFiles();
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="max-w-6xl mx-auto p-6 pt-20">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">知识库管理</h1>
        </div>

        <div className="bg-card p-8 rounded-lg mb-8 space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">选择上传范围</h3>
            <RadioGroup
              value={selectedScope}
              onValueChange={(value) => setSelectedScope(value as 'enterprise' | 'department')}
              className="flex items-center space-x-6"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="enterprise" id="enterprise" />
                <Label htmlFor="enterprise" className="cursor-pointer">
                  企业知识库
                </Label>
              </div>
              {showDepartmentOption && (
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="department" id="department" />
                  <Label htmlFor="department" className="cursor-pointer">
                    {userInfo?.department_name}知识库
                  </Label>
                </div>
              )}
            </RadioGroup>
            <p className="text-sm text-muted-foreground">
              {selectedScope === 'enterprise' 
                ? '上传到企业知识库的文件将对所有部门可见' 
                : `上传到${userInfo?.department_name}知识库的文件仅对部门内成员可见`
              }
            </p>
          </div>
          <div
            className={`border-2 border-dashed rounded-lg ${
              dragActive
                ? 'border-primary bg-primary/10'
                : 'border-muted-foreground hover:border-primary'
            } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <label className="flex flex-col items-center justify-center h-48 cursor-pointer">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                {uploading ? (
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
                ) : (
                  <>
                    <Upload className={`mb-3 ${dragActive ? 'text-primary' : 'text-muted-foreground'}`} size={32} />
                    <p className="mb-2 text-sm text-muted-foreground">
                      <span className="font-semibold">点击上传</span> 或拖拽文件至此处
                    </p>
                    <div className="text-xs text-muted-foreground space-y-1 text-center">
                      <p>支持格式：PDF、Word、Docx、Txt</p>
                      <p>大小限制：{FileUtils.formatFileSize(FILE_SIZE_LIMIT)}</p>
                      <p>每次仅可上传一个文件</p>
                    </div>
                  </>
                )}
              </div>
              <input 
                ref={fileInputRef}
                type="file" 
                className="hidden" 
                onChange={handleInputChange} 
                disabled={uploading}
                accept=".pdf,.doc,.docx,.txt"
              />
            </label>
          </div>
        </div>

        <div className="bg-card rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-foreground">已上传文档</h2>
            <div className="flex items-center text-muted-foreground text-sm group relative">
              <AlertCircle size={16} className="mr-2" />
              <span>仅显示最近上传的文档</span>
              <div 
                className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-popover/90 rounded-md text-sm text-popover-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-500 shadow-md border border-border whitespace-nowrap"
                style={{ backdropFilter: 'blur(8px)' }}
              >
                文件未进行向量化处理时允许删除
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentFiles.map((file) => (
              <div 
                key={file.id} 
                className="bg-background p-4 rounded-lg hover:bg-background/80 transition-colors relative group"
              >
                <div className="flex items-start space-x-3">
                  <FileText className="text-primary flex-shrink-0" size={24} />
                  <div className="flex-1 min-w-0">
                    <TruncatedFileName fileName={file.file_name} />
                    <p className="text-muted-foreground text-sm">
                      上传于 {new Date(file.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  {file.can_delete && (
                    <div className="flex items-center flex-shrink-0">
                      <DeleteButton
                        onDelete={() => handleDeleteFile(file.id.toString())}
                        className="flex items-center justify-center"
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <AlertDialog open={showOverwriteDialog} onOpenChange={setShowOverwriteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认覆盖文件？</AlertDialogTitle>
            <AlertDialogDescription>
              该文件已存在但尚未向量化。继续上传将覆盖现有文件，是否继续？
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setShowOverwriteDialog(false);
              setFilesToConfirm([]);
            }}>
              取消
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleOverwriteConfirm}>
              确认覆盖
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <Toaster />
    </div>
  );
}