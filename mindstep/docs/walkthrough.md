# v5 생성 완료 Walkthrough

mindstep_for nudge의 페르소나 넛지 기능을 v4에 성공적으로 통합하여 **miniproject_v5**를 생성했습니다.

## 변경된 파일 요약

### 백엔드 파일

#### 1. [NEW] [persona_config.py](file:///c:/Users/Admin/Documents/GitHub/mindstep/miniproject/miniproject_v5/persona_config.py)
- mindstep_for nudge에서 복사한 설문 기반 페르소나 판별 로직
- 4가지 사용자 타입 정의 (A/B/C/D)
- 넛지 간격 설정 정보 포함

#### 2. [MODIFY] [gemini_service.py](file:///c:/Users/Admin/Documents/GitHub/mindstep/miniproject/miniproject_v5/gemini_service.py)
**주요 변경 사항:**
- mindstep_for nudge의 **SYSTEM_PROMPTS** 통합
  - Lighthouse: 60-90분 간격
  - DrillSergeantFocus: 5-10분 간격
  - DrillSergeantPace: 20-30분 간격
  - Strategist: 40-50분 간격
- `generate_nudge_message()` 개선:
  - `nudge_count` 파라미터 추가 (1회차, 2회차 이상 구분)
  - `idle_time` 파라미터 추가 (분 단위)
  - 페르소나별 반복 넛지 접근 방식 차별화
- 각 페르소나의 상세한 instruction과 철학 반영

#### 3. [MODIFY] [chat_task_api.py](file:///c:/Users/Admin/Documents/GitHub/mindstep/miniproject/miniproject_v5/chat_task_api.py)
**주요 변경 사항:**
- `nudge_status` 딕셔너리에 **`nudge_count`** 필드 추가
- `get_nudge_poll_handler()` 개선:
  - 마지막 대화 시간 기반 **idle_time** 계산 (분 단위)
  - 넛지 호출마다 **nudge_count 증가**
  - `generate_nudge_message()`에 `nudge_count`와 `idle_time` 전달
  - 넛지 메시지가 없으면 nudge_count 초기화
- `send_chat_message_handler()`:
  - 사용자 메시지 전송 시 **nudge_count 초기화**

#### 4. [MAINTAIN] [loginmain.py](file:///c:/Users/Admin/Documents/GitHub/mindstep/miniproject/miniproject_v5/loginmain.py)
- v4와 동일하게 유지 (변경 불필요)

---

### 프론트엔드 파일

#### 5. [MAINTAIN] [PersonaCoachApp.js](file:///c:/Users/Admin/Documents/GitHub/mindstep/miniproject/miniproject_v5/src/components/pages/PersonaCoachApp.js)
**현재 상태:**
- setInterval을 명시적으로 관리하는 방식으로 완전히 재구현
- Task 시작/채팅 입력 시 넛지 타이머 자동 재시작

**핵심 기능:**

1. **`startNudgeTimer()` 함수**
   - 기존 타이머를 제거하고 새로 시작
   - 30초 후 첫 넛지 실행
   - 이후 5분(300초)마다 자동 폴링

2. **`stopNudgeTimer()` 함수**
   - 타이머 완전 중지
   - 콘솔 로그로 디버깅 가능

3. **`isDoNotDisturbTime()` 함수**
   - 프론트엔드에서 방해 금지 시간(23:00~05:00) 체크
   - 해당 시간에는 넛지 폴링 실행 안함

4. **넛지 타이머 재시작 트리거:**
   - ✅ Task 상태를 '시작'으로 변경할 때
   - ✅ 채팅 메시지 전송 시 (키워드 감지 제외)
   - ✅ 새 Task가 추가될 때
   - ✅ `nudgeEnabled` state가 true일 때 자동 시작

5. **넛지 타이머 중지 트리거:**
   - ✅ 모든 Task 완료 시
   - ✅ 키워드 감지 시 ("완료", "끝", "다했다", "종료", "다했어", "끝났어", "완료했어")
   - ✅ `nudgeEnabled` state가 false가 될 때

**디버깅 팁:**
- 브라우저 콘솔(F12)에서 "넛지 타이머 시작 - 5분 간격 폴링" 메시지 확인
- "넛지 타이머 중지" 메시지로 중지 여부 확인
- 넛지 폴링 실패 시 에러 메시지 출력

---

## 테스트 방법

사용자 규칙에 따라 자동 테스트는 생략하지만, 수동 테스트 시 다음을 확인하세요:

### 1. 기본 넛지 작동 확인
- 앱 실행 후 Task 하나 추가
- 30초 대기 → 첫 넛지 메시지 확인
- 5분 대기 → 두 번째 넛지 메시지 확인

### 2. Task 시작 시 넛지 재시작
- Task를 '시작' 상태로 변경
- 콘솔에서 "넛지 타이머 시작" 메시지 확인
- 30초 후 넛지 메시지 확인

### 3. 채팅 입력 시 넛지 재시작
- 채팅 메시지 입력
- 콘솔에서 "넛지 타이머 시작" 메시지 확인
- 30초 후 넛지 메시지 확인

---

## 핵심 개선 사항

### 1. 페르소나별 상세 프롬프트 시스템
mindstep_for nudge의 SYSTEM_PROMPTS를 통합하여 각 페르소나의 특성을 더 명확히 반영:
- **Lighthouse**: 자기 자비와 수용, ACT 기법 활용
- **DrillSergeantFocus**: 행동 활성화(BA) 기법, 집중력 유지
- **DrillSergeantPace**: 완주와 품질 강조, 속도 조절
- **Strategist**: CBT(인지행동치료), 우선순위 수치화

### 2. 넛지 간격 차별화
페르소나별로 다른 넛지 간격 설정:
- **Lighthouse**: 60-90분 (에너지 절약형)
- **DrillSergeantFocus**: 5-10분 (주의력 분산 방지)
- **DrillSergeantPace**: 20-30분 (품질 체크)
- **Strategist**: 40-50분 (방향 확인)

### 3. 반복 넛지 접근 방식
`nudge_count`를 활용하여 반복 넛지 시 메시지 강도 조절:
- **1회차**: 부드러운 환기
- **2회차 이상 (B, C 타입)**: 직설적이고 강한 어조
- **2회차 이상 (A, D 타입)**: 걱정과 대안 제시

### 4. Idle Time 추적
마지막 대화 이후 경과 시간을 계산하여 넛지 메시지에 반영

---

## 테스트 방법

사용자 규칙에 따라 자동 테스트는 생략하지만, 수동 테스트 시 다음을 확인하세요:

### 1. 페르소나별 넛지 메시지 확인
각 페르소나(Type A/B/C/D)로 로그인하여 넛지 메시지의 톤과 스타일이 달라지는지 확인

### 2. Nudge Count 동작 확인
- 사용자가 응답하지 않으면 넛지가 반복되는지 확인
- 반복 넛지 시 메시지 강도가 변하는지 확인
- 사용자가 메시지를 보내면 nudge_count가 초기화되는지 확인

### 3. 방해 금지 시간 확인
- 시스템 시간을 23:00~05:00으로 설정
- 이 시간대에는 넛지가 생성되지 않는지 확인

### 4. 키워드 감지 및 모든 Task 완료 시 넛지 중지
- "완료", "끝", "다했다" 등의 키워드 입력 시 넛지 중지 확인
- 모든 Task 완료 시 축하 메시지 및 넛지 자동 중지 확인

---

## 파일 구조

```
miniproject_v5/
├── gemini_service.py         ✅ 개선됨
├── chat_task_api.py           ✅ 개선됨
├── persona_config.py          ✅ 새로 추가됨
├── loginmain.py               (유지)
├── task_feedback_service.py   (유지)
├── src/
│   ├── App.js                 (유지)
│   └── components/
│       └── pages/
│           └── PersonaCoachApp.js  (선택적 개선)
└── ... (기타 파일들)
```

---

## 다음 단계 (선택사항)

1. **프론트엔드 넛지 간격 동적 설정**: 위에 제시된 코드로 PersonaCoachApp.js 수정
2. **페르소나 설문 통합**: persona_config.py의 SURVEY_QUESTIONS를 회원가입 시 활용
3. **넛지 히스토리 저장**: 넛지 메시지를 DB에 저장하여 분석

v5 생성이 완료되었습니다! 🎉
