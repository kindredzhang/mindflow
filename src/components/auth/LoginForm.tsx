import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Toaster } from '@/components/ui/toaster';
import { authApi } from '@/services/api/auth';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { showToast } from '@/store/toast';

export default function LoginForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await authApi.login({ email, password });
      localStorage.setItem('access_token', response.access_token);
      localStorage.setItem('user_info', JSON.stringify(response.user));
            
      showToast({
        title: "登录成功",
        description: "正在跳转到主页...",
      });

      setTimeout(() => {
        navigate('/chat');
      }, 1000);
    } catch (error) {
      showToast({
        title: "登录失败",
        description: (error as Error).message,
        variant: "destructive",
      });
    }
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
              />
            </div>
          </div>

          <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-600/90 text-white">
            登录
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