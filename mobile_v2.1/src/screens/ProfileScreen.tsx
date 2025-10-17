import React from 'react';
import { View, Text } from 'react-native';
import theme from '../styles/theme';
export default function ProfileScreen() {
  return <View style={{ flex:1, backgroundColor: theme.color.bg, padding:16 }}><Text>프로필</Text></View>;
}
