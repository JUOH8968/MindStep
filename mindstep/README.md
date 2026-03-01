# MindStep 

React 프론트엔드와 FastAPI 백엔드가 결합된 AI 챗봇 및 태스크 관리(To-Do) 웹 애플리케이션입니다. Google Gemini AI 모델을 연동하여 사용자의 성향 분석, 페르소나 맞춤형 코칭(넛지), 채팅 대화 속에서 자동으로 할 일을 추출해 내는 기능이 특징입니다.

## 🚀 프로젝트 주요 기능 (Features)

1. **사용자 맞춤형 AI 코칭 (Persona System)**
   - 사용자의 성향이나 MBTI에 맞춰 네 가지 페르소나('온화한 등대', '단호한 교관 (집중)', '단호한 교관 (완주)', '냉철한 전략가') 중 하나가 배정되어 알맞은 톤으로 피드백을 제공합니다.
2. **AI 스마트 할 일(Task) 추출**
   - 챗봇과 대화하는 도중, 내일 할 일이나 오늘 끝내야 할 과제 등을 말하면 **AI가 문맥을 분석하여 자동으로 To-Do 리스트에 일정을 등록**해 줍니다.
3. **스마트 넛지 (Nudging) 시스템**
   - 사용자가 활동이 없거나 진행 중인 스케줄이 밀릴 때, AI가 상황과 성향을 분석해 먼저 독려 메시지(넛지)를 보냅니다.
4. **회원가입 및 세션 로그인**
   - SQLite 기반 사용자 인증, 동기화된 프로필 관리 기능이 포함되어 있습니다.

---

## 🛠 기술 스택 (Tech Stack)

### **Frontend**
- **React 19**
- **JavaScript (ES6+)**
- HTML5 / CSS3

### **Backend**
- **FastAPI** (Python 3.x)
- **Google GenAI** (`gemini-2.0-flash` 모델 연동)
- **SQLite** (로컬 DB)
- `python-dotenv` (환경 변수 관리)
- `uvicorn` (서버 구동)

---

## 📥 설치 및 실행 방법 (Getting Started)

### 1. 소스 코드 클론
```bash
git clone https://github.com/사용자이름/miniproject.git
cd miniproject
```

### 2. 백엔드 (FastAPI) 설정 및 실행
```bash
# 1. 가상환경 생성 및 활성화
python -m venv venv
source venv/bin/activate       # Mac/Linux
.\venv\Scripts\activate        # Windows

# 2. 패키지 설치
pip install -r requirements.txt

# 3. 환경 변수 설정
# 루트 폴더에 .env 파일을 생성하고 아래 값을 입력합니다.
# GEMINI_API_KEY=당신의_발급받은_Gemini_API_Key
# SECRET_KEY=원하는_시크릿_키_문자열

# 4. 서버 실행 (http://localhost:8000)
python loginmain.py
```

### 3. 프론트엔드 (React) 설정 및 실행
```bash
# 1. 터미널을 새로 열어 프로젝트 루트 폴더에서 패키지 설치
npm install

# 2. React 개발 서버 실행 (http://localhost:3000)
npm start
```

---

## 📁 프로젝트 폴더 구조 (Folder Structure)

```text
📦 miniproject_v6_v1
 ┣ 📂 src/                  # React 프론트엔드 소스코드
 ┃ ┣ 📂 components/         # 화면 컴포넌트 모음 (Login, SignUp 등)
 ┃ ┗ 📜 App.js              # 프론트엔드 메인 로우팅
 ┣ 📂 public/               # React 정적 파일
 ┣ 📜 loginmain.py          # FastAPI 실행 및 인증(로그인) 관리
 ┣ 📜 chat_task_api.py      # 채팅 API & 할 일(Task) 관리 DB 핸들러
 ┣ 📜 gemini_service.py     # Google Gemini AI 연동 및 프롬프트 제어 모듈
 ┣ 📜 task_feedback_service.py # 작업 완료/수정 시 코멘트 피드백 모듈
 ┣ 📜 User.db / chatlog.db 등  # (Git 제외 파일) 로컬 데이터베이스
 ┣ 📜 .env                     # (Git 제외 파일) 환경변수, API 키 설정용
 ┗ 📜 package.json / requirements.txt # 패키지 매니저 파일
```

---

## 🔒 정보 보호 및 보안
이 레포지토리에는 사용자 보호를 위해 실제 DB(`*.db`)와 환경 변수(`.env`) 파일이 업로드되지 않습니다. 따라서 클론 후에는 **반드시 본인의 `GEMINI_API_KEY`를 넣은 `.env` 파일을 직접 생성하고 실행하셔야 합니다.**
