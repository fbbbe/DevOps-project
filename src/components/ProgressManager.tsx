import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Textarea } from './ui/textarea';
import { ArrowLeft, BarChart3, TrendingUp, Calendar, Target, Plus, Edit } from 'lucide-react';
import { Study, User } from '../App';

interface ProgressManagerProps {
  study: Study;
  user: User;
  onBack: () => void;
}

interface SessionProgress {
  id: string;
  sessionNumber: number;
  date: string;
  topic: string;
  targetProgress: number;
  actualProgress: number;
  notes: string;
  isCompleted: boolean;
}

const mockProgressData: SessionProgress[] = [
  {
    id: '1',
    sessionNumber: 1,
    date: '2024-01-15',
    topic: '1주차: 기초 문법',
    targetProgress: 10,
    actualProgress: 10,
    notes: '기초 문법 완료. 모든 멤버가 잘 따라왔음.',
    isCompleted: true
  },
  {
    id: '2',
    sessionNumber: 2,
    date: '2024-01-22',
    topic: '2주차: 시제와 동사',
    targetProgress: 20,
    actualProgress: 18,
    notes: '시제 부분에서 약간의 어려움. 다음 주에 복습 예정.',
    isCompleted: true
  },
  {
    id: '3',
    sessionNumber: 3,
    date: '2024-01-29',
    topic: '3주차: 문장 구조',
    targetProgress: 30,
    actualProgress: 30,
    notes: '문장 구조 이해도 높음. 예정대로 진행.',
    isCompleted: true
  },
  {
    id: '4',
    sessionNumber: 4,
    date: '2024-02-05',
    topic: '4주차: 관계사',
    targetProgress: 40,
    actualProgress: 35,
    notes: '관계사가 어려워서 진도가 약간 늦어짐.',
    isCompleted: true
  },
  {
    id: '5',
    sessionNumber: 5,
    date: '2024-02-12',
    topic: '5주차: 가정법',
    targetProgress: 50,
    actualProgress: 0,
    notes: '',
    isCompleted: false
  }
];

export function ProgressManager({ study, user, onBack }: ProgressManagerProps) {
  const [isOwner] = useState(study.ownerId === user.id);
  const [progressData, setProgressData] = useState(mockProgressData);
  const [isAddingProgress, setIsAddingProgress] = useState(false);
  const [editingSession, setEditingSession] = useState<string | null>(null);
  const [newProgress, setNewProgress] = useState({
    topic: '',
    progress: 0,
    notes: ''
  });

  const totalProgress = Math.round(
    progressData.filter(p => p.isCompleted).reduce((sum, p) => sum + p.actualProgress, 0) / 
    Math.max(progressData.filter(p => p.isCompleted).length, 1)
  );

  const nextSession = progressData.find(p => !p.isCompleted);
  const completedSessions = progressData.filter(p => p.isCompleted).length;
  const totalSessions = progressData.length;

  const handleAddProgress = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (nextSession) {
      const updatedProgress = progressData.map(p => 
        p.id === nextSession.id 
          ? {
              ...p,
              actualProgress: newProgress.progress,
              notes: newProgress.notes,
              isCompleted: true
            }
          : p
      );
      
      setProgressData(updatedProgress);
      setNewProgress({ topic: '', progress: 0, notes: '' });
      setIsAddingProgress(false);
    }
  };

  const handleEditProgress = (sessionId: string, progress: number, notes: string) => {
    const updatedProgress = progressData.map(p => 
      p.id === sessionId 
        ? { ...p, actualProgress: progress, notes }
        : p
    );
    
    setProgressData(updatedProgress);
    setEditingSession(null);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background border-b">
        <div className="flex items-center p-4">
          <Button variant="ghost" size="sm" onClick={onBack} className="mr-2">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-lg font-medium">진행률 관리</h1>
        </div>
      </header>

      <div className="p-4 space-y-4">
        {/* Study Info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{study.name}</CardTitle>
            <CardDescription>
              단기 스터디 · {study.duration === 'short' ? '12주 이하' : '장기'}
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Overall Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              전체 진행률
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">{totalProgress}%</div>
              <Progress value={totalProgress} className="w-full mb-2" />
              <p className="text-sm text-muted-foreground">
                {completedSessions}/{totalSessions} 회차 완료
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div className="text-center">
                <div className="text-lg font-semibold text-green-600">
                  {progressData.filter(p => p.actualProgress >= p.targetProgress).length}
                </div>
                <div className="text-xs text-muted-foreground">목표 달성 회차</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-blue-600">
                  {Math.round(progressData.filter(p => p.isCompleted).reduce((avg, p) => avg + (p.actualProgress / p.targetProgress * 100), 0) / Math.max(completedSessions, 1))}%
                </div>
                <div className="text-xs text-muted-foreground">목표 달성률</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Add Progress (Owner Only) */}
        {isOwner && nextSession && !isAddingProgress && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center">
                <Plus className="w-5 h-5 mr-2" />
                다음 회차 진행률 입력
              </CardTitle>
              <CardDescription>
                {nextSession.sessionNumber}회차: {nextSession.topic}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => setIsAddingProgress(true)}
                className="w-full"
                size="lg"
              >
                진행률 입력하기
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Progress Input Form */}
        {isOwner && isAddingProgress && nextSession && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {nextSession.sessionNumber}회차 진행률 입력
              </CardTitle>
              <CardDescription>{nextSession.topic}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddProgress} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="progress">달성 진행률 (%)</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="progress"
                      type="number"
                      min="0"
                      max="100"
                      value={newProgress.progress}
                      onChange={(e) => setNewProgress(prev => ({ 
                        ...prev, 
                        progress: parseInt(e.target.value) || 0 
                      }))}
                      required
                    />
                    <span className="text-sm text-muted-foreground">
                      목표: {nextSession.targetProgress}%
                    </span>
                  </div>
                  <Progress value={newProgress.progress} className="w-full" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">회차 노트 (선택)</Label>
                  <Textarea
                    id="notes"
                    placeholder="이번 회차에 대한 메모를 남겨보세요..."
                    value={newProgress.notes}
                    onChange={(e) => setNewProgress(prev => ({ 
                      ...prev, 
                      notes: e.target.value 
                    }))}
                    rows={3}
                  />
                </div>

                <div className="flex space-x-2">
                  <Button type="submit" className="flex-1">
                    진행률 저장
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsAddingProgress(false)}
                    className="flex-1"
                  >
                    취소
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Progress History */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              진행률 기록
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {progressData.map((session) => (
              <div key={session.id} className="space-y-3 p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">{session.sessionNumber}회차</h4>
                    <p className="text-sm text-muted-foreground">{session.topic}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-xs">
                      <Calendar className="w-3 h-3 mr-1" />
                      {session.date}
                    </Badge>
                    {session.isCompleted ? (
                      <Badge 
                        variant={session.actualProgress >= session.targetProgress ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {session.actualProgress >= session.targetProgress ? "목표 달성" : "진행 중"}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs">예정</Badge>
                    )}
                  </div>
                </div>

                {session.isCompleted && (
                  <>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>진행률</span>
                        <span className="font-medium">
                          {session.actualProgress}% / {session.targetProgress}%
                        </span>
                      </div>
                      <Progress value={session.actualProgress} className="w-full" />
                    </div>

                    {session.notes && (
                      <div className="p-3 bg-muted/30 rounded-lg">
                        <p className="text-sm">{session.notes}</p>
                      </div>
                    )}

                    {isOwner && (
                      <div className="flex justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingSession(session.id)}
                        >
                          <Edit className="w-3 h-3 mr-1" />
                          수정
                        </Button>
                      </div>
                    )}
                  </>
                )}

                {!session.isCompleted && (
                  <div className="text-center py-4 text-muted-foreground">
                    <Target className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">아직 진행되지 않은 회차입니다</p>
                    <p className="text-xs">목표: {session.targetProgress}%</p>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Progress Tips */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">진행률 관리 팁</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
              <div>
                <p className="font-medium text-foreground">정확한 평가</p>
                <p>실제 학습 진도를 정확히 평가하여 입력하세요.</p>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
              <div>
                <p className="font-medium text-foreground">회차별 기록</p>
                <p>각 회차마다 노트를 남겨 학습 과정을 기록하세요.</p>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
              <div>
                <p className="font-medium text-foreground">목표 조정</p>
                <p>필요시 다음 회차 목표를 조정하여 현실적으로 관리하세요.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}