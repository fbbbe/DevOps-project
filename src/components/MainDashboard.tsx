import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Plus, Search, MapPin, Users, Calendar, Clock, BookOpen, User, LogOut, Filter } from 'lucide-react';
import { User as UserType, Study } from '../App';

interface MainDashboardProps {
  user: UserType;
  onViewChange: (view: 'create-study' | 'study-detail' | 'profile', study?: Study) => void;
  onLogout: () => void;
}

// Mock data
const mockStudies: Study[] = [
  {
    id: '1',
    name: '토익 900점 달성하기',
    subject: '영어',
    description: '3개월 안에 토익 900점을 목표로 하는 스터디입니다.',
    tags: ['토익', '영어', '시험준비'],
    region: '서울 강남구',
    type: 'offline',
    duration: 'short',
    startDate: '2024-01-15',
    endDate: '2024-04-15',
    maxMembers: 6,
    currentMembers: 4,
    ownerId: '2',
    ownerNickname: '영어왕',
    ownerGender: '여성',
    status: 'recruiting',
    progress: 65
  },
  {
    id: '2',
    name: '정보처리기사 실기 준비',
    subject: 'IT/컴퓨터',
    description: '정보처리기사 실기시험을 함께 준비해요.',
    tags: ['정보처리기사', 'IT', '자격증'],
    region: '온라인',
    type: 'online',
    duration: 'short',
    startDate: '2024-02-01',
    endDate: '2024-05-01',
    maxMembers: 8,
    currentMembers: 6,
    ownerId: '3',
    ownerNickname: '코딩마스터',
    ownerGender: '남성',
    status: 'active',
    progress: 40
  },
  {
    id: '3',
    name: '경영학 원서 읽기 모임',
    subject: '경영학',
    description: '매주 경영학 원서를 읽고 토론하는 장기 스터디입니다.',
    tags: ['경영학', '원서', '토론'],
    region: '서울 마포구',
    type: 'offline',
    duration: 'long',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    maxMembers: 10,
    currentMembers: 8,
    ownerId: '4',
    ownerNickname: '경영컨설턴트',
    ownerGender: '남성',
    status: 'active'
  }
];

const myStudies = mockStudies.filter(study => Math.random() > 0.5);

export function MainDashboard({ user, onViewChange, onLogout }: MainDashboardProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [filteredStudies, setFilteredStudies] = useState(mockStudies);

  const handleSearch = () => {
    let filtered = mockStudies;

    if (searchQuery) {
      filtered = filtered.filter(study => 
        study.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        study.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        study.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    if (selectedRegion !== 'all') {
      filtered = filtered.filter(study => 
        study.region.includes(selectedRegion) || 
        (selectedRegion === '온라인' && study.type === 'online')
      );
    }

    if (selectedSubject !== 'all') {
      filtered = filtered.filter(study => study.subject === selectedSubject);
    }

    setFilteredStudies(filtered);
  };

  React.useEffect(() => {
    handleSearch();
  }, [searchQuery, selectedRegion, selectedSubject]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background border-b">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-bold">Study-UP</h1>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" onClick={() => onViewChange('profile')}>
              <User className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onLogout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="p-4">
        {/* Welcome Section */}
        <div className="mb-6">
          <h2 className="text-lg mb-2">안녕하세요, {user.nickname}님! 👋</h2>
          <p className="text-muted-foreground text-sm">새로운 스터디를 찾아보거나 만들어보세요.</p>
        </div>

        {/* Quick Actions */}
        <div className="flex space-x-3 mb-6">
          <Button 
            onClick={() => onViewChange('create-study')}
            className="flex-1"
            size="lg"
          >
            <Plus className="w-4 h-4 mr-2" />
            스터디 만들기
          </Button>
        </div>

        {/* Search & Filter */}
        <div className="space-y-3 mb-6">
          <div className="flex space-x-2">
            <div className="flex-1">
              <Input
                placeholder="스터디 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <Button variant="outline" size="icon">
              <Search className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="flex space-x-2">
            <Select value={selectedRegion} onValueChange={setSelectedRegion}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="지역" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 지역</SelectItem>
                <SelectItem value="온라인">온라인</SelectItem>
                <SelectItem value="서울">서울</SelectItem>
                <SelectItem value="부산">부산</SelectItem>
                <SelectItem value="대구">대구</SelectItem>
                <SelectItem value="인천">인천</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="주제" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 주제</SelectItem>
                <SelectItem value="영어">영어</SelectItem>
                <SelectItem value="IT/컴퓨터">IT/컴퓨터</SelectItem>
                <SelectItem value="경영학">경영학</SelectItem>
                <SelectItem value="고시/공무원">고시/공무원</SelectItem>
                <SelectItem value="자격증">자격증</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="all">전체 스터디</TabsTrigger>
            <TabsTrigger value="my">내 스터디</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="space-y-4">
            {filteredStudies.map((study) => (
              <StudyCard 
                key={study.id} 
                study={study} 
                onSelect={() => onViewChange('study-detail', study)}
              />
            ))}
            {filteredStudies.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>검색 결과가 없습니다.</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="my" className="space-y-4">
            {myStudies.map((study) => (
              <StudyCard 
                key={study.id} 
                study={study} 
                onSelect={() => onViewChange('study-detail', study)}
                showProgress
              />
            ))}
            {myStudies.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>참여 중인 스터디가 없습니다.</p>
                <Button 
                  onClick={() => onViewChange('create-study')}
                  className="mt-4"
                  variant="outline"
                >
                  첫 스터디 만들기
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

interface StudyCardProps {
  study: Study;
  onSelect: () => void;
  showProgress?: boolean;
}

function StudyCard({ study, onSelect, showProgress }: StudyCardProps) {
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

  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={onSelect}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-base line-clamp-1">{study.name}</CardTitle>
            <CardDescription className="text-sm mt-1">
              {study.ownerNickname} ({study.ownerGender})
            </CardDescription>
          </div>
          {getStatusBadge(study.status)}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
          {study.description}
        </p>
        
        <div className="flex flex-wrap gap-1 mb-3">
          {study.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
          {study.tags.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{study.tags.length - 3}
            </Badge>
          )}
        </div>

        <div className="space-y-2 text-xs text-muted-foreground">
          <div className="flex items-center">
            <MapPin className="w-3 h-3 mr-1" />
            <span>{study.region}</span>
            <Badge variant={study.type === 'online' ? 'secondary' : 'outline'} className="ml-2 text-xs">
              {study.type === 'online' ? '온라인' : '오프라인'}
            </Badge>
          </div>
          <div className="flex items-center">
            <Users className="w-3 h-3 mr-1" />
            <span>{study.currentMembers}/{study.maxMembers}명</span>
          </div>
          <div className="flex items-center">
            <Calendar className="w-3 h-3 mr-1" />
            <span>{study.startDate} ~ {study.endDate}</span>
          </div>
        </div>

        {showProgress && study.progress !== undefined && (
          <div className="mt-3 pt-3 border-t">
            <div className="flex items-center justify-between text-xs mb-1">
              <span>진행률</span>
              <span>{study.progress}%</span>
            </div>
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
  );
}