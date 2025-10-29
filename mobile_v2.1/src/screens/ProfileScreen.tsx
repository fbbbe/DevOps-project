import React, { useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Screen from '../components/Screen';
import theme from '../styles/theme';
import Button from '../components/Button';
import Input from '../components/Input';
import Badge from '../components/Badge';
import ProgressBar from '../components/ProgressBar';
import SegmentTabs from '../components/SegmentTabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/Card';
import { BookOpen, ArrowLeft, LogOut, TrendingUp, Trophy, Shield, Bell, MessageCircle, Edit, Save, X } from 'lucide-react-native';

type User = {
  id: string;
  nickname: string;
  gender?: string;
  email?: string;
};

type StudyHistoryItem = {
  id: string;
  name: string;
  status: 'recruiting' | 'active' | 'completed';
  role: 'owner' | 'member';
  progress: number;
  attendanceRate: number;
};

// 웹 UserProfile.tsx의 더미 데이터/구조를 1:1 반영  :contentReference[oaicite:1]{index=1}
const myStudyHistory: StudyHistoryItem[] = [
  { id: '1', name: '토익 900점 달성하기', status: 'active', role: 'member', progress: 65, attendanceRate: 95 },
  { id: '2', name: '정보처리기사 실기 준비', status: 'completed', role: 'member', progress: 100, attendanceRate: 88 },
  { id: '3', name: '경영학 원서 읽기', status: 'active', role: 'owner', progress: 40, attendanceRate: 92 },
  { id: '4', name: 'React 스터디', status: 'completed', role: 'owner', progress: 100, attendanceRate: 95 },
  { id: '5', name: '영어 회화 마스터', status: 'completed', role: 'member', progress: 100, attendanceRate: 85 },
];

export default function ProfileScreen({ route, navigation }: any) {
  const userParam: User | undefined = route?.params?.user;
  const [user, setUser] = useState<User>(userParam ?? { id: 'me', nickname: '나', gender: '남성', email: 'me@example.com' });

  // 편집
  const [isEditing, setIsEditing] = useState(false);
  const [editedNickname, setEditedNickname] = useState(user.nickname);

  // 탭
  const [tab, setTab] = useState<'history' | 'achievements'>('history');

  // 모달 (알림, 개인정보, 문의)
  const [notifOpen, setNotifOpen] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);

  // 알림 설정
  const [notifications, setNotifications] = useState({
    studyReminder: true,
    attendanceAlert: true,
    chatMessages: false,
    weeklyReport: true,
  });

  // 문의 폼
  const [contactCategory, setContactCategory] = useState<string>('');
  const [contactSubject, setContactSubject] = useState<string>('');
  const [contactMessage, setContactMessage] = useState<string>('');

  // 통계 계산 (웹과 동일)  :contentReference[oaicite:2]{index=2}
  const studiesJoined = myStudyHistory.length;
  const studiesCompleted = myStudyHistory.filter(s => s.status === 'completed').length;
  const studiesCreated = myStudyHistory.filter(s => s.role === 'owner').length;
  const totalAttendanceRate = Math.round(myStudyHistory.reduce((sum, s) => sum + s.attendanceRate, 0) / Math.max(studiesJoined, 1));
  const averageProgressRate = Math.round(
    myStudyHistory.filter(s => s.status === 'active').reduce((sum, s) => sum + s.progress, 0)
    / Math.max(myStudyHistory.filter(s => s.status === 'active').length, 1)
  );

  const achievements = useMemo(() => ([
    { id: '1', name: '첫 스터디', description: '첫 번째 스터디 참여', icon: '🎯', earned: studiesJoined >= 1 },
    { id: '2', name: '완주의 달인', description: '스터디 5회 완주', icon: '🏃‍♂️', earned: studiesCompleted >= 5 },
    { id: '3', name: '출석왕', description: '출석률 90% 이상', icon: '👑', earned: totalAttendanceRate >= 90 },
    { id: '4', name: '리더십', description: '스터디 3회 개설', icon: '⭐', earned: studiesCreated >= 3 },
    { id: '5', name: '성실한 학습자', description: '진행률 95% 이상 달성', icon: '📚', earned: averageProgressRate >= 95 },
  ]), [studiesJoined, studiesCompleted, totalAttendanceRate, studiesCreated, averageProgressRate]);

  // 배지 렌더
  const getStatusBadge = (status: StudyHistoryItem['status']) => {
    if (status === 'active') return <Badge variant="secondary">진행중</Badge>;
    if (status === 'completed') return <Badge variant="outline">완료</Badge>;
    return <Badge variant="default">모집중</Badge>;
  };
  const getRoleBadge = (role: StudyHistoryItem['role']) => {
    if (role === 'owner') return <Badge variant="default">방장</Badge>;
    return <Badge variant="outline">멤버</Badge>;
  };

  // 액션
  const handleSaveProfile = () => {
    const name = editedNickname.trim();
    if (!name) return Alert.alert('오류', '닉네임을 입력해주세요.');
    setUser(prev => ({ ...prev, nickname: name }));
    setIsEditing(false);
    Alert.alert('완료', '프로필이 업데이트되었습니다.');
  };

  const handleNotificationToggle = (key: keyof typeof notifications) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
    Alert.alert('알림', '알림 설정이 변경되었습니다.');
  };

  const handleContactSubmit = () => {
    if (!contactCategory || !contactSubject.trim() || !contactMessage.trim()) {
      return Alert.alert('오류', '문의 유형/제목/내용을 모두 입력해주세요.');
    }
    // 실제 전송 대신 로그만
    console.log('Contact submit', { contactCategory, contactSubject, contactMessage });
    Alert.alert('완료', '문의가 접수되었습니다. 빠른 시일 내에 답변드리겠습니다.');
    setContactCategory('');
    setContactSubject('');
    setContactMessage('');
    setContactOpen(false);
  };

  const onLogout = () => Alert.alert('로그아웃', '로그아웃 하시겠어요?', [
   { text: '취소', style: 'cancel' },
   { text: '로그아웃', style: 'destructive', onPress: () => navigation?.reset?.({ index: 0, routes: [{ name: '로그인' }] }) },
 ]);

  const AvatarFallback = ({ name }: { name: string }) => (
    <View style={S.avatar}>
      <Text style={S.avatarTxt}>{name?.charAt(0) ?? '?'}</Text>
    </View>
  );

  return (
    <Screen withPadding={false}>
      {/* Header */}
      <View style={S.header}>
        <Button variant="ghost" size="sm" onPress={() => navigation?.goBack?.()} style={{ paddingHorizontal: 8 }}>
          <ArrowLeft size={16} color={theme.color.text} />
        </Button>
        <View style={{ flexDirection:'row', alignItems:'center', gap:8 }}>
          <BookOpen size={20} color={theme.color.primary} />
          <Text style={{ fontSize:16, fontWeight:'600', color: theme.color.text }}>프로필</Text>
        </View>
        <Button variant="ghost" size="sm" onPress={onLogout}>
          <LogOut size={16} color={theme.color.text} />
        </Button>
      </View>

      <KeyboardAvoidingView behavior={Platform.select({ ios: 'padding', android: undefined })} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>
          {/* Profile Card */}
          <Card>
            <CardHeader>
              <View style={{ flexDirection:'row', alignItems:'center', gap:12 }}>
                <AvatarFallback name={user.nickname} />
                <View style={{ flex:1 }}>
                  {!isEditing ? (
                    <>
                      <Text style={{ fontSize:18, fontWeight:'700' }}>{user.nickname}</Text>
                      {!!user.gender && <Text style={{ color: theme.color.mutedText }}>{user.gender}</Text>}
                      {!!user.email && <Text style={{ color: theme.color.mutedText, fontSize:12 }}>{user.email}</Text>}
                    </>
                  ) : (
                    <View>
                      <Text style={S.label}>닉네임</Text>
                      <Input value={editedNickname} onChangeText={setEditedNickname} placeholder="새 닉네임 입력" />
                    </View>
                  )}
                </View>

                {!isEditing ? (
                  <Button variant="outline" size="sm" onPress={() => setIsEditing(true)}><Edit size={14} color={theme.color.text} /></Button>
                ) : (
                  <View style={{ flexDirection:'row', gap:6 }}>
                    <Button variant="outline" size="sm" onPress={handleSaveProfile}><Save size={14} color={theme.color.text} /></Button>
                    <Button variant="ghost" size="sm" onPress={() => { setIsEditing(false); setEditedNickname(user.nickname); }}>
                      <X size={14} color={theme.color.text} />
                    </Button>
                  </View>
                )}
              </View>
            </CardHeader>
          </Card>

          {/* Statistics */}
          <Card style={{ marginTop: 12 }}>
            <CardHeader>
              <CardTitle style={{ fontSize: 16, flexDirection:'row', alignItems:'center' }}>
                <TrendingUp size={18} color={theme.color.text} />
                <Text style={{ marginLeft: 8 }}>활동 통계</Text>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <View style={S.grid2}>
                <View style={[S.statBox, { backgroundColor: '#eff6ff' }]}>
                  <Text style={[S.statValue, { color: '#2563eb' }]}>{studiesJoined}</Text>
                  <Text style={S.statLabel}>참여한 스터디</Text>
                </View>
                <View style={[S.statBox, { backgroundColor: '#ecfdf5' }]}>
                  <Text style={[S.statValue, { color: '#16a34a' }]}>{studiesCompleted}</Text>
                  <Text style={S.statLabel}>완주한 스터디</Text>
                </View>
                <View style={[S.statBox, { backgroundColor: '#f5f3ff' }]}>
                  <Text style={[S.statValue, { color: '#7c3aed' }]}>{studiesCreated}</Text>
                  <Text style={S.statLabel}>개설한 스터디</Text>
                </View>
                <View style={[S.statBox, { backgroundColor: '#fff7ed' }]}>
                  <Text style={[S.statValue, { color: '#ea580c' }]}>{totalAttendanceRate}%</Text>
                  <Text style={S.statLabel}>평균 출석률</Text>
                </View>
              </View>

              <View style={S.separator} />

              <View style={{ alignItems:'center' }}>
                <Text style={{ fontSize: 16, fontWeight:'700', color: theme.color.primary, marginBottom: 6 }}>
                  평균 진행률: {averageProgressRate}%
                </Text>
                <ProgressBar value={averageProgressRate} />
              </View>
            </CardContent>
          </Card>

          {/* Tabs: history / achievements */}
          <View style={{ marginTop: 12 }}>
            <SegmentTabs 
              value={tab}
              onChange={(v)=>setTab(v as 'history'|'achievements')}
              tabs={[
                { value: 'history', label: '스터디 기록' },
                { value: 'achievements', label: '성취' },
              ]}
            />

            {tab === 'history' ? (
              <View style={{ gap: 10 }}>
                {myStudyHistory.map((study) => (
                  <Pressable
                    key={study.id}
                    onPress={() => {
                      // 웹과 동일하게 상세로 이동 가능한 mock 객체 구성  :contentReference[oaicite:3]{index=3}
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
                        status: study.status,
                        progress: study.progress,
                      };
                      navigation?.navigate?.('StudyDetail', { study: mockStudy, user });
                    }}
                    style={{ borderRadius: 12, overflow:'hidden' }}
                  >
                    <Card>
                      <CardContent style={{ padding: 12 }}>
                        <View style={{ flexDirection:'row', alignItems:'center', justifyContent:'space-between' }}>
                          <Text style={{ fontWeight:'600' }}>{study.name}</Text>
                          <View style={{ flexDirection:'row', gap: 6 }}>
                            {getRoleBadge(study.role)}
                            {getStatusBadge(study.status)}
                          </View>
                        </View>

                        <View style={{ flexDirection:'row', gap: 12, marginTop: 8 }}>
                          <Text style={{ fontSize: 12, color: theme.color.mutedText }}>
                            진행률: <Text style={{ fontWeight:'600', color: theme.color.text }}>{study.progress}%</Text>
                          </Text>
                          <Text style={{ fontSize: 12, color: theme.color.mutedText }}>
                            출석률: <Text style={{ fontWeight:'600', color: theme.color.text }}>{study.attendanceRate}%</Text>
                          </Text>
                        </View>

                        {study.status === 'active' && (
                          <View style={{ marginTop: 8 }}>
                            <ProgressBar value={study.progress} height={6} />
                          </View>
                        )}
                      </CardContent>
                    </Card>
                  </Pressable>
                ))}
              </View>
            ) : (
              <View style={{ gap: 10 }}>
                {achievements.map(a => (
                  <Card key={a.id} style={[a.earned ? { borderColor: theme.color.primary + '33', backgroundColor: theme.color.primary + '0D' } : { opacity: 0.6 }]}>
                    <CardContent style={{ padding: 12 }}>
                      <View style={{ flexDirection:'row', alignItems:'center', gap: 10 }}>
                        <Text style={{ fontSize: 20 }}>{a.icon}</Text>
                        <View style={{ flex:1 }}>
                          <View style={{ flexDirection:'row', alignItems:'center', gap: 6 }}>
                            <Text style={{ fontWeight:'600' }}>{a.name}</Text>
                            {a.earned && (
                              <Badge variant="secondary">
                                <Trophy size={12} color={theme.color.text} />
                                <Text style={{ marginLeft: 4, fontSize: 12 }}>달성</Text>
                              </Badge>
                            )}
                          </View>
                          <Text style={{ fontSize: 12, color: theme.color.mutedText }}>{a.description}</Text>
                        </View>
                      </View>
                    </CardContent>
                  </Card>
                ))}
              </View>
            )}
          </View>

          {/* 설정 카드 */}
          <Card style={{ marginTop: 12 }}>
            <CardHeader>
              <CardTitle style={{ fontSize: 16, flexDirection:'row', alignItems:'center' }}>
                <Shield size={18} color={theme.color.text} />
                <Text style={{ marginLeft: 8 }}>설정</Text>
              </CardTitle>
            </CardHeader>
            <CardContent style={{ gap: 8 }}>
              <Button variant="outline" onPress={() => setNotifOpen(true)} style={{ justifyContent:'flex-start' }}>
                <Bell size={16} color={theme.color.text} />
                <Text style={{ marginLeft: 8 }}>알림 설정</Text>
              </Button>
              <Button variant="outline" onPress={() => setPrivacyOpen(true)} style={{ justifyContent:'flex-start' }}>
                <Shield size={16} color={theme.color.text} />
                <Text style={{ marginLeft: 8 }}>개인정보 보호</Text>
              </Button>
              <Button variant="outline" onPress={() => setContactOpen(true)} style={{ justifyContent:'flex-start' }}>
                <MessageCircle size={16} color={theme.color.text} />
                <Text style={{ marginLeft: 8 }}>문의하기</Text>
              </Button>

              <View style={S.separator} />

              <Button variant="destructive" onPress={onLogout} style={{ justifyContent:'flex-start' }}>
                <LogOut size={16} color={theme.color.onDestructive} />
                <Text style={{ marginLeft: 8, color: theme.color.onDestructive }}>로그아웃</Text>
              </Button>
            </CardContent>
          </Card>

          <View style={{ height: 24 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* 알림 설정 모달 */}
      <Modal visible={notifOpen} transparent animationType={Platform.select({ ios: 'slide', android: 'fade' })}>
        <Pressable style={S.backdrop} onPress={() => setNotifOpen(false)}>
          <Pressable style={S.sheet} onPress={() => {}}>
            <Text style={S.sheetTitle}>알림 설정</Text>
            {([
              { key: 'studyReminder', title: '스터디 일정 알림', desc: '스터디 시작 전 알림' },
              { key: 'attendanceAlert', title: '출석 체크 알림', desc: '출석 코드 생성 알림' },
              { key: 'chatMessages', title: '채팅 메시지 알림', desc: '새 메시지 알림' },
              { key: 'weeklyReport', title: '주간 리포트', desc: '주간 활동 요약' },
            ] as const).map(row => (
              <View key={row.key} style={S.rowBetween}>
                <View style={{ flex:1 }}>
                  <Text style={{ fontWeight:'600' }}>{row.title}</Text>
                  <Text style={{ fontSize: 12, color: theme.color.mutedText }}>{row.desc}</Text>
                </View>
                <Pressable
                  onPress={() => handleNotificationToggle(row.key)}
                  style={[
                    S.switchBase,
                    notifications[row.key] ? S.switchOn : S.switchOff,
                  ]}
                >
                  <View style={[S.knob, notifications[row.key] && { left: 20 }]} />
                </Pressable>
              </View>
            ))}
          </Pressable>
        </Pressable>
      </Modal>

      {/* 개인정보 모달 */}
      <Modal visible={privacyOpen} transparent animationType={Platform.select({ ios: 'slide', android: 'fade' })}>
        <Pressable style={S.backdrop} onPress={() => setPrivacyOpen(false)}>
          <Pressable style={[S.sheet, { maxHeight: '85%' }]} onPress={() => {}}>
            <ScrollView>
              <Text style={S.sheetTitle}>개인정보 보호</Text>

              <Text style={S.sectionTitle}>수집하는 정보</Text>
              <Text style={S.sectionText}>닉네임, 이메일, 성별 / 스터디 활동 기록 / 출석 및 진행률 데이터</Text>

              <View style={S.separator} />

              <Text style={S.sectionTitle}>정보 사용 목적</Text>
              <Text style={S.sectionText}>서비스 제공 및 개선 / 스터디 매칭 및 관리 / 통계 및 분석</Text>

              <View style={S.separator} />

              <Text style={S.sectionTitle}>정보 공개</Text>
              <Text style={S.sectionText}>성별 정보는 본인과 관리자만 볼 수 있으며, 다른 사용자에게는 공개되지 않습니다.</Text>

              <View style={S.separator} />

              <Text style={S.sectionTitle}>계정 삭제</Text>
              <Text style={S.sectionText}>계정 삭제를 원하시면 문의하기를 통해 요청해주세요.</Text>

              <Button variant="destructive" style={{ marginTop: 12, alignSelf:'stretch' }}>
                계정 삭제 요청
              </Button>
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      {/* 문의하기 모달 */}
      <Modal visible={contactOpen} transparent animationType={Platform.select({ ios: 'slide', android: 'fade' })}>
        <Pressable style={S.backdrop} onPress={() => setContactOpen(false)}>
          <Pressable style={S.sheet} onPress={() => {}}>
            <Text style={S.sheetTitle}>문의하기</Text>

            {/* 간단 카테고리 피커 (Select 대체) */}
            <Text style={S.label}>문의 유형</Text>
            <View style={S.pillRow}>
              {[
                { value: 'bug', label: '버그 신고' },
                { value: 'feature', label: '기능 제안' },
                { value: 'account', label: '계정 문제' },
                { value: 'other', label: '기타' },
              ].map(opt => (
                <Pressable
                  key={opt.value}
                  onPress={() => setContactCategory(opt.value)}
                  style={[
                    S.pill,
                    contactCategory === opt.value && { backgroundColor: theme.color.primary + '22', borderColor: theme.color.primary },
                  ]}
                >
                  <Text style={{ color: contactCategory === opt.value ? theme.color.primary : theme.color.text }}>{opt.label}</Text>
                </Pressable>
              ))}
            </View>

            <Text style={[S.label, { marginTop: 12 }]}>제목</Text>
            <Input value={contactSubject} onChangeText={setContactSubject} placeholder="제목을 입력하세요" />

            <Text style={[S.label, { marginTop: 12 }]}>내용</Text>
            <View style={S.textareaWrap}>
              <TextInput
                value={contactMessage}
                onChangeText={setContactMessage}
                multiline
                style={S.textarea}
                placeholder="자세한 내용을 입력해주세요"
                placeholderTextColor={theme.color.mutedText}
              />
            </View>

            <Button style={{ marginTop: 12 }} onPress={handleContactSubmit}>제출하기</Button>
          </Pressable>
        </Pressable>
      </Modal>
    </Screen>
  );
}

const S = StyleSheet.create({
  header: {
    flexDirection:'row', alignItems:'center', justifyContent:'space-between',
    borderBottomWidth:1, borderBottomColor: theme.color.border,
    paddingVertical:8, paddingHorizontal:16,
  },
  label: { fontSize: 12, color: theme.color.text, marginBottom: 6 },
  avatar: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: theme.color.secondary, alignItems:'center', justifyContent:'center',
  },
  avatarTxt: { color: theme.color.onSecondary, fontSize: 24, fontWeight:'700' },

  grid2: { flexDirection:'row', flexWrap:'wrap', gap: 12 },
  statBox: { flexBasis: '48%', padding: 12, borderRadius: 12, alignItems:'center' },
  statValue: { fontSize: 20, fontWeight:'700' },
  statLabel: { fontSize: 12, color: theme.color.mutedText, marginTop: 2 },

  separator: { height: 1, backgroundColor: theme.color.border, marginVertical: 12 },

  progressOuter: { width:'100%', height: 8, backgroundColor: theme.color.secondary, borderRadius: 999, overflow:'hidden' },
  progressOuterSm: { width:'100%', height: 6, backgroundColor: theme.color.secondary, borderRadius: 999, overflow:'hidden' },
  progressInner: { height: 8, backgroundColor: theme.color.primary, borderRadius: 999 },

  tabs: {
    flexDirection:'row', borderWidth:1, borderColor: theme.color.border, borderRadius: 8, overflow:'hidden', marginBottom: 12
  },
  tabBtn: { flex:1, alignItems:'center', paddingVertical: 10, backgroundColor:'#fff' },
  tabActive: { backgroundColor: theme.color.secondary },
  tabTxt: { color: theme.color.mutedText, fontSize: 14, fontWeight:'600' },
  tabTxtActive: { color: theme.color.text },

  backdrop: { flex:1, backgroundColor:'rgba(0,0,0,0.25)', justifyContent:'flex-end' },
  sheet: { backgroundColor:'#fff', padding:16, borderTopLeftRadius:16, borderTopRightRadius:16, borderTopWidth:1, borderColor: theme.color.border },
  sheetTitle: { fontSize: 16, fontWeight:'700', marginBottom: 12 },
  sectionTitle: { fontWeight:'600', marginTop: 6, marginBottom: 4 },
  sectionText: { fontSize: 12, color: theme.color.mutedText },

  pillRow: { flexDirection:'row', flexWrap:'wrap', gap: 8 },
  pill: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, borderWidth: 1, borderColor: theme.color.border, backgroundColor:'#fff' },

  rowBetween: { flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingVertical: 8, gap: 12 },
  switchBase: { width: 40, height: 24, borderRadius: 12, borderWidth: 1, borderColor: theme.color.border, backgroundColor:'#f3f4f7', position:'relative' },
  switchOn: { backgroundColor: '#e0ecff', borderColor: theme.color.primary },
  switchOff: { backgroundColor: '#f3f4f7' },
  knob: { position:'absolute', top: 2, left: 2, width: 20, height: 20, borderRadius: 10, backgroundColor:'#fff', elevation: 2 },
});