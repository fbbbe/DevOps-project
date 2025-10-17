export const theme = {
  color: {
    bg: '#ffffff',
    text: '#141414',
    border: '#e5e7eb',
    card: '#ffffff',
    // 버튼/상태
    primary: '#2d6cdf',
    onPrimary: '#ffffff',
    secondary: '#f3f4f6',
    onSecondary: '#141414',
    ghostBg: 'transparent',
    link: '#2d6cdf',
    // 경고/위험/포커스
    destructive: '#d4183d',
    onDestructive: '#ffffff',
    ring: 'rgba(45,108,223,0.28)',
    // 입력
    inputBg: '#f7f7f9',
    mutedText: '#6b7280',
  },
  radius: { sm: 8, md: 12, lg: 10, xl: 14, full: 999 },
  space:  { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 },
} as const;
export type Theme = typeof theme;
export default theme;
