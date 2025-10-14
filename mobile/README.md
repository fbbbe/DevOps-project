# DevOps Mobile (React Native / Expo)

웹 프론트엔드(frontend_v1)의 로그인/회원가입 기능을 모바일로 옮긴 앱입니다. Expo(Managed) 환경을 사용합니다.

## 진행 상황
- 로그인/회원가입/홈 화면 구현 완료
- React Navigation 스택 구성 완료 (`@react-navigation/native`, `@react-navigation/native-stack`)
- Expo SDK 54 기준으로 의존성 정렬 완료
- 네트워크 연결 이슈 대비: 터널 모드 실행 가이드 포함

## 실행 방법(권장 순서)
1) 의존성 설치
```
cd mobile
npm install
npx expo install --fix
```

2) 터널 모드 + 캐시 초기화로 실행(캠퍼스 Wi‑Fi 등에서도 안정적)
```
npx expo start --tunnel -c
```
- QR 코드 스캔(Expo Go) 또는 터미널 단축키: Android `a` / iOS `i` / 웹 `w`

3) 문제 해결 팁(빨간 화면 또는 연결 문제 시)
- Expo Go를 최신으로 업데이트하고, 앱을 완전히 종료 후 재실행
- `npx expo doctor --fix` 실행으로 의존성 자동 정렬
- 여전히 `PlatformConstants` 관련 에러가 나오면:
  - `App.js` 최상단에 임포트 존재 확인: `import 'react-native-gesture-handler';`
  - `rd /s /q node_modules && del package-lock.json && npm install` 후 재시도
- 같은 네트워크 문제 시: 터널 모드(`--tunnel`) 사용 권장
- Windows에서 한글/공백 경로 문제 발생 시: 더 짧고 ASCII-only 경로로 옮겨서 재시도

## 폴더 구조
- `App.js`: 네비게이션 및 화면 등록 (로그인, 회원가입, 홈)
- `src/screens/LoginScreen.js`: 로그인 화면
- `src/screens/RegisterScreen.js`: 회원가입 화면
- `src/screens/HomeScreen.js`: 로그인/회원가입 후 간단한 정보 표시
- `src/services/auth.js`: 인증 로직(현재 Mock), 추후 fetch로 실제 API 연동
- `src/config.js`: API 기본 주소 설정

## 백엔드 연동(다음 단계)
- `src/config.js`의 `API_BASE_URL`을 실제 백엔드 주소로 변경
- `src/services/auth.js`의 주석 처리된 `fetch` 예시를 활성화하고, 실제 엔드포인트(`/auth/login`, `/auth/register`)에 맞게 수정
- 토큰 보관이 필요하면 `expo-secure-store` 사용 권장

## 현재 의존성(주요 버전)
- `expo`: `~54.0.0`
- `react`: `18.2.0`
- `react-native`: `0.76.5`
- `react-native-gesture-handler`: `~2.16.2`
- `react-native-safe-area-context`: `~4.10.5`
- `react-native-screens`: `~3.31.1`

필요 시 SDK 55+로 업그레이드할 수 있으나, 현재는 Expo Go(SDK 54)와 호환되도록 구성되어 있습니다.
