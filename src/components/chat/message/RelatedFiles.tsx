import { Badge } from "@/components/ui/badge";
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
import { Calendar, ChevronDown, ChevronRight, ExternalLink, FileText, FileType, Percent } from 'lucide-react';
import { useState } from 'react';

interface RelatedFile {
  file_id: number;
  file_name: string;
  file_contents: string;
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

  const formatSourceType = (type: string) => {
    return type === 'unknown' ? '/' : type;
  };

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
          <DialogContent className="max-w-4xl">
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
                      className="min-w-[120px] flex items-center gap-2"
                    >
                      <FileText size={14} />
                      <span className="truncate max-w-[100px]">{file.file_name}</span>
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
                  <div className="grid grid-cols-[300px,1fr] gap-6">
                    <div className="space-y-6">
                      <div className="rounded-lg border bg-card p-4 space-y-4">
                        <h3 className="font-semibold flex items-center gap-2">
                          <FileText size={16} />
                          基本信息
                        </h3>
                        <div className="space-y-3 text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <FileType size={14} />
                            <span className="w-16">文件类型:</span>
                            <span className="font-medium text-foreground">{file.file_type}</span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar size={14} />
                            <span className="w-16">创建时间:</span>
                            <span className="font-medium text-foreground">
                              {new Date(file.created_at).toLocaleString()}
                            </span>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Percent size={14} />
                              <span className="w-16">相关度:</span>
                              <div className="flex-1 flex items-center gap-2">
                                <div className="flex-1 relative h-2 bg-secondary/30 rounded-full overflow-hidden">
                                  <div 
                                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary/40 to-primary transition-all duration-500 ease-out"
                                    style={{ 
                                      width: `${Math.max(file.similarity * 100, 50)}%`,
                                      opacity: file.similarity > 0 ? 1 : 0.5
                                    }}
                                  />
                                  <div 
                                    className="absolute top-0 left-0 h-full bg-primary/20 transition-all duration-500"
                                    style={{ width: '50%' }}
                                  />
                                </div>
                                <Badge variant="secondary" className="shrink-0">
                                  {(file.similarity * 100).toFixed(2)}%
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-lg border bg-card p-4 space-y-4">
                        <h3 className="font-semibold flex items-center gap-2">
                          <ExternalLink size={16} />
                          来源信息
                        </h3>
                        <div className="text-sm text-muted-foreground">
                          <p>来源类型: {formatSourceType(file.source_type)}</p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-lg border bg-card">
                      <div className="p-4 border-b">
                        <h3 className="font-semibold">文件预览</h3>
                      </div>
                      <div className="p-4 min-h-[500px] overflow-auto">
                        {file.file_type.toLowerCase().includes('image') ? (
                          <img 
                            src={file.file_contents} 
                            alt={file.file_name}
                            className="max-w-full h-auto"
                          />
                        ) : file.file_type.toLowerCase().includes('pdf') ? (
                          <div className="text-muted-foreground">
                            PDF预览暂不支持
                          </div>
                        ) : (
                          <pre className="whitespace-pre-wrap break-words text-sm">
                            {file.file_contents}
                          </pre>
                        )}
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
              <div className="ml-auto flex items-center gap-2">
                <div className="w-20 h-1.5 bg-secondary/30 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all"
                    style={{ 
                      width: `${Math.max(file.similarity * 100, 50)}%`,
                      opacity: file.similarity > 0 ? 1 : 0.5
                    }}
                  />
                </div>
                <span className="w-14 text-right">{(file.similarity * 100).toFixed(2)}%</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 