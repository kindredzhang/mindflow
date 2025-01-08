import { FileText, Mic, Send, Upload, X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
  
  interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    onstart: () => void;
    onresult: (event: SpeechRecognitionEvent) => void;
    onend: () => void;
    onerror: (event: SpeechRecognitionErrorEvent) => void;
    start: () => void;
    stop: () => void;
  }

  interface SpeechRecognitionEvent {
    results: SpeechRecognitionResultList;
  }

  interface SpeechRecognitionResultList {
    readonly length: number;
    item(index: number): SpeechRecognitionResult;
    [index: number]: SpeechRecognitionResult;
  }

  interface SpeechRecognitionResult {
    readonly isFinal: boolean;
    [index: number]: SpeechRecognitionAlternative;
  }

  interface SpeechRecognitionAlternative {
    readonly transcript: string;
  }

  interface SpeechRecognitionErrorEvent extends Event {
    error: string;
  }
}

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: (e: React.FormEvent) => void;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  selectedFile: File | null;
  isSending: boolean;
  quotedMessage?: { messageId: string; content: string } | null;
  onCancelQuote?: () => void;
}

export function ChatInput({ 
  value, 
  onChange, 
  onSend, 
  onFileSelect,
  selectedFile,
  isSending,
  quotedMessage,
  onCancelQuote
}: ChatInputProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const [isComposing, setIsComposing] = useState(false); // 跟踪输入法状态
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  }, [recognition]);

  const startRecording = () => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new window.webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'zh-CN';

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join('');
        onChange(value + transcript);
      };

      recognition.onend = () => {
        setIsRecording(false);
        setRecognition(null);
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
        setRecognition(null);
      };

      recognition.start();
      setRecognition(recognition);
    } else {
      alert('您的浏览器不支持语音识别功能');
    }
  };

  const stopRecording = () => {
    if (recognition) {
      recognition.stop();
    }
  };

  // 重置输入框高度的函数
  const resetTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = '48px'; // 设置回初始高度
      textareaRef.current.style.overflowY = 'hidden';
    }
  };

  // 处理文本输入和高度调整
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
    
    // 调整高度
    const textarea = e.target;
    textarea.style.height = '48px'; // 先重置高度
    const scrollHeight = textarea.scrollHeight;
    textarea.style.height = Math.max(48, Math.min(scrollHeight, 220)) + 'px';
    textarea.style.overflowY = scrollHeight > 220 ? 'auto' : 'hidden';
  };

  // 处理发送事件
  const handleSubmit = (e: React.FormEvent) => {
    onSend(e);
    resetTextareaHeight();
  };

  return (
    <div className="border-t bg-[#1a1a1a]">
      {quotedMessage && (
        <div className="max-w-3xl mx-auto px-4 pt-3">
          <div className="flex items-center gap-2 text-sm">
            <div className="flex-1 pl-4 border-l-2 border-primary/30">
              <p className="line-clamp-1 text-muted-foreground">
                {quotedMessage.content}
              </p>
            </div>
            <button
              onClick={onCancelQuote}
              className="p-1 hover:bg-muted/20 rounded-md"
            >
              <X size={14} className="text-muted-foreground" />
            </button>
          </div>
        </div>
      )}
      <div className="max-w-3xl mx-auto px-4 py-3">
        <form onSubmit={handleSubmit} className="relative">
          <div className="flex items-center gap-2 bg-[#2a2a2a] rounded-lg p-1">
            <div className="flex-1 flex items-center gap-2">
              <textarea
                ref={textareaRef}
                value={value}
                onChange={handleTextareaChange}
                onCompositionStart={() => setIsComposing(true)}
                onCompositionEnd={() => setIsComposing(false)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey && !isComposing) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
                placeholder={isSending ? "AI 正在回复中..." : "发送消息..."}
                className="flex-1 min-h-[48px] h-[48px] max-h-[220px] px-3 py-2 
                          bg-transparent text-foreground placeholder:text-muted-foreground 
                          focus:outline-none resize-none overflow-x-hidden"
                disabled={isSending}
              />
              <div className="flex items-center gap-1 pr-2">
                <button
                  type="button"
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`p-2 rounded-md transition-colors ${
                    isRecording 
                      ? 'text-primary bg-primary/20' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/20'
                  }`}
                  disabled={isSending}
                >
                  <Mic size={20} className={isRecording ? 'animate-pulse' : ''} />
                </button>
                <label 
                  htmlFor="file-upload" 
                  className={`p-2 rounded-md transition-colors ${
                    isSending 
                      ? 'opacity-50 cursor-not-allowed' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/20 cursor-pointer'
                  }`}
                >
                  <Upload size={20} />
                  <input
                    id="file-upload"
                    type="file"
                    className="hidden"
                    onChange={onFileSelect}
                    accept=".pdf,.doc,.docx,.txt"
                    disabled={isSending}
                  />
                </label>
                <button
                  type="submit"
                  className={`p-2 rounded-md transition-colors ${
                    isSending 
                      ? 'opacity-50 cursor-not-allowed'
                      : 'text-primary hover:bg-primary/20'
                  }`}
                  disabled={isSending}
                >
                  <Send size={20} className={isSending ? 'animate-pulse' : ''} />
                </button>
              </div>
            </div>
          </div>
          {selectedFile && (
            <div className="absolute -top-8 left-0 right-0">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground bg-muted/50 px-3 py-1 rounded">
                <FileText size={14} />
                <span className="truncate">{selectedFile.name}</span>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
} 