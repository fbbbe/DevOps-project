import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Separator } from './ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { ArrowLeft, MapPin, Users, Calendar, Clock, Tag, QrCode, BarChart3, UserCheck, UserX, AlertTriangle, Settings, MessageCircle, BookOpen } from 'lucide-react';
import { Study, User } from '../App';

interface StudyDetailProps {
  study: Study;
  user: User;
  onBack: () => void;
  onViewChange: (view: 'attendance' | 'progress' | 'chat') => void;
}

// Mock member data
const mockMembers = [
  { id: '1', nickname: '영어왕', gender: '여성', role: 'owner', status: 'active', attendanceRate: 95, warnings: 0 },
  { id: '2', nickname: '스터디킹', gender: '남성', role: 'member', status: 'active', attendanceRate: 88, warnings: 0 },
  { id: '3', nickname: '열공맨', gender: '남성', role: 'member', status: 'active', attendanceRate: 76, warnings: 1 },
  { id: '4', nickname: '공부러버', gender: '여성', role: 'member', status: 'warning', attendanceRate: 52, warnings: 3 },
];

const mockSessions = [
  { id: '1', date: '2024-01-15', topic: '1주차: 기초 문법', attendance: 4, total: 4, progress: 100 },
  { id: '2', date: '2024-01-22', topic: '2주차: 시제와 동사', attendance: 3, total: 4, progress: 75 },
  { id: '3', date: '2024-01-29', topic: '3주차: 문장 구조', attendance: 4, total: 4, progress: 100 },
  { id: '4', date: '2024-02-05', topic: '4주차: 관계사', attendance: 3, total: 4, progress: 75 },
];

export function StudyDetail({ study, user, onBack, onViewChange }: StudyDetailProps) {
  const [isMember, setIsMember] = useState(Math.random() > 0.5);
  const [isOwner] = useState(study.ownerId === user.id);
  const [joinStatus, setJoinStatus] = useState<'none' | 'pending' | 'approved'>('none');

  const handleJoinRequest = () => {
    setJoinStatus('pending');
    // Mock API call
    setTimeout(() => {
      setJoinStatus('approved');
      setIsMember(true);
    }, 2000);
  };

  const handleLeaveStudy = () => {
    setIsMember(false);
    setJoinStatus('none');
  };

  const getStatusBadge = (status: Study['status']) => {
    switch (status) {
      case 'recruiting':
        return <Badge variant="default">모집중</Badge>;
      case 'active':
        return <Badge variant="secondary">진행중</Badge>;
      case 'completed':
        return <Badge variant="outline">완료</Badge>;
      default:
        return null;
    }
  };

  const getMemberStatusBadge = (status: string, warnings: number) => {
    if (warnings >= 3) {
      return <Badge variant="destructive" className="text-xs">경고 {warnings}회</Badge>;
    }
    if (warnings > 0) {
      return <Badge variant="outline" className="text-xs">주의 {warnings}회</Badge>;
    }
    return <Badge variant="secondary" className="text-xs">정상</Badge>;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background border-b">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center flex-1">
            <Button variant="ghost" size="sm" onClick={onBack} className="mr-2">
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-primary" />
              <h1 className="text-lg font-medium">스터디 상세</h1>
            </div>
          </div>
          {isOwner && (
            <Button variant="ghost" size="sm">
              <Settings className="w-4 h-4" />
            </Button>
          )}
        </div>
      </header>

      <div className="p-4 space-y-4">
        {/* Study Info */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-xl mb-2">{study.name}</CardTitle>
                <div className="flex items-center space-x-2 mb-2">
                  <Avatar className="w-6 h-6">
                    <AvatarFallback className="text-xs">
                      {study.ownerNickname.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-muted-foreground">
                    {study.ownerNickname}
                  </span>
                </div>
              </div>
              {getStatusBadge(study.status)}
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">{study.description}</p>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="flex items-center text-sm">
                <MapPin className="w-4 h-4 mr-2 text-muted-foreground" />
                <span>{study.region}</span>
              </div>
              <div className="flex items-center text-sm">
                <Badge variant={study.type === 'online' ? 'secondary' : 'outline'} className="text-xs">
                  {study.type === 'online' ? '온라인' : '오프라인'}
                </Badge>
              </div>
              <div className="flex items-center text-sm">
                <Users className="w-4 h-4 mr-2 text-muted-foreground" />
                <span>{study.currentMembers}/{study.maxMembers}명</span>
              </div>
              <div className="flex items-center text-sm">
                <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                <span>{study.duration === 'short' ? '단기' : '장기'}</span>
              </div>
            </div>

            <div className="flex items-center text-sm mb-4">
              <Clock className="w-4 h-4 mr-2 text-muted-foreground" />
              <span>{study.startDate} ~ {study.endDate}</span>
            </div>

            <div className="flex flex-wrap gap-1 mb-4">
              {study.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  <Tag className="w-3 h-3 mr-1" />
                  {tag}
                </Badge>
              ))}
            </div>

            {study.progress !== undefined && (
              <div className="mt-4 p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span>전체 진행률</span>
                  <span className="font-medium">{study.progress}%</span>
                </div>
                <Progress value={study.progress} className="w-full" />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        {!isMember && !isOwner && (
          <div className="space-y-2">
            {joinStatus === 'none' && (
              <Button 
                onClick={handleJoinRequest} 
                className="w-full" 
                size="lg"
                disabled={study.status !== 'recruiting'}
              >
                {study.status === 'recruiting' ? '참여 신청하기' : '모집 완료'}
              </Button>
            )}
            {joinStatus === 'pending' && (
              <Button variant="outline" className="w-full" size="lg" disabled>
                승인 대기중...
              </Button>
            )}
            {joinStatus === 'approved' && (
              <Button variant="secondary" className="w-full" size="lg" disabled>
                참여 승인됨
              </Button>
            )}
          </div>
        )}

        {(isMember || isOwner) && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Button 
                onClick={() => onViewChange('attendance')}
                variant="outline" 
                className="flex items-center"
              >
                <QrCode className="w-4 h-4 mr-2" />
                출석 관리
              </Button>
              {study.duration === 'short' && (
                <Button 
                  onClick={() => onViewChange('progress')}
                  variant="outline" 
                  className="flex items-center"
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  진행률 관리
                </Button>
              )}
              {study.duration === 'long' && (
                <Button variant="outline" disabled>
                  장기 스터디
                </Button>
              )}
            </div>
            <Button 
              onClick={() => onViewChange('chat')}
              variant="default"
              className="w-full flex items-center"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              채팅
            </Button>
          </div>
        )}

        {/* Tabs for detailed info */}
        <Tabs defaultValue="members" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="members">멤버 ({mockMembers.length})</TabsTrigger>
            <TabsTrigger value="sessions">회차 ({mockSessions.length})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="members" className="space-y-3 mt-4">
            {mockMembers.map((member) => (
              <Card key={member.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarFallback>
                          {member.nickname.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{member.nickname}</span>
                          {(member.id === user.id || user.role === 'admin') && (
                            <span className="text-sm text-muted-foreground">({member.gender})</span>
                          )}
                          {member.role === 'owner' && (
                            <Badge variant="secondary" className="text-xs">방장</Badge>
                          )}
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-xs text-muted-foreground">
                            출석률 {member.attendanceRate}%
                          </span>
                          {getMemberStatusBadge(member.status, member.warnings)}
                        </div>
                      </div>
                    </div>
                    {isOwner && member.id !== user.id && (
                      <div className="flex space-x-1">
                        {member.warnings >= 3 && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="sm">
                                <UserX className="w-3 h-3" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>멤버 퇴출</AlertDialogTitle>
                                <AlertDialogDescription>
                                  {member.nickname} 님을 스터디에서 퇴출하시겠습니까?
                                  이 작업은 되돌릴 수 없습니다.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>취소</AlertDialogCancel>
                                <AlertDialogAction className="bg-destructive text-destructive-foreground">
                                  퇴출하기
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                        {member.warnings > 0 && member.warnings < 3 && (
                          <Button variant="outline" size="sm">
                            <AlertTriangle className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
          
          <TabsContent value="sessions" className="space-y-3 mt-4">
            {mockSessions.map((session, index) => (
              <Card key={session.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{session.topic}</h4>
                    <Badge variant="outline" className="text-xs">
                      {session.date}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center space-x-4">
                      <span>출석: {session.attendance}/{session.total}명</span>
                      <span>참석률: {Math.round((session.attendance / session.total) * 100)}%</span>
                    </div>
                    {study.duration === 'short' && (
                      <span>진행률: {session.progress}%</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>

        {/* Leave Study Button for Members */}
        {isMember && !isOwner && (
          <div className="pt-4 border-t">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full">
                  스터디 나가기
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>스터디 나가기</AlertDialogTitle>
                  <AlertDialogDescription>
                    정말로 이 스터디를 나가시겠습니까? 
                    나간 후에는 다시 참여하려면 재신청해야 합니다.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>취소</AlertDialogCancel>
                  <AlertDialogAction 
                    className="bg-destructive text-destructive-foreground"
                    onClick={handleLeaveStudy}
                  >
                    나가기
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </div>
    </div>
  );
}