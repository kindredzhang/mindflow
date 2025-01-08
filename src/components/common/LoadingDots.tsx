export function LoadingDots() {
  return (
    <div className="flex items-center space-x-2">
      <div className="w-2 h-2 bg-current rounded-full animate-bounce" />
      <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:0.2s]" />
      <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:0.4s]" />
    </div>
  );
} 