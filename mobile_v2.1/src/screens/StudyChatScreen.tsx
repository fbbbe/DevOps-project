import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, KeyboardAvoidingView,
  Platform, TextInput, Keyboard
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Screen from '../components/Screen';
import theme from '../styles/theme';
import { Card, CardContent } from '../components/Card';
import Button from '../components/Button';
import { ArrowLeft, Send, BookOpen } from 'lucide-react-native';

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

const initialMessages: Message[] = [
  { id: '1', userId: '2', userNickname: '영어왕', text: '안녕하세요! 첫 모임 때 준비물이 따로 있을까요?', timestamp: new Date(Date.now() - 3600000) },
  { id: '2', userId: '3', userNickname: '스터디킹', text: '노트북이랑 필기도구 정도면 충분할 것 같아요!', timestamp: new Date(Date.now() - 3000000) },
  { id: '3', userId: '2', userNickname: '영어왕', text: '감사합니다~ 그럼 내일 뵙겠습니다!', timestamp: new Date(Date.now() - 1800000) },
];

export default function StudyChatScreen({ route, navigation }: any) {
  const insets = useSafeAreaInsets();

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

  // ✅ 입력창 자동 높이 증가
  const MIN_H = 44;
  const MAX_H = 140;
  const [tiHeight, setTiHeight] = useState(MIN_H);
  const onInputSize = (e: any) => {
    const h = Math.ceil(e.nativeEvent.contentSize.height);
    setTiHeight(Math.min(MAX_H, Math.max(MIN_H, h)));
  };

  // ✅ 키보드 표시 여부 감지 → 키보드 올라올 때 bottom safe-area 패딩 제거
  const [kbVisible, setKbVisible] = useState(false);
  useEffect(() => {
    const show = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hide = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const s = Keyboard.addListener(show, () => setKbVisible(true));
    const h = Keyboard.addListener(hide, () => setKbVisible(false));
    return () => { s.remove(); h.remove(); };
  }, []);

  const scrollToBottom = () => {
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
    setTiHeight(MIN_H);
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
    return Array.from(map.entries());
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

      {/* 스크롤 + 입력바를 함께 감싸서 키보드 대응 */}
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: 'padding', android: 'height' })}
        keyboardVerticalOffset={insets.top + 48}
        style={{ flex: 1 }}
      >
        <View style={{ flex: 1 }}>
          {/* Messages */}
          <ScrollView
            ref={scrollRef}
            style={{ flex: 1 }}
            contentContainerStyle={{ padding: 16, paddingBottom: 16 }}
            onContentSizeChange={scrollToBottom}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
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

          {/* 하단 입력 바: 가로 꽉 + 자동 줄바꿈 + 세로 자동 증가 */}
          <View
            style={[
              S.footer,
              {paddingTop: kbVisible ? 6 : 12,
        paddingBottom: kbVisible ? 0 : 12 + insets.bottom, } // ✅ 키보드 보일 땐 여분 패딩 제거
            ]}
          >
            <View style={{ flexDirection:'row', alignItems:'flex-end', gap:8 }}>
              <TextInput
                multiline
                value={newMessage}
                onChangeText={setNewMessage}
                onContentSizeChange={onInputSize}
                style={[S.input, { height: tiHeight }]}
                placeholder="메시지를 입력하세요..."
                placeholderTextColor={theme.color.mutedText}
                textAlignVertical="top"
                scrollEnabled={tiHeight >= MAX_H}
                returnKeyType="default"
                blurOnSubmit={false}
                onFocus={scrollToBottom}
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
        </View>
      </KeyboardAvoidingView>
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
    borderTopWidth:1, borderTopColor: theme.color.border,
    backgroundColor: theme.color.bg, padding: 12,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 140,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.color.border,
    backgroundColor: '#fff',
    color: theme.color.text,
    fontSize: 16,
    lineHeight: 20,
    includeFontPadding: false,
  },
});