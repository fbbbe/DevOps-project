import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Separator } from './ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ArrowLeft, User, Settings, Trophy, Calendar, Users, TrendingUp, LogOut, Edit, Save, X } from 'lucide-react';
import { User as UserType } from '../App';

interface UserProfileProps {
  user: UserType;
  onBack: () => void;
  onLogout: () => void;
}

// Mock user statistics
const userStats = {
  studiesJoined: 8,
  studiesCompleted: 5,
  studiesCreated: 3,
  totalAttendanceRate: 92,
  averageProgressRate: 87,
  achievements: [
    { id: '1', name: '첫 스터디', description: '첫 번째 스터디 참여', icon: '🎯', earned: true },
    { id: '2', name: '완주의 달인', description: '스터디 5회 완주', icon: '🏃‍♂️', earned: true },
    { id: '3', name: '출석왕', description: '출석률 90% 이상', icon: '👑', earned: true },
    { id: '4', name: '리더십', description: '스터디 3회 개설', icon: '⭐', earned: true },
    { id: '5', name: '성실한 학습자', description: '진행률 95% 이상 달성', icon: '📚', earned: false },
  ]
};

const myStudyHistory = [
  { id: '1', name: '토익 900점 달성하기', status: 'active', role: 'member', progress: 65, attendanceRate: 95 },
  { id: '2', name: '정보처리기사 실기 준비', status: 'completed', role: 'member', progress: 100, attendanceRate: 88 },
  { id: '3', name: '경영학 원서 읽기', status: 'active', role: 'owner', progress: 40, attendanceRate: 92 },
  { id: '4', name: 'React 스터디', status: 'completed', role: 'owner', progress: 100, attendanceRate: 95 },
  { id: '5', name: '영어 회화 마스터', status: 'completed', role: 'member', progress: 100, attendanceRate: 85 },
];

export function UserProfile({ user, onBack, onLogout }: UserProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedNickname, setEditedNickname] = useState(user.nickname);

  const handleSaveProfile = () => {
    // Mock save profile
    console.log('Profile saved:', editedNickname);
    setIsEditing(false);
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background border-b">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center">
            <Button variant="ghost" size="sm" onClick={onBack} className="mr-2">
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-lg font-medium">프로필</h1>
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
                    <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
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
                <div className="text-2xl font-bold text-blue-600">{userStats.studiesJoined}</div>
                <div className="text-sm text-muted-foreground">참여한 스터디</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{userStats.studiesCompleted}</div>
                <div className="text-sm text-muted-foreground">완주한 스터디</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{userStats.studiesCreated}</div>
                <div className="text-sm text-muted-foreground">개설한 스터디</div>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">{userStats.totalAttendanceRate}%</div>
                <div className="text-sm text-muted-foreground">평균 출석률</div>
              </div>
            </div>

            <Separator className="my-4" />

            <div className="text-center">
              <div className="text-lg font-semibold text-primary mb-2">
                평균 진행률: {userStats.averageProgressRate}%
              </div>
              <div className="w-full bg-secondary rounded-full h-3">
                <div 
                  className="bg-primary h-3 rounded-full transition-all duration-300" 
                  style={{ width: `${userStats.averageProgressRate}%` }}
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
              <Card key={study.id}>
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
              {userStats.achievements.map((achievement) => (
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
            <Button variant="outline" className="w-full justify-start">
              알림 설정
            </Button>
            <Button variant="outline" className="w-full justify-start">
              개인정보 보호
            </Button>
            <Button variant="outline" className="w-full justify-start">
              문의하기
            </Button>
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