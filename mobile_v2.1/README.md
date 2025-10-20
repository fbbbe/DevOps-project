# Study-UP Mobile v2.1 (Expo + React Native)

`mobile_v2.1`는 웹(`frontend_v2`) UI/UX를 **Expo 기반 React Native**로 재현한 모바일 앱입니다. 로그인 → 대시보드 → 스터디 생성/상세 → 출석/진행 → 채팅 → 프로필의 흐름을 네이티브 컴포넌트로 구성했고, 현재는 **목업 데이터**로 동작합니다(백엔드 연동 준비됨). 기본 러닝타임·버전/세팅 흐름은 기존 v2 가이드와 동일합니다. 

---

## 🔧 Tech Stack

* **Expo SDK 54**, **React Native 0.81**, **React 19.1** (TypeScript)
* React Navigation (Native Stack + Bottom Tabs)
* `react-native-reanimated` v4, `react-native-gesture-handler`
* 상태/목업: `src/data/*` (필요 시 Context/Service 연결) 

---

## ▶️ Quick Start

```bash
cd mobile_v2.1

# 1) deps
npm install

# 2) Expo SDK 버전에 맞춰 peer/버전 정렬
npx expo install --fix
npx expo-doctor --fix-dependencies

# 3) (필수) Babel preset 보장
npm i -D babel-preset-expo@~54.0.0

# 4) 개발 서버 (캐시 클리어 + 터널)
npx expo start --clear --tunnel
```

> ⚠️ Windows/OneDrive/한글·공백 경로는 워처 문제가 생길 수 있어요. 경로를 `C:\dev\mobile_v2.1`처럼 단순하게 두면 안전합니다. 

---

## 🧠 Babel 설정

루트에 `babel.config.js`(또는 `.cjs`)를 두고 아래처럼 설정하세요.

```js
// babel.config.js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'react-native-worklets/plugin', // Reanimated v4: 마지막에 위치
    ],
  };
};
```

> Reanimated v4는 **`react-native-worklets`** 플러그인이 필요합니다. 

---

## 🗂 Project Structure

```
mobile_v2.1/
├─ App.tsx
├─ babel.config.js
└─ src/
   ├─ components/
   │  ├─ Badge.tsx
   │  ├─ Button.tsx
   │  ├─ Card.tsx
   │  ├─ Input.tsx
   │  ├─ ProgressBar.tsx
   │  ├─ Screen.tsx
   │  ├─ SegmentTabs.tsx
   │  ├─ Select.tsx
   │  └─ ui.tsx
   ├─ data/
   │  ├─ regions.ts
   │  └─ subjects.ts
   ├─ navigation/
   │  └─ AppNavigator.tsx
   ├─ screens/
   │  ├─ AttendanceScreen.tsx
   │  ├─ ChatListScreen.tsx
   │  ├─ CreateStudyScreen.tsx
   │  ├─ DashboardScreen.tsx
   │  ├─ LoginScreen.tsx
   │  ├─ ProfileScreen.tsx
   │  ├─ ProgressScreen.tsx
   │  ├─ StudyChatScreen.tsx
   │  └─ StudyDetailScreen.tsx
   └─ styles/
      └─ theme.ts
```

* **Design Tokens**: 웹(`globals.css/Tailwind 변수`)의 토큰을 `styles/theme.ts`로 매핑해 **웹/모바일 색·라운드·보더 톤**을 통일했습니다.
* **공용 컴포넌트**

  * `ProgressBar` : 웹 `progress.tsx` 톤(배경 primary/20, h=8, 라운드) 그대로
  * `SegmentTabs` : 웹 `tabs.tsx` 톤(rounded, bg-muted, active 카드 보더) 그대로
  * `Select` : placeholder에 **빈 문자열을 쓰지 않도록** 방어(아래 Known Issues 참고)

---

## 🧭 Navigation

* **Root**: Bottom Tabs(홈/진행/채팅/프로필) + Stack(상세/채팅룸/생성 등)
* 로그인 성공 시 `reset({ routes:[{ name:'Root' }] })`로 전환
  (네비게이터에 존재하지 않는 라우트로 `reset/replace` 하지 않도록 주의)

---

## 🧪 Dev Scripts

`package.json`에 아래 스크립트를 추가해두면 편합니다. 

```json
{
  "scripts": {
    "start": "expo start --tunnel -c",
    "android": "expo run:android",
    "ios": "expo run:ios",
    "web": "expo start --web",
    "doctor": "expo-doctor",
    "typecheck": "tsc --noEmit"
  }
}
```

---

## 🛠 Known Issues & Fixes

### 1) Select 값/플레이스홀더

* **증상**: “A `<Select.Item />` must have a value prop that is not an empty string”
* **원인**: placeholder를 `value=""`로 두면 **빈 문자열이 실제 선택값**으로 처리될 수 있음
* **해결**: placeholder는 **선택 항목이 아님**. 상태는 `string | null`로 두고, `null`일 때만 placeholder를 보여주기

```tsx
// 올바른 예
<Select
  value={selected ?? null}
  onChange={(v) => setSelected(v)}
  placeholder="선택하세요"
/>
```

### 2) DatePicker가 안 뜨는 경우(Android)

* `@react-native-community/datetimepicker` 설치 후에도 안 뜨면 **컴포넌트 렌더 대신**
  `DateTimePickerAndroid.open({ ... })`로 **시스템 피커**를 여세요.
* `Pressable` 안에 `Input`을 넣을 땐, 내부 `Input`이 터치를 **가로채지 않도록**
  `<View pointerEvents="none"><Input ... /></View>` 패턴을 사용

### 3) 로그인 후 네비게이션 경고

* **증상**: “The action 'REPLACE/RESET' … screen named 'Root'?”
* **해결**: 실제 네비게이터에 등록된 **정확한 라우트 이름**으로 이동/리셋

```ts
navigation.reset({ index: 0, routes: [{ name: 'Root' }] });
// 또는 로그아웃시
navigation.reset({ index: 0, routes: [{ name: '로그인' }] });
```

### 4) 메인(대시보드) 스크롤 안 됨

* **원인**: 스크롤 컨테이너 부재 또는 상위 Pressable이 제스처 가로채기
* **해결**: 화면 본문을 **단일 `ScrollView`**로 감싸고, 불필요한 상위 Pressable 제거/치환

```tsx
<ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}>
  {/* header / search / segments / list ... */}
</ScrollView>
```

### 5) 채팅 입력창 키보드 겹침

* **해결**: 메시지 리스트 + 입력 바를 **같은 `KeyboardAvoidingView`**로 감싸고,
  `keyboardVerticalOffset`을 헤더 높이 + safe area 만큼 보정

---

## 🔌 백엔드 연동 (다음 단계)

* 인증/프로필/스터디·참여/출석/경고/진행률은 **REST(or GraphQL)** 계층으로 분리해 `services/*`로 연결
* 출석 코드 검증/진행률 집계는 서버(Oracle PL/SQL/ORDS)에서 처리, 앱은 **결과/상태 표시**에 집중

---

## 🧹 코드 스타일 & 접근성

* 컴포넌트는 **터치 타겟 최소 44×44**, 텍스트 대비 WCAG 준수(테마 토큰 사용)
* placeholder는 의미만 제공, **실제 값이 아님**(특히 Select)
* 리스트 성능: 길어질 경우 `FlatList` 채택(현재는 단일 ScrollView도 충분)

---

## Troubleshooting Quick Refs

* `babel-preset-expo` 미설치 → **devDependency**에 명시 후 `npx expo start -c --tunnel` 재실행
* `expo-doctor` 경고 → `expo install`/`expo-doctor --fix-dependencies`로 정리
* 포트 8081 점유 → `netstat -ano | findstr :8081` → `taskkill /PID <PID> /F` 후 재기동 

---

## License

Internal / Project coursework use only. (변경 가능)

---
