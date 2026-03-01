# MindStep 🧠

사용자의 성향을 분석하여 맞춤형 페르소나 코칭을 제공하는 **AI 챗봇 기반 To-Do 관리 웹 애플리케이션**입니다. 
React 프론트엔드와 FastAPI 백엔드, 그리고 Google Gemini AI를 활용하여 단방향적인 할 일 관리를 넘어 심리적 동기부여를 결합한 스마트 시스템을 제공합니다.

---

## 🚀 주요 기능 (Key Features)

1. **페르소나 맞춤형 AI 코칭**
   - 사용자 MBTI 및 행동 데이터 기반으로 4가지 페르소나('온화한 등대', '단호한 교관 - 집중형', '단호한 교관 - 페이스메이커', '냉철한 전략가') 중 하나가 매칭됩니다.
   - 각 페르소나의 성격과 전략에 맞는 말투로 사용자의 업무 완수를 독려합니다.

2. **채팅을 통한 스마트 할 일(Task) 추출**
   - 챗봇과 일상적인 대화나 일정에 대해 이야기하면, AI가 자연어 문맥을 분석하여 **오늘/내일 해야 할 일을 찾아내 To-Do 리스트에 자동으로 등록**해 줍니다.
   - "내일까지 파이썬 과제 끝내야 해" -> 날짜와 할 일을 인식해 Task로 적재.

3. **상황 인지형 Nudge(넛지) 시스템**
   - 사용자가 활동이 없거나(Idle Time) 완료하지 못한 일정이 밀려있을 때, AI가 상황을 판단하여 목표 달성을 돕는 먼저 다가가는 '독려 메시지(Nudge)'를 발송합니다.
   - 방해금지 시간대(23:00~05:00)에는 푸시를 보내지 않는 스마트 제어 기능 포함.

4. **사용자 세션 보안 및 상태 동기화**
   - SQLite 기반 인증(Auth) 시스템으로 로그인/회원가입 세션을 관리합니다.
   - 작업 변경 로그(`action_log`) 및 AI 추출 내역을 모두 DB에 기록하여 통계 및 트래킹이 가능합니다.

---

## 🛠 사용 기술 (Tech Stack)

### Frontend
- **React 19**
- HTML / CSS3
- JavaScript (ES6+)

### Backend
- **FastAPI** (Python 3.x)
- **Google GenAI** (`gemini-2.0-flash` 모델)
- **SQLite3** (RDBMS)
- `python-dotenv`, `uvicorn`

---

## 📁 프로젝트 구조 (Project Architecture)

```text
📦 miniproject_v6_v1
 ┣ 📂 src/                  # React UI 컴포넌트 및 클라이언트 로직
 ┃ ┣ 📂 components/         # Page 및 UI 컴포넌트
 ┃ ┗ 📜 App.js              # 프론트엔드 라우팅 중앙 관리
 ┣ 📂 public/               # React 정적 파일
 ┣ 📜 loginmain.py          # 서버 진입점 (인증/세션 핸들링, CORS)
 ┣ 📜 chat_task_api.py      # Task 관리 및 챗봇 통신 API 라우터
 ┣ 📜 gemini_service.py     # Gemini 연동, 페르소나 시스템 프롬프트 관리 로직
 ┣ 📜 task_feedback_service.py # 할 일 완료/변경 시 피드백 생성 로직
 ┣ 📜 User.db / chatlog.db ... # (로컬 데이터베이스 리스트)
 ┗ 📜 .env                     # (Git Ignore) 환경변수, 시크릿 키 관리
```

---

## ⚙️ 로컬 환경 구축 및 실행 (Getting Started)

> **주의(Warning):** 프로젝트를 원활하게 실행하려면 Google Gemini API Key가 필요합니다. 루트 폴더에 반드시 `.env` 파일을 생성하고 아래 내용을 입력해 주세요.
> ```env
> GEMINI_API_KEY=당신의_제미나이_API_키
> SECRET_KEY=로컬_테스트용_세션_시크릿키
> ```

### 1️⃣ 백엔드(서버) 실행
```bash
# 1. 패키지 설치
pip install -r requirements.txt

# 2. FastAPI 서버 구동 (localhost:8000)
python loginmain.py
```

### 2️⃣ 프론트엔드(클라이언트) 실행
```bash
# 새 터미널 창을 열고 프로젝트 폴더에서
# 1. npm 패키지 설치
npm install

# 2. React 개발 서버 구동 (localhost:3000)
npm start
```

---

## 🔒 보안 및 기여 가이드
- **데이터베이스(`.db`) 파일과 API 키가 든 `.env` 파일은 절대로 리포지토리에 푸시하지 마세요.** `.gitignore` 처리가 필수입니다.
- 개발용 Dummy Data 설정 후 테스트하는 것을 권장합니다.
