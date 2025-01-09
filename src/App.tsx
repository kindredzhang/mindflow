import LoginForm from '@/components/auth/LoginForm';
import RegisterForm from '@/components/auth/RegisterForm';
import ChatInterface from '@/components/chat/ChatInterface';
import KnowledgeBase from '@/components/knowledge/KnowledgeBase';
import { Toaster } from '@/components/ui/toaster';
import { ErrorBoundary } from 'react-error-boundary';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';

function ErrorFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-xl font-semibold">出现了一些问题</h2>
        <button 
          onClick={() => window.location.href = '/'}
          className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded"
        >
          返回首页
        </button>
      </div>
    </div>
  );
}

function App() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <Router>
          <Routes>
            <Route path="/" element={<LoginForm />} />
            <Route path="/register" element={<RegisterForm />} />
            <Route path="/chat" element={<ChatInterface />} />
            <Route path="/knowledge" element={<KnowledgeBase />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </ErrorBoundary>
      <Toaster />
    </div>
  );
}

export default App;