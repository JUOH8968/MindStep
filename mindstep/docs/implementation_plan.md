# v5 생성 구현 계획

mindstep_for nudge의 페르소나 넛지 기능을 v4에 통합하여 v5를 생성합니다.

## 분석 결과

### mindstep_for nudge 구조 분석

#### 1. [prompts.py](file:///c:/Users/Admin/Documents/GitHub/mindstep/miniproject/mindstep_for%20nudge/mindstep/prompts.py)
- **SYSTEM_PROMPTS**: 4가지 페르소나 타입별 상세 프롬프트
  - A_LIGHTHOUSE (60~90분 간격)
  - B_INSTRUCTOR (5~10분 간격)
  - C_INSTRUCTOR (20~30분 간격)
  - D_STRATEGIST (40~50분 간격)
- **템플릿 시스템**:
  - OPENING_GREETING_TEMPLATE: 첫 인사/복귀 멘트
  - NUDGE_TEMPLATE: 실시간 넛지 메시지 (idle time, 넛지 횟수 기반)
  - FEEDBACK_TEMPLATE: Task 완료 피드백
  - MEMORY_INSTRUCTION: 사용자 정보 기억 지침
  - ALARM_INSTRUCTION: 알림 요청 처리

#### 2. [persona_manager.py](file:///c:/Users/Admin/Documents/GitHub/mindstep/miniproject/mindstep_for%20nudge/mindstep/persona_manager.py)
- **PersonaManager 클래스**:
  - `determine_persona()`: 설문 응답 기반 페르소나 결정
  - `get_system_prompt()`: 페르소나별 시스템 프롬프트 생성
  - `get_nudge_message()`: 넛지 메시지 프롬프트 생성

#### 3. [chat_manager.py](file:///c:/Users/Admin/Documents/GitHub/mindstep/miniproject/mindstep_for%20nudge/mindstep/chat_manager.py)
- **ChatManager 클래스**:
  - Gemini API 클라이언트 관리
  - `start_chat()`: 시스템 인스트럭션으로 채팅 시작
  - `send_message()`: 대화 히스토리 관리 및 메시지 전송
  - `generate_nudge()`: 넛지 메시지 생성 (one-off)

### v4 구조

- **백엔드**:
  - `gemini_service.py`: 페르소나별 프롬프트, Task 추출, 넛지 메시지 생성
  - `chat_task_api.py`: 채팅/Task API, 넛지 폴링 API
  - `loginmain.py`: FastAPI 앱 및 핸들러 등록
- **프론트엔드**:
  - `App.js`: 메인 앱 (로그인/회원가입 라우팅)
  - `PersonaCoachApp.js`: 실제 채팅 및 Task 관리 UI

## 통합 전략

### 핵심 개선사항

1. **페르소나 시스템 강화**
   - mindstep_for nudge의 상세한 SYSTEM_PROMPTS 활용
   - 페르소나별 넛지 간격 설정 (현재 v4는 고정 5분)
   
2. **넛지 템플릿 시스템 도입**
   - NUDGE_TEMPLATE 활용으로 더 정교한 넛지 메시지 생성
   - idle_time, nudge_count 기반 메시지 조정
   
3. **메모리 및 알림 기능**
   - MEMORY_INSTRUCTION 통합
   - ALARM_INSTRUCTION 통합 (선택사항)

4. **ChatManager 패턴 적용**
   - 대화 히스토리 관리 개선
   - system_instruction 활용

## 제안된 변경사항

### v5 디렉토리 구조

```
miniproject_v5/
├── backend/
│   ├── gemini_service.py (개선)
│   ├── chat_task_api.py (개선)
│   ├── loginmain.py (유지)
│   ├── persona_config.py (NEW - mindstep_for nudge에서 가져오기)
│   └── task_feedback_service.py (유지)
├── src/
│   ├── App.js (유지)
│   └── components/
│       └── pages/
│           └── PersonaCoachApp.js (개선)
└── databases/ (유지)
```

### 주요 파일 변경사항

#### 1. [NEW] `persona_config.py`
mindstep_for nudge의 persona_config.py를 가져와서 설문 기반 페르소나 결정 로직 추가

#### 2. [MODIFY] `gemini_service.py`
- mindstep_for nudge의 SYSTEM_PROMPTS로 교체
- PersonaManager 패턴 적용
- ChatManager 패턴 적용 (대화 히스토리 관리)
- `generate_nudge_message()` 개선: NUDGE_TEMPLATE 활용

#### 3. [MODIFY] `chat_task_api.py`
- 넛지 폴링 API 개선: 페르소나별 간격 설정
- nudge_count 추가 (반복 넛지 횟수 추적)
- idle_time 계산 및 전달

#### 4. [MODIFY] `PersonaCoachApp.js`  
- 페르소나별 넛지 간격 설정
- nudge_count UI 표시 (선택사항)

## 구현 순서

1. ✅ v5 디렉토리 생성
2. ✅ v4 파일들을 v5로 복사
3. ✅ persona_config.py 추가 (mindstep_for nudge에서)
4. ✅ gemini_service.py 수정
5. ✅ chat_task_api.py 수정
6. ✅ PersonaCoachApp.js 수정 (또는 사용자 가이드 제공)
