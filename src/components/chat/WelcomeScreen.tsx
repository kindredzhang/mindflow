import { Brain, FileText, Sparkles } from 'lucide-react';

export function WelcomeScreen() {
  return (
    <div className="h-full flex flex-col items-center justify-center translate-y-12">
      <div className="text-center space-y-8 max-w-3xl">
        <div className="space-y-3">
          <h1 className="text-4xl font-light tracking-tight">
            欢迎使用{' '}
            <span className="font-mono bg-gradient-to-r from-indigo-500 to-indigo-400 bg-clip-text text-transparent">
              MindFlow
            </span>
          </h1>
          {/* <p className="text-lg text-muted-foreground/60 font-light">
            把时间留给思考
          </p> */}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12">
          <div className="group relative overflow-hidden rounded-xl border bg-background/50 p-6 hover:bg-accent/50 transition-all duration-300 hover:shadow-lg">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="rounded-full bg-indigo-500/10 p-3.5 group-hover:bg-indigo-500/20 transition-colors">
                <Brain className="h-6 w-6 text-indigo-500" />
              </div>
              <div className="space-y-2.5">
                <h3 className="font-medium tracking-wide">智能对话</h3>
                <p className="text-sm text-muted-foreground/80 leading-relaxed">
                  像聊天一样自然地交流，让 AI 成为你的思维助手
                </p>
              </div>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-xl border bg-background/50 p-6 hover:bg-accent/50 transition-all duration-300 hover:shadow-lg">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="rounded-full bg-indigo-500/10 p-3.5 group-hover:bg-indigo-500/20 transition-colors">
                <FileText className="h-6 w-6 text-indigo-500" />
              </div>
              <div className="space-y-2.5">
                <h3 className="font-medium tracking-wide">知识库问答</h3>
                <p className="text-sm text-muted-foreground/80 leading-relaxed">
                  上传文档后，AI 能快速理解并回答相关问题
                </p>
              </div>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-xl border bg-background/50 p-6 hover:bg-accent/50 transition-all duration-300 hover:shadow-lg">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="rounded-full bg-indigo-500/10 p-3.5 group-hover:bg-indigo-500/20 transition-colors">
                <Sparkles className="h-6 w-6 text-indigo-500" />
              </div>
              <div className="space-y-2.5">
                <h3 className="font-medium tracking-wide">持续对话</h3>
                <p className="text-sm text-muted-foreground/80 leading-relaxed">
                  记住上下文，让对话更连贯，思维更流畅
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-12 text-center">
          <p className="text-sm text-muted-foreground/60 tracking-wide">
            点击左侧「新建工作区」并开始体验 ✨
          </p>
        </div>
      </div>
    </div>
  );
} 