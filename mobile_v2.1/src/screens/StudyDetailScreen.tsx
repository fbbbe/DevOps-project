import React, { useMemo, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
} from 'react-native';
import Screen from '../components/Screen';
import theme from '../styles/theme';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/Card';
import Button from '../components/Button';
import Badge from '../components/Badge';
import ProgressBar from '../components/ProgressBar';
import {
  ArrowLeft, MapPin, Users, Calendar, Clock, Tag, QrCode,
  BarChart3, Settings, MessageCircle, BookOpen, AlertTriangle, UserX
} from 'lucide-react-native';

// ---- 웹 타입과 맞춘 기본 타입 (필요시 공용 타입으로 분리해도 OK)
export type Study = {
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
export type User = { id: string; nickname: string; role?: 'user' | 'admin' };

type RouteParams = { study: Study; user?: User };
export default function StudyDetailScreen({ route, navigation }: any) {
  const { study, user: userParam } = (route?.params ?? {}) as RouteParams;
  // 임시: 유저가 없을 경우 가짜 유저
  const user: User = userParam ?? { id: 'me', nickname: '나', role: 'user' };

  const [isMember, setIsMember] = useState(Math.random() > 0.5);
  const isOwner = study?.ownerId === user.id;
  const [joinStatus, setJoinStatus] = useState<'none' | 'pending' | 'approved'>('none');
  const [tab, setTab] = useState<'members' | 'sessions'>('members');

  // ---- 웹과 동일한 mock 데이터
  const mockMembers = useMemo(() => ([
    { id: '1', nickname: '영어왕', gender: '여성', role: 'owner', status: 'active', attendanceRate: 95, warnings: 0 },
    { id: '2', nickname: '스터디킹', gender: '남성', role: 'member', status: 'active', attendanceRate: 88, warnings: 0 },
    { id: '3', nickname: '열공맨', gender: '남성', role: 'member', status: 'active', attendanceRate: 76, warnings: 1 },
    { id: '4', nickname: '공부러버', gender: '여성', role: 'member', status: 'warning', attendanceRate: 52, warnings: 3 },
  ]), []);

  const mockSessions = useMemo(() => ([
    { id: '1', date: '2024-01-15', topic: '1주차: 기초 문법', attendance: 4, total: 4, progress: 100 },
    { id: '2', date: '2024-01-22', topic: '2주차: 시제와 동사', attendance: 3, total: 4, progress: 75 },
    { id: '3', date: '2024-01-29', topic: '3주차: 문장 구조', attendance: 4, total: 4, progress: 100 },
    { id: '4', date: '2024-02-05', topic: '4주차: 관계사', attendance: 3, total: 4, progress: 75 },
  ]), []);

  if (!study) {
    return (
      <Screen>
        <View style={{ padding: 16 }}>
          <Text>잘못된 접근입니다. 목록에서 다시 시도해주세요.</Text>
        </View>
      </Screen>
    );
  }

  const getStatusBadge = (status: Study['status']) => {
    switch (status) {
      case 'recruiting': return <Badge variant="default">모집중</Badge>;
      case 'active':     return <Badge variant="secondary">진행중</Badge>;
      case 'completed':  return <Badge variant="outline">완료</Badge>;
      default:           return null;
    }
  };

  const getMemberStatusBadge = (status: string, warnings: number) => {
    if (warnings >= 3) return <Badge variant="destructive">경고 {warnings}회</Badge>;
    if (warnings > 0)  return <Badge variant="outline">주의 {warnings}회</Badge>;
    return <Badge variant="secondary">정상</Badge>;
  };

  const handleJoinRequest = () => {
    setJoinStatus('pending');
    setTimeout(() => {
      setJoinStatus('approved');
      setIsMember(true);
    }, 1200);
  };

  const handleLeaveStudy = () => {
    Alert.alert('스터디 나가기', '정말로 이 스터디를 나가시겠습니까?', [
      { text: '취소', style: 'cancel' },
      { text: '나가기', style: 'destructive', onPress: () => {
          setIsMember(false); setJoinStatus('none');
        }
      }
    ]);
  };

  const kickMember = (nickname: string) => {
    Alert.alert('멤버 퇴출', `${nickname} 님을 스터디에서 퇴출하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`, [
      { text: '취소', style: 'cancel' },
      { text: '퇴출하기', style: 'destructive', onPress: () => {} },
    ]);
  };

  return (
    <Screen withPadding={false}>
      {/* Header */}
      <View style={S.header}>
        <View style={S.headerLeft}>
          <Button variant="ghost" size="sm" onPress={() => navigation?.goBack?.()} style={{ paddingHorizontal: 8 }}>
            <ArrowLeft size={16} color={theme.color.text} />
          </Button>
          <View style={{ flexDirection:'row', alignItems:'center', gap:8 }}>
            <BookOpen size={20} color={theme.color.primary} />
            <Text style={{ fontSize:16, fontWeight:'600', color: theme.color.text }}>스터디 상세</Text>
          </View>
        </View>
        {isOwner && (
          <Button variant="ghost" size="sm">
            <Settings size={16} color={theme.color.text} />
          </Button>
        )}
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>
        {/* Study Info */}
        <Card>
          <CardHeader>
            <View style={{ flexDirection:'row', justifyContent:'space-between' }}>
              <View style={{ flex:1, paddingRight: 12 }}>
                <CardTitle style={{ fontSize: 18, marginBottom: 8 }}>{study.name}</CardTitle>
                <View style={{ flexDirection:'row', alignItems:'center', gap:8, marginBottom: 8 }}>
                  {/* AvatarFallback */}
                  <View style={{ width:24, height:24, borderRadius:12, backgroundColor: theme.color.secondary, alignItems:'center', justifyContent:'center' }}>
                    <Text style={{ fontSize:12, color: theme.color.onSecondary, fontWeight:'600' }}>
                      {study.ownerNickname.charAt(0)}
                    </Text>
                  </View>
                  <Text style={{ fontSize: 12, color: theme.color.mutedText }}>{study.ownerNickname}</Text>
                </View>
              </View>
              {getStatusBadge(study.status)}
            </View>
          </CardHeader>

          <CardContent>
            <Text style={{ color: theme.color.mutedText, marginBottom: 12 }}>{study.description}</Text>

            {/* grid 2 cols */}
            <View style={S.grid2}>
              <View style={S.row}>
                <MapPin size={14} color={theme.color.mutedText} />
                <Text style={S.rowTxt}>{study.region}</Text>
              </View>
              <View style={S.row}>
                <Badge variant={study.type === 'online' ? 'secondary' : 'outline'}> {study.type === 'online' ? '온라인' : '오프라인'} </Badge>
              </View>
              <View style={S.row}>
                <Users size={14} color={theme.color.mutedText} />
                <Text style={S.rowTxt}>{study.currentMembers}/{study.maxMembers}명</Text>
              </View>
              <View style={S.row}>
                <Calendar size={14} color={theme.color.mutedText} />
                <Text style={S.rowTxt}>{study.duration === 'short' ? '단기' : '장기'}</Text>
              </View>
            </View>

            <View style={S.row} >
              <Clock size={14} color={theme.color.mutedText} />
              <Text style={S.rowTxt}>{study.startDate} ~ {study.endDate}</Text>
            </View>

            <View style={{ flexDirection:'row', flexWrap:'wrap', gap:6, marginTop: 8 }}>
              {study.tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  <View style={{ flexDirection:'row', alignItems:'center', gap:4 }}>
                    <Tag size={12} color={theme.color.text} />
                    <Text style={{ fontSize: 12 }}>{tag}</Text>
                  </View>
                </Badge>
              ))}
            </View>

            {typeof study.progress === 'number' && (
              <View style={{ marginTop: 12, padding: 12, backgroundColor: '#f3f4f7', borderRadius: 12 }}>
                <View style={{ flexDirection:'row', justifyContent:'space-between', marginBottom: 6 }}>
                  <Text style={{ fontSize: 12 }}>전체 진행률</Text>
                  <Text style={{ fontSize: 12, fontWeight:'600' }}>{study.progress}%</Text>
                </View>
                <ProgressBar value={study.progress} style={{ marginTop: 8 }} />
              </View>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        {!isMember && !isOwner && (
          <View style={{ marginTop: 12 }}>
            {joinStatus === 'none' && (
              <Button size="lg" onPress={handleJoinRequest} disabled={study.status !== 'recruiting'}>
                {study.status === 'recruiting' ? '참여 신청하기' : '모집 완료'}
              </Button>
            )}
            {joinStatus === 'pending' && (
              <Button size="lg" variant="outline" disabled style={{ marginTop: 8 }}>
                승인 대기중...
              </Button>
            )}
            {joinStatus === 'approved' && (
              <Button size="lg" variant="secondary" disabled style={{ marginTop: 8 }}>
                참여 승인됨
              </Button>
            )}
          </View>
        )}

        {(isMember || isOwner) && (
          <View style={{ marginTop: 12, gap: 12 }}>
            <View style={{ flexDirection:'row', gap: 12 }}>
              <Button
              variant="outline"
                onPress={() =>
                  navigation?.navigate?.('출석', {
                    study,
                    user: { id: 'me', nickname: '나', gender: '남성', role: 'user' },
                  })
                }
                style={{ flex: 1, flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center' }}
              >
                <QrCode size={16} color={theme.color.text} />
                출석 관리
              </Button>

              {study.duration === 'short' ? (
                <Button
                  variant="outline"
                  onPress={() => navigation?.navigate?.('진행률', { study, user })}
                  style={{ flex:1, flexDirection:'row', gap:8, alignItems:'center', justifyContent:'center' }}
                >
                  <BarChart3 size={16} color={theme.color.text} />
                  진행률 관리
                </Button>
              ) : (
                <Button variant="outline" disabled style={{ flex:1 }}>장기 스터디</Button>
              )}
            </View>

            <Button
              variant="default"
              onPress={() => navigation?.navigate?.('채팅', { study, user })}
              style={{ flexDirection:'row', gap:8, alignItems:'center', justifyContent:'center' }}
            >
              <MessageCircle size={16} color={theme.color.onPrimary} />
              채팅
            </Button>
          </View>
        )}

        {/* Tabs */}
        <View style={S.tabsWrap}>
          <View style={S.tabs}>
            <Pressable onPress={()=>setTab('members')} style={[S.tabBtn, tab==='members' && S.tabActive]}>
              <Text style={[S.tabTxt, tab==='members' && S.tabTxtActive]}>멤버 ({mockMembers.length})</Text>
            </Pressable>
            <Pressable onPress={()=>setTab('sessions')} style={[S.tabBtn, tab==='sessions' && S.tabActive]}>
              <Text style={[S.tabTxt, tab==='sessions' && S.tabTxtActive]}>회차 ({mockSessions.length})</Text>
            </Pressable>
          </View>

          {tab==='members' && (
            <View style={{ gap: 12, marginTop: 12 }}>
              {mockMembers.map(member => (
                <Card key={member.id}>
                  <CardContent style={{ padding: 12 }}>
                    <View style={{ flexDirection:'row', justifyContent:'space-between', alignItems:'center' }}>
                      <View style={{ flexDirection:'row', alignItems:'center', gap:12 }}>
                        <View style={{ width:32, height:32, borderRadius:16, backgroundColor: theme.color.secondary, alignItems:'center', justifyContent:'center' }}>
                          <Text style={{ fontWeight:'700', color: theme.color.onSecondary }}>
                            {member.nickname.charAt(0)}
                          </Text>
                        </View>
                        <View>
                          <View style={{ flexDirection:'row', alignItems:'center', gap:8 }}>
                            <Text style={{ fontWeight:'600' }}>{member.nickname}</Text>
                            {(member.id === user.id || user.role === 'admin') && (
                              <Text style={{ fontSize:12, color: theme.color.mutedText }}>({member.gender})</Text>
                            )}
                            {member.role === 'owner' && (
                              <Badge variant="secondary">방장</Badge>
                            )}
                          </View>
                          <View style={{ flexDirection:'row', alignItems:'center', gap:8, marginTop: 4 }}>
                            <Text style={{ fontSize:12, color: theme.color.mutedText }}>출석률 {member.attendanceRate}%</Text>
                            {getMemberStatusBadge(member.status, member.warnings)}
                          </View>
                        </View>
                      </View>

                      {(isOwner && member.id !== user.id) && (
                        <View style={{ flexDirection:'row', gap:6 }}>
                          {member.warnings >= 3 && (
                            <Button variant="destructive" size="sm" onPress={() => kickMember(member.nickname)}>
                              <UserX size={14} color={theme.color.onDestructive} />
                            </Button>
                          )}
                          {(member.warnings > 0 && member.warnings < 3) && (
                            <Button variant="outline" size="sm" onPress={() => Alert.alert('주의', '주의 조치')}>
                              <AlertTriangle size={14} color={theme.color.text} />
                            </Button>
                          )}
                        </View>
                      )}
                    </View>
                  </CardContent>
                </Card>
              ))}
            </View>
          )}

          {tab==='sessions' && (
            <View style={{ gap: 12, marginTop: 12 }}>
              {mockSessions.map((s) => {
                const attendanceRate = Math.round((s.attendance / s.total) * 100);
                return (
                  <Card key={s.id}>
                    <CardContent style={{ padding: 12 }}>
                      <View style={{ flexDirection:'row', justifyContent:'space-between', marginBottom: 6 }}>
                        <Text style={{ fontWeight:'600' }}>{s.topic}</Text>
                        <Badge variant="outline">{s.date}</Badge>
                      </View>
                      <View style={{ flexDirection:'row', justifyContent:'space-between' }}>
                        <Text style={{ fontSize:12, color: theme.color.mutedText }}>
                          출석: {s.attendance}/{s.total}명 · 참석률: {attendanceRate}%
                        </Text>
                        {study.duration === 'short' && (
                          <Text style={{ fontSize:12, color: theme.color.mutedText }}>진행률: {s.progress}%</Text>
                        )}
                      </View>
                    </CardContent>
                  </Card>
                );
              })}
            </View>
          )}
        </View>

        {/* Leave button for members */}
        {(isMember && !isOwner) && (
          <View style={{ marginTop: 16, paddingTop: 12, borderTopWidth:1, borderTopColor: theme.color.border }}>
            <Button variant="destructive" onPress={handleLeaveStudy}>스터디 나가기</Button>
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

const S = StyleSheet.create({
  header: {
    flexDirection:'row', alignItems:'center', justifyContent:'space-between',
    borderBottomWidth:1, borderBottomColor: theme.color.border, paddingVertical: 8, paddingHorizontal: 16,
  },
  headerLeft: { flexDirection:'row', alignItems:'center', gap:8 },
  grid2: {
    flexDirection:'row', flexWrap:'wrap', columnGap: 16, rowGap: 8, marginBottom: 8,
  },
  row: { flexDirection:'row', alignItems:'center', gap:6, marginBottom: 6 },
  rowTxt: { fontSize: 12, color: theme.color.text },
  tabsWrap: { marginTop: 16 },
  tabs: {
    flexDirection:'row', borderWidth:1, borderColor: theme.color.border, borderRadius: 8, overflow:'hidden',
  },
  tabBtn: { flex:1, alignItems:'center', paddingVertical: 10, backgroundColor:'#fff' },
  tabActive: { backgroundColor: theme.color.secondary },
  tabTxt: { color: theme.color.mutedText, fontSize: 14, fontWeight:'600' },
  tabTxtActive: { color: theme.color.text },
});
