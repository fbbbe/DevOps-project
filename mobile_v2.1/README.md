# Study-UP Mobile v2.1 (Expo + React Native)

`mobile_v2.1`는 웹 앱(`frontend_v2`)의 UI/UX를 **Expo 기반 React Native**로 재현한 모바일 앱입니다.
현재는 목업 데이터로 동작하며, ORDS/Oracle 연동을 위한 구조가 준비되어 있습니다.

---

## 🚀 Quick Start

```bash
cd mobile_v2.1

# 1) 의존성 설치
npm install

# 2) Expo 호환 버전 정렬
npx expo install --fix

# 3) 개발 서버 실행(스마트폰과 같은 와이파이 연결 필수)
npx expo start --lan

# 3.1) 개발 서버 실행(캐시 클리어 + 터널)
npx expo start --clear --tunnel
```

> Windows 환경에서 경로에 공백/특수문자가 많으면 워처 이슈가 발생할 수 있어요.
> 예: `C:\dev\mobile_v2.1`처럼 단순한 경로를 권장합니다.

---

## 🧰 Tech Stack

* **Expo + React Native + TypeScript**
* React Navigation (Native Stack + Bottom Tabs)
* Reanimated / Gesture Handler
* 프로젝트 전역 디자인 토큰: `src/styles/theme.ts`

---

## 🗂 프로젝트 구조

```
mobile_v2.1/
├─ App.tsx
└─ src/
   ├─ components/
   │  ├─ Badge.tsx
   │  ├─ Button.tsx
   │  ├─ Card.tsx
   │  ├─ Input.tsx
   │  ├─ ProgressBar.tsx      # 웹 Progress 톤 매핑
   │  ├─ Screen.tsx
   │  ├─ SegmentTabs.tsx      # 웹 Tabs 톤 매핑
   │  ├─ Select.tsx
   │  └─ ui.tsx
   ├─ data/
   │  ├─ regions.ts
   │  └─ subjects.ts
   ├─ navigation/
   │  └─ AppNavigator.tsx     # 로그인/루트 스택 + 탭바
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

* **웹 매핑 컴포넌트**

  * `ProgressBar` ↔︎ `frontend_v2/components/ui/progress.tsx`
  * `SegmentTabs` ↔︎ `frontend_v2/components/ui/tabs.tsx`
* **디자인 토큰**: 웹의 색/보더/라운드 톤을 `theme.ts`로 통일

---

## 🧭 네비게이션

* **Root(Tabs)**: 홈(대시보드) / 진행 / 채팅 / 프로필
* **Stack**: 로그인, 스터디 상세, 스터디 생성, 채팅룸 등
* 인증 후: `navigation.reset({ routes: [{ name: 'Root' }] })`로 전환
* 로그아웃: `navigation.reset({ routes: [{ name: '로그인' }] })` 권장

---

## 🧱 코딩 규칙 (요약)

* **한 화면 = 한 스크롤러**: 긴 목록은 `FlatList` or 단일 `ScrollView`
* **터치 히트영역**: 버튼/아이콘은 최소 44×44
* **색/여백**: 반드시 `theme.ts` 사용
* **Form 컴포넌트**

  * `Select`의 placeholder는 *값이 아님*(state는 `string | null`)
  * 날짜 입력은 네이티브 DatePicker 사용
* **접근성**: 텍스트 대비 준수, 중요한 아이콘은 라벨/힌트 제공

---

## 🧪 NPM Scripts (권장)

```json
{
  "scripts": {
    "start": "expo start --tunnel -c",
    "android": "expo run:android",
    "ios": "expo run:ios",
    "web": "expo start --web",
    "typecheck": "tsc --noEmit"
  }
}
```

---

## 🔌 백엔드 연동 가이드(개요)

* ORDS(Oracle REST Data Services) 엔드포인트와 통신하는 `services/*` 레이어 추가
* 주요 도메인: 인증/프로필, 스터디(생성/검색/참여), 출석 코드, 경고/퇴출, 진행률
* 출석/진행률 집계는 서버(PL/SQL) 처리 → 앱은 결과 표시/상태 전이만 수행

---
