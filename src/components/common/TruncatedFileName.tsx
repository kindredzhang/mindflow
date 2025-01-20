import { useState, useRef, useLayoutEffect } from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export const TruncatedFileName: React.FC<{ fileName: string }> = ({ fileName }) => {
    const [isTruncated, setIsTruncated] = useState(false);
    const textRef = useRef<HTMLHeadingElement>(null);
  
    useLayoutEffect(() => {
      const checkTruncation = () => {
        const element = textRef.current;
        if (element) {
          setIsTruncated(element.scrollWidth > element.clientWidth);
        }
      };
  
      checkTruncation();
      window.addEventListener('resize', checkTruncation);
      return () => window.removeEventListener('resize', checkTruncation);
    }, [fileName]);
  
    if (!isTruncated) {
      return (
        <h3 
          ref={textRef}
          className="text-foreground font-medium truncate"
        >
          {fileName}
        </h3>
      );
    }
  
    return (
      <TooltipProvider delayDuration={300}>
        <Tooltip>
          <TooltipTrigger asChild>
            <h3 
              ref={textRef}
              className="text-foreground font-medium truncate cursor-default hover:text-primary/90 transition-colors"
            >
              {fileName}
            </h3>
          </TooltipTrigger>
          <TooltipContent 
            side="top" 
            className="bg-popover/95 backdrop-blur-sm border border-border shadow-md"
          >
            <p className="max-w-[300px] break-all text-sm px-1">
              {fileName}
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };