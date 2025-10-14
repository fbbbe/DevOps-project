import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { ArrowLeft, RefreshCw, Check, QrCode, Clock, Users, AlertCircle, BookOpen } from 'lucide-react';
import { Study, User } from '../App';

interface AttendanceCodeProps {
  study: Study;
  user: User;
  onBack: () => void;
}

export function AttendanceCode({ study, user, onBack }: AttendanceCodeProps) {
  const [isOwner] = useState(study.ownerId === user.id);
  const [currentCode, setCurrentCode] = useState('');
  const [isCodeActive, setIsCodeActive] = useState(false);
  const [inputCode, setInputCode] = useState('');
  const [attendanceStatus, setAttendanceStatus] = useState<'none' | 'success' | 'error'>('none');
  const [timeLeft, setTimeLeft] = useState(0);

  // Mock attendance data
  const [todayAttendance, setTodayAttendance] = useState([
    { id: '1', nickname: '영어왕', gender: '여성', time: '14:30:15', status: 'present' },
    { id: '2', nickname: '스터디킹', gender: '남성', time: '14:32:42', status: 'present' },
  ]);

  const generateCode = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setCurrentCode(code);
    setIsCodeActive(true);
    setTimeLeft(300); // 5 minutes
  };

  const deactivateCode = () => {
    setIsCodeActive(false);
    setCurrentCode('');
    setTimeLeft(0);
  };

  const handleCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (inputCode.toUpperCase() === currentCode) {
      setAttendanceStatus('success');
      setTodayAttendance(prev => [
        ...prev,
        {
          id: user.id,
          nickname: user.nickname,
          gender: user.gender,
          time: new Date().toLocaleTimeString(),
          status: 'present'
        }
      ]);
      setInputCode('');
    } else {
      setAttendanceStatus('error');
    }

    setTimeout(() => {
      setAttendanceStatus('none');
    }, 3000);
  };

  // Timer countdown
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isCodeActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsCodeActive(false);
            setCurrentCode('');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isCodeActive, timeLeft]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background border-b">
        <div className="flex items-center p-4">
          <Button variant="ghost" size="sm" onClick={onBack} className="mr-2">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-primary" />
            <h1 className="text-lg font-medium">출석 관리</h1>
          </div>
        </div>
      </header>

      <div className="p-4 space-y-4">
        {/* Study Info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{study.name}</CardTitle>
            <CardDescription>
              {new Date().toLocaleDateString('ko-KR', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                weekday: 'long'
              })}
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Owner: Code Generation */}
        {isOwner && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center">
                <QrCode className="w-5 h-5 mr-2" />
                출석 코드 생성
              </CardTitle>
              <CardDescription>
                멤버들이 입력할 출석 코드를 생성하세요
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!isCodeActive ? (
                <Button onClick={generateCode} className="w-full" size="lg">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  출석 코드 생성
                </Button>
              ) : (
                <div className="space-y-4">
                  <div className="text-center p-6 bg-primary/10 rounded-lg border-2 border-dashed border-primary/20">
                    <div className="text-3xl font-mono font-bold text-primary mb-2">
                      {currentCode}
                    </div>
                    <div className="flex items-center justify-center text-sm text-muted-foreground">
                      <Clock className="w-4 h-4 mr-1" />
                      남은 시간: {formatTime(timeLeft)}
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button onClick={generateCode} variant="outline" className="flex-1">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      새로 생성
                    </Button>
                    <Button onClick={deactivateCode} variant="destructive" className="flex-1">
                      코드 비활성화
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Member: Code Input */}
        {!isOwner && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center">
                <Check className="w-5 h-5 mr-2" />
                출석 체크
              </CardTitle>
              <CardDescription>
                스터디장이 제공한 출석 코드를 입력하세요
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCodeSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="attendanceCode">출석 코드</Label>
                  <Input
                    id="attendanceCode"
                    placeholder="6자리 코드를 입력하세요"
                    value={inputCode}
                    onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                    maxLength={6}
                    className="text-center text-lg font-mono"
                    required
                  />
                </div>
                
                <Button type="submit" className="w-full" size="lg">
                  출석 체크
                </Button>

                {attendanceStatus === 'success' && (
                  <div className="flex items-center justify-center text-green-600 bg-green-50 p-3 rounded-lg">
                    <Check className="w-4 h-4 mr-2" />
                    출석이 완료되었습니다!
                  </div>
                )}

                {attendanceStatus === 'error' && (
                  <div className="flex items-center justify-center text-red-600 bg-red-50 p-3 rounded-lg">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    잘못된 출석 코드입니다.
                  </div>
                )}
              </form>
            </CardContent>
          </Card>
        )}

        {/* Today's Attendance */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center justify-between">
              <div className="flex items-center">
                <Users className="w-5 h-5 mr-2" />
                오늘 출석 현황
              </div>
              <Badge variant="secondary">
                {todayAttendance.length}/{study.currentMembers}명
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {todayAttendance.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>아직 출석한 멤버가 없습니다.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {todayAttendance.map((attendance) => (
                  <div key={attendance.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium">
                          {attendance.nickname}
                          {(attendance.id === user.id || user.role === 'admin') && (
                            <span className="text-sm text-muted-foreground ml-1">({attendance.gender})</span>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{attendance.time}</p>
                      <Badge variant="outline" className="text-xs">출석</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Attendance Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">출석 통계</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">95%</div>
                <div className="text-sm text-muted-foreground">전체 출석률</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">12</div>
                <div className="text-sm text-muted-foreground">총 회차</div>
              </div>
            </div>
            
            <Separator className="my-4" />
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>정상 출석 (90% 이상)</span>
                <span className="text-green-600 font-medium">3명</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>주의 대상 (70-89%)</span>
                <span className="text-yellow-600 font-medium">1명</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>경고 대상 (70% 미만)</span>
                <span className="text-red-600 font-medium">0명</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Attendance Rules */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">출석 규칙</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 mt-0.5 text-yellow-500" />
              <div>
                <p className="font-medium text-foreground">결석 3회 시 자동 경고</p>
                <p>3회 결석 시 시스템에서 자동으로 경고 상태로 변경됩니다.</p>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 mt-0.5 text-red-500" />
              <div>
                <p className="font-medium text-foreground">경고 후 추가 결석</p>
                <p>경고 상태에서 추가 결석 시 스터디장이 퇴출 여부를 결정할 수 있습니다.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}