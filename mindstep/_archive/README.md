# MindStep - Miniproject 2

나를 위한 AI 행동 코칭 애플리케이션

## 주요 기능

### 1. 사용자 인증
- 회원가입 및 로그인
- 4가지 사용자 타입 선택 (Type A/B/C/D)
- MBTI 기반 개인화

### 2. AI 채팅
- 4가지 페르소나 코치
  - 온화한 등대 (Lighthouse)
  - 단호한 교관 - 집중 가이드 (DrillSergeantFocus)
  - 단호한 교관 - 완주 페이스메이커 (DrillSergeantPace)
  - 냉철한 전략가 (Strategist)
- 대화 기록 저장 및 조회
- 채팅 기록 삭제 기능

### 3. 태스크 관리
- 대화에서 자동으로 태스크 추출
- 태스크 생성, 수정, 삭제
- 태스크 상태 관리 (시작, 일시정지, 완료, 포기, 미루기)
- **완료 시 폭죽 이펙트 및 응원 메시지**
- **완료된 태스크 자동 삭제 (DB + 프론트엔드)**
- MBTI 기반 맞춤형 피드백

## 기술 스택

### 백엔드
- Python 3.x
- FastAPI
- SQLite
- Google Gemini API

### 프론트엔드
- React
- JavaScript

## 설치 및 실행

### 1. 환경 설정

`.env` 파일에 Gemini API 키 설정:
```
GEMINI_API_KEY=your_api_key_here
```

### 2. 백엔드 설정

```bash
# Python 패키지 설치
pip install -r requirements.txt

# 데이터베이스 초기화
python min_db.py
```

### 3. 프론트엔드 설정

```bash
# Node.js 패키지 설치
npm install
```

### 4. 실행

**터미널 1 - 백엔드 서버:**
```bash
cd c:\myworkfolder\miniproj_MS\mindstep\miniproject_1
uvicorn loginmain:app --reload --port 8000
```

**터미널 2 - 프론트엔드 개발 서버:**
```bash
cd c:\myworkfolder\miniproj_MS\mindstep\miniproject_1
npm start
```

브라우저에서 `http://localhost:3000` 접속

## 데이터베이스 구조

- `UData.db` - 사용자 인증 정보
- `User.db` - 사용자 프로필 정보
- `chatlog.db` - 채팅 기록
- `task.db` - 태스크 및 액션 로그

## 주요 파일

### 백엔드
- `loginmain.py` - 메인 서버 (인증 및 API 등록)
- `chat_task_api.py` - 채팅 및 태스크 API
- `gemini_service.py` - Gemini API 연동
- `task_feedback_service.py` - MBTI 기반 피드백 생성
- `mbti_guides.py` - MBTI별 가이드
- `min_db.py` - 데이터베이스 초기화

### 프론트엔드
- `src/App.js` - 메인 React 컴포넌트
- `public/` - 정적 파일 (이미지, 아이콘)

## 새로운 기능 (v2)

### 완료 태스크 이펙트
- 완료 버튼 클릭 시 화려한 폭죽 애니메이션
- 응원 메시지와 함께 태스크 제목 표시
- 3초 후 자동으로 이펙트 제거
- 완료된 태스크는 DB와 프론트엔드에서 자동 삭제

### UI 개선
- 태스크 삭제 버튼을 수정 모드에서만 작게 표시
- 채팅 기록 삭제 기능 추가 (설정 패널)

## 라이선스

MIT License
