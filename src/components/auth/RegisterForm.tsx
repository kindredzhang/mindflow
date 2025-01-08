import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Toaster } from '@/components/ui/toaster';
import { authApi } from '@/services/api/auth';
import { showToast } from '@/store/toast';
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

interface Department {
  id: number;
  name: string;
}

export default function RegisterForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [departments, setDepartments] = useState<Department[]>([]);
  const [countdown, setCountdown] = useState(0);
  const [name, setName] = useState('');

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const departments = await authApi.getDepartments();
        console.log(departments);
        setDepartments(departments);
      } catch (error) {
        console.error('Failed to fetch departments:', error);
        setDepartments([]);
      }
    };
    fetchDepartments();
  }, []);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  useEffect(() => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
  }, []);

  const handleSendCode = async () => {
    if (!email || countdown > 0) return;
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showToast({
        title: "邮箱格式错误",
        description: "请输入正确的邮箱地址",
        variant: "destructive",
      });
      return;
    }

    try {
      await authApi.sendVerificationCode(email);
      setCountdown(60);
      showToast({
        title: "验证码已发送",
        description: "请查看邮箱获取验证码",
        variant: "default",
      });
    } catch (error) {
      showToast({
        title: "发送失败",
        description: error instanceof Error ? error.message : '发送验证码失败',
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      showToast({
        title: "密码不匹配",
        description: "",
        variant: "destructive",
      })
      return;
    }
    try {
      await authApi.register({
        email,
        password,
        confirm_password: confirmPassword,
        verification_code: verificationCode,
        department_id: parseInt(departmentId),
        name,
      });
      showToast({
        title: "注册成功",
        description: "即将跳转到登录页面...",
        variant: "default",
      });
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (error) {
      showToast({
        title: "注册失败",
        description: error instanceof Error ? error.message : '注册失败',
        variant: "destructive",
      })
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-xl w-full space-y-8 bg-card p-8 rounded-lg shadow-lg">
        <div>
          <h2 className="text-center text-3xl font-bold text-foreground">创建账号</h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">邮箱</Label>
              <div className="flex gap-2">
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-3/4"
                  required
                />
                <Button
                  type="button"
                  onClick={handleSendCode}
                  disabled={countdown > 0}
                  className="w-1/4 bg-indigo-600 hover:bg-indigo-600/90 text-white"
                >
                  {countdown > 0 ? `${countdown}s` : '发送验证码'}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="verificationCode">验证码</Label>
              <Input
                id="verificationCode"
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2 relative">
              <Label htmlFor="department">部门</Label>
              <Select value={departmentId} onValueChange={setDepartmentId}>
                <SelectTrigger>
                  <SelectValue placeholder="请选择部门" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>可选部门</SelectLabel>
                    {Array.isArray(departments) && departments
                      .filter(dept => dept.id !== 0)
                      .map(dept => (
                        <SelectItem key={dept.id} value={dept.id.toString()}>
                          {dept.name}
                        </SelectItem>
                      ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">姓名</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
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

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">确认密码</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>


          </div>

          <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-600/90 text-white">
            注册
          </Button>

          <div className="text-center">
            <p className="text-muted-foreground">
              已有账号？{' '}
              <Link to="/login" className="text-primary hover:text-primary/90">
                登录
              </Link>
            </p>
          </div>
        </form>
      </div>
      <Toaster />
    </div>
  );
}
