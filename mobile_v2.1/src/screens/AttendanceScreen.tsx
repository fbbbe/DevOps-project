import React, { useEffect, useMemo, useState } from 'react';
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
import Input from '../components/Input';
import Button from '../components/Button';
import Badge from '../components/Badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/Card';
import {
  ArrowLeft, RefreshCw, Check, QrCode, Clock, Users, AlertCircle, BookOpen,
} from 'lucide-react-native';

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
type User = { id: string; nickname: string; gender?: string; role?: 'user' | 'admin' };

export default function AttendanceScreen({ route, navigation }: any) {
  // route로 넘어온 study/user가 있으면 사용, 없으면 임시값
  const study: Study = route?.params?.study ?? {
    id: 'stub',
    name: '출석 테스트 스터디',
    subject: '어학',
    description: '모바일 출석 화면 검증용 임시 스터디',
    tags: ['테스트'],
    region: '온라인',
    type: 'online',
    duration: 'short',
    startDate: '2024-01-01',
    endDate: '2024-03-31',
    maxMembers: 8,
    currentMembers: 6,
    ownerId: 'owner-1',
    ownerNickname: '영어왕',
    status: 'active',
    progress: 50,
  };
  const user: User = route?.params?.user ?? { id: 'me', nickname: '나', gender: '남성', role: 'user' };

  const isOwnerParam = route?.params?.isOwner as boolean | undefined;
  const [isOwner] = useState(
    typeof isOwnerParam === 'boolean' ? isOwnerParam : study.ownerId === user.id
  );
  const [currentCode, setCurrentCode] = useState('');
  const [isCodeActive, setIsCodeActive] = useState(false);
  const [inputCode, setInputCode] = useState('');
  const [attendanceStatus, setAttendanceStatus] =
    useState<'none' | 'success' | 'error'>('none');
  const [timeLeft, setTimeLeft] = useState(0);

  // 오늘의 출석 목록 (mock)
  const [todayAttendance, setTodayAttendance] = useState<
    { id: string; nickname: string; gender?: string; time: string; status: 'present' }[]
  >([
    { id: '1', nickname: '영어왕', gender: '여성', time: '14:30:15', status: 'present' },
    { id: '2', nickname: '스터디킹', gender: '남성', time: '14:32:42', status: 'present' },
  ]);

  // 코드 생성 (대문자 6자리)
  const generateCode = () => {
    const code = Math.random().toString(36).slice(2, 8).toUpperCase();
    setCurrentCode(code);
    setIsCodeActive(true);
    setTimeLeft(300); // 5분
  };

  const deactivateCode = () => {
    setIsCodeActive(false);
    setCurrentCode('');
    setTimeLeft(0);
  };

  const handleSubmit = () => {
    const sanitized = inputCode.trim().toUpperCase();
    if (!sanitized || sanitized.length !== 6 || !/^[A-Z0-9]{6}$/.test(sanitized)) {
      setAttendanceStatus('error');
      resetToastLater();
      return;
    }
    if (sanitized === currentCode && isCodeActive) {
      setAttendanceStatus('success');
      setTodayAttendance((prev) => [
        ...prev,
        { id: user.id, nickname: user.nickname, gender: user.gender, time: new Date().toLocaleTimeString(), status: 'present' },
      ]);
      setInputCode('');
    } else {
      setAttendanceStatus('error');
    }
    resetToastLater();
  };

  const resetToastLater = () => {
    setTimeout(() => setAttendanceStatus('none'), 2500);
  };

  // 타이머
  useEffect(() => {
    let t: any;
    if (isCodeActive && timeLeft > 0) {
      t = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsCodeActive(false);
            setCurrentCode('');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => t && clearInterval(t);
  }, [isCodeActive, timeLeft]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  const todayKST = useMemo(
    () =>
      new Date().toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long',
      }),
    []
  );

  return (
    <Screen withPadding={false}>
      {/* Header */}
      <View style={S.header}>
        <Button
          variant="ghost"
          size="sm"
          onPress={() => {
            if (navigation?.canGoBack?.()) navigation.goBack();
          }}
          style={{ paddingHorizontal: 8 }}
        >
          <ArrowLeft size={16} color={theme.color.text} />
        </Button>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <BookOpen size={20} color={theme.color.primary} />
          <Text style={{ fontSize: 16, fontWeight: '600', color: theme.color.text }}>
            출석 관리
          </Text>
        </View>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 96 }}>
        {/* Study info */}
        <Card>
          <CardHeader style={{ paddingBottom: 12 }}>
            <CardTitle style={{ fontSize: 16 }}>{study.name}</CardTitle>
            <CardDescription>{todayKST}</CardDescription>
          </CardHeader>
        </Card>

        {/* Owner: code generation */}
        {isOwner && (
          <Card style={{ marginTop: 12 }}>
            <CardHeader>
              <CardTitle style={{ fontSize: 16, flexDirection: 'row', alignItems: 'center' }}>
                <QrCode size={18} color={theme.color.text} />
                <Text style={{ marginLeft: 8 }}>출석 코드 생성</Text>
              </CardTitle>
              <CardDescription>멤버들이 입력할 출석 코드를 생성하세요</CardDescription>
            </CardHeader>
            <CardContent style={{ gap: 12 }}>
              {!isCodeActive ? (
                <Button onPress={generateCode} size="lg">
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <RefreshCw size={16} color={theme.color.onPrimary} />
                    <Text style={{ color: theme.color.onPrimary, fontWeight: '600' }}>출석 코드 생성</Text>
                  </View>
                </Button>
              ) : (
                <View style={{ gap: 12 }}>
                  <View
                    style={{
                      alignItems: 'center',
                      padding: 16,
                      backgroundColor: 'rgba(45,108,223,0.08)',
                      borderRadius: 12,
                      borderWidth: 2,
                      borderStyle: 'dashed',
                      borderColor: 'rgba(45,108,223,0.2)',
                    }}
                  >
                    <Text style={{ fontSize: 28, fontWeight: '700', color: theme.color.primary, fontFamily: 'System' }}>
                      {currentCode}
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
                      <Clock size={14} color={theme.color.mutedText} />
                      <Text style={{ color: theme.color.mutedText, marginLeft: 4 }}>
                        남은 시간: {formatTime(timeLeft)}
                      </Text>
                    </View>
                  </View>

                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <Button variant="outline" style={{ flex: 1 }} onPress={generateCode}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <RefreshCw size={16} color={theme.color.text} />
                        <Text style={{ fontWeight: '600', color: theme.color.text }}>새로 생성</Text>
                      </View>
                    </Button>
                    <Button variant="destructive" style={{ flex: 1 }} onPress={deactivateCode}>
                      <Text style={{ color: theme.color.onDestructive, fontWeight: '600' }}>코드 비활성화</Text>
                    </Button>
                  </View>
                </View>
              )}
            </CardContent>
          </Card>
        )}

        {/* Member: code input */}
        {!isOwner && (
          <Card style={{ marginTop: 12 }}>
            <CardHeader>
              <CardTitle style={{ fontSize: 16, flexDirection: 'row', alignItems: 'center' }}>
                <Check size={18} color={theme.color.text} />
                <Text style={{ marginLeft: 8 }}>출석 체크</Text>
              </CardTitle>
              <CardDescription>스터디장이 제공한 출석 코드를 입력하세요</CardDescription>
            </CardHeader>
            <CardContent style={{ gap: 12 }}>
              <View>
                <Text style={S.label}>출석 코드</Text>
                <Input
                  placeholder="6자리 코드를 입력하세요"
                  value={inputCode}
                  onChangeText={(t) => setInputCode(t.toUpperCase())}
                  maxLength={6}
                  style={{ textAlign: 'center', fontSize: 16 }}
                />
              </View>

              <Button size="lg" onPress={handleSubmit}>
                <Text style={{ color: theme.color.onPrimary, fontWeight: '600' }}>출석 체크</Text>
              </Button>

              {attendanceStatus === 'success' && (
                <View style={S.toastSuccess}>
                  <Check size={16} color="#16a34a" />
                  <Text style={S.toastSuccessText}>출석이 완료되었습니다!</Text>
                </View>
              )}
              {attendanceStatus === 'error' && (
                <View style={S.toastError}>
                  <AlertCircle size={16} color="#ef4444" />
                  <Text style={S.toastErrorText}>잘못된 출석 코드입니다.</Text>
                </View>
              )}
            </CardContent>
          </Card>
        )}

        {/* Today attendance */}
        <Card style={{ marginTop: 12 }}>
          <CardHeader>
            <CardTitle style={{ fontSize: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Users size={18} color={theme.color.text} />
                <Text style={{ marginLeft: 8 }}>오늘 출석 현황</Text>
              </View>
              <Badge variant="secondary">
                {todayAttendance.length}/{study.currentMembers}명
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {todayAttendance.length === 0 ? (
              <View style={{ alignItems: 'center', paddingVertical: 24 }}>
                <Users size={48} color={theme.color.mutedText} />
                <Text style={{ color: theme.color.mutedText, marginTop: 8 }}>아직 출석한 멤버가 없습니다.</Text>
              </View>
            ) : (
              <View style={{ gap: 8 }}>
                {todayAttendance.map((a) => (
                  <View
                    key={a.id}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: 12,
                      backgroundColor: '#f3f4f7',
                      borderRadius: 10,
                    }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                      <View
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 16,
                          backgroundColor: '#d1fae5',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Check size={16} color="#16a34a" />
                      </View>
                      <View>
                        <Text style={{ fontWeight: '600' }}>
                          {a.nickname}
                          {(a.id === user.id || user.role === 'admin') && (
                            <Text style={{ color: theme.color.mutedText, fontSize: 12 }}> ({a.gender ?? '-'})</Text>
                          )}
                        </Text>
                      </View>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={{ fontSize: 12, fontWeight: '600' }}>{a.time}</Text>
                      <Badge variant="outline">출석</Badge>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </CardContent>
        </Card>

        {/* Attendance stats */}
        <Card style={{ marginTop: 12 }}>
          <CardHeader>
            <CardTitle style={{ fontSize: 16 }}>출석 통계</CardTitle>
          </CardHeader>
          <CardContent>
            <View style={S.grid2}>
              <View style={[S.statBox, { backgroundColor: '#ecfdf5' }]}>
                <Text style={[S.statValue, { color: '#16a34a' }]}>95%</Text>
                <Text style={S.statLabel}>전체 출석률</Text>
              </View>
              <View style={[S.statBox, { backgroundColor: '#eff6ff' }]}>
                <Text style={[S.statValue, { color: '#2563eb' }]}>12</Text>
                <Text style={S.statLabel}>총 회차</Text>
              </View>
            </View>

            <View style={S.separator} />

            <View style={{ gap: 6 }}>
              <View style={S.statRow}>
                <Text style={S.statRowLabel}>정상 출석 (90% 이상)</Text>
                <Text style={[S.statRowValue, { color: '#16a34a' }]}>3명</Text>
              </View>
              <View style={S.statRow}>
                <Text style={S.statRowLabel}>주의 대상 (70-89%)</Text>
                <Text style={[S.statRowValue, { color: '#ca8a04' }]}>1명</Text>
              </View>
              <View style={S.statRow}>
                <Text style={S.statRowLabel}>경고 대상 (70% 미만)</Text>
                <Text style={[S.statRowValue, { color: '#ef4444' }]}>0명</Text>
              </View>
            </View>
          </CardContent>
        </Card>

        {/* Rules */}
        <Card style={{ marginTop: 12 }}>
          <CardHeader>
            <CardTitle style={{ fontSize: 16 }}>출석 규칙</CardTitle>
          </CardHeader>
          <CardContent style={{ gap: 8 }}>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <AlertCircle size={16} color="#f59e0b" />
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: '600', color: theme.color.text }}>결석 3회 시 자동 경고</Text>
                <Text style={{ color: theme.color.mutedText }}>
                  3회 결석 시 시스템에서 자동으로 경고 상태로 변경됩니다.
                </Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <AlertCircle size={16} color="#ef4444" />
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: '600', color: theme.color.text }}>경고 후 추가 결석</Text>
                <Text style={{ color: theme.color.mutedText }}>
                  경고 상태에서 추가 결석 시 스터디장이 퇴출 여부를 결정할 수 있습니다.
                </Text>
              </View>
            </View>
          </CardContent>
        </Card>

        <View style={{ height: 20 }} />
      </ScrollView>
    </Screen>
  );
}

const S = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: theme.color.border,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  label: { fontSize: 12, color: theme.color.text, marginBottom: 6 },
  toastSuccess: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    backgroundColor: '#ecfdf5',
    borderRadius: 10,
  },
  toastSuccessText: { color: '#16a34a', fontWeight: '600' },
  toastError: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    backgroundColor: '#fee2e2',
    borderRadius: 10,
  },
  toastErrorText: { color: '#ef4444', fontWeight: '600' },
  grid2: { flexDirection: 'row', gap: 12 },
  statBox: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  statValue: { fontSize: 22, fontWeight: '700' },
  statLabel: { fontSize: 12, color: theme.color.mutedText, marginTop: 2 },
  separator: {
    height: 1,
    backgroundColor: theme.color.border,
    marginVertical: 12,
  },
  statRow: { flexDirection: 'row', justifyContent: 'space-between' },
  statRowLabel: { fontSize: 12, color: theme.color.text },
  statRowValue: { fontSize: 12, fontWeight: '600' },
});
