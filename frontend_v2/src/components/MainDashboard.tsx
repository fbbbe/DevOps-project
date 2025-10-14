import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Search, MapPin, Users, Calendar, BookOpen, Heart } from 'lucide-react';
import { User as UserType, Study } from '../App';
import { STUDY_SUBJECTS } from '../utils/subjects';

interface MainDashboardProps {
  user: UserType;
  onViewChange: (view: 'create-study' | 'study-detail' | 'profile', study?: Study) => void;
  onLogout: () => void;
  favoriteStudyIds: string[];
  onToggleFavorite: (studyId: string) => void;
}

// 한국 행정구역 데이터
const KOREA_REGIONS = {
  '서울특별시': ['강남구', '강동구', '강북구', '강서구', '관악구', '광진구', '구로구', '금천구', '노원구', '도봉구', '동대문구', '동작구', '마포구', '서대문구', '서초구', '성동구', '성북구', '송파구', '양천구', '영등포구', '용산구', '은평구', '종로구', '중구', '중랑구'],
  '부산광역시': ['강서구', '금정구', '기장군', '남구', '동구', '동래구', '부산진구', '북구', '사상구', '사하구', '서구', '수영구', '연제구', '영도구', '중구', '해운대구'],
  '대구광역시': ['남구', '달서구', '달성군', '동구', '북구', '서구', '수성구', '중구'],
  '인천광역시': ['강화군', '계양구', '남동구', '동구', '미추홀구', '부평구', '서구', '연수구', '옹진군', '중구'],
  '광주광역시': ['광산구', '남구', '동구', '북구', '서구'],
  '대전광역시': ['대덕구', '동구', '서구', '유성구', '중구'],
  '울산광역시': ['남구', '동구', '북구', '울주군', '중구'],
  '세종특별자치시': ['세종시'],
  '경기도': ['가평군', '고양시', '과천시', '광명시', '광주시', '구리시', '군포시', '김포시', '남양주시', '동두천시', '부천시', '성남시', '수원시', '시흥시', '안산시', '안성시', '안양시', '양주시', '양평군', '여주시', '연천군', '오산시', '용인시', '의왕시', '의정부시', '이천시', '파주시', '평택시', '포천시', '하남시', '화성시'],
  '강원특별자치도': ['강릉시', '고성군', '동해시', '삼척시', '속초시', '양구군', '양양군', '영월군', '원주시', '인제군', '정선군', '철원군', '춘천시', '태백시', '평창군', '홍천군', '화천군', '횡성군'],
  '충청북도': ['괴산군', '단양군', '보은군', '영동군', '옥천군', '음성군', '제천시', '증평군', '진천군', '청주시', '충주시'],
  '충청남도': ['계룡시', '공주시', '금산군', '논산시', '당진시', '보령시', '부여군', '서산시', '서천군', '아산시', '예산군', '천안시', '청양군', '태안군', '홍성군'],
  '전북특별자치도': ['고창군', '군산시', '김제시', '남원시', '무주군', '부안군', '순창군', '완주군', '익산시', '임실군', '장수군', '전주시', '정읍시', '진안군'],
  '전라남도': ['강진군', '고흥군', '곡성군', '광양시', '구례군', '나주시', '담양군', '목포시', '무안군', '보성군', '순천시', '신안군', '여수시', '영광군', '영암군', '완도군', '장성군', '장흥군', '진도군', '함평군', '해남군', '화순군'],
  '경상북도': ['경산시', '경주시', '고령군', '구미시', '군위군', '김천시', '문경시', '봉화군', '상주시', '성주군', '안동시', '영덕군', '영양군', '영주시', '영천시', '예천군', '울릉군', '울진군', '의성군', '청도군', '청송군', '칠곡군', '포항시'],
  '경상남도': ['거제시', '거창군', '고성군', '김해시', '남해군', '밀양시', '사천시', '산청군', '양산시', '의령군', '진주시', '창녕군', '창원시', '통영시', '하동군', '함안군', '함양군', '합천군'],
  '제주특별자치도': ['서귀포시', '제주시'],
};

// Mock data
const mockStudies: Study[] = [
  {
    id: '1',
    name: '토익 900점 달성하기',
    subject: '어학',
    description: '3개월 안에 토익 900점을 목표로 하는 스터디입니다.',
    tags: ['토익', '영어', '시험준비'],
    region: '서울특별시 강남구 역삼동',
    regionDetail: {
      sido: '서울특별시',
      sigungu: '강남구',
      dongEupMyeon: '역삼동'
    },
    type: 'offline',
    duration: 'short',
    startDate: '2024-01-15',
    endDate: '2024-04-15',
    maxMembers: 6,
    currentMembers: 4,
    ownerId: '2',
    ownerNickname: '영어왕',
    status: 'recruiting',
    progress: 65
  },
  {
    id: '2',
    name: '정보처리기사 실기 준비',
    subject: 'IT/프로그래밍',
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
    status: 'active',
    progress: 40
  },
  {
    id: '3',
    name: '경영학 원서 읽기 모임',
    subject: '마케팅/경영',
    description: '매주 경영학 원서를 읽고 토론하는 장기 스터디입니다.',
    tags: ['경영학', '원서', '토론'],
    region: '서울특별시 마포구 서교동',
    regionDetail: {
      sido: '서울특별시',
      sigungu: '마포구',
      dongEupMyeon: '서교동'
    },
    type: 'offline',
    duration: 'long',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    maxMembers: 10,
    currentMembers: 8,
    ownerId: '4',
    ownerNickname: '경영컨설턴트',
    status: 'active'
  }
];

const myStudies = mockStudies.filter(study => Math.random() > 0.5);

export function MainDashboard({ user, onViewChange, onLogout, favoriteStudyIds, onToggleFavorite }: MainDashboardProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSido, setSelectedSido] = useState<string>('all');
  const [selectedSigungu, setSelectedSigungu] = useState<string>('all');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [filteredStudies, setFilteredStudies] = useState(mockStudies);
  const [availableSigungu, setAvailableSigungu] = useState<string[]>([]);

  const handleSidoChange = (sido: string) => {
    setSelectedSido(sido);
    setSelectedSigungu('all');
    if (sido !== 'all' && sido !== '온라인') {
      setAvailableSigungu(KOREA_REGIONS[sido as keyof typeof KOREA_REGIONS] || []);
    } else {
      setAvailableSigungu([]);
    }
  };

  const handleSearch = () => {
    let filtered = mockStudies;

    if (searchQuery) {
      filtered = filtered.filter(study => 
        study.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        study.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        study.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    if (selectedSido !== 'all') {
      if (selectedSido === '온라인') {
        filtered = filtered.filter(study => study.type === 'online');
      } else {
        filtered = filtered.filter(study => 
          study.regionDetail?.sido === selectedSido
        );
        
        if (selectedSigungu !== 'all') {
          filtered = filtered.filter(study => 
            study.regionDetail?.sigungu === selectedSigungu
          );
        }
      }
    }

    if (selectedSubject !== 'all') {
      filtered = filtered.filter(study => study.subject === selectedSubject);
    }

    setFilteredStudies(filtered);
  };

  React.useEffect(() => {
    handleSearch();
  }, [searchQuery, selectedSido, selectedSigungu, selectedSubject]);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background border-b">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-bold">Study-UP</h1>
          </div>
        </div>
      </header>

      <div className="p-4">
        {/* Welcome Section */}
        <div className="mb-6">
          <h2 className="text-lg mb-2">안녕하세요, {user.nickname}님! 👋</h2>
          <p className="text-muted-foreground text-sm">새로운 스터디를 찾아보거나 만들어보세요.</p>
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
          
          <div className="grid grid-cols-2 gap-2">
            <Select value={selectedSido} onValueChange={handleSidoChange}>
              <SelectTrigger>
                <SelectValue placeholder="시/도" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 지역</SelectItem>
                <SelectItem value="온라인">온라인</SelectItem>
                {Object.keys(KOREA_REGIONS).map(sido => (
                  <SelectItem key={sido} value={sido}>{sido}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedSido !== 'all' && selectedSido !== '온라인' && availableSigungu.length > 0 && (
              <Select value={selectedSigungu} onValueChange={setSelectedSigungu}>
                <SelectTrigger>
                  <SelectValue placeholder="시/군/구" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체 시/군/구</SelectItem>
                  {availableSigungu.map(sigungu => (
                    <SelectItem key={sigungu} value={sigungu}>{sigungu}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            
            {(selectedSido === 'all' || selectedSido === '온라인' || availableSigungu.length === 0) && (
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger>
                  <SelectValue placeholder="주제" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체 주제</SelectItem>
                  {STUDY_SUBJECTS.map(subject => (
                    <SelectItem key={subject.value} value={subject.value}>
                      {subject.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {selectedSido !== 'all' && selectedSido !== '온라인' && availableSigungu.length > 0 && (
            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="주제" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 주제</SelectItem>
                {STUDY_SUBJECTS.map(subject => (
                  <SelectItem key={subject.value} value={subject.value}>
                    {subject.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="all">전체</TabsTrigger>
            <TabsTrigger value="my">내 스터디</TabsTrigger>
            <TabsTrigger value="favorites">찜</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="space-y-4">
            {filteredStudies.map((study) => (
              <StudyCard 
                key={study.id} 
                study={study} 
                onSelect={() => onViewChange('study-detail', study)}
                isFavorite={favoriteStudyIds.includes(study.id)}
                onToggleFavorite={() => onToggleFavorite(study.id)}
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
                isFavorite={favoriteStudyIds.includes(study.id)}
                onToggleFavorite={() => onToggleFavorite(study.id)}
              />
            ))}
            {myStudies.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>참여 중인 스터디가 없습니다.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="favorites" className="space-y-4">
            {filteredStudies.filter(s => favoriteStudyIds.includes(s.id)).map((study) => (
              <StudyCard 
                key={study.id} 
                study={study} 
                onSelect={() => onViewChange('study-detail', study)}
                isFavorite={true}
                onToggleFavorite={() => onToggleFavorite(study.id)}
              />
            ))}
            {filteredStudies.filter(s => favoriteStudyIds.includes(s.id)).length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Heart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>찜한 스터디가 없습니다.</p>
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
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

function StudyCard({ study, onSelect, showProgress, isFavorite, onToggleFavorite }: StudyCardProps) {
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

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite();
  };

  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={onSelect}>
      <CardHeader className="pb-3">
        <div className="flex justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <CardTitle className="text-base line-clamp-1">{study.name}</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 flex-shrink-0"
                onClick={handleFavoriteClick}
              >
                <Heart
                  className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`}
                />
              </Button>
            </div>
            <CardDescription className="text-sm">
              {study.ownerNickname}
            </CardDescription>
            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
              {study.description}
            </p>
            
            <div className="flex flex-wrap gap-1 mt-3">
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
          </div>

          {/* Right side info */}
          <div className="flex flex-col items-end justify-between flex-shrink-0 text-xs text-muted-foreground space-y-2">
            {getStatusBadge(study.status)}
            
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              <span className="line-clamp-1">{study.type === 'online' ? '온라인' : study.regionDetail?.dongEupMyeon || study.region}</span>
            </div>
            
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              <span>{study.currentMembers}/{study.maxMembers}</span>
            </div>
            
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>{study.startDate.slice(5)}</span>
            </div>
          </div>
        </div>
      </CardHeader>

      {showProgress && study.progress !== undefined && (
        <CardContent className="pt-3 border-t">
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
        </CardContent>
      )}
    </Card>
  );
}

export { KOREA_REGIONS };
