import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Separator } from './ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Switch } from './ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from './ui/dialog';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ArrowLeft, User, Settings, Trophy, Calendar, Users, TrendingUp, LogOut, Edit, Save, X, Bell, Shield, MessageCircle, Check, BookOpen } from 'lucide-react';
import { User as UserType } from '../App';
import { toast } from 'sonner@2.0.3';

interface UserProfileProps {
  user: UserType;
  onBack: () => void;
  onLogout: () => void;
  onUpdateUser: (updatedUser: UserType) => void;
  onViewStudy: (view: 'study-detail', study: any) => void;
}

// Mock user statistics
const myStudyHistory = [
  { id: '1', name: '토익 900점 달성하기', status: 'active', role: 'member', progress: 65, attendanceRate: 95 },
  { id: '2', name: '정보처리기사 실기 준비', status: 'completed', role: 'member', progress: 100, attendanceRate: 88 },
  { id: '3', name: '경영학 원서 읽기', status: 'active', role: 'owner', progress: 40, attendanceRate: 92 },
  { id: '4', name: 'React 스터디', status: 'completed', role: 'owner', progress: 100, attendanceRate: 95 },
  { id: '5', name: '영어 회화 마스터', status: 'completed', role: 'member', progress: 100, attendanceRate: 85 },
];

export function UserProfile({ user, onBack, onLogout, onUpdateUser, onViewStudy }: UserProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedNickname, setEditedNickname] = useState(user.nickname);
  
  // Notification Settings
  const [notifications, setNotifications] = useState({
    studyReminder: true,
    attendanceAlert: true,
    chatMessages: false,
    weeklyReport: true,
  });

  // Contact Form
  const [contactForm, setContactForm] = useState({
    category: '',
    subject: '',
    message: '',
  });

  // Calculate statistics
  const studiesJoined = myStudyHistory.length;
  const studiesCompleted = myStudyHistory.filter(s => s.status === 'completed').length;
  const studiesCreated = myStudyHistory.filter(s => s.role === 'owner').length;
  const totalAttendanceRate = Math.round(
    myStudyHistory.reduce((sum, s) => sum + s.attendanceRate, 0) / studiesJoined
  );
  const averageProgressRate = Math.round(
    myStudyHistory.filter(s => s.status === 'active').reduce((sum, s) => sum + s.progress, 0) / 
    Math.max(myStudyHistory.filter(s => s.status === 'active').length, 1)
  );

  // Achievements
  const achievements = [
    { id: '1', name: '첫 스터디', description: '첫 번째 스터디 참여', icon: '🎯', earned: studiesJoined >= 1 },
    { id: '2', name: '완주의 달인', description: '스터디 5회 완주', icon: '🏃‍♂️', earned: studiesCompleted >= 5 },
    { id: '3', name: '출석왕', description: '출석률 90% 이상', icon: '👑', earned: totalAttendanceRate >= 90 },
    { id: '4', name: '리더십', description: '스터디 3회 개설', icon: '⭐', earned: studiesCreated >= 3 },
    { id: '5', name: '성실한 학습자', description: '진행률 95% 이상 달성', icon: '📚', earned: averageProgressRate >= 95 },
  ];

  const handleSaveProfile = () => {
    if (editedNickname.trim() === '') {
      toast.error('닉네임을 입력해주세요');
      return;
    }
    
    const updatedUser = { ...user, nickname: editedNickname.trim() };
    onUpdateUser(updatedUser);
    setIsEditing(false);
    toast.success('프로필이 업데이트되었습니다');
  };

  const handleNotificationChange = (key: keyof typeof notifications) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
    toast.success('알림 설정이 변경되었습니다');
  };

  const handleContactSubmit = () => {
    if (!contactForm.category || !contactForm.subject || !contactForm.message) {
      toast.error('모든 필드를 입력해주세요');
      return;
    }
    
    // Mock submit
    console.log('Contact form submitted:', contactForm);
    toast.success('문의가 접수되었습니다. 빠른 시일 내에 답변드리겠습니다.');
    setContactForm({ category: '', subject: '', message: '' });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="secondary">진행중</Badge>;
      case 'completed':
        return <Badge variant="outline">완료</Badge>;
      case 'recruiting':
        return <Badge variant="default">모집중</Badge>;
      default:
        return null;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'owner':
        return <Badge variant="default" className="text-xs">방장</Badge>;
      case 'member':
        return <Badge variant="outline" className="text-xs">멤버</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background border-b">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center flex-1">
            <Button variant="ghost" size="sm" onClick={onBack} className="mr-2">
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-primary" />
              <h1 className="text-lg font-medium">프로필</h1>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onLogout}>
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </header>

      <div className="p-4 space-y-4">
        {/* Profile Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-4">
              <Avatar className="w-16 h-16">
                <AvatarFallback className="text-2xl">
                  {user.nickname.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                {!isEditing ? (
                  <div>
                    <h2 className="text-xl font-semibold">{user.nickname}</h2>
                    <p className="text-muted-foreground">{user.gender}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div>
                      <Label htmlFor="nickname" className="text-sm">닉네임</Label>
                      <Input
                        id="nickname"
                        value={editedNickname}
                        onChange={(e) => setEditedNickname(e.target.value)}
                        className="mt-1"
                        placeholder="새 닉네임 입력"
                      />
                    </div>
                  </div>
                )}
              </div>
              <div className="flex flex-col space-y-2">
                {!isEditing ? (
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                    <Edit className="w-3 h-3 mr-1" />
                    수정
                  </Button>
                ) : (
                  <div className="flex space-x-1">
                    <Button variant="outline" size="sm" onClick={handleSaveProfile}>
                      <Save className="w-3 h-3" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => {
                      setIsEditing(false);
                      setEditedNickname(user.nickname);
                    }}>
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              활동 통계
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{studiesJoined}</div>
                <div className="text-sm text-muted-foreground">참여한 스터디</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{studiesCompleted}</div>
                <div className="text-sm text-muted-foreground">완주한 스터디</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{studiesCreated}</div>
                <div className="text-sm text-muted-foreground">개설한 스터디</div>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">{totalAttendanceRate}%</div>
                <div className="text-sm text-muted-foreground">평균 출석률</div>
              </div>
            </div>

            <Separator className="my-4" />

            <div className="text-center">
              <div className="text-lg font-semibold text-primary mb-2">
                평균 진행률: {averageProgressRate}%
              </div>
              <div className="w-full bg-secondary rounded-full h-3">
                <div 
                  className="bg-primary h-3 rounded-full transition-all duration-300" 
                  style={{ width: `${averageProgressRate}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs for detailed info */}
        <Tabs defaultValue="history" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="history">스터디 기록</TabsTrigger>
            <TabsTrigger value="achievements">성취</TabsTrigger>
          </TabsList>
          
          <TabsContent value="history" className="space-y-3 mt-4">
            {myStudyHistory.map((study) => (
              <Card 
                key={study.id} 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => {
                  // Mock study object for navigation
                  const mockStudy = {
                    id: study.id,
                    name: study.name,
                    subject: '어학',
                    description: '',
                    tags: [],
                    region: '서울특별시 강남구 역삼동',
                    type: 'offline' as const,
                    duration: 'short' as const,
                    startDate: '2024-01-15',
                    endDate: '2024-04-15',
                    maxMembers: 6,
                    currentMembers: 4,
                    ownerId: '2',
                    ownerNickname: '방장',
                    status: study.status as 'recruiting' | 'active' | 'completed',
                    progress: study.progress
                  };
                  onViewStudy('study-detail', mockStudy);
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{study.name}</h4>
                    <div className="flex items-center space-x-2">
                      {getRoleBadge(study.role)}
                      {getStatusBadge(study.status)}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                    <div>
                      <span>진행률: </span>
                      <span className="font-medium">{study.progress}%</span>
                    </div>
                    <div>
                      <span>출석률: </span>
                      <span className="font-medium">{study.attendanceRate}%</span>
                    </div>
                  </div>

                  {study.status === 'active' && (
                    <div className="mt-3">
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${study.progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </TabsContent>
          
          <TabsContent value="achievements" className="space-y-3 mt-4">
            <div className="grid grid-cols-1 gap-3">
              {achievements.map((achievement) => (
                <Card 
                  key={achievement.id} 
                  className={achievement.earned ? 'border-primary/20 bg-primary/5' : 'opacity-60'}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">{achievement.icon}</div>
                      <div className="flex-1">
                        <h4 className="font-medium flex items-center space-x-2">
                          <span>{achievement.name}</span>
                          {achievement.earned && (
                            <Badge variant="secondary" className="text-xs">
                              <Trophy className="w-3 h-3 mr-1" />
                              달성
                            </Badge>
                          )}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {achievement.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center">
              <Settings className="w-5 h-5 mr-2" />
              설정
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Notification Settings Dialog */}
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full justify-start">
                  <Bell className="w-4 h-4 mr-2" />
                  알림 설정
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>알림 설정</DialogTitle>
                  <DialogDescription>
                    받고 싶은 알림을 선택하세요
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="study-reminder" className="text-base">스터디 일정 알림</Label>
                      <p className="text-sm text-muted-foreground">스터디 시작 전 알림</p>
                    </div>
                    <Switch
                      id="study-reminder"
                      checked={notifications.studyReminder}
                      onCheckedChange={() => handleNotificationChange('studyReminder')}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="attendance-alert" className="text-base">출석 체크 알림</Label>
                      <p className="text-sm text-muted-foreground">출석 코드 생성 알림</p>
                    </div>
                    <Switch
                      id="attendance-alert"
                      checked={notifications.attendanceAlert}
                      onCheckedChange={() => handleNotificationChange('attendanceAlert')}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="chat-messages" className="text-base">채팅 메시지 알림</Label>
                      <p className="text-sm text-muted-foreground">새 메시지 알림</p>
                    </div>
                    <Switch
                      id="chat-messages"
                      checked={notifications.chatMessages}
                      onCheckedChange={() => handleNotificationChange('chatMessages')}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="weekly-report" className="text-base">주간 리포트</Label>
                      <p className="text-sm text-muted-foreground">주간 활동 요약</p>
                    </div>
                    <Switch
                      id="weekly-report"
                      checked={notifications.weeklyReport}
                      onCheckedChange={() => handleNotificationChange('weeklyReport')}
                    />
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Privacy Settings */}
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full justify-start">
                  <Shield className="w-4 h-4 mr-2" />
                  개인정보 보호
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>개인정보 보호</DialogTitle>
                  <DialogDescription>
                    Study-UP의 개인정보 보호 정책
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4 max-h-96 overflow-y-auto">
                  <div>
                    <h4 className="font-medium mb-2">수집하는 정보</h4>
                    <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                      <li>닉네임, 이메일, 성별</li>
                      <li>스터디 활동 기록</li>
                      <li>출석 및 진행률 데이터</li>
                    </ul>
                  </div>
                  <Separator />
                  <div>
                    <h4 className="font-medium mb-2">정보 사용 목적</h4>
                    <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                      <li>서비스 제공 및 개선</li>
                      <li>스터디 매칭 및 관리</li>
                      <li>통계 및 분석</li>
                    </ul>
                  </div>
                  <Separator />
                  <div>
                    <h4 className="font-medium mb-2">정보 공개</h4>
                    <p className="text-sm text-muted-foreground">
                      성별 정보는 본인과 관리자만 볼 수 있으며, 다른 사용자에게는 공개되지 않습니다.
                    </p>
                  </div>
                  <Separator />
                  <div>
                    <h4 className="font-medium mb-2">계정 삭제</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      계정 삭제를 원하시면 문의하기를 통해 요청해주세요.
                    </p>
                    <Button variant="destructive" size="sm" className="w-full">
                      계정 삭제 요청
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Contact Dialog */}
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full justify-start">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  문의하기
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>문의하기</DialogTitle>
                  <DialogDescription>
                    궁금하신 점이나 건의사항을 보내주세요
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">문의 유형</Label>
                    <Select 
                      value={contactForm.category}
                      onValueChange={(value) => setContactForm(prev => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="유형을 선택하세요" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bug">버그 신고</SelectItem>
                        <SelectItem value="feature">기능 제안</SelectItem>
                        <SelectItem value="account">계정 문제</SelectItem>
                        <SelectItem value="other">기타</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="subject">제목</Label>
                    <Input
                      id="subject"
                      placeholder="제목을 입력하세요"
                      value={contactForm.subject}
                      onChange={(e) => setContactForm(prev => ({ ...prev, subject: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">내용</Label>
                    <Textarea
                      id="message"
                      placeholder="자세한 내용을 입력해주세요"
                      rows={5}
                      value={contactForm.message}
                      onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleContactSubmit} className="w-full">
                    <Check className="w-4 h-4 mr-2" />
                    제출하기
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Separator />
            
            <Button 
              variant="destructive" 
              className="w-full justify-start"
              onClick={onLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              로그아웃
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
