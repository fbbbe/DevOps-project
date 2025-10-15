# Study-UP Mobile v2 (React Native)

`mobile_v2`는 Vite 기반 웹 앱(`frontend_v2`)의 화면 흐름과 핵심 기능을 **Expo 기반 React Native**로 이식한 프로젝트입니다. 로그인 이후 대시보드, 스터디 생성/상세, 출석 관리, 진행 현황, 채팅, 프로필 등 주요 화면을 **네이티브 UI**로 재구성했습니다.
현재 데이터는 **목업(mock)** 으로 구성되어 있어, 백엔드 연동 전에도 시연과 UI 작업을 진행할 수 있습니다.

---

## 기술 스택

* **Expo SDK 54** / **React Native 0.81** / **React 19.1**
* TypeScript (strict)
* React Navigation (Native Stack + Bottom Tabs)
* `react-native-reanimated` v4, `react-native-gesture-handler`
* 상태/목업: `src/context`, `src/data`

---

## 실행 전 요구사항 (필수)

* **Node.js ≥ 20.19.4** (권장: 최신 20 LTS 또는 22)

  ```bash
  node -v
  ```
* **Expo Go**(디바이스) 또는 에뮬레이터/시뮬레이터 준비
* Windows에서 OneDrive/한글/공백 경로는 파일 워처 문제를 일으킬 수 있습니다. 문제가 지속되면
  `C:\dev\mobile_v2` 처럼 **짧고 공백 없는 로컬 경로**로 옮겨 실행해 보세요.

---

## 빠른 시작 (Windows/PowerShell 기준)

```powershell
cd mobile_v2

# 1) 의존성 설치
npm install

# 2) Expo SDK 54에 맞게 버전 자동 정렬 (중요)
npx expo install --fix

# 3) 누락된 peer deps 점검 및 자동 수정
npx expo-doctor --fix-dependencies

# 4) (필수) Babel 프리셋을 루트 devDependency로 보장
npm i -D babel-preset-expo@~54.0.0

# 5) Babel 설정 확인/생성
# 파일: babel.config.js (또는 package.json의 "type": "module"이면 babel.config.cjs)
# 내용은 아래 "Babel 설정" 참고

# 6) 개발 서버 실행 (캐시 클리어 + 터널)
npx expo start --clear --tunnel
```

> 포트 **8081**이 사용 중이면 자동으로 다른 포트를 제안합니다. 필요 시 아래 “문제 해결”의 포트 점유 해제를 참고하세요.

---

## Babel 설정

프로젝트 루트에 `babel.config.js`(또는 `.cjs`)가 있어야 합니다.

```js
// babel.config.js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // 기타 플러그인 ...
      'react-native-worklets/plugin', // Reanimated v4 사용 시, 마지막에 위치
    ],
  };
};
```

> `react-native-reanimated` v4부터 **worklets가 분리 패키지**이므로
> `react-native-worklets`와 위 Babel 플러그인이 필요합니다.

---

## NPM 스크립트 (권장)

`package.json`에 다음 스크립트를 추가하면 편합니다.

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

사용 예:

```bash
npm run start
npm run typecheck
npm run doctor
```

---

## 프로젝트 구조

```
mobile_v2/
├── App.tsx                     # AppProvider + NavigationContainer 루트
├── babel.config.js             # Babel 프리셋/플러그인 설정 (필수)
├── src/
│   ├── context/AppContext.tsx  # 글로벌 상태 (사용자, 스터디, 출석, 진행, 채팅)
│   ├── data/mockData.ts        # 목업 데이터
│   ├── navigation/             # 네비게이션 설정 및 타입
│   ├── screens/                # 화면 컴포넌트 (Login, Dashboard, Chat 등)
│   └── types/index.ts          # 공통 타입
└── ...
```

---

## 문제 해결(Troubleshooting)

### 1) `Cannot find module 'babel-preset-expo'`

* 원인: `babel-preset-expo`가 **루트(devDependency)** 로 설치되지 않음(하위 의존성만 존재).
* 해결:

  ```bash
  npm i -D babel-preset-expo@~54.0.0
  # babel.config.js/.cjs에서 presets: ['babel-preset-expo'] 확인
  npx expo start --clear --tunnel
  ```

### 2) `expo-doctor`가 누락된 peer dependencies를 경고

예:

* `expo-font` (요구 주체: `@expo/vector-icons`)
* `react-native-worklets` (요구 주체: `react-native-reanimated` v4)

해결:

```bash
npx expo install expo-font react-native-worklets
npx expo-doctor
```

### 3) 포트 8081 점유로 실행이 8082로 변경

정상 동작이며, 8081을 쓰고 싶다면:

```powershell
netstat -ano | findstr :8081
taskkill /PID <찾은_PID> /F
```

이후 재실행:

```bash
npx expo start --clear --tunnel
```

### 4) Metro 캐시/번들 오류가 잦을 때

```bash
# 서버 종료(Ctrl+C) 후
rm -rf node_modules
rm -f package-lock.json
npm cache verify
npm install
npx expo install --fix
npx expo-doctor --fix-dependencies
npx expo start --clear --tunnel
```

### 5) OneDrive/한글/공백 경로에서 파일 워처 이슈

* 증상: 파일 변경 감지 불안정, 번들 오류 간헐 발생
* 해결: 프로젝트를 `C:\dev\mobile_v2`처럼 **짧고 공백 없는 로컬 경로**로 옮겨 실행

### 6) Expo Go 호환

* 디바이스의 **Expo Go**를 최신으로 유지하세요. SDK 54와 호환되지 않은 Go 버전은 런타임 오류를 유발할 수 있습니다.

---

## 다음 단계 제안

1. **Supabase 인증/데이터 연동**: `AppContext`에 서비스 호출을 연결해 실제 데이터로 전환
2. **Expo Router 도입** 또는 코드 분할로 네비게이션 구조 개선
3. **디자인 시스템**(Tamagui/NativeWind 등) 적용 및 접근성 점검
4. **E2E 테스트**(Detox)와 **유닛 테스트**(Jest/RTL) 도입

---

## 요약

* Node 20+ 환경에서 `npm install → expo install --fix → expo-doctor --fix-dependencies` 순으로 **버전 정렬**
* `babel-preset-expo`를 **루트 devDependency**로 설치하고 **Babel 설정** 확인
* 누락된 **peer deps(`expo-font`, `react-native-worklets`)** 설치
* `expo start --clear --tunnel`로 **캐시 초기화** 후 실행

이 README대로 진행하면 `mobile_v2`의 실행 오류(의존성/바벨/피어 디펜던시/포트 문제)를 안정적으로 재현 없이 해결할 수 있습니다.
---

## 디자인 메모

- `frontend_v2` Tailwind 토큰(`--primary`, `--muted` 등)을 `src/styles/theme.ts`에 매핑해 모바일과 웹이 동일한 색 구성과 대비를 사용합니다.
- 로그인, 대시보드, 상세, 채팅, 출석, 진행, 프로필 화면은 웹 카드와 동일한 라운드/섀도우/보더 스타일을 적용했습니다.
- Expo `LinearGradient`와 `Ionicons` 심볼을 활용해 웹 디자인의 그라데이션과 아이콘 분위기를 재현했습니다.
