import { Pause, Volume2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

interface SpeakButtonProps {
  content: string;
  className?: string;
  onSpeak?: (content: string) => void;
}

export function SpeakButton({ content, className = '', onSpeak }: SpeakButtonProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleSpeak = () => {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      toast.success('已停止朗读');
    } else {
      const utterance = new SpeechSynthesisUtterance(content);
      utterance.lang = 'zh-CN';
      utterance.onend = () => setIsSpeaking(false);
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
      toast.success('正在朗读内容');
      if (onSpeak) {
        onSpeak(content);
      }
      }
  };
  
  useEffect(() => {
    return () => {
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return (
    <button
      onClick={handleSpeak}
      className={`p-1.5 rounded-md hover:bg-muted transition-all active:scale-95 ${className}`}
    >
      {isSpeaking ? (
        <Pause size={14} className="text-primary" />
      ) : (
        <Volume2 size={14} className="text-muted-foreground" />
      )}
    </button>
  );
} 