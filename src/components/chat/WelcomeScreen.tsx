import { Database, MessageSquare, Upload } from 'lucide-react';

export function WelcomeScreen() {
  return (
    <div className="text-center">
      <h2 className="text-2xl font-bold text-foreground mb-8">欢迎使用 MindFlow</h2>
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-card p-6 rounded-lg">
          <MessageSquare className="text-primary mb-4 mx-auto" size={24} />
          <h3 className="text-foreground font-semibold mb-2">知识库问答</h3>
          <p className="text-muted-foreground text-sm">基于企业知识库进行智能问答</p>
        </div>
        <div className="bg-card p-6 rounded-lg">
          <Upload className="text-primary mb-4 mx-auto" size={24} />
          <h3 className="text-foreground font-semibold mb-2">文档上传</h3>
          <p className="text-muted-foreground text-sm">支持多种格式文档上传与解析</p>
        </div>
        <div className="bg-card p-6 rounded-lg">
          <Database className="text-primary mb-4 mx-auto" size={24} />
          <h3 className="text-foreground font-semibold mb-2">智能对话</h3>
          <p className="text-muted-foreground text-sm">持续对话，深入理解需求</p>
        </div>
      </div>
    </div>
  );
} 