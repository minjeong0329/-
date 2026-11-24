# 🌿 미루지마! (MIRUMA) — 캐릭터 기반 미루기 방지 및 자동 일정 관리 웹앱

> **"오늘의 5분이 내일의 5시간을 아껴줍니다."**  
> 미루기 감지, 캐릭터 기반 개입, 스마트 자동 일정 설계, 5분 미세 시작법, 보상 시스템을 결합한 모바일 중심 일정 관리 PWA입니다.

---

## 📌 1. 깃허브(GitHub) 업로드 문제 해결 안내

### ❓ 수동 업로드 시 "파일 크기가 너무 커서 안 올라갑니다" 오류가 났던 원인
- 깃허브 웹 화면의 수동 파일 업로드(Drag & Drop)는 **단일 파일 25MB 이하**, **한 번에 최대 100개 파일**로 제한됩니다.
- 이전 작업 공간에 포함되었던 `tools/` 폴더 및 Node.js 실행 바이너리(`node.exe`, 약 82MB)가 포함되어 깃허브 업로드 용량을 초과했던 것입니다.

### ✅ 조치 및 해결 내역
- **불필요한 대용량 바이너리(`node.exe`, `tools/` 등)를 완전 제거**하였습니다.
- 표준 `.gitignore` 파일을 적용하여 대용량 파일 및 의존성 라이브러리가 깃에 업로드되지 않도록 방지했습니다.
- 이제 전체 프로젝트 용량이 **1MB 미만의 가벼운 순수 소스 코드**로 구성되어, 깃허브 웹에서 수동으로 드래그 앤 드롭해도 즉시 정상 업로드됩니다.

---

## 🚀 2. 깃허브에 올리는 방법 (초보자용 가이드)

### 방법 A. 깃허브 웹사이트에서 수동으로 올리기 (가장 쉬운 방법)
1. [GitHub](https://github.com/)에 로그인 후 새 저장소(New Repository)를 만듭니다. (저장소 이름 예: `miruma-app`)
2. 생성된 저장소 화면에서 **"uploading an existing file"** 또는 **Add file > Upload files** 버튼을 클릭합니다.
3. 현재 폴더(`c:\Users\유아122-00\테스트`)의 모든 파일과 폴더를 선택하여 브라우저 창으로 드래그 앤 드롭합니다.
   - 단, `node_modules` 폴더가 나중에 생성되더라도 이는 올리지 않습니다. (현재 폴더는 순수 소스만 있으므로 전체 선택하여 올리시면 됩니다.)
4. 화면 아래의 **"Commit changes"** 초록색 버튼을 누르면 업로드가 완료됩니다!

### 방법 B. Git 명령어로 올리기 (터미널 사용 시)
```bash
git init
git add .
git commit -m "feat: MIRUMA 미루지마 일정 관리 모바일 앱 완성"
git branch -M main
git remote add origin https://github.com/당신의깃허브아이디/miruma-app.git
git push -u origin main
```

---

## 💻 3. 로컬 환경에서 실행하는 방법

Node.js(v18 이상 권장)가 설치된 환경에서 다음 명령어를 실행합니다.

```bash
# 1. 패키지 의존성 설치
npm install

# 2. 로컬 개발 서버 실행
npm run dev

# 3. 프로덕션 빌드
npm run build
```

개발 서버 실행 후 브라우저에서 `http://localhost:3000`으로 접속하시면 모바일 뷰로 최적화된 앱을 바로 사용하실 수 있습니다.

---

## 🌐 4. 깃허브 페이지(GitHub Pages) 무료 배포 방법

프로젝트의 `.github/workflows/deploy.yml` 파일이 깃허브 액션 배포를 자동으로 지원합니다.

1. 깃허브 저장소 상단의 **Settings** 메뉴로 들어갑니다.
2. 좌측 메뉴의 **Pages**를 클릭합니다.
3. **Build and deployment > Source** 항목을 **GitHub Actions**로 선택합니다.
4. 코드를 `main` 브랜치에 푸시하면 약 1~2분 후 자동으로 무료 웹사이트 주소(`https://<아이디>.github.io/<저장소이름>/`)가 생성됩니다.

---

## 📱 5. 주요 구현 기능

### 1) 온보딩 (Onboarding)
- 사용자의 기상 시간(`07:30`) 및 취침 시간(`23:30`) 설정
- 선호 집중 시간대(오전, 오후, 저녁, 심야) 및 기본 집중/휴식 시간 설정
- 3단계 압박 강도 선택 (🌱 순한맛 / ⚖️ 기본맛 / 🌶️ 매운맛)
- 함께할 매니저 캐릭터 이름 지정

### 2) 캐릭터 브랜드 & 반응형 인터랙션
- 오리지널 생명체 캐릭터 **'미루미(Mirumi)'** SVG 벡터 애니메이션
- 8가지 상황별 상태 완벽 지원:
  - `idle`: 기본 상태 (온화한 눈 깜빡임, 공중에 둥실)
  - `prompt`: 작업 시작 독려 (손 흔들기, 에너지 넘치는 표정)
  - `delay_warning`: 미루는 상황 (팔짱 끼고 의심스러운 눈초리)
  - `repeated_delay`: 반복 지연 (식은땀, 시계를 들고 귀여운 잔소리)
  - `focusing`: 집중하는 상황 (열정 머리띠 착용, 몰입 표정)
  - `completed`: 작업 완료 (만세 점프, 별빛 눈, 축하 파티클)
  - `rest`: 휴식 및 응원 (따뜻한 차 마시기, 포근한 휴식)
  - `daily_goal_achieved`: 하루 목표 달성 (금빛 왕관, 별 메달 수여)
- 선택한 압박 강도에 맞춘 위트 있는 한국어 말풍선 대화 시스템

### 3) 스마트 자동 일정 생성 (Auto Scheduling)
- 사용자의 가용 시간과 취침 시간을 고려하여 빈틈없이 유연한 일정을 자동 배치
- 고정 일정(회의, 수업 등)은 절대 침범하지 않고 유지
- 마감 기한 긴급도, 중요도, 소요 시간 가중치를 계산하여 우선순위 부여
- 취침 시간을 넘기는 무리한 일정은 **'미배정 작업'**으로 안전하게 분리

### 4) 미루기 감지 및 단계별 개입 (Procrastination Detection)
- 실제 시간(`Date.now()`)을 기준으로 지연 여부 실시간 계산:
  - **시작 시각**: 작업 시작 알림 및 독려
  - **5분 경과**: 캐릭터의 가벼운 넛지 ("5분만 먼저 시도해봐요!")
  - **15분 경과**: 지연 사유 선택 모달 등장
    - *하기 싫어요* → 5분 미세 시작법 추천
    - *너무 어려워요* → 하위 작업 쪼개기 제안
    - *다른 일을 하고 있어요* → 10~15분 단기 연기
    - *시간이 더 필요해요* → 일정 재배치
    - *몸이 좋지 않아요* → 휴식 모드 전환
  - **30분 경과**: 오늘 남은 일정 자동 재배치 제안
- Before & After 비교 모달을 통해 변경된 시간표를 확인 후 승인 적용

### 5) 백그라운드 복원 보장 집중 모드 (Focus Mode)
- **5분 시작 모드**, **25분 뽀모도로 모드**, **사용자 지정 시간**
- 단순 타이머 숫자가 아닌 **실제 시작 시각(Epoch Timestamp)** 기준 계산으로 브라우저 탭 전환, 백그라운드 대기, 새로고침 시에도 오차 없이 시간 복원
- 완료 시 5분 휴식 타이머 자동 연계

### 6) 성장 및 보상 시스템 (Growth & Reward)
- 집중 세션 완료 및 작업 달성 시 **XP 경험치**와 **씨앗 포인트(P)** 지급
- 레벨 업 시스템 (Lv.1 새싹 ~ Lv.10 완성형 프로 매니저)
- **미루미의 방 꾸미기**: 방석, 다육 화분, 스탠드, 벽시계, 러그 등 소품 배치
- **캐릭터 악세서리**: 스마트 안경, 열정 머리띠, 달성의 왕관, 목도리 등 착용
- 중복 완료 반복을 통한 포인트 어뷰징 방지 로직 적용
- 일정 지연이나 실패로 인한 포인트/아이템 박탈 없는 긍정적 강화 설계

### 7) 정직한 통계 분석 (Statistics)
- 작업 완료율, 누적 집중 시간, 지연 횟수, 자주 미루는 카테고리 분석
- 데이터가 부족한 경우 가짜 통계를 꾸며내지 않고 데이터 축적 안내 표시

### 8) 데이터 저장 및 PWA
- **IndexedDB** 및 **LocalStorage Fallback**을 통한 100% 로컬 영구 저장
- PWA `manifest.json`, `sw.js` 탑재로 모바일 홈 화면 추가 및 오프라인 접근 지원
- 외부 유료 API나 서버 전송 없는 완벽한 개인정보 보호

---

## 📂 6. 프로젝트 디렉터리 구조

```text
miruma-app/
├── .github/
│   └── workflows/
│       └── deploy.yml          # 깃허브 페이지 자동 배포 워크플로우
├── .gitignore                  # 대용량 바이너리 및 불필요 파일 제외 설정
├── index.html                  # 모바일 뷰포트 및 메타 태그, PWA 설정
├── package.json                # 프로젝트 메타데이터 및 라이브러리 목록
├── tsconfig.json               # TypeScript 컴파일러 설정
├── vite.config.ts              # Vite 번들러 설정
├── tailwind.config.js          # MIRUMA 전용 컬러 및 애니메이션 테마
├── public/
│   ├── manifest.json           # PWA 웹 앱 매니페스트
│   ├── sw.js                   # 오프라인 캐싱 서비스 워커
│   ├── favicon.svg             # 미루미 파비콘
│   ├── icon-192.svg            # 모바일 홈 화면 아이콘 (192px)
│   └── icon-512.svg            # 모바일 스플래시 아이콘 (512px)
└── src/
    ├── types/
    │   └── index.ts            # 전체 데이터 모델 및 인터페이스 정의
    ├── lib/
    │   ├── storage.ts          # IndexedDB 영구 저장 및 복원 엔진
    │   ├── scheduler.ts        # 스마트 자동 일정 생성 및 재배치 알고리즘
    │   ├── delayEngine.ts      # 미루기 감지 및 맞춤형 솔루션 엔진
    │   └── sound.ts            # Web Audio API 기반 무설치 효과음
    ├── components/
    │   ├── character/
    │   │   ├── MirumiCharacter.tsx   # 8종 상태 및 악세서리 지원 SVG 캐릭터
    │   │   └── SpeechBubble.tsx      # 압박 강도별 동적 말풍선 대화
    │   ├── home/
    │   │   ├── DateHeader.tsx        # 날짜 헤더 및 빠른 추가/배치 버튼
    │   │   ├── WeeklyStrip.tsx       # 주간 달력 탐색 스트립
    │   │   ├── DailyProgressCard.tsx # 오늘의 달성률 프로그레스 카드
    │   │   ├── ActiveTaskCard.tsx    # 진행 중/다음 작업 강조 카드
    │   │   └── TimelineBlock.tsx     # 타임라인 일정 아이템 (체크박스/수정/삭제)
    │   ├── schedule/
    │   │   ├── ScheduleViewToggle.tsx# 월간/주간/일간 뷰 전환 토글
    │   │   ├── MonthView.tsx         # 월간 달력
    │   │   ├── WeekView.tsx          # 주간 타임라인
    │   │   ├── DayView.tsx           # 일간 24시간 상세 뷰
    │   │   ├── TaskModal.tsx         # 작업 등록 및 수정 모달 (하위 작업 지원)
    │   │   └── AutoScheduleModal.tsx # 자동 일정 생성 미리보기 및 적용 모달
    │   ├── focus/
    │   │   ├── FocusTimer.tsx        # 백그라운드 동기화 집중 타이머
    │   │   └── BreakTimer.tsx        # 휴식 모드 타이머
    │   ├── delay/
    │   │   ├── DelayInterventionModal.tsx # 미루기 개입 및 사유 선택 모달
    │   │   └── RescheduleDiffModal.tsx    # 일정 재배치 전후 비교 모달
    │   ├── manager/
    │   │   ├── CharacterRoom.tsx     # 미루미의 방 및 꾸미기 아이템 관리
    │   │   ├── ItemShop.tsx          # 씨앗 상점 (악세서리 및 가구 구매)
    │   │   ├── StatisticsView.tsx    # 정직한 데이터 통계 분석 뷰
    │   │   └── PreferencesSettings.tsx# 생활 패턴 및 알림 설정
    │   ├── onboarding/
    │   │   └── OnboardingModal.tsx   # 3단계 생활 패턴 온보딩
    │   └── common/
    │       ├── Header.tsx            # 상단 헤더 (포인트, 휴식 모드)
    │       ├── BottomNav.tsx         # 4개 하단 탭 내비게이션
    │       ├── Modal.tsx             # 접근성 공통 모달
    │       └── Toast.tsx             # 상태 토스트 알림
    ├── App.tsx                 # 최상위 상태 관리 및 오케스트레이션
    ├── main.tsx                # React 엔트리포인트
    └── index.css               # Tailwind 및 모바일 Safe Area 스타일
```

---

## 🎨 7. 디자인 시스템 (Design System)

- **Background**: `#F8F7F2` (부드러운 아이보리 페이퍼)
- **Primary**: `#D5E5B5` (싱그러운 말차 새싹 그린)
- **Secondary**: `#778C59` (단단하고 차분한 올리브 그린)
- **Text**: `#292D27` (가독성 높은 짙은 차콜)
- **Accent**: `#F0AA95` (따뜻한 피치 코랄)
- **Typography**: Pretendard, sans-serif
- **Touch Areas**: 모든 주요 상호작용 버튼 최소 44px 터치 영역 확보
- **Mobile Optimized**: 320px ~ 430px 반응형 모바일 최적화 및 모바일 Safe Area 대응
