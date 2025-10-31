import React, { useEffect, useMemo, useState } from 'react';
import Screen from '../components/Screen';
import Input from '../components/Input';
import Button from '../components/Button';
import Badge from '../components/Badge';
import ProgressBar from '../components/ProgressBar';
import SegmentTabs from '../components/SegmentTabs';
import Select, { Option } from '../components/Select';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/Card';
import theme from '../styles/theme';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { Search, MapPin, Users, Calendar, BookOpen, Heart } from 'lucide-react-native';
import { STUDY_SUBJECTS } from '../data/subjects';
import { fetchTopicOptions } from '../services/topicService';//topics추가
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { fetchStudies } from '../services/studyServices';
import { useAuth } from '../context/AuthContext';

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

// 이 화면에서 사용하는 Study 타입
type Study = {
  id: string;
  name: string;
  subject: string;
  description: string;
  tags: string[];
  region: string;
  regionDetail?: { sido: string; sigungu: string; dongEupMyeon?: string };
  type: 'online' | 'offline';
  duration: 'short' | 'long';
  startDate: string;
  endDate?: string;
  maxMembers: number;
  currentMembers: number;
  ownerId: string;
  ownerNickname: string;
  status: 'recruiting' | 'active' | 'completed';
  progress?: number;
};

export default function DashboardScreen() {
  // ==== 서버에서 가져온 스터디 목록 상태 ====
  const [studies, setStudies] = useState<Study[]>([]);
  const [loading, setLoading] = useState(false);

  // ==== 기존 상태 (UI 그대로 유지) ====
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSido, setSelectedSido] = useState('all');
  const [selectedSigungu, setSelectedSigungu] = useState('all');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [availableSigungu, setAvailableSigungu] = useState<string[]>([]);
  const [tab, setTab] = useState<'all'|'my'|'favorites'>('all');
  // topics추가
  const [subjectOptions, setSubjectOptions] = useState<Option[]>([
    { label: '전체 주제', value: 'all' },
  ]);
  const isFocused = useIsFocused();
  const { user: authUser } = useAuth();

  const currentUser = useMemo(() => {
    const id = authUser ? String(authUser.user_id) : 'me';
    const nickname = authUser?.nickname ?? '나';
    const role = authUser?.role === 'admin' ? 'admin' : 'user';
    return { id, nickname, role } as const;
  }, [authUser]);

  // 화면에 돌아올 때마다 최신 스터디 목록 불러오기
  useEffect(() => {
    if (!isFocused) return;

    const load = async () => {
      try {
        setLoading(true);
        const list = await fetchStudies();
        // fetchStudies()가 백엔드 데이터를 우리 Study 형태로 매핑해준다고 가정
        setStudies(list as Study[]);
        //----topics변경 코드----
         try {
          const opts = await fetchTopicOptions();
          setSubjectOptions([{ label: '전체 주제', value: 'all' }, ...opts]);
        } catch (e) {
          //console.log('주제 옵션 로드 실패:', e);
          setSubjectOptions([{ label: '전체 주제', value: 'all' },]);
        }
        //-----------------------
      } catch (err) {
        console.log('스터디 목록 불러오기 실패:', err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [isFocused]);

  // "내 스터디" 탭 데이터
  // 아직 실제 사용자 정보 연결 전이므로 기존 코드의 무작위 필터 방식 유지
  const sortStudies = (list: Study[]) =>
    [...list].sort((a, b) =>
      a.name.localeCompare(b.name) || (a.startDate || '').localeCompare(b.startDate || '')
    );

  const myStudies = useMemo(() => {
    const mine = studies.filter(s => String(s.ownerId) === String(currentUser.id));
    return sortStudies(mine);
  }, [studies, currentUser.id]);

  // 검색/필터 적용된 스터디 목록
  const filteredStudies = useMemo(() => {
    let filtered = studies;

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
        filtered = filtered.filter(study => {
          const regionText = (study.region ?? '').toString();
          return (study.regionDetail?.sido === selectedSido) ||
                 (selectedSido ? regionText.includes(selectedSido) : true);
        });
        if (selectedSigungu !== 'all') {
          filtered = filtered.filter(study => {
            const regionText = (study.region ?? '').toString();
            return (study.regionDetail?.sigungu === selectedSigungu) ||
                   (selectedSigungu ? regionText.includes(selectedSigungu) : true);
          });
        }
      }
    }

    if (selectedSubject !== 'all') {
      filtered = filtered.filter(study => study.subject === selectedSubject);
    }

    return sortStudies(filtered);
  }, [studies, searchQuery, selectedSido, selectedSigungu, selectedSubject]);

  // 시/도 선택 시 시/군/구 옵션 업데이트 (기존 로직 유지)
  const handleSidoChange = (sido: string) => {
    setSelectedSido(sido);
    setSelectedSigungu('all');

    if (sido !== 'all' && sido !== '온라인') {
      setAvailableSigungu(KOREA_REGIONS[sido] ?? []);
    } else {
      setAvailableSigungu([]);
    }
  };

  // 이건 기존 코드에서 filteredStudies 의존 걸어둔 useEffect 형태를 그대로 남김
  useEffect(() => {
    // filteredStudies는 useMemo에서 자동 계산됨
  }, [searchQuery, selectedSido, selectedSigungu, selectedSubject, filteredStudies]);

  // Select용 옵션들 (기존 스타일 유지)
  const sidoOptions: Option[] = [
    { label:'전체 지역', value:'all' },
    { label:'온라인', value:'온라인' },
    ...Object.keys(KOREA_REGIONS).map(s=>({ label:s, value:s }))
  ];

  const sigunguOptions: Option[] = [
    { label:'전체 시/군/구', value:'all' },
    ...availableSigungu.map(g=>({ label:g, value:g }))
  ];
  // 삭제 부분
  // const subjectOptions: Option[] = [
  //   { label:'전체 주제', value:'all' },
  //   ...STUDY_SUBJECTS.map(s=>({ label:s.label, value:s.value }))
  // ];

  return (
    <Screen>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
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
          <Text style={{ color: theme.color.mutedText, fontSize: 12 }}>
            새로운 스터디를 찾아보거나 만들어보세요.
          </Text>
        </View>

        {/* Search */}
        <View style={{ flexDirection:'row', gap:8, marginBottom: 12 }}>
          <View style={{ flex:1 }}>
            <Input
              placeholder="스터디 검색..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <Button variant="outline" size="icon">
            <Search size={22} strokeWidth={2.2} color={theme.color.text} />
          </Button>
        </View>

        {/* Filters */}
        <View style={{ gap:8, marginBottom: 12 }}>
          <View style={{ flexDirection:'row', gap:8 }}>
            <View style={{ flex:1 }}>
              <Select
                value={selectedSido}
                onChange={handleSidoChange}
                placeholder="시/도"
                options={sidoOptions}
              />
            </View>

            {(selectedSido !== 'all' && selectedSido !== '온라인' && availableSigungu.length > 0) ? (
              <View style={{ flex:1 }}>
                <Select
                  value={selectedSigungu}
                  onChange={setSelectedSigungu}
                  placeholder="시/군/구"
                  options={sigunguOptions}
                />
              </View>
            ) : (
              <View style={{ flex:1 }}>
                <Select
                  value={selectedSubject}
                  onChange={setSelectedSubject}
                  placeholder="주제"
                  options={subjectOptions}
                />
              </View>
            )}
          </View>

          {(selectedSido !== 'all' && selectedSido !== '온라인' && availableSigungu.length > 0) && (
            <Select
              value={selectedSubject}
              onChange={setSelectedSubject}
              placeholder="주제"
              options={subjectOptions}
            />
          )}
        </View>

        <SegmentTabs
          value={tab}
          onChange={setTab}
          tabs={[
            { value: 'all', label: '전체' },
            { value: 'my', label: '내 스터디' },
            { value: 'favorites', label: '찜' },
          ]}
        />

        {/* Lists */}
        {tab === 'all' && (
          filteredStudies.length ? filteredStudies.map(study => (
            <StudyCard
              key={study.id}
              study={study}
              currentUser={currentUser}
              isFavorite={favoriteIds.includes(study.id)}
              onToggleFavorite={() => {
                setFavoriteIds(ids =>
                  ids.includes(study.id)
                    ? ids.filter(x => x !== study.id)
                    : [...ids, study.id]
                );
              }}
            />
          )) : (
            <View style={S.empty}>
              <Search size={48} color={theme.color.mutedText} />
              <Text style={{ color: theme.color.mutedText, marginTop: 8 }}>
                {loading ? '불러오는 중...' : '검색 결과가 없습니다.'}
              </Text>
            </View>
          )
        )}

        {tab === 'my' && (
          myStudies.length ? myStudies.map(study => (
            <StudyCard
              key={study.id}
              study={study}
              showProgress
              isFavorite={favoriteIds.includes(study.id)}
              onToggleFavorite={() => {
                setFavoriteIds(ids =>
                  ids.includes(study.id)
                    ? ids.filter(x => x !== study.id)
                    : [...ids, study.id]
                );
              }}
              currentUser={currentUser}
              defaultIsMember
            />
          )) : (
            <View style={S.empty}>
              <Users size={48} color={theme.color.mutedText} />
              <Text style={{ color: theme.color.mutedText, marginTop: 8 }}>
                {loading ? '불러오는 중...' : '참여 중인 스터디가 없습니다.'}
              </Text>
            </View>
          )
        )}

        {tab === 'favorites' && (
          filteredStudies.filter(s => favoriteIds.includes(s.id)).length
            ? filteredStudies
                .filter(s => favoriteIds.includes(s.id))
                .map(study => (
                  <StudyCard
                    key={study.id}
                    study={study}
                    isFavorite
                    currentUser={currentUser}
                    onToggleFavorite={() => {
                      setFavoriteIds(ids => ids.filter(x => x !== study.id));
                    }}
                  />
                ))
            : (
              <View style={S.empty}>
                <Heart size={48} color={theme.color.mutedText} />
                <Text style={{ color: theme.color.mutedText, marginTop: 8 }}>
                  {loading ? '불러오는 중...' : '찜한 스터디가 없습니다.'}
                </Text>
              </View>
            )
        )}

        <View style={{ height: 20 }} />
      </ScrollView>
    </Screen>
  );
}

type MinimalUser = { id: string; nickname: string; role?: 'user' | 'admin' };

type StudyCardProps = {
  study: Study;
  showProgress?: boolean;
  isFavorite?: boolean;
  onToggleFavorite: () => void;
  currentUser: MinimalUser;
  defaultIsMember?: boolean;
};

function StudyCard({
  study,
  showProgress,
  isFavorite,
  onToggleFavorite,
  currentUser,
  defaultIsMember = false,
}: StudyCardProps) {
  const navigation = useNavigation<any>();
  const isOwner = String(study.ownerId ?? '') === String(currentUser.id ?? '');
  const initialIsMember = defaultIsMember || isOwner;

  return (
    <Pressable
      onPress={() => navigation.navigate('StudyDetail', {
        study,
        user: currentUser,
        isMember: initialIsMember,
        isOwner,
      })}
      style={S.studyPressable}
    >
      <Card style={S.studyCard}>
        <CardHeader style={S.studyHeader}>
          <View style={S.studyTop}>
            <View style={S.studyTitleWrap}>
              <CardTitle style={S.studyTitle} numberOfLines={1}>
                {study.name}
              </CardTitle>
            </View>

            <View style={S.studyActions}>
              <Pressable
                onPress={(e:any) => {
                  if (typeof e?.stopPropagation === 'function') e.stopPropagation();
                  onToggleFavorite();
                }}
                hitSlop={8}
                style={S.favoriteButton}
              >
                <Heart
                  size={20}
                  color={isFavorite ? '#ef4444' : theme.color.mutedText}
                  fill={isFavorite ? '#ef4444' : 'transparent'}
                />
              </Pressable>

              {study.status==='recruiting' && <Badge variant="default">모집중</Badge>}
              {study.status==='active' && <Badge variant="secondary">진행중</Badge>}
              {study.status==='completed' && <Badge variant="outline">완료</Badge>}
            </View>
          </View>

          <Text
            style={S.studyDescription}
            numberOfLines={2}
          >
            {study.description}
          </Text>

          <View style={S.studyMetaRow}>
            <View style={S.studyMetaItem}>
              <MapPin size={12} color={theme.color.mutedText} />
              <Text style={S.studyMetaText} numberOfLines={1}>
                {study.type==='online'
                  ? '온라인'
                  : (study.regionDetail?.dongEupMyeon ?? study.region)}
              </Text>
            </View>

            <View style={S.studyMetaItem}>
              <Calendar size={12} color={theme.color.mutedText} />
              <Text style={S.studyMetaText}>
                {study.startDate.slice(5)}
              </Text>
            </View>
          </View>

          <View style={S.tagRow}>
            {study.tags.slice(0,3).map(tag => (
              <Badge key={tag} variant="outline" style={S.tagBadge}>
                <Text style={S.tagText}>#{tag}</Text>
              </Badge>
            ))}
            {study.tags.length > 3 && (
              <Badge variant="outline" style={S.tagBadge}>
                <Text style={S.tagText}>+{study.tags.length-3}</Text>
              </Badge>
            )}
          </View>
        </CardHeader>

        {showProgress && study.progress !== undefined && (
          <CardContent style={S.studyProgressContent}>
            <View style={S.studyProgressHeader}>
              <Text style={S.studyProgressLabel}>진행률</Text>
              <Text style={S.studyProgressLabel}>{study.progress}%</Text>
            </View>
            <ProgressBar value={study.progress} />
          </CardContent>
        )}
      </Card>
    </Pressable>
  );
}

const S = StyleSheet.create({
  header: {
    borderBottomWidth:1,
    borderBottomColor: theme.color.border,
    paddingBottom: 8
  },
  logo: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.color.text
  },
  empty:{
    alignItems:'center',
    paddingVertical: 32
  },
  studyPressable: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  studyCard: {
    marginTop: 12,
  },
  studyHeader: {
    paddingBottom: 12,
    gap: 12,
  },
  studyTop: {
    flexDirection:'row',
    alignItems:'flex-start',
    justifyContent:'space-between',
    gap: 12,
  },
  studyTitleWrap: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  studyTitle: {
    fontSize: 16,
  },
  studyOwner: {
    fontSize: 12,
  },
  studyActions: {
    flexDirection:'row',
    alignItems:'center',
    gap: 8,
    paddingTop: 2,
  },
  favoriteButton: {
    paddingVertical: 2,
    paddingHorizontal: 2,
    alignItems:'center',
    justifyContent:'center',
    alignSelf:'flex-start',
    marginTop: -2,
  },
  studyDescription: {
    fontSize:12,
    color: theme.color.mutedText,
  },
  studyMetaRow: {
    flexDirection:'row',
    alignItems:'center',
    justifyContent:'space-between',
    gap: 12,
  },
  studyMetaItem: {
    flexDirection:'row',
    alignItems:'center',
    gap: 4,
    flex: 1,
  },
  studyMetaText: {
    fontSize: 12,
    color: theme.color.mutedText,
  },
  tagRow: {
    flexDirection:'row',
    flexWrap:'wrap',
    gap:4,
  },
  tagBadge: {
    paddingVertical: 2,
  },
  tagText: {
    fontSize: 12,
  },
  studyProgressContent: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: theme.color.border,
  },
  studyProgressHeader: {
    flexDirection:'row',
    justifyContent:'space-between',
    marginBottom: 4,
  },
  studyProgressLabel: {
    fontSize: 12,
  },
});
