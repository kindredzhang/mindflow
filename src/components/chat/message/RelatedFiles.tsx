import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronDown, ChevronRight, ExternalLink, FileText } from 'lucide-react';
import { useState } from 'react';

interface RelatedFile {
  file_id: number;
  file_name: string;
  similarity: number;
  source_type: string;
  created_at: string;
  file_type: string;
}

interface RelatedFilesProps {
  files: RelatedFile[];
}

export function RelatedFiles({ files }: RelatedFilesProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!files.length) return null;

  return (
    <div className="mt-2 space-y-2">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <FileText size={14} />
        <span>关联文件 ({files.length})</span>
        {files.length > 1 && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <ChevronDown size={14} />
            ) : (
              <ChevronRight size={14} />
            )}
            {isExpanded ? '收起' : '展开'}
          </Button>
        )}
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="h-6 px-2 ml-auto">
              <ExternalLink size={14} className="mr-1" />
              查看详情
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>关联文件详情</DialogTitle>
            </DialogHeader>
            <Tabs defaultValue={files[0].file_id.toString()} className="w-full">
              <ScrollArea className="w-full">
                <TabsList className="w-full justify-start">
                  {files.map(file => (
                    <TabsTrigger
                      key={file.file_id}
                      value={file.file_id.toString()}
                      className="min-w-[100px]"
                    >
                      {file.file_name}
                    </TabsTrigger>
                  ))}
                </TabsList>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
              
              {files.map(file => (
                <TabsContent 
                  key={file.file_id} 
                  value={file.file_id.toString()}
                  className="mt-4"
                >
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">文件信息</h4>
                        <div className="text-sm space-y-1">
                          <p>文件名：{file.file_name}</p>
                          <p>文件类型：{file.file_type}</p>
                          <p>创建时间：{new Date(file.created_at).toLocaleString()}</p>
                          <p>相关度：{(file.similarity * 100).toFixed(2)}%</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">文件预览</h4>
                        {/* TODO: 根据文件类型显示不同的预览 */}
                        <div className="border rounded-md p-4 h-[200px] overflow-auto">
                          文件预览区域
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </DialogContent>
        </Dialog>
      </div>
      
      {/* 展开的文件列表 */}
      {isExpanded && (
        <div className="pl-6 space-y-1">
          {files.map(file => (
            <div
              key={file.file_id}
              className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <FileText size={12} />
              <span className="truncate">{file.file_name}</span>
              <span className="ml-auto">
                {(file.similarity * 100).toFixed(2)}% 相关
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 