import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import Screen from '../components/Screen';
import theme from '../styles/theme';
import { Card, CardContent, CardHeader, CardTitle } from '../components/Card';
import Button from '../components/Button';
import Badge from '../components/Badge';
import ProgressBar from '../components/ProgressBar';
import {
  ArrowLeft, MapPin, Users, Calendar, Clock, Tag, QrCode,
  BarChart3, Settings, MessageCircle, BookOpen, AlertTriangle, UserX, Check, X
} from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  fetchStudyMembers,
  fetchJoinRequests,
  requestStudyJoin,
  cancelStudyJoinRequest,
  decideJoinRequest,
  fetchMembershipStatus,
  type Study as ApiStudy,
  type StudyMember as ApiStudyMember,
  type StudyJoinRequest as ApiStudyJoinRequest,
} from '../services/studyServices';

// ---- 웹 타입과 맞춘 기본 타입 (필요시 공용 타입으로 분리해도 OK)
export type Study = ApiStudy;
export type User = { id: string; nickname: string; role?: 'user' | 'admin' };

type StudyMember = ApiStudyMember;
type StudyJoinRequest = ApiStudyJoinRequest;

type RouteParams = { study: Study; user?: User };
export default function StudyDetailScreen({ route, navigation }: any) {
  const { study, user: userParam } = (route?.params ?? {}) as RouteParams;
  // 임시: 유저가 없을 경우 가짜 유저
  const user: User = userParam ?? { id: 'me', nickname: '나', role: 'user' };
  const { user: authUser } = useAuth();
  const authToken = authUser?.token;
  const authUserId = authUser?.user_id ?? (authUser as any)?.id ?? null;
  const [resolvedToken, setResolvedToken] = useState<string | null>(authToken ?? null);
  const [tokenReady, setTokenReady] = useState<boolean>(Boolean(authToken));
  useEffect(() => {
    if (__DEV__) {
      console.log(
        "[StudyDetail] auth state",
        authUserId,
        authToken ? authToken.slice(0, 12) + "..." : "(no token)"
      );
    }
  }, [authUserId, authToken]);

  const routeIsOwner = route?.params?.isOwner as boolean | undefined;
  const inferredIsOwner = (() => {
    const ownerValue = String(study?.ownerId ?? '');
    const authValue = authUserId != null ? String(authUserId) : null;
    const routeValue = String(user.id ?? '');
    return ownerValue === (authValue ?? routeValue);
  })();
  const isOwner = routeIsOwner ?? inferredIsOwner;

  const routeIsMember = route?.params?.isMember as boolean | undefined;
  const initialIsMember = isOwner || Boolean(routeIsMember);
  const selfUserId = authUserId != null ? String(authUserId) : String(user.id ?? '');

  const [isMember, setIsMember] = useState<boolean>(initialIsMember);
  const [joinStatus, setJoinStatus] = useState<'none' | 'pending' | 'approved'>(
    initialIsMember ? 'approved' : 'none'
  );
  const [joinRequestId, setJoinRequestId] = useState<string | null>(null);
  const [joinRequestLoading, setJoinRequestLoading] = useState<boolean>(false);
  const [tab, setTab] = useState<'members' | 'sessions' | 'requests'>('members');
  const [rawMembers, setRawMembers] = useState<StudyMember[]>([]);
  const [membersLoading, setMembersLoading] = useState<boolean>(true);
  const [membersError, setMembersError] = useState<string | null>(null);
  const [joinRequests, setJoinRequests] = useState<StudyJoinRequest[]>([]);
  const [requestsLoading, setRequestsLoading] = useState<boolean>(false);
  const [requestsError, setRequestsError] = useState<string | null>(null);
  const [processingRequestId, setProcessingRequestId] = useState<string | null>(null);

  const buildMembersList = useCallback(
    (base: StudyMember[], includeSelfOverride?: boolean): StudyMember[] => {
      const includeSelf = includeSelfOverride ?? (isOwner || isMember);
      const map = new Map<string, StudyMember>();

      base.forEach((member) => {
        if (!member) return;
        const key = String(member.userId ?? '');
        if (!key) return;
        map.set(key, {
          userId: key,
          nickname: member.nickname || '멤버',
          role: member.role || 'member',
          gender: member.gender,
          attendanceRate: member.attendanceRate,
          warnings: member.warnings,
          userStatus: member.userStatus,
          email: member.email,
          joinedAt: member.joinedAt,
          memberId: member.memberId,
        });
      });

      const ownerIdStr = String(study.ownerId ?? '');
      if (ownerIdStr) {
        const existing = map.get(ownerIdStr);
        map.set(ownerIdStr, {
          userId: ownerIdStr,
          nickname: study.ownerNickname || existing?.nickname || '방장',
          role: 'owner',
          gender: existing?.gender,
          attendanceRate: existing?.attendanceRate,
          warnings: existing?.warnings,
          userStatus: existing?.userStatus ?? 'owner',
          email: existing?.email,
          joinedAt: existing?.joinedAt,
          memberId: existing?.memberId,
        });
      }

      if (includeSelf && selfUserId) {
        const existing = map.get(selfUserId);
        map.set(selfUserId, {
          userId: selfUserId,
          nickname: user.nickname || existing?.nickname || '나',
          role: isOwner ? 'owner' : existing?.role ?? 'member',
          gender: existing?.gender,
          attendanceRate: existing?.attendanceRate,
          warnings: existing?.warnings,
          userStatus: existing?.userStatus ?? (isOwner ? 'owner' : existing?.userStatus),
          email: existing?.email,
          joinedAt: existing?.joinedAt,
          memberId: existing?.memberId,
        });
      }

      return Array.from(map.values()).sort((a, b) => {
        if (a.role === 'owner' && b.role !== 'owner') return -1;
        if (a.role !== 'owner' && b.role === 'owner') return 1;
        return a.nickname.localeCompare(b.nickname);
      });
    },
    [selfUserId, isOwner, isMember, study.ownerId, study.ownerNickname, user.nickname]
  );
  const members = useMemo(() => buildMembersList(rawMembers), [rawMembers, buildMembersList]);

  useEffect(() => {
    let active = true;
    const hydrateToken = async () => {
      try {
        if (authToken) {
          if (active) {
            setResolvedToken(String(authToken));
            setTokenReady(true);
          }
          return;
        }
        if (active) {
          setTokenReady(false);
          setResolvedToken(null);
        }
        const stored = await AsyncStorage.getItem('userToken');
        if (active) {
          if (stored) {
            setResolvedToken(stored);
            setTokenReady(true);
          } else {
            setResolvedToken(null);
            setTokenReady(true);
          }
        }
      } catch (err) {
        console.warn('[StudyDetail] failed to resolve auth token', err);
        if (active) {
          setResolvedToken(null);
          setTokenReady(true);
        }
      }
    };
    hydrateToken();
    return () => {
      active = false;
    };
  }, [authToken]);

  const mockSessions = useMemo(() => ([/** 
    { id: '1', date: '2024-01-15', topic: '1주차: 기초 문법', attendance: 4, total: 4, progress: 100 },
    { id: '2', date: '2024-01-22', topic: '2주차: 시제와 동사', attendance: 3, total: 4, progress: 75 },
    { id: '3', date: '2024-01-29', topic: '3주차: 문장 구조', attendance: 4, total: 4, progress: 100 },
    { id: '4', date: '2024-02-05', topic: '4주차: 관계사', attendance: 3, total: 4, progress: 75 },
    */
  ]), []);
  const pendingRequestsCount = useMemo(
    () => joinRequests.filter((req) => req.status === 'pending').length,
    [joinRequests]
  );

  const loadMembers = useCallback(async () => {
    setMembersLoading(true);
    setMembersError(null);
    try {
      const list = await fetchStudyMembers(String(study.id), resolvedToken ?? undefined);
      setRawMembers(list);
    } catch (err) {
      console.warn('[StudyDetail] fetchStudyMembers failed', err);
      setRawMembers([]);
      const message =
        err instanceof Error && err.message
          ? err.message
          : '멤버 정보를 불러오지 못했습니다.';
      setMembersError(message);
    } finally {
      setMembersLoading(false);
    }
  }, [study.id, resolvedToken]);

  const loadJoinRequests = useCallback(async () => {
    if (!isOwner) return;
    if (!tokenReady) return;
    if (!resolvedToken) {
      setRequestsError('인증 토큰을 확인할 수 없어 참여 요청을 가져오지 못했습니다. 다시 로그인해 주세요.');
      setRequestsLoading(false);
      return;
    }
    setRequestsLoading(true);
    setRequestsError(null);
    try {
      const list = await fetchJoinRequests(String(study.id), resolvedToken);
      setJoinRequests(list);
    } catch (err) {
      console.warn('[StudyDetail] loadJoinRequests failed', err);
      const message =
        err instanceof Error && err.message
          ? err.message
          : '참여 요청을 불러오지 못했습니다.';
      setRequestsError(message);
    } finally {
      setRequestsLoading(false);
    }
  }, [isOwner, study.id, resolvedToken, tokenReady]);

  const refreshJoinRequests = useCallback(() => {
    if (!isOwner) return;
    loadJoinRequests();
  }, [isOwner, loadJoinRequests]);

  const syncMembershipStatus = useCallback(async () => {
    if (isOwner) {
      setIsMember(true);
      setJoinStatus('approved');
      setJoinRequestId(null);
      return;
    }
    if (!selfUserId) {
      setIsMember(false);
      setJoinStatus('none');
      setJoinRequestId(null);
      return;
    }
    if (!tokenReady) return;
    if (!resolvedToken) {
      if (initialIsMember) {
        setIsMember(true);
        setJoinStatus('approved');
      } else {
        setIsMember(false);
        setJoinStatus('none');
      }
      setJoinRequestId(null);
      return;
    }
    try {
      const res = await fetchMembershipStatus(String(study.id), resolvedToken);
      const status = res.status;
      setJoinRequestId(res.requestId ?? null);
      if (status === 'owner' || status === 'member' || status === 'approved') {
        setIsMember(true);
        setJoinStatus('approved');
      } else if (status === 'pending') {
        setIsMember(false);
        setJoinStatus('pending');
      } else {
        setIsMember(false);
        setJoinStatus('none');
      }
    } catch (err) {
      console.warn('[StudyDetail] fetchMembershipStatus failed', err);
      if (initialIsMember) {
        setIsMember(true);
        setJoinStatus('approved');
      } else {
        setIsMember(false);
        setJoinStatus('none');
      }
    }
  }, [isOwner, selfUserId, study.id, resolvedToken, initialIsMember, tokenReady]);

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  useEffect(() => {
    syncMembershipStatus();
  }, [syncMembershipStatus]);

  useEffect(() => {
    if (isOwner) {
      loadJoinRequests();
    } else {
      setJoinRequests([]);
      setRequestsError(null);
      setRequestsLoading(false);
    }
  }, [isOwner, loadJoinRequests]);

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

  const getMemberStatusBadge = (status: string | undefined, warnings: number) => {
    if (warnings >= 3) return <Badge variant="destructive">경고 {warnings}회</Badge>;
    if (warnings > 0)  return <Badge variant="outline">주의 {warnings}회</Badge>;
    if (status) {
      const lowered = status.toLowerCase();
      if (!['active', 'approved', 'member', 'owner'].includes(lowered)) {
        return <Badge variant="outline">{status}</Badge>;
      }
    }
    return <Badge variant="secondary">정상</Badge>;
  };

  const getRequestStatusBadge = (status: StudyJoinRequest['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline">승인 대기</Badge>;
      case 'approved':
        return <Badge variant="secondary">승인됨</Badge>;
      case 'rejected':
        return <Badge variant="destructive">거절됨</Badge>;
      case 'cancelled':
        return <Badge variant="outline">취소됨</Badge>;
      default:
        return null;
    }
  };

  const handleJoinRequest = async () => {
    if (joinRequestLoading) return;
    if (!selfUserId) {
      Alert.alert('안내', '로그인 후 참여 신청을 할 수 있습니다.');
      return;
    }
    if (tokenReady && !resolvedToken) {
      Alert.alert('안내', '로그인 정보를 찾을 수 없습니다. 다시 로그인해 주세요.');
      return;
    }

    setJoinRequestLoading(true);
    try {
      const result = await requestStudyJoin(String(study.id), {
        token: resolvedToken ?? undefined,
      });
      const nextStatus = result.status;
      setJoinRequestId(result.requestId ?? null);

      if (nextStatus === 'approved' || nextStatus === 'already_member') {
        setIsMember(true);
        setJoinStatus('approved');
        await loadMembers();
      } else if (nextStatus === 'pending') {
        setIsMember(false);
        setJoinStatus('pending');
      } else {
        setIsMember(false);
        setJoinStatus('none');
      }
      await syncMembershipStatus();
    } catch (err) {
      const message = err instanceof Error ? err.message : '참여 신청 처리 중 오류가 발생했습니다.';
      Alert.alert('참여 신청 실패', message);
    } finally {
      setJoinRequestLoading(false);
    }
  };

  const handleCancelJoinRequest = () => {
    if (joinRequestLoading) return;
    if (!joinRequestId || !selfUserId) {
      Alert.alert('취소할 요청을 찾을 수 없습니다.');
      return;
    }

    Alert.alert('참여 요청 취소', '참여 요청을 취소하시겠습니까?', [
      { text: '아니오', style: 'cancel' },
      {
        text: '예',
        style: 'destructive',
        onPress: async () => {
          setJoinRequestLoading(true);
          try {
            await cancelStudyJoinRequest(String(study.id), resolvedToken ?? undefined);
            setJoinStatus('none');
            setJoinRequestId(null);
            setIsMember(isOwner);
            await syncMembershipStatus();
          } catch (err) {
            const message =
              err instanceof Error ? err.message : '참여 요청 취소 중 오류가 발생했습니다.';
            Alert.alert('취소 실패', message);
          } finally {
            setJoinRequestLoading(false);
          }
        },
      },
    ]);
  };

  const handleDecideRequest = async (request: StudyJoinRequest, decision: 'approve' | 'reject') => {
    if (processingRequestId) return;
    setProcessingRequestId(request.requestId);
    try {
      const updated = await decideJoinRequest(
        request.requestId,
        decision,
        resolvedToken ?? undefined
      );
      setJoinRequests((prev) =>
        prev.map((item) =>
          item.requestId === request.requestId ? { ...item, status: updated.status } : item
        )
      );
      await loadMembers();
      await loadJoinRequests();
    } catch (err) {
      const message = err instanceof Error ? err.message : '요청 처리 중 오류가 발생했습니다.';
      Alert.alert('처리 실패', message);
    } finally {
      setProcessingRequestId(null);
    }
  };

  const handleLeaveStudy = () => {
    Alert.alert('스터디 나가기', '정말로 이 스터디를 나가시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '나가기',
        style: 'destructive',
        onPress: async () => {
          try {
            await cancelStudyJoinRequest(String(study.id), resolvedToken ?? undefined);
          } catch (err) {
            console.warn('[StudyDetail] leaveStudy cancel request failed', err);
          }
          setIsMember(false);
          setJoinStatus('none');
          setJoinRequestId(null);
          await loadMembers();
          await syncMembershipStatus();
        },
      },
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
                <View style={{ marginBottom: 8 }} />
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

            <View style={{ flexDirection:'row', flexWrap:'wrap', gap:4, marginTop: 8 }}>
                {(study.tags ?? [])
                    .filter(t => typeof t === 'string' && t.trim().length > 0)  // ✅ 빈 값 제거
                     .map((tag, i) => (
                       <Badge
                          key={`${tag}-${i}`}
                              variant="outline"
                                 style={{
                                  alignSelf: 'flex-start',   // ✅ flex로 늘어나지 않고 컨텐트만큼
                                paddingVertical: 4,        // ✅ 세로 여백 축소
                               paddingHorizontal: 8,      // ✅ 가로 여백 축소
                               borderRadius: 12           // (선택) 더 타이트한 모서리
                                }}
                 >             {/* ✅ key 충돌 방지 */}
                        <View style={{ flexDirection:'row', alignItems:'center', gap:2 }}>
                           <Tag size={10} color={theme.color.text} />
                           <Text style={{ fontSize: 12, lineHeight: 14, includeFontPadding: false }}>{tag}</Text>
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
              <Button
                size="lg"
                onPress={handleJoinRequest}
                disabled={study.status !== 'recruiting' || joinRequestLoading}
              >
                {joinRequestLoading
                  ? '신청 중...'
                  : study.status === 'recruiting'
                    ? '참여 신청하기'
                    : '모집 완료'}
              </Button>
            )}
            {joinStatus === 'pending' && (
              <Button
                size="lg"
                variant="outline"
                onPress={handleCancelJoinRequest}
                disabled={joinRequestLoading}
                style={{ marginTop: 8 }}
              >
                {joinRequestLoading ? '취소 중...' : '승인 대기중... (탭하여 취소)'}
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
                  navigation?.navigate?.('Attendance', {
                    study,
                    user,
                    isOwner,
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
              <Text style={[S.tabTxt, tab==='members' && S.tabTxtActive]}>
                멤버 ({membersLoading ? '...' : members.length})
              </Text>
            </Pressable>
           
            {isOwner && (
              <Pressable onPress={()=>{ setTab('requests'); if (!requestsLoading) refreshJoinRequests(); }} style={[S.tabBtn, tab==='requests' && S.tabActive]}>
                <Text style={[S.tabTxt, tab==='requests' && S.tabTxtActive]}>
                  참여 요청 ({requestsLoading ? '...' : pendingRequestsCount})
                </Text>
              </Pressable>
            )}
          </View>

          {tab==='members' && (
            <View style={{ gap: 12, marginTop: 12 }}>
              {membersLoading && (
                <View style={{ paddingVertical: 32, alignItems: 'center', justifyContent: 'center' }}>
                  <ActivityIndicator size="small" color={theme.color.primary} />
                  <Text style={{ marginTop: 8, color: theme.color.mutedText }}>멤버 정보를 불러오는 중...</Text>
                </View>
              )}

              {!membersLoading && membersError && (
                <Card>
                  <CardContent style={{ padding: 16 }}>
                    <Text style={{ color: theme.color.destructive }}>{membersError}</Text>
                  </CardContent>
                </Card>
              )}

              {!membersLoading && !membersError && members.length === 0 && (
                <Card>
                  <CardContent style={{ padding: 16 }}>
                    <Text style={{ color: theme.color.mutedText }}>
                      아직 등록된 멤버가 없습니다. 첫 번째 멤버가 되어보세요!
                    </Text>
                  </CardContent>
                </Card>
              )}

              {!membersLoading && !membersError && members.map(member => (
                <Card key={member.userId}>
                  <CardContent style={{ padding: 12 }}>
                    <View style={{ flexDirection:'row', justifyContent:'space-between', alignItems:'center' }}>
                      <View style={{ flexDirection:'row', alignItems:'center', gap:12 }}>
                        <View style={{ width:32, height:32, borderRadius:16, backgroundColor: theme.color.secondary, alignItems:'center', justifyContent:'center' }}>
                          <Text style={{ fontWeight:'700', color: theme.color.onSecondary }}>
                            {member.nickname?.charAt(0) ?? '멤'}
                          </Text>
                        </View>
                        <View>
                          <View style={{ flexDirection:'row', alignItems:'center', gap:8 }}>
                            <Text style={{ fontWeight:'600' }}>{member.nickname}</Text>
                            {member.role === 'owner' && (
                              <Badge variant="secondary">방장</Badge>
                            )}
                          </View>
                          <View style={{ flexDirection:'row', alignItems:'center', gap:8, marginTop: 4 }}>
                            <Text style={{ fontSize:12, color: theme.color.mutedText }}>
                              출석률 {member.attendanceRate != null ? `${member.attendanceRate}%` : '-'}
                            </Text>
                            {getMemberStatusBadge(member.userStatus, member.warnings)}
                          </View>
                        </View>
                      </View>

                      {(isOwner && member.userId !== selfUserId) && (
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

          {tab==='requests' && isOwner && (
            <View style={{ gap: 12, marginTop: 12 }}>
              {requestsLoading && (
                <View style={{ paddingVertical: 32, alignItems: 'center', justifyContent: 'center' }}>
                  <ActivityIndicator size="small" color={theme.color.primary} />
                  <Text style={{ marginTop: 8, color: theme.color.mutedText }}>참여 요청을 불러오는 중...</Text>
                </View>
              )}

              {!requestsLoading && requestsError && (
                <Card>
                  <CardContent style={{ padding: 16 }}>
                    <Text style={{ color: theme.color.destructive }}>{requestsError}</Text>
                    <Button
                      size="sm"
                      variant="outline"
                      style={{ marginTop: 12 }}
                      onPress={refreshJoinRequests}
                    >
                      다시 시도
                    </Button>
                  </CardContent>
                </Card>
              )}

              {!requestsLoading && !requestsError && joinRequests.length === 0 && (
                <Card>
                  <CardContent style={{ padding: 16 }}>
                    <Text style={{ color: theme.color.mutedText }}>새로운 참여 요청이 없습니다.</Text>
                  </CardContent>
                </Card>
              )}

              {!requestsLoading && !requestsError && joinRequests.map((request) => {
                const isProcessing = processingRequestId === request.requestId;
                const requestedAtText = (() => {
                  if (!request.requestedAt) return null;
                  const parsed = new Date(request.requestedAt);
                  return Number.isNaN(parsed.getTime()) ? request.requestedAt : parsed.toLocaleString();
                })();

                return (
                  <Card key={request.requestId}>
                    <CardContent style={{ padding: 14 }}>
                      <View style={{ flexDirection:'row', justifyContent:'space-between', alignItems:'center' }}>
                        <View style={{ flex:1, paddingRight: 12 }}>
                          <View style={{ flexDirection:'row', alignItems:'center', gap:8 }}>
                            <Text style={{ fontWeight:'600', fontSize:15 }}>{request.nickname}</Text>
                            {getRequestStatusBadge(request.status)}
                          </View>
                          {request.message && (
                            <Text style={{ marginTop: 6, fontSize: 13, color: theme.color.mutedText }}>
                              {request.message}
                            </Text>
                          )}
                          {requestedAtText && (
                            <Text style={{ marginTop: 6, fontSize: 12, color: theme.color.mutedText }}>
                              신청일: {requestedAtText}
                            </Text>
                          )}
                        </View>

                        <View style={{ flexDirection:'row', gap:8 }}>
                          {request.status === 'pending' ? (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onPress={() => handleDecideRequest(request, 'reject')}
                                disabled={isProcessing}
                                style={{ flexDirection:'row', alignItems:'center', gap:4 }}
                              >
                                <X size={14} color={theme.color.text} />
                                {isProcessing ? '처리중...' : '거절'}
                              </Button>
                              <Button
                                variant="default"
                                size="sm"
                                onPress={() => handleDecideRequest(request, 'approve')}
                                disabled={isProcessing}
                                style={{ flexDirection:'row', alignItems:'center', gap:4 }}
                              >
                                <Check size={14} color={theme.color.onPrimary} />
                                {isProcessing ? '처리중...' : '승인'}
                              </Button>
                            </>
                          ) : (
                            <Button variant="outline" size="sm" disabled>
                              처리 완료
                            </Button>
                          )}
                        </View>
                      </View>
                    </CardContent>
                  </Card>
                );
              })}
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
