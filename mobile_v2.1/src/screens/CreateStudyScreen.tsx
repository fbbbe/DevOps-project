// CreateStudyScreen.tsx  — 전체 교체본
import React, { useState } from 'react';
import { ScrollView, View, Text, Pressable } from 'react-native';
import Screen from '../components/Screen';
import theme from '../styles/theme';
import Input from '../components/Input';
import Select, { Option } from '../components/Select';
import Button from '../components/Button';
import Badge from '../components/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '../components/Card';

// 필요하면 프로젝트의 SUBJECT 데이터로 교체하세요.
const SUBJECT_OPTIONS: Option[] = [
  { label: '어학', value: '어학' },
  { label: 'IT/프로그래밍', value: 'IT/프로그래밍' },
  { label: '마케팅/경영', value: '마케팅/경영' },
  { label: '자격증', value: '자격증' },
  { label: '기타', value: '기타' },
];

export default function CreateStudyScreen() {
  const [name, setName] = useState('');
  const [subject, setSubject] = useState<string | undefined>(undefined);
  const [desc, setDesc] = useState('');
  const [mode, setMode] = useState<'offline' | 'online'>('offline');

  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);

  const canSubmit = name.trim() !== '' && subject && desc.trim() !== '';

  const addTag = () => {
    const t = tagInput.trim();
    if (!t) return;
    if (tags.includes(t)) return;
    if (tags.length >= 5) return;
    setTags(prev => [...prev, t]);
    setTagInput('');
  };
  const removeTag = (t: string) => setTags(prev => prev.filter(x => x !== t));

  const handleCreate = () => {
    // TODO: 실제 생성 API 연동
    console.log({
      name, subject, desc, mode, tags
    });
  };

  return (
    // ✅ 변경: footer 슬롯을 사용해 하단 고정 버튼 + SafeArea 하단 패딩을 한 번만 적용
    <Screen
      footer={
        <Button size="lg" onPress={handleCreate} disabled={!canSubmit}>
          스터디 만들기
        </Button>
      }
    >
      {/* ✅ 변경: 내용 스크롤 컨테이너에는 과한 하단 패딩을 주지 않는다. (버튼과 겹치지 않도록 16px 정도만) */}
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 16, gap: 12 }}
        showsVerticalScrollIndicator={false}
      >
        {/* 기본 정보 */}
        <Card>
          <CardHeader>
            <CardTitle>기본 정보</CardTitle>
          </CardHeader>
          <CardContent style={{ gap: 12 }}>
            <View>
              <Text style={{ marginBottom: 6, color: theme.color.mutedText }}>스터디 이름 *</Text>
              <Input
                placeholder="예: 토익 900점 달성하기"
                value={name}
                onChangeText={setName}
              />
            </View>

            <View>
              <Text style={{ marginBottom: 6, color: theme.color.mutedText }}>주제 *</Text>
              <Select
                value={subject ?? ''}
                onChange={(v) => setSubject(v)}
                placeholder="주제를 선택하세요"
                options={SUBJECT_OPTIONS}
              />
            </View>

            <View>
              <Text style={{ marginBottom: 6, color: theme.color.mutedText }}>설명 *</Text>
              <Input
                placeholder="스터디에 대한 자세한 설명을 입력하세요"
                value={desc}
                onChangeText={setDesc}
                multiline
                style={{ minHeight: 120, textAlignVertical: 'top' }}
              />
            </View>

            <View>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <Text style={{ color: theme.color.mutedText }}>태그 (최대 5개)</Text>
                <Text style={{ color: theme.color.mutedText }}>{tags.length}/5</Text>
              </View>

              <View style={{ flexDirection: 'row', gap: 8 }}>
                <View style={{ flex: 1 }}>
                  <Input
                    placeholder="태그 입력 후 추가 버튼 클릭"
                    value={tagInput}
                    onChangeText={setTagInput}
                    onSubmitEditing={addTag}
                  />
                </View>
                <Button variant="outline" onPress={addTag} style={{ paddingHorizontal: 16 }}>
                  +
                </Button>
              </View>

              {tags.length > 0 && (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                  {tags.map(t => (
                    <Pressable key={t} onLongPress={() => removeTag(t)}>
                      <Badge variant="outline">
                        <Text style={{ fontSize: 12 }}>#{t}</Text>
                      </Badge>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>
          </CardContent>
        </Card>

        {/* 장소 및 방식 */}
        <Card>
          <CardHeader>
            <CardTitle>장소 및 방식</CardTitle>
          </CardHeader>
          <CardContent>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <Button
                variant={mode === 'offline' ? 'default' : 'outline'}
                onPress={() => setMode('offline')}
                style={{ flex: 1 }}
              >
                오프라인 (대면)
              </Button>
              <Button
                variant={mode === 'online' ? 'default' : 'outline'}
                onPress={() => setMode('online')}
                style={{ flex: 1 }}
              >
                온라인 (비대면)
              </Button>
            </View>
          </CardContent>
        </Card>

        {/* 필요 시 다른 섹션들 추가 */}
      </ScrollView>
    </Screen>
  );
}