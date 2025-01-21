import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Toaster } from '@/components/ui/toaster';
import { useDebounce } from '@/hooks/use-debounce';
import { authApi } from '@/services/api/auth';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function LoginForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const debouncedLogin = useDebounce(async (email: string, password: string) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    
    try {
      const response = await authApi.login({ email, password });
      localStorage.setItem('access_token', response.access_token);
      localStorage.setItem('user_info', JSON.stringify(response.user));
  
      const savedToken = localStorage.getItem('access_token');
      console.log(savedToken);
      if (!savedToken) {
        throw new Error('Token not saved properly');
      }

      navigate('/chat', { replace: true });

    } catch (error) {
      console.log(error);
    } finally {
      setIsSubmitting(false);
    }
  }, 1000);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    debouncedLogin(email, password);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 bg-card p-8 rounded-lg shadow-lg">
        <div>
          <h2 className="text-center text-3xl font-bold text-foreground">欢迎回来</h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">邮箱</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="new-password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">密码</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full bg-indigo-600 hover:bg-indigo-600/90 text-white"
            disabled={isSubmitting}
          >
            {isSubmitting ? '登录中...' : '登录'}
          </Button>

          <div className="text-center">
            <p className="text-muted-foreground">
              还没有账号？{' '}
              <Link to="/register" className="text-primary hover:text-primary/90">
                注册
              </Link>
            </p>
          </div>
        </form>
      </div>
      <Toaster />
    </div>
  );
}