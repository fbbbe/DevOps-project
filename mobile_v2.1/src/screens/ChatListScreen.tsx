import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import Screen from '../components/Screen';
import theme from '../styles/theme';
import { Card, CardContent, CardHeader, CardTitle } from '../components/Card';
import Button from '../components/Button';
import { BookOpen, MessageSquare } from 'lucide-react-native';

type Study = {
  id: string;
  name: string;
  description: string;
  currentMembers: number;
};

type User = { id: string; nickname: string };

export default function ChatListScreen({ route, navigation }: any) {
  const user: User = route?.params?.user ?? { id: 'me', nickname: '나' };

  // 웹 ChatList처럼 myStudies를 받아서 렌더 (없으면 샘플로 표시)  :contentReference[oaicite:1]{index=1}
  const [myStudies] = useState<Study[]>(
    route?.params?.myStudies ?? [
      { id: 's1', name: '영문법 스터디', description: '매주 화/목 오전 9시 · 문법/독해', currentMembers: 6 },
      { id: 's2', name: '토익 900+', description: '파트5/6 집중, 주 3회', currentMembers: 8 },
    ]
  );

  const AvatarFallback = ({ name }: { name: string }) => (
    <View style={S.avatar}>
      <Text style={S.avatarTxt}>{name.charAt(0)}</Text>
    </View>
  );

  return (
    <Screen withPadding={false}>
      {/* Header */}
      <View style={S.header}>
        <View style={{ flexDirection:'row', alignItems:'center', gap:8 }}>
          <BookOpen size={20} color={theme.color.primary} />
          <Text style={{ fontSize:16, fontWeight:'700', color: theme.color.text }}>채팅</Text>
        </View>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 24 }}>
        {myStudies.length === 0 ? (
          <View style={S.empty}>
            <MessageSquare size={48} color={theme.color.mutedText} />
            <Text style={{ color: theme.color.mutedText, marginTop: 8 }}>참여 중인 스터디가 없습니다.</Text>
            <Text style={{ color: theme.color.mutedText, fontSize: 12, marginTop: 4 }}>
              스터디에 참여하면 채팅을 시작할 수 있습니다.
            </Text>
          </View>
        ) : (
          <View style={{ gap: 12 }}>
            {myStudies.map((study) => (
              <Pressable
                key={study.id}
                onPress={() => navigation?.navigate?.('채팅', { study, user })} // 👉 채팅방 화면으로 이동
                style={{ borderRadius: 12, overflow:'hidden' }}
              >
                <Card>
                  <CardContent style={{ padding: 14 }}>
                    <View style={{ flexDirection:'row', alignItems:'center', gap:12 }}>
                      <AvatarFallback name={study.name} />
                      <View style={{ flex:1, minWidth: 0 }}>
                        <View style={{ flexDirection:'row', justifyContent:'space-between', alignItems:'center' }}>
                          <CardTitle style={{ fontSize: 15 }} numberOfLines={1}>{study.name}</CardTitle>
                          <Text style={{ fontSize: 12, color: theme.color.mutedText }}>{study.currentMembers}명</Text>
                        </View>
                        <Text style={{ fontSize: 12, color: theme.color.mutedText }} numberOfLines={1}>
                          {study.description}
                        </Text>
                      </View>
                    </View>
                  </CardContent>
                </Card>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

const S = StyleSheet.create({
  header: {
    flexDirection:'row', alignItems:'center', justifyContent:'space-between',
    borderBottomWidth:1, borderBottomColor: theme.color.border,
    paddingVertical:8, paddingHorizontal:16,
  },
  avatar: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: theme.color.secondary,
    alignItems:'center', justifyContent:'center',
  },
  avatarTxt: { color: theme.color.onSecondary, fontWeight:'700', fontSize: 16 },
  empty: { alignItems:'center', paddingVertical: 48 },
});
