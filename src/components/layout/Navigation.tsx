import { UserButton } from "@/components/ui/user-button";
import { Database, MessageSquare } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function Navigation() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogoClick = () => {
    navigate('/chat', { 
      state: { clearSession: true } 
    });
  };

  return (
    <div className="fixed top-0 left-0 right-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50 border-b border-border">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center space-x-8">
          <h1 
            className="text-foreground font-bold text-xl flex items-center cursor-pointer group" 
            onClick={handleLogoClick}
          >
            <img 
              src="/logo.svg" 
              alt="MindFlow" 
              className="w-8 h-8 mr-2 transition-transform group-hover:scale-105" 
            />
            <div className="flex flex-col">
              <span className="font-mono text-xl tracking-wide bg-gradient-to-r from-indigo-500 to-indigo-400 bg-clip-text text-transparent">
                MindFlow
              </span>
              <span className="text-xs text-muted-foreground tracking-wider font-light">
                AI Thinking Assistant
              </span>
            </div>
          </h1>
          <nav className="flex space-x-4">
            <button
              onClick={() => navigate('/chat')}
              className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
                location.pathname === '/chat'
                  ? 'bg-indigo-600 text-white hover:bg-indigo-600/90'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              }`}
            >
              <MessageSquare size={16} className="mr-2" />
              <span>Chat</span>
            </button>
            <button
              onClick={() => navigate('/knowledge')}
              className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
                location.pathname === '/knowledge'
                  ? 'bg-indigo-600 text-white hover:bg-indigo-600/90'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              }`}
            >
              <Database size={16} className="mr-2" />
              <span>Knowledge</span>
            </button>
          </nav>
        </div>
        
        <div className="flex items-center space-x-4">
          <UserButton />
        </div>
      </div>
    </div>
  );
}