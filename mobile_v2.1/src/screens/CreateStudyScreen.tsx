import React, { useMemo, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Screen from '../components/Screen';
import Input from '../components/Input';
import Button from '../components/Button';
import Select, { Option } from '../components/Select';
import Badge from '../components/Badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/Card';
import theme from '../styles/theme';
import { KOREA_REGIONS } from '../data/regions';
import { STUDY_SUBJECTS } from '../data/subjects';
import { ArrowLeft, BookOpen, Plus, X } from 'lucide-react-native';

type StudyType = 'online' | 'offline';
type DurationType = 'short' | 'long';

export default function CreateStudyScreen({ navigation }: any) {
  // ---- form state (빈 문자열 대신 null 사용: placeholder 안전) ----
  const [name, setName] = useState('');
  const [subject, setSubject] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [type, setType] = useState<StudyType | null>(null);

  const [sido, setSido] = useState<string | null>(null);
  const [sigungu, setSigungu] = useState<string | null>(null);
  const [dongEupMyeon, setDongEupMyeon] = useState('');

  const [duration, setDuration] = useState<DurationType | null>(null);
  const [weekDuration, setWeekDuration] = useState<string | null>(null);
  const [dayDuration, setDayDuration] = useState<string | null>(null);

  const [maxMembers, setMaxMembers] = useState<number>(6);
  const [startDate, setStartDate] = useState(''); // YYYY-MM-DD (간단 입력)
  const [endDate, setEndDate] = useState('');

  // ---- derived ----
  const availableSigungu = useMemo(() => (sido ? KOREA_REGIONS[sido] ?? [] : []), [sido]);

  const subjectOptions: Option[] = useMemo(() => [
    // placeholder는 Select 내부에서 처리 (value=null) — 항목엔 빈 문자열 금지
    ...STUDY_SUBJECTS.map(s => ({ label: s.label, value: s.value })),
  ], []);

  const sidoOptions: Option[] = useMemo(() => Object.keys(KOREA_REGIONS).map(s => ({ label: s, value: s })), []);
  const sigunguOptions: Option[] = useMemo(() => availableSigungu.map(g => ({ label: g, value: g })), [availableSigungu]);

  const maxMemberOptions: Option[] = useMemo(
    () => [4,5,6,7,8,9,10,12,15,20].map(n => ({ label: `${n}명`, value: String(n) })),
    []
  );
  const weekOptions: Option[] = useMemo(
    () => Array.from({ length: 12 }, (_, i) => i + 1).map(w => ({ label: `${w}주`, value: String(w) })),
    []
  );
  const dayOptions: Option[] = useMemo(
    () => [7,14,21,30,45,60,90].map(d => ({ label: `${d}일`, value: String(d) })),
    []
  );

  // ---- handlers ----
  const addTag = () => {
    const t = newTag.trim();
    if (!t) return;
    if (tags.includes(t)) return;
    if (tags.length >= 5) return;
    setTags(prev => [...prev, t]);
    setNewTag('');
  };

  const removeTag = (t: string) => setTags(prev => prev.filter(x => x !== t));

  const onChangeSido = (v: string) => {
    setSido(v);
    setSigungu(null);
    setDongEupMyeon('');
  };

  const submit = () => {
    // ---- validation (웹과 동일 정책) ----
    if (!name || !subject || !description) {
      Alert.alert('확인', '필수 정보를 모두 입력해주세요');
      return;
    }
    if (!type) {
      Alert.alert('확인', '진행 방식을 선택해주세요');
      return;
    }
    if (type === 'offline') {
      if (!sido || !sigungu || !dongEupMyeon) {
        Alert.alert('확인', '지역 정보를 모두 입력해주세요');
        return;
      }
    }
    if (!duration || !startDate || !endDate) {
      Alert.alert('확인', '진행 기간 정보를 모두 입력해주세요');
      return;
    }

    // mock create
    const payload = {
      name, subject, description, tags,
      type, regionDetail: type === 'offline' ? { sido, sigungu, dongEupMyeon } : undefined,
      duration, weekDuration, dayDuration,
      maxMembers, startDate, endDate,
    };
    console.log('Creating study:', payload);
    Alert.alert('성공', '스터디가 성공적으로 생성되었습니다!', [
      { text: '확인', onPress: () => navigation?.goBack?.() }
    ]);
  };

  // ---- small helpers UI ----
  const SegButton = ({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) => (
    <Button
      variant={active ? 'secondary' : 'outline'}
      size="sm"
      style={[{ flex: 1 }, active && { backgroundColor: theme.color.secondary }]}
      onPress={onPress}
    >
      {label}
    </Button>
  );

  return (
    <Screen>
      {/* Sticky-like header */}
      <View style={S.header}>
        <Button variant="ghost" size="sm" onPress={() => navigation?.goBack?.()} style={{ paddingHorizontal: 8 }}>
          <ArrowLeft size={16} color={theme.color.text} />
        </Button>
        <View style={{ flexDirection:'row', alignItems:'center', gap:8, flex:1 }}>
          <BookOpen size={20} color={theme.color.primary} />
          <Text style={{ fontSize:16, fontWeight:'600', color: theme.color.text }}>스터디 만들기</Text>
        </View>
        <View style={{ width: 32 }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.select({ ios: 'padding', android: undefined })} style={{ flex:1 }}>
        <ScrollView contentContainerStyle={{ paddingBottom: 96 }}>
          {/* 기본 정보 */}
          <Card style={{ marginTop: 12 }}>
            <CardHeader>
              <CardTitle className="text-base">기본 정보</CardTitle>
              <CardDescription>스터디의 기본 정보를 입력하세요</CardDescription>
            </CardHeader>
            <CardContent style={{ gap: 12 }}>
              {/* 이름 */}
              <View>
                <Text style={S.label}>스터디 이름 *</Text>
                <Input placeholder="예: 토익 900점 달성하기" value={name} onChangeText={setName} />
              </View>

              {/* 주제 */}
              <View>
                <Text style={S.label}>주제 *</Text>
                <Select value={subject} onChange={setSubject} placeholder="주제를 선택하세요" options={subjectOptions} />
              </View>

              {/* 설명 */}
              <View>
                <Text style={S.label}>설명 *</Text>
                <View style={S.textareaWrap}>
                  <TextInput
                    placeholder="스터디에 대한 자세한 설명을 입력하세요"
                    value={description}
                    onChangeText={setDescription}
                    multiline
                    style={S.textarea}
                    placeholderTextColor={theme.color.mutedText}
                  />
                </View>
              </View>

              {/* 태그 */}
              <View>
                <Text style={S.label}>태그 (최대 5개)</Text>
                <View style={{ flexDirection:'row', gap:8, marginBottom: 8 }}>
                  <Input
                    placeholder="태그 입력 후 추가 버튼 클릭"
                    value={newTag}
                    onChangeText={setNewTag}
                    onSubmitEditing={addTag}
                  />
                  <Button variant="outline" size="sm" onPress={addTag}>
                    <Plus size={16} color={theme.color.text} />
                  </Button>
                </View>
                <View style={{ flexDirection:'row', flexWrap:'wrap', gap:8 }}>
                  {tags.map(tag => (
                    <Badge key={tag} variant="outline" style={{ paddingRight: 4 }}>
                      <View style={{ flexDirection:'row', alignItems:'center', gap:6 }}>
                        <Text style={{ fontSize: 12 }}>{tag}</Text>
                        <Button variant="ghost" size="sm" onPress={() => removeTag(tag)} style={{ padding: 4 }}>
                          <X size={12} color={theme.color.text} />
                        </Button>
                      </View>
                    </Badge>
                  ))}
                </View>
              </View>
            </CardContent>
          </Card>

          {/* 장소 및 방식 */}
          <Card style={{ marginTop: 12 }}>
            <CardHeader>
              <CardTitle className="text-base">장소 및 방식</CardTitle>
            </CardHeader>
            <CardContent style={{ gap: 12 }}>
              {/* 진행 방식 (세그먼트 토글로 라디오 표현) */}
              <View>
                <Text style={S.label}>진행 방식 *</Text>
                <View style={S.segment}>
                  <SegButton label="오프라인 (대면)" active={type === 'offline'} onPress={() => setType('offline')} />
                  <SegButton label="온라인 (비대면)" active={type === 'online'} onPress={() => setType('online')} />
                </View>
              </View>

              {/* 오프라인일 때만 지역 표시 */}
              {type === 'offline' && (
                <View style={{ gap: 12, backgroundColor: '#f6f7fa', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: theme.color.border }}>
                  {/* 시/도 */}
                  <View>
                    <Text style={S.label}>시/도 *</Text>
                    <Select value={sido} onChange={onChangeSido} placeholder="시/도를 선택하세요" options={sidoOptions} />
                  </View>
                  {/* 시/군/구 */}
                  {sido && (
                    <View>
                      <Text style={S.label}>시/군/구 *</Text>
                      <Select value={sigungu} onChange={setSigungu} placeholder="시/군/구를 선택하세요" options={sigunguOptions} />
                    </View>
                  )}
                  {/* 동/읍/면 */}
                  {sido && sigungu && (
                    <View>
                      <Text style={S.label}>동/읍/면 *</Text>
                      <Input placeholder="예: 역삼동" value={dongEupMyeon} onChangeText={setDongEupMyeon} />
                    </View>
                  )}
                </View>
              )}

              {/* 최대 인원 */}
              <View>
                <Text style={S.label}>최대 인원</Text>
                <Select
                  value={String(maxMembers)}
                  onChange={(v) => setMaxMembers(parseInt(v, 10))}
                  options={maxMemberOptions}
                  placeholder="선택"
                />
              </View>
            </CardContent>
          </Card>

          {/* 진행 기간 */}
          <Card style={{ marginTop: 12 }}>
            <CardHeader>
              <CardTitle className="text-base">진행 기간</CardTitle>
            </CardHeader>
            <CardContent style={{ gap: 12 }}>
              {/* 기간 유형 */}
              <View>
                <Text style={S.label}>기간 유형 *</Text>
                <View style={S.segment}>
                  <SegButton label="단기 (12주 이하, 진행률 관리)" active={duration === 'short'} onPress={() => setDuration('short')} />
                  <SegButton label="장기 (12주 초과, 지속적 학습)" active={duration === 'long'} onPress={() => setDuration('long')} />
                </View>
              </View>

              {/* 단기 설정 */}
              {duration === 'short' && (
                <View style={{ gap: 12, backgroundColor: '#f6f7fa', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: theme.color.border }}>
                  <Text style={{ fontSize: 12, color: theme.color.mutedText }}>
                    단기 스터디는 주 단위 또는 일 단위로 기간을 설정할 수 있습니다.
                  </Text>
                  <View style={{ flexDirection:'row', gap:12 }}>
                    <View style={{ flex:1 }}>
                      <Text style={S.label}>주 단위 기간</Text>
                      <Select value={weekDuration} onChange={setWeekDuration} placeholder="주 선택" options={weekOptions} />
                    </View>
                    <View style={{ flex:1 }}>
                      <Text style={S.label}>또는 일 단위</Text>
                      <Select value={dayDuration} onChange={setDayDuration} placeholder="일 선택" options={dayOptions} />
                    </View>
                  </View>
                </View>
              )}

              {/* 날짜 */}
              <View style={{ flexDirection:'row', gap:12 }}>
                <View style={{ flex:1 }}>
                  <Text style={S.label}>시작일 *</Text>
                  <Input placeholder="YYYY-MM-DD" value={startDate} onChangeText={setStartDate} />
                </View>
                <View style={{ flex:1 }}>
                  <Text style={S.label}>종료일 *</Text>
                  <Input placeholder="YYYY-MM-DD" value={endDate} onChangeText={setEndDate} />
                </View>
              </View>
            </CardContent>
          </Card>

          {/* 스터디장 정보 (웹은 user prop, RN은 추후 Auth 연동 시 표시) */}
          <Card style={{ marginTop: 12 }}>
            <CardHeader>
              <CardTitle className="text-base">스터디장 정보</CardTitle>
              <CardDescription>자동으로 표시됩니다</CardDescription>
            </CardHeader>
            <CardContent>
              <View style={{ flexDirection:'row', alignItems:'center', gap:12, backgroundColor: '#f6f7fa', borderRadius: 12, padding: 12 }}>
                <View style={{ width:40, height:40, borderRadius: 20, backgroundColor: theme.color.primary, alignItems:'center', justifyContent:'center' }}>
                  <Text style={{ color: theme.color.onPrimary, fontWeight: '600' }}>U</Text>
                </View>
                <View>
                  <Text style={{ fontWeight:'600' }}>닉네임</Text>
                  <Text style={{ color: theme.color.mutedText, fontSize: 12 }}>성별</Text>
                </View>
              </View>
            </CardContent>
          </Card>

          <View style={{ height: 24 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Submit footer */}
      <View style={S.footer}>
        <Button size="lg" onPress={submit} style={{ flex:1 }}>스터디 만들기</Button>
      </View>
    </Screen>
  );
}

const S = StyleSheet.create({
  header: {
    flexDirection:'row', alignItems:'center', gap:8,
    borderBottomWidth: 1, borderBottomColor: theme.color.border,
    paddingVertical: 8, marginBottom: 8,
  },
  label: { fontSize: 12, color: theme.color.text, marginBottom: 6 },
  textareaWrap: {
    borderWidth: 1, borderColor: theme.color.border, borderRadius: 8, backgroundColor: '#fff',
  },
  textarea: { minHeight: 100, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: theme.color.text },
  segment: { flexDirection:'row', gap:8 },
  footer: {
    position:'absolute', left:0, right:0, bottom:0,
    backgroundColor: theme.color.bg, borderTopWidth: 1, borderTopColor: theme.color.border,
    paddingHorizontal: 16, paddingVertical: 12,
  },
});
