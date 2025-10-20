import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View, Text, ScrollView, TextInput, StyleSheet, KeyboardAvoidingView,
  Platform, Pressable
} from 'react-native';
import Screen from '../components/Screen';
import theme from '../styles/theme';
import { Card, CardContent, CardHeader, CardTitle } from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import { ArrowLeft, Send, BookOpen } from 'lucide-react-native';

// 웹 StudyChat.tsx의 타입/흐름을 반영  :contentReference[oaicite:1]{index=1}
export type Study = {
  id: string;
  name: string;
  subject: string;
  description: string;
  tags: string[];
  region: string;
  type: 'online' | 'offline';
  duration: 'short' | 'long';
  startDate: string;
  endDate?: string;
  maxMembers: number;
  currentMembers: number;
  ownerId: string;
  ownerNickname: string;
  status: 'recruiting' | 'active' | 'completed';
};
export type User = { id: string; nickname: string };

type Message = {
  id: string;
  userId: string;
  userNickname: string;
  text: string;
  timestamp: Date;
};

// 웹의 초기 메시지 구조를 그대로 사용  :contentReference[oaicite:2]{index=2}
const initialMessages: Message[] = [
  { id: '1', userId: '2', userNickname: '영어왕', text: '안녕하세요! 첫 모임 때 준비물이 따로 있을까요?', timestamp: new Date(Date.now() - 3600000) },
  { id: '2', userId: '3', userNickname: '스터디킹', text: '노트북이랑 필기도구 정도면 충분할 것 같아요!', timestamp: new Date(Date.now() - 3000000) },
  { id: '3', userId: '2', userNickname: '영어왕', text: '감사합니다~ 그럼 내일 뵙겠습니다!', timestamp: new Date(Date.now() - 1800000) },
];

export default function StudyChatScreen({ route, navigation }: any) {
  const study: Study = route?.params?.study ?? {
    id: 'stub', name: '채팅 테스트 스터디', subject: '어학', description: '', tags: [],
    region: '온라인', type: 'online', duration: 'short',
    startDate: '2024-01-01', endDate: '2024-03-31', maxMembers: 8, currentMembers: 6,
    ownerId: 'o', ownerNickname: '영어왕', status: 'active',
  };
  const user: User = route?.params?.user ?? { id: 'me', nickname: '나' };

  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [newMessage, setNewMessage] = useState('');
  const scrollRef = useRef<ScrollView>(null);

  const scrollToBottom = () => {
    // 레이아웃 직후 스크롤 보장
    requestAnimationFrame(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    });
  };

  useEffect(() => { scrollToBottom(); }, [messages]);

  const handleSend = () => {
    const t = newMessage.trim();
    if (!t) return;
    const msg: Message = {
      id: Date.now().toString(),
      userId: user.id,
      userNickname: user.nickname,
      text: t,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, msg]);
    setNewMessage('');
  };

  const formatTime = (date: Date) => {
    const d = new Date(date);
    const h = d.getHours();
    const m = d.getMinutes();
    const ampm = h >= 12 ? '오후' : '오전';
    const hh = h % 12 || 12;
    return `${ampm} ${hh}:${String(m).padStart(2, '0')}`;
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const d = new Date(date);
    const yday = new Date(); yday.setDate(yday.getDate() - 1);
    if (today.toDateString() === d.toDateString()) return '오늘';
    if (yday.toDateString() === d.toDateString()) return '어제';
    return `${d.getMonth() + 1}월 ${d.getDate()}일`;
  };

  const grouped = useMemo(() => {
    const map = new Map<string, Message[]>();
    messages.forEach(msg => {
      const key = formatDate(msg.timestamp);
      const arr = map.get(key) ?? [];
      arr.push(msg);
      map.set(key, arr);
    });
    return Array.from(map.entries()); // [ [date, msgs], ... ]
  }, [messages]);

  const AvatarFallback = ({ name }: { name: string }) => (
    <View style={S.avatar}>
      <Text style={S.avatarTxt}>{name.charAt(0)}</Text>
    </View>
  );

  return (
    <Screen withPadding={false}>
      {/* Header */}
      <View style={S.header}>
        <Button variant="ghost" size="sm" onPress={() => navigation?.goBack?.()} style={{ paddingHorizontal: 8 }}>
          <ArrowLeft size={16} color={theme.color.text} />
        </Button>
        <View style={{ flexDirection:'row', alignItems:'center', gap:8, flex:1 }}>
          <BookOpen size={20} color={theme.color.primary} />
          <View style={{ flex:1 }}>
            <Text style={{ fontSize:16, fontWeight:'600' }} numberOfLines={1}>{study.name}</Text>
            <Text style={{ fontSize:12, color: theme.color.mutedText }}>{study.currentMembers}명</Text>
          </View>
        </View>
        <View style={{ width:32 }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.select({ ios: 'padding', android: undefined })} style={{ flex:1 }}>
        {/* Messages */}
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={{ padding: 16, paddingBottom: 96 }}
          onContentSizeChange={scrollToBottom}
          keyboardShouldPersistTaps="handled"
        >
          {grouped.map(([date, msgs]) => (
            <View key={date} style={{ marginBottom: 12 }}>
              {/* Date pill */}
              <View style={{ alignItems:'center', marginVertical: 8 }}>
                <View style={S.datePill}><Text style={S.datePillTxt}>{date}</Text></View>
              </View>

              {msgs.map(m => {
                const own = m.userId === user.id;
                return (
                  <View
                    key={m.id}
                    style={[
                      S.msgRow,
                      own ? { flexDirection: 'row-reverse' } : null
                    ]}
                  >
                    {!own && <AvatarFallback name={m.userNickname} />}

                    <View style={[{ maxWidth: '75%' }, own ? { alignItems: 'flex-end' } : { alignItems: 'flex-start' }]}>
                      {!own && <Text style={S.nickname}>{m.userNickname}</Text>}

                      <View style={S.msgLine}>
                        {own && <Text style={S.time}>{formatTime(m.timestamp)}</Text>}
                        <Card style={[S.bubble, own ? S.bubbleOwn : S.bubbleOther]}>
                          <CardContent style={{ padding: 10 }}>
                            <Text style={[S.msgText, own ? { color: theme.color.onPrimary } : null]}>
                              {m.text}
                            </Text>
                          </CardContent>
                        </Card>
                        {!own && <Text style={S.time}>{formatTime(m.timestamp)}</Text>}
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          ))}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Input */}
      <View style={S.footer}>
        <View style={{ flexDirection:'row', alignItems:'center', gap:8 }}>
          <Input
            value={newMessage}
            onChangeText={setNewMessage}
            placeholder="메시지를 입력하세요..."
            style={{ flex:1 }}
          />
          <Button
            size="icon"
            onPress={handleSend}
            disabled={newMessage.trim() === ''}
            style={{ width: 44, height: 44, alignItems:'center', justifyContent:'center' }}
          >
            <Send size={18} color={newMessage.trim() ? theme.color.onPrimary : theme.color.mutedText} />
          </Button>
        </View>
      </View>
    </Screen>
  );
}

const S = StyleSheet.create({
  header: {
    flexDirection:'row', alignItems:'center', gap:8,
    borderBottomWidth:1, borderBottomColor: theme.color.border,
    paddingVertical:8, paddingHorizontal:16,
  },
  avatar: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: theme.color.secondary,
    alignItems:'center', justifyContent:'center', marginHorizontal: 8,
  },
  avatarTxt: { color: theme.color.onSecondary, fontWeight:'700' },
  datePill: { paddingHorizontal:10, paddingVertical:4, borderRadius:999, backgroundColor: '#eef1f4' },
  datePillTxt: { fontSize: 11, color: theme.color.mutedText },
  msgRow: { flexDirection:'row', alignItems:'flex-end', marginBottom: 8 },
  nickname: { fontSize: 11, color: theme.color.mutedText, marginBottom: 4, marginLeft: 8 },
  msgLine: { flexDirection:'row', alignItems:'flex-end', gap:6 },
  bubble: { borderRadius: 12, overflow:'hidden' },
  bubbleOwn: { backgroundColor: theme.color.primary },
  bubbleOther: { backgroundColor: '#eef1f4' },
  msgText: { fontSize: 14, lineHeight: 20, color: theme.color.text },
  time: { fontSize: 10, color: theme.color.mutedText },
  footer: {
    position:'absolute', left:0, right:0, bottom:0,
    borderTopWidth:1, borderTopColor: theme.color.border,
    backgroundColor: theme.color.bg, padding: 12,
  },
});
