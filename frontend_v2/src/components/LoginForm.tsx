import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { BookOpen, Users } from 'lucide-react';
import { User } from '../App';

interface LoginFormProps {
  onLogin: (user: User) => void;
}

export function LoginForm({ onLogin }: LoginFormProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    nickname: '',
    gender: '' as '남성' | '여성' | ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mock login/signup logic
    const user: User = {
      id: Math.random().toString(36).substr(2, 9),
      nickname: isLogin ? '테스트유저' : formData.nickname,
      gender: isLogin ? '남성' : formData.gender as '남성' | '여성',
      email: formData.email,
      role: 'user'
    };
    
    onLogin(user);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl mb-4">
            <BookOpen className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-primary">Study-UP</h1>
          <p className="text-muted-foreground mt-2">함께 성장하는 스터디 플랫폼</p>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle>{isLogin ? '로그인' : '회원가입'}</CardTitle>
            <CardDescription>
              {isLogin ? '계정에 로그인하세요' : '새 계정을 만들어보세요'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">이메일</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="이메일을 입력하세요"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">비밀번호</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="비밀번호를 입력하세요"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  required
                />
              </div>

              {!isLogin && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="nickname">닉네임</Label>
                    <Input
                      id="nickname"
                      placeholder="닉네임을 입력하세요"
                      value={formData.nickname}
                      onChange={(e) => handleInputChange('nickname', e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-3">
                    <Label>성별</Label>
                    <RadioGroup
                      value={formData.gender}
                      onValueChange={(value) => handleInputChange('gender', value)}
                      className="flex space-x-6"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="남성" id="male" />
                        <Label htmlFor="male">남성</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="여성" id="female" />
                        <Label htmlFor="female">여성</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </>
              )}

              <Button type="submit" className="w-full">
                {isLogin ? '로그인' : '회원가입'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Button
                variant="link"
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm"
              >
                {isLogin ? '계정이 없으신가요? 회원가입' : '이미 계정이 있으신가요? 로그인'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          <div className="flex items-center justify-center space-x-2">
            <Users className="w-4 h-4" />
            <span>1000+ 명이 함께하고 있어요</span>
          </div>
        </div>
      </div>
    </div>
  );
}