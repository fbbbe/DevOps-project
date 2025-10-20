import React, { useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Pressable,
} from 'react-native';
import Screen from '../components/Screen';
import theme from '../styles/theme';
import Button from '../components/Button';
import Input from '../components/Input';
import Badge from '../components/Badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/Card';
import {
  ArrowLeft, BarChart3, TrendingUp, Calendar, Target, Plus, Edit, BookOpen,
} from 'lucide-react-native';

// 웹 ProgressManager.tsx의 타입/데이터 흐름을 그대로 반영  :contentReference[oaicite:1]{index=1}
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

type SessionProgress = {
  id: string;
  sessionNumber: number;
  date: string;
  topic: string;
  targetProgress: number;
  actualProgress: number;
  notes: string;
  isCompleted: boolean;
};

// 웹의 mockProgressData를 동일하게 이식  :contentReference[oaicite:2]{index=2}
const initialProgress: SessionProgress[] = [
  { id: '1', sessionNumber: 1, date: '2024-01-15', topic: '1주차: 기초 문법', targetProgress: 10, actualProgress: 10, notes: '기초 문법 완료. 모든 멤버가 잘 따라왔음.', isCompleted: true },
  { id: '2', sessionNumber: 2, date: '2024-01-22', topic: '2주차: 시제와 동사', targetProgress: 20, actualProgress: 18, notes: '시제 부분에서 약간의 어려움. 다음 주에 복습 예정.', isCompleted: true },
  { id: '3', sessionNumber: 3, date: '2024-01-29', topic: '3주차: 문장 구조', targetProgress: 30, actualProgress: 30, notes: '문장 구조 이해도 높음. 예정대로 진행.', isCompleted: true },
  { id: '4', sessionNumber: 4, date: '2024-02-05', topic: '4주차: 관계사', targetProgress: 40, actualProgress: 35, notes: '관계사가 어려워서 진도가 약간 늦어짐.', isCompleted: true },
  { id: '5', sessionNumber: 5, date: '2024-02-12', topic: '5주차: 가정법', targetProgress: 50, actualProgress: 0, notes: '', isCompleted: false },
];

export default function ProgressScreen({ route, navigation }: any) {
  const study: Study = route?.params?.study ?? {
    id: 'stub', name: '진행률 테스트 스터디', subject: '어학', description: '모바일 진행률 화면 검증용',
    tags: ['테스트'], region: '온라인', type: 'online', duration: 'short',
    startDate: '2024-01-01', endDate: '2024-03-31', maxMembers: 8, currentMembers: 6,
    ownerId: 'owner-1', ownerNickname: '영어왕', status: 'active', progress: 50,
  };
  const user: User = route?.params?.user ?? { id: 'me', nickname: '나', role: 'user' };

  const isOwner = study.ownerId === user.id;

  const [progressData, setProgressData] = useState<SessionProgress[]>(initialProgress);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newProgress, setNewProgress] = useState<{ progress: number; notes: string }>({ progress: 0, notes: '' });

  const completed = useMemo(() => progressData.filter(p => p.isCompleted), [progressData]);
  const totalProgress = useMemo(() => {
    const c = completed.length;
    if (c === 0) return 0;
    const avg = completed.reduce((sum, p) => sum + p.actualProgress, 0) / c;
    return Math.round(avg);
  }, [completed]);
  const nextSession = useMemo(() => progressData.find(p => !p.isCompleted), [progressData]);
  const completedSessions = completed.length;
  const totalSessions = progressData.length;

  const achievedCount = useMemo(
    () => progressData.filter(p => p.actualProgress >= p.targetProgress).length,
    [progressData]
  );
  const achievedRate = useMemo(() => {
    const c = completed.length;
    if (c === 0) return 0;
    const pct = completed.reduce((acc, p) => acc + (p.targetProgress ? (p.actualProgress / p.targetProgress) * 100 : 0), 0) / c;
    return Math.round(pct);
  }, [completed]);

  const clamp0to100 = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

  const saveNextProgress = () => {
    if (!nextSession) return;
    const v = clamp0to100(newProgress.progress);
    const updated = progressData.map(p =>
      p.id === nextSession.id
        ? { ...p, actualProgress: v, notes: newProgress.notes, isCompleted: true }
        : p
    );
    setProgressData(updated);
    setIsAdding(false);
    setNewProgress({ progress: 0, notes: '' });
  };

  const handleEditProgress = (sessionId: string, progress: number, notes: string) => {
    const v = clamp0to100(progress);
    const updated = progressData.map(p => (p.id === sessionId ? { ...p, actualProgress: v, notes } : p));
    setProgressData(updated);
    setEditingId(null);
  };

  const editingSession = useMemo(() => progressData.find(p => p.id === editingId) || null, [editingId, progressData]);

  const ProgressBar = ({ value }: { value: number }) => (
    <View style={styles.progressOuter}>
      <View style={[styles.progressInner, { width: `${clamp0to100(value)}%` as any }]} />
    </View>
  );

  return (
    <Screen withPadding={false}>
      {/* Header */}
      <View style={styles.header}>
        <Button variant="ghost" size="sm" onPress={() => navigation?.goBack?.()} style={{ paddingHorizontal: 8 }}>
          <ArrowLeft size={16} color={theme.color.text} />
        </Button>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <BookOpen size={20} color={theme.color.primary} />
          <Text style={{ fontSize: 16, fontWeight: '600', color: theme.color.text }}>진행률 관리</Text>
        </View>
        <View style={{ width: 32 }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.select({ ios: 'padding', android: undefined })} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>
          {/* Study Info */}
          <Card>
            <CardHeader style={{ paddingBottom: 12 }}>
              <CardTitle style={{ fontSize: 16 }}>{study.name}</CardTitle>
              <CardDescription>
                단기 스터디 · {study.duration === 'short' ? '12주 이하' : '장기'}
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Overall Progress */}
          <Card style={{ marginTop: 12 }}>
            <CardHeader>
              <CardTitle style={{ fontSize: 16, flexDirection: 'row', alignItems: 'center' }}>
                <BarChart3 size={18} color={theme.color.text} />
                <Text style={{ marginLeft: 8 }}>전체 진행률</Text>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <View style={{ alignItems: 'center', marginBottom: 10 }}>
                <Text style={{ fontSize: 28, fontWeight: '700', color: theme.color.primary, marginBottom: 6 }}>
                  {totalProgress}%
                </Text>
                <ProgressBar value={totalProgress} />
                <Text style={{ fontSize: 12, color: theme.color.mutedText, marginTop: 6 }}>
                  {completedSessions}/{totalSessions} 회차 완료
                </Text>
              </View>

              <View style={{ flexDirection: 'row', gap: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: theme.color.border }}>
                <View style={[styles.statBox, { backgroundColor: '#ecfdf5' }]}>
                  <Text style={[styles.statValue, { color: '#16a34a' }]}>{achievedCount}</Text>
                  <Text style={styles.statLabel}>목표 달성 회차</Text>
                </View>
                <View style={[styles.statBox, { backgroundColor: '#eff6ff' }]}>
                  <Text style={[styles.statValue, { color: '#2563eb' }]}>{achievedRate}%</Text>
                  <Text style={styles.statLabel}>목표 달성률</Text>
                </View>
              </View>
            </CardContent>
          </Card>

          {/* Add Progress (Owner Only) */}
          {isOwner && nextSession && !isAdding && (
            <Card style={{ marginTop: 12 }}>
              <CardHeader>
                <CardTitle style={{ fontSize: 16, flexDirection: 'row', alignItems: 'center' }}>
                  <Plus size={18} color={theme.color.text} />
                  <Text style={{ marginLeft: 8 }}>다음 회차 진행률 입력</Text>
                </CardTitle>
                <CardDescription>
                  {nextSession.sessionNumber}회차: {nextSession.topic}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onPress={() => setIsAdding(true)} size="lg">진행률 입력하기</Button>
              </CardContent>
            </Card>
          )}

          {/* Progress Input Form */}
          {isOwner && isAdding && nextSession && (
            <Card style={{ marginTop: 12 }}>
              <CardHeader>
                <CardTitle style={{ fontSize: 16 }}>{nextSession.sessionNumber}회차 진행률 입력</CardTitle>
                <CardDescription>{nextSession.topic}</CardDescription>
              </CardHeader>
              <CardContent style={{ gap: 12 }}>
                <View>
                  <Text style={styles.label}>달성 진행률 (%)</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Input
                      keyboardType="number-pad"
                      value={String(newProgress.progress)}
                      onChangeText={(t) => setNewProgress(p => ({ ...p, progress: Number(t.replace(/\D/g, '')) || 0 }))}
                      style={{ flex: 1 }}
                    />
                    <Text style={{ fontSize: 12, color: theme.color.mutedText }}>목표: {nextSession.targetProgress}%</Text>
                  </View>
                  <ProgressBar value={newProgress.progress} />
                </View>

                <View>
                  <Text style={styles.label}>회차 노트 (선택)</Text>
                  <View style={styles.textareaWrap}>
                    <TextInput
                      placeholder="이번 회차에 대한 메모를 남겨보세요..."
                      value={newProgress.notes}
                      onChangeText={(t) => setNewProgress(p => ({ ...p, notes: t }))}
                      multiline
                      style={styles.textarea}
                      placeholderTextColor={theme.color.mutedText}
                    />
                  </View>
                </View>

                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <Button style={{ flex: 1 }} onPress={saveNextProgress}>진행률 저장</Button>
                  <Button variant="outline" style={{ flex: 1 }} onPress={() => setIsAdding(false)}>취소</Button>
                </View>
              </CardContent>
            </Card>
          )}

          {/* Progress History */}
          <Card style={{ marginTop: 12 }}>
            <CardHeader>
              <CardTitle style={{ fontSize: 16, flexDirection: 'row', alignItems: 'center' }}>
                <TrendingUp size={18} color={theme.color.text} />
                <Text style={{ marginLeft: 8 }}>진행률 기록</Text>
              </CardTitle>
            </CardHeader>
            <CardContent style={{ gap: 12 }}>
              {progressData.map((s) => (
                <View key={s.id} style={{ gap: 8, padding: 12, borderWidth: 1, borderColor: theme.color.border, borderRadius: 10 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <View>
                      <Text style={{ fontWeight: '600' }}>{s.sessionNumber}회차</Text>
                      <Text style={{ fontSize: 12, color: theme.color.mutedText }}>{s.topic}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Badge variant="outline">
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                          <Calendar size={12} color={theme.color.text} />
                          <Text style={{ fontSize: 12 }}>{s.date}</Text>
                        </View>
                      </Badge>
                      {s.isCompleted ? (
                        <Badge variant={s.actualProgress >= s.targetProgress ? 'default' : 'secondary'}>
                          <Text style={{ fontSize: 12 }}>{s.actualProgress >= s.targetProgress ? '목표 달성' : '진행 중'}</Text>
                        </Badge>
                      ) : (
                        <Badge variant="outline"><Text style={{ fontSize: 12 }}>예정</Text></Badge>
                      )}
                    </View>
                  </View>

                  {s.isCompleted ? (
                    <>
                      <View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                          <Text style={{ fontSize: 12 }}>진행률</Text>
                          <Text style={{ fontSize: 12, fontWeight: '600' }}>
                            {s.actualProgress}% / {s.targetProgress}%
                          </Text>
                        </View>
                        <ProgressBar value={s.actualProgress} />
                      </View>

                      {!!s.notes && (
                        <View style={{ padding: 10, backgroundColor: '#f3f4f7', borderRadius: 8 }}>
                          <Text style={{ fontSize: 13 }}>{s.notes}</Text>
                        </View>
                      )}

                      {isOwner && (
                        <View style={{ alignItems: 'flex-end' }}>
                          <Button variant="ghost" size="sm" onPress={() => setEditingId(s.id)}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                              <Edit size={14} color={theme.color.text} />
                              <Text>수정</Text>
                            </View>
                          </Button>
                        </View>
                      )}
                    </>
                  ) : (
                    <View style={{ alignItems: 'center', paddingVertical: 12 }}>
                      <Target size={28} color={theme.color.mutedText} />
                      <Text style={{ fontSize: 12, color: theme.color.mutedText, marginTop: 4 }}>아직 진행되지 않은 회차입니다</Text>
                      <Text style={{ fontSize: 12, color: theme.color.mutedText }}>목표: {s.targetProgress}%</Text>
                    </View>
                  )}
                </View>
              ))}
            </CardContent>
          </Card>

          {/* Tips */}
          <Card style={{ marginTop: 12 }}>
            <CardHeader>
              <CardTitle style={{ fontSize: 16 }}>진행률 관리 팁</CardTitle>
            </CardHeader>
            <CardContent style={{ gap: 10 }}>
              <View style={styles.tipRow}>
                <View style={styles.dot} />
                <View>
                  <Text style={styles.tipTitle}>정확한 평가</Text>
                  <Text style={styles.tipText}>실제 학습 진도를 정확히 평가하여 입력하세요.</Text>
                </View>
              </View>
              <View style={styles.tipRow}>
                <View style={styles.dot} />
                <View>
                  <Text style={styles.tipTitle}>회차별 기록</Text>
                  <Text style={styles.tipText}>각 회차마다 노트를 남겨 학습 과정을 기록하세요.</Text>
                </View>
              </View>
              <View style={styles.tipRow}>
                <View style={styles.dot} />
                <View>
                  <Text style={styles.tipTitle}>목표 조정</Text>
                  <Text style={styles.tipText}>필요시 다음 회차 목표를 조정하여 현실적으로 관리하세요.</Text>
                </View>
              </View>
            </CardContent>
          </Card>

          <View style={{ height: 24 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Edit Modal */}
      <Modal visible={!!editingSession} transparent animationType={Platform.select({ ios: 'slide', android: 'fade', default: 'fade' })}>
        <Pressable style={styles.backdrop} onPress={() => setEditingId(null)}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            {editingSession && (
              <>
                <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 12 }}>
                  {editingSession.sessionNumber}회차 수정
                </Text>

                <Text style={styles.label}>진행률 (%)</Text>
                <Input
                  keyboardType="number-pad"
                  value={String(editingSession.actualProgress)}
                  onChangeText={(t) => setEditingId(prev => {
                    // 임시로 편집 값은 local state를 쓰지 않고, 저장 시에만 반영 (간단화)
                    (editingSession as any).actualProgress = Number(t.replace(/\D/g, '')) || 0;
                    return prev;
                  })}
                />

                <Text style={[styles.label, { marginTop: 12 }]}>노트</Text>
                <View style={styles.textareaWrap}>
                  <TextInput
                    value={editingSession.notes}
                    onChangeText={(t) => { (editingSession as any).notes = t; }}
                    multiline
                    style={styles.textarea}
                    placeholderTextColor={theme.color.mutedText}
                  />
                </View>

                <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
                  <Button
                    style={{ flex: 1 }}
                    onPress={() => handleEditProgress(
                      editingSession.id,
                      (editingSession as any).actualProgress,
                      editingSession.notes
                    )}
                  >
                    저장
                  </Button>
                  <Button variant="outline" style={{ flex: 1 }} onPress={() => setEditingId(null)}>취소</Button>
                </View>
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    borderBottomWidth: 1, borderBottomColor: theme.color.border,
    paddingVertical: 8, paddingHorizontal: 16,
  },
  label: { fontSize: 12, color: theme.color.text, marginBottom: 6 },
  textareaWrap: { borderWidth: 1, borderColor: theme.color.border, borderRadius: 8, backgroundColor: '#fff' },
  textarea: { minHeight: 90, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: theme.color.text },

  progressOuter: { width: '100%', height: 8, backgroundColor: theme.color.secondary, borderRadius: 999, overflow: 'hidden', marginTop: 6 },
  progressInner: { height: 8, backgroundColor: theme.color.primary, borderRadius: 999 },

  statBox: { flex: 1, padding: 12, borderRadius: 12, alignItems: 'center' },
  statValue: { fontSize: 20, fontWeight: '700' },
  statLabel: { fontSize: 12, color: theme.color.mutedText, marginTop: 2 },

  tipRow: { flexDirection: 'row', gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: theme.color.primary, marginTop: 6 },
  tipTitle: { fontWeight: '600', color: theme.color.text },
  tipText: { color: theme.color.mutedText, fontSize: 12 },

  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.25)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#fff', padding: 16, borderTopLeftRadius: 14, borderTopRightRadius: 14, borderTopWidth: 1, borderColor: theme.color.border },
});
