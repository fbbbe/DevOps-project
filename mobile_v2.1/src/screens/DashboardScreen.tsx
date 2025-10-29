import React, { useEffect, useMemo, useState } from 'react';
import Screen from '../components/Screen';
import Input from '../components/Input';
import Button from '../components/Button';
import Badge from '../components/Badge';
import ProgressBar from '../components/ProgressBar';
import SegmentTabs from '../components/SegmentTabs';
import Select, { Option } from '../components/Select';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/Card';
import theme from '../styles/theme';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { Search, MapPin, Users, Calendar, BookOpen, Heart } from 'lucide-react-native';
import { STUDY_SUBJECTS } from '../data/subjects';
import { useNavigation } from '@react-navigation/native';

// === 웹과 동일 KOREA_REGIONS (필요 구역만 우선 반영, 전체 복붙도 OK) ===
export const KOREA_REGIONS: Record<string, string[]> = {
  '서울특별시': ['강남구','강동구','강북구','강서구','관악구','광진구','구로구','금천구','노원구','도봉구','동대문구','동작구','마포구','서대문구','서초구','성동구','성북구','송파구','양천구','영등포구','용산구','은평구','종로구','중구','중랑구'],
  '부산광역시': ['강서구','금정구','기장군','남구','동구','동래구','부산진구','북구','사상구','사하구','서구','수영구','연제구','영도구','중구','해운대구'],
  '대구광역시': ['남구','달서구','달성군','동구','북구','서구','수성구','중구'],
  '인천광역시': ['강화군','계양구','남동구','동구','미추홀구','부평구','서구','연수구','옹진군','중구'],
  '광주광역시': ['광산구','남구','동구','북구','서구'],
  '대전광역시': ['대덕구','동구','서구','유성구','중구'],
  '울산광역시': ['남구','동구','북구','울주군','중구'],
  '세종특별자치시': ['세종시'],
  '경기도': ['가평군','고양시','과천시','광명시','광주시','구리시','군포시','김포시','남양주시','동두천시','부천시','성남시','수원시','시흥시','안산시','안성시','안양시','양주시','양평군','여주시','연천군','오산시','용인시','의왕시','의정부시','이천시','파주시','평택시','포천시','하남시','화성시'],
  '강원특별자치도': ['강릉시','고성군','동해시','삼척시','속초시','양구군','양양군','영월군','원주시','인제군','정선군','철원군','춘천시','태백시','평창군','홍천군','화천군','횡성군'],
  '충청북도': ['괴산군','단양군','보은군','영동군','옥천군','음성군','제천시','증평군','진천군','청주시','충주시'],
  '충청남도': ['계룡시','공주시','금산군','논산시','당진시','보령시','부여군','서산시','서천군','아산시','예산군','천안시','청양군','태안군','홍성군'],
  '전북특별자치도': ['고창군','군산시','김제시','남원시','무주군','부안군','순창군','완주군','익산시','임실군','장수군','전주시','정읍시','진안군'],
  '전라남도': ['강진군','고흥군','곡성군','광양시','구례군','나주시','담양군','목포시','무안군','보성군','순천시','신안군','여수시','영광군','영암군','완도군','장성군','장흥군','진도군','함평군','해남군','화순군'],
  '경상북도': ['경산시','경주시','고령군','구미시','군위군','김천시','문경시','봉화군','상주시','성주군','안동시','영덕군','영양군','영주시','영천시','예천군','울릉군','울진군','의성군','청도군','청송군','칠곡군','포항시'],
  '경상남도': ['거제시','거창군','고성군','김해시','남해군','밀양시','사천시','산청군','양산시','의령군','진주시','창녕군','창원시','통영시','하동군','함안군','함양군','합천군'],
  '제주특별자치도': ['서귀포시','제주시'],
};

// === 웹과 동일 Mock data ===
type Study = {
  id: string; name: string; subject: string; description: string; tags: string[];
  region: string; regionDetail?: { sido: string; sigungu: string; dongEupMyeon?: string };
  type: 'online' | 'offline'; duration: 'short' | 'long';
  startDate: string; endDate?: string; maxMembers: number; currentMembers: number;
  ownerId: string; ownerNickname: string; status: 'recruiting'|'active'|'completed'; progress?: number;
};

const mockStudies: Study[] = [
  { id:'1', name:'토익 900점 달성하기', subject:'어학', description:'3개월 안에 토익 900점을 목표로 하는 스터디입니다.', tags:['토익','영어','시험준비'], region:'서울특별시 강남구 역삼동',
    regionDetail:{ sido:'서울특별시', sigungu:'강남구', dongEupMyeon:'역삼동' }, type:'offline', duration:'short',
    startDate:'2024-01-15', endDate:'2024-04-15', maxMembers:6, currentMembers:4, ownerId:'2', ownerNickname:'영어왕', status:'recruiting', progress:65 },
  { id:'2', name:'정보처리기사 실기 준비', subject:'IT/프로그래밍', description:'정보처리기사 실기시험을 함께 준비해요.', tags:['정보처리기사','IT','자격증'], region:'온라인',
    type:'online', duration:'short', startDate:'2024-02-01', endDate:'2024-05-01', maxMembers:8, currentMembers:6, ownerId:'3', ownerNickname:'코딩마스터', status:'active', progress:40 },
  { id:'3', name:'경영학 원서 읽기 모임', subject:'마케팅/경영', description:'매주 경영학 원서를 읽고 토론하는 장기 스터디입니다.', tags:['경영학','원서','토론'], region:'서울특별시 마포구 서교동',
    regionDetail:{ sido:'서울특별시', sigungu:'마포구', dongEupMyeon:'서교동' }, type:'offline', duration:'long',
    startDate:'2024-01-01', endDate:'2024-12-31', maxMembers:10, currentMembers:8, ownerId:'4', ownerNickname:'경영컨설턴트', status:'active' },
];
const myStudies = mockStudies.filter(()=> Math.random() > 0.5);

export default function DashboardScreen() {
  // ==== 상태 (웹과 동일) ====
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSido, setSelectedSido] = useState('all');
  const [selectedSigungu, setSelectedSigungu] = useState('all');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [availableSigungu, setAvailableSigungu] = useState<string[]>([]);

  const filteredStudies = useMemo(()=> {
    let filtered = mockStudies;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(study =>
        study.name.toLowerCase().includes(q) ||
        study.description.toLowerCase().includes(q) ||
        study.tags.some(tag => tag.toLowerCase().includes(q))
      );
    }
    if (selectedSido !== 'all') {
      if (selectedSido === '온라인') {
        filtered = filtered.filter(study => study.type === 'online');
      } else {
        filtered = filtered.filter(study => study.regionDetail?.sido === selectedSido);
        if (selectedSigungu !== 'all') {
          filtered = filtered.filter(study => study.regionDetail?.sigungu === selectedSigungu);
        }
      }
    }
    if (selectedSubject !== 'all') {
      filtered = filtered.filter(study => study.subject === selectedSubject);
    }
    return filtered;
  }, [searchQuery, selectedSido, selectedSigungu, selectedSubject]);

  // 시/도 변경 핸들러 (웹 동일)
  const handleSidoChange = (sido: string) => {
    setSelectedSido(sido);
    setSelectedSigungu('all');
    if (sido !== 'all' && sido !== '온라인') {
      setAvailableSigungu(KOREA_REGIONS[sido] ?? []);
    } else {
      setAvailableSigungu([]);
    }
  };

  useEffect(()=>{ /* filteredStudies는 useMemo에서 자동 갱신 */ }, [searchQuery, selectedSido, selectedSigungu, selectedSubject]);

  // Tabs (전체 / 내 스터디 / 찜)
  const [tab, setTab] = useState<'all'|'my'|'favorites'>('all');

  // Select options
  const sidoOptions: Option[] = [
    { label:'전체 지역', value:'all' },
    { label:'온라인', value:'온라인' },
    ...Object.keys(KOREA_REGIONS).map(s=>({ label:s, value:s }))
  ];
  const sigunguOptions: Option[] = [
    { label:'전체 시/군/구', value:'all' },
    ...availableSigungu.map(g=>({ label:g, value:g }))
  ];
  const subjectOptions: Option[] = [
    { label:'전체 주제', value:'all' },
    ...STUDY_SUBJECTS.map(s=>({ label:s.label, value:s.value }))
  ];

  return (
    <Screen>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={S.header}>
          <View style={{ flexDirection:'row', alignItems:'center', gap:8 }}>
            <BookOpen size={24} color={theme.color.primary} />
            <Text style={S.logo}>Study-UP</Text>
          </View>
        </View>

        {/* Welcome */}
        <View style={{ marginTop: 12, marginBottom: 12 }}>
          <Text style={{ fontSize:16, marginBottom: 4 }}>안녕하세요! 👋</Text>
          <Text style={{ color: theme.color.mutedText, fontSize: 12 }}>새로운 스터디를 찾아보거나 만들어보세요.</Text>
        </View>

        {/* Search */}
        <View style={{ flexDirection:'row', gap:8, marginBottom: 12 }}>
          <View style={{ flex:1 }}>
            <Input placeholder="스터디 검색..." value={searchQuery} onChangeText={setSearchQuery} />
          </View>
          <Button variant="outline" size="icon">
          <Search size={22} strokeWidth={2.2} color={theme.color.text} />
          </Button>
        </View>

        {/* Filters */}
        <View style={{ gap:8, marginBottom: 12 }}>
          <View style={{ flexDirection:'row', gap:8 }}>
            <View style={{ flex:1 }}>
              <Select value={selectedSido} onChange={handleSidoChange} placeholder="시/도" options={sidoOptions} />
            </View>

            {(selectedSido !== 'all' && selectedSido !== '온라인' && availableSigungu.length > 0) ? (
              <View style={{ flex:1 }}>
                <Select value={selectedSigungu} onChange={setSelectedSigungu} placeholder="시/군/구" options={sigunguOptions} />
              </View>
            ) : (
              <View style={{ flex:1 }}>
                <Select value={selectedSubject} onChange={setSelectedSubject} placeholder="주제" options={subjectOptions} />
              </View>
            )}
          </View>

          {(selectedSido !== 'all' && selectedSido !== '온라인' && availableSigungu.length > 0) && (
            <Select value={selectedSubject} onChange={setSelectedSubject} placeholder="주제" options={subjectOptions} />
          )}
        </View>

        <SegmentTabs value={tab} onChange={setTab} tabs={[{ value: 'all', label: '전체' }, { value: 'my', label: '내 스터디' }, { value: 'favorites', label: '찜' },]} />

        {/* Lists */}
        {tab==='all' && (
          filteredStudies.length ? filteredStudies.map(study=>(
            <StudyCard
              key={study.id}
              study={study}
              isFavorite={favoriteIds.includes(study.id)}
              onToggleFavorite={()=>{
                setFavoriteIds(ids => ids.includes(study.id) ? ids.filter(x=>x!==study.id) : [...ids, study.id]);
              }}
            />
          )) : (
            <View style={S.empty}>
              <Search size={48} color={theme.color.mutedText} />
              <Text style={{ color: theme.color.mutedText, marginTop: 8 }}>검색 결과가 없습니다.</Text>
            </View>
          )
        )}

        {tab==='my' && (
          myStudies.length ? myStudies.map(study=>(
            <StudyCard
              key={study.id}
              study={study}
              showProgress
              isFavorite={favoriteIds.includes(study.id)}
              onToggleFavorite={()=>{
                setFavoriteIds(ids => ids.includes(study.id) ? ids.filter(x=>x!==study.id) : [...ids, study.id]);
              }}
            />
          )) : (
            <View style={S.empty}>
              <Users size={48} color={theme.color.mutedText} />
              <Text style={{ color: theme.color.mutedText, marginTop: 8 }}>참여 중인 스터디가 없습니다.</Text>
            </View>
          )
        )}

        {tab==='favorites' && (
          filteredStudies.filter(s=>favoriteIds.includes(s.id)).length ? filteredStudies.filter(s=>favoriteIds.includes(s.id)).map(study=>(
            <StudyCard
              key={study.id}
              study={study}
              isFavorite
              onToggleFavorite={()=>{
                setFavoriteIds(ids => ids.filter(x=>x!==study.id));
              }}
            />
          )) : (
            <View style={S.empty}>
              <Heart size={48} color={theme.color.mutedText} />
              <Text style={{ color: theme.color.mutedText, marginTop: 8 }}>찜한 스터디가 없습니다.</Text>
            </View>
          )
        )}

        <View style={{ height: 20 }} />
      </ScrollView>
    </Screen>
  );
}

function StudyCard({
  study, showProgress, isFavorite, onToggleFavorite
}:{ study: Study; showProgress?: boolean; isFavorite?: boolean; onToggleFavorite: ()=>void; }) {
  const navigation = useNavigation<any>();

  return (
    <Pressable
      onPress={() => navigation.navigate('StudyDetail', {
        study,
        user: { id: 'me', nickname: '나', role: 'user' }, // 필요 시 실제 유저로 교체
      })}
      style={{ borderRadius: 12, overflow: 'hidden' }}
    >
      <Card style={{ marginTop: 12 }}>
        <CardHeader style={{ paddingBottom: 12 }}>
          <View style={{ flexDirection:'row', justifyContent:'space-between', gap:12 }}>
            <View style={{ flex:1, minWidth:0 }}>
              <View style={{ flexDirection:'row', alignItems:'center', justifyContent:'space-between', marginBottom: 6 }}>
                <CardTitle style={{ fontSize: 16 }} numberOfLines={1}>{study.name}</CardTitle>

                {/* 찜 아이콘은 탭 전파 막기 (가드 추가) */}
                <Pressable
                  onPress={(e:any) => {
                    if (typeof e?.stopPropagation === 'function') e.stopPropagation();
                    onToggleFavorite();
                  }}
                  hitSlop={8}
                  style={{ width:32, height:32, alignItems:'center', justifyContent:'center' }}
                >
                  <Heart
                    size={20}
                    color={isFavorite ? '#ef4444' : theme.color.mutedText}
                    fill={isFavorite ? '#ef4444' : 'transparent'}
                  />
                </Pressable>
              </View>

              <CardDescription style={{ fontSize: 12 }}>{study.ownerNickname}</CardDescription>
              <Text style={{ fontSize:12, color: theme.color.mutedText, marginTop: 6 }} numberOfLines={2}>
                {study.description}
              </Text>

              <View style={{ flexDirection:'row', flexWrap:'wrap', gap:4, marginTop: 8 }}>
                {study.tags.slice(0,3).map(tag=>(
                  <Badge key={tag} variant="outline" style={{ paddingVertical: 2 }}>
                    <Text style={{ fontSize: 12 }}>#{tag}</Text>
                  </Badge>
                ))}
                {study.tags.length>3 && (
                  <Badge variant="outline" style={{ paddingVertical: 2 }}>
                    <Text style={{ fontSize: 12 }}>+{study.tags.length-3}</Text>
                  </Badge>
                )}
              </View>
            </View>

            <View style={{ alignItems:'flex-end', justifyContent:'space-between' }}>
              {study.status==='recruiting' && <Badge variant="default">모집중</Badge>}
              {study.status==='active' && <Badge variant="secondary">진행중</Badge>}
              {study.status==='completed' && <Badge variant="outline">완료</Badge>}

              <View style={{ flexDirection:'row', alignItems:'center', gap:4, marginTop: 6 }}>
                <MapPin size={12} color={theme.color.mutedText} />
                <Text style={{ fontSize: 12, color: theme.color.mutedText }} numberOfLines={1}>
                  {study.type==='online' ? '온라인' : (study.regionDetail?.dongEupMyeon ?? study.region)}
                </Text>
              </View>
              <View style={{ flexDirection:'row', alignItems:'center', gap:4 }}>
                <Users size={12} color={theme.color.mutedText} />
                <Text style={{ fontSize: 12, color: theme.color.mutedText }}>{study.currentMembers}/{study.maxMembers}</Text>
              </View>
              <View style={{ flexDirection:'row', alignItems:'center', gap:4 }}>
                <Calendar size={12} color={theme.color.mutedText} />
                <Text style={{ fontSize: 12, color: theme.color.mutedText }}>{study.startDate.slice(5)}</Text>
              </View>
            </View>
          </View>
        </CardHeader>

        {showProgress && study.progress !== undefined && (
          <CardContent style={{ paddingTop: 12, borderTopWidth: 1, borderTopColor: theme.color.border }}>
            <View style={{ flexDirection:'row', justifyContent:'space-between', marginBottom: 4 }}>
              <Text style={{ fontSize: 12 }}>진행률</Text>
              <Text style={{ fontSize: 12 }}>{study.progress}%</Text>
            </View>
            <ProgressBar value={study.progress} />
          </CardContent>
        )}
      </Card>
    </Pressable>
  );
}

const S = StyleSheet.create({
  header: { borderBottomWidth:1, borderBottomColor: theme.color.border, paddingBottom: 8 },
  logo: { fontSize: 20, fontWeight: '700', color: theme.color.text },
  empty:{ alignItems:'center', paddingVertical: 32 },
});