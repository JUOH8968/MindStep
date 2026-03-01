# 📋 AWS EC2 배포 체크리스트

배포 과정에서 놓치기 쉬운 부분들을 체크리스트로 정리했습니다.

---

## ✅ 배포 전 준비사항

### AWS 계정 및 설정
- [ ] AWS 계정 생성 완료
- [ ] 결제 정보 등록 완료
- [ ] IAM 사용자 생성 (선택사항)
- [ ] AWS CLI 설치 (선택사항)

### 로컬 환경
- [ ] Gemini API 키 확인 (`gemini_service.py` 7번 줄)
- [ ] 프로젝트가 로컬에서 정상 작동 확인
  - [ ] 백엔드: `uvicorn loginmain:app --reload`
  - [ ] 프론트엔드: `npm start`
- [ ] 데이터베이스 초기화 확인: `python min_db.py`
- [ ] Git 저장소 설정 (선택사항)

---

## ✅ EC2 인스턴스 생성

### 인스턴스 설정
- [ ] AMI: Ubuntu Server 22.04 LTS 선택
- [ ] 인스턴스 타입: t2.small 이상 (권장: t2.medium)
- [ ] 키 페어 생성 및 다운로드
  - [ ] `.pem` 파일 안전한 위치에 저장
  - [ ] 파일 경로 기록: `___________________`

### 보안 그룹 설정
- [ ] SSH (22): 내 IP 또는 0.0.0.0/0
- [ ] HTTP (80): 0.0.0.0/0
- [ ] HTTPS (443): 0.0.0.0/0
- [ ] Custom TCP (8000): 0.0.0.0/0

### 스토리지
- [ ] 최소 30GB gp3 설정

### 인스턴스 정보 기록
- [ ] 퍼블릭 IP: `___________________`
- [ ] 인스턴스 ID: `___________________`
- [ ] 리전: `___________________`

---

## ✅ 서버 초기 설정

### SSH 접속
- [ ] SSH 접속 성공
  ```bash
  ssh -i mindstep-key.pem ubuntu@YOUR_EC2_IP
  ```
- [ ] 시스템 업데이트 완료
  ```bash
  sudo apt update && sudo apt upgrade -y
  ```

### 필수 소프트웨어 설치
- [ ] Python 3.11 설치 확인
  ```bash
  python3.11 --version
  ```
- [ ] Node.js 18.x 설치 확인
  ```bash
  node --version
  npm --version
  ```
- [ ] Git 설치 확인
  ```bash
  git --version
  ```
- [ ] Nginx 설치 및 실행 확인
  ```bash
  sudo systemctl status nginx
  ```
- [ ] PM2 설치 확인
  ```bash
  pm2 --version
  ```

---

## ✅ 프로젝트 배포

### 파일 업로드
- [ ] 프로젝트 파일 EC2에 업로드 완료
  - [ ] SCP 사용 또는
  - [ ] Git clone 사용
- [ ] 파일 권한 확인
  ```bash
  ls -la /home/ubuntu/miniproject_v2
  ```

### Python 백엔드 설정
- [ ] 가상환경 생성
  ```bash
  python3.11 -m venv venv
  ```
- [ ] 가상환경 활성화
  ```bash
  source venv/bin/activate
  ```
- [ ] 패키지 설치
  ```bash
  pip install -r requirements.txt
  ```
- [ ] 데이터베이스 초기화
  ```bash
  python min_db.py
  ```
- [ ] FastAPI 테스트 실행
  ```bash
  uvicorn loginmain:app --host 0.0.0.0 --port 8000
  ```

### React 프론트엔드 설정
- [ ] API URL 설정 확인 (`src/App.js`)
- [ ] npm 패키지 설치
  ```bash
  npm install
  ```
- [ ] 프로덕션 빌드
  ```bash
  npm run build
  ```
- [ ] `build/` 디렉토리 생성 확인

---

## ✅ Nginx 설정

### 설정 파일
- [ ] Nginx 설정 파일 생성
  ```bash
  sudo nano /etc/nginx/sites-available/mindstep
  ```
- [ ] 설정 내용 확인 (EC2 IP 또는 도메인)
- [ ] 심볼릭 링크 생성
  ```bash
  sudo ln -s /etc/nginx/sites-available/mindstep /etc/nginx/sites-enabled/
  ```
- [ ] 기본 설정 비활성화
  ```bash
  sudo rm /etc/nginx/sites-enabled/default
  ```
- [ ] 설정 테스트
  ```bash
  sudo nginx -t
  ```
- [ ] Nginx 재시작
  ```bash
  sudo systemctl restart nginx
  ```

---

## ✅ PM2 프로세스 관리

### FastAPI 서버 실행
- [ ] PM2로 FastAPI 실행
  ```bash
  pm2 start "venv/bin/uvicorn loginmain:app --host 0.0.0.0 --port 8000" --name mindstep-api
  ```
- [ ] 프로세스 상태 확인
  ```bash
  pm2 status
  ```
- [ ] 로그 확인
  ```bash
  pm2 logs mindstep-api
  ```
- [ ] 자동 시작 설정
  ```bash
  pm2 startup systemd
  pm2 save
  ```

---

## ✅ CORS 설정

### loginmain.py 수정
- [ ] EC2 IP 추가
  ```python
  allow_origins=[
      "http://localhost:3000",
      "http://YOUR_EC2_PUBLIC_IP",
  ]
  ```
- [ ] 도메인 추가 (도메인 사용 시)
  ```python
  "http://yourdomain.com",
  "https://yourdomain.com"
  ```
- [ ] 변경 후 서버 재시작
  ```bash
  pm2 restart mindstep-api
  ```

---

## ✅ 기능 테스트

### 웹사이트 접속
- [ ] 브라우저에서 `http://YOUR_EC2_IP` 접속 성공
- [ ] 페이지 로딩 정상
- [ ] 콘솔 에러 없음 (F12 개발자 도구)

### 회원가입 테스트
- [ ] 회원가입 페이지 접속
- [ ] 설문조사 완료
- [ ] 회원가입 성공

### 로그인 테스트
- [ ] 로그인 성공
- [ ] 홈 화면 이동
- [ ] 사용자 정보 표시

### 채팅 및 태스크 테스트
- [ ] 채팅 메시지 전송
- [ ] AI 응답 수신
- [ ] 태스크 자동 추출
- [ ] 태스크 목록 표시
- [ ] 태스크 상태 변경
- [ ] 피드백 메시지 표시

### API 문서 확인
- [ ] `http://YOUR_EC2_IP/api/docs` 접속
- [ ] Swagger UI 정상 표시

---

## ✅ 보안 설정 (선택사항)

### 방화벽 설정
- [ ] UFW 활성화
  ```bash
  sudo ufw enable
  sudo ufw allow 22
  sudo ufw allow 80
  sudo ufw allow 443
  ```

### SSH 보안 강화
- [ ] 비밀번호 인증 비활성화
- [ ] SSH 포트 변경 (선택사항)
- [ ] Fail2ban 설치 (선택사항)

### 환경변수 보안
- [ ] `.env` 파일 생성
- [ ] API 키 환경변수로 이동
- [ ] `.env` 파일 권한 설정
  ```bash
  chmod 600 .env
  ```

---

## ✅ 도메인 연결 (선택사항)

### DNS 설정
- [ ] 도메인 구매
- [ ] A 레코드 추가
  - 이름: `@`
  - 값: EC2 퍼블릭 IP
- [ ] DNS 전파 확인 (최대 48시간)

### SSL 인증서
- [ ] Certbot 설치
  ```bash
  sudo apt install certbot python3-certbot-nginx
  ```
- [ ] SSL 인증서 발급
  ```bash
  sudo certbot --nginx -d yourdomain.com
  ```
- [ ] 자동 갱신 설정 확인
  ```bash
  sudo certbot renew --dry-run
  ```
- [ ] HTTPS 접속 확인

---

## ✅ 모니터링 및 유지보수

### 로그 모니터링
- [ ] PM2 로그 확인 방법 숙지
  ```bash
  pm2 logs mindstep-api
  ```
- [ ] Nginx 로그 확인 방법 숙지
  ```bash
  sudo tail -f /var/log/nginx/error.log
  ```

### 백업 설정
- [ ] 데이터베이스 백업 스크립트 작성
- [ ] 정기 백업 cron 설정 (선택사항)

### 업데이트 프로세스
- [ ] `update.sh` 스크립트 테스트
- [ ] Git pull 후 자동 재배포 확인

---

## ✅ 문서화

### 배포 정보 기록
- [ ] EC2 인스턴스 정보 문서화
- [ ] 도메인 정보 기록 (사용 시)
- [ ] API 키 안전한 곳에 보관
- [ ] SSH 키 백업

### 팀 공유 (해당 시)
- [ ] 배포 가이드 공유
- [ ] 접속 정보 공유
- [ ] 관리자 권한 설정

---

## 🎉 배포 완료!

모든 항목을 체크했다면 배포가 성공적으로 완료되었습니다!

### 다음 단계
- [ ] 성능 모니터링 시작
- [ ] 사용자 피드백 수집
- [ ] 기능 개선 계획 수립

---

## 📞 문제 발생 시

1. **PM2 로그 확인**: `pm2 logs mindstep-api`
2. **Nginx 로그 확인**: `sudo tail -f /var/log/nginx/error.log`
3. **시스템 로그 확인**: `sudo journalctl -xe`
4. **트러블슈팅 가이드**: [AWS_DEPLOYMENT_GUIDE.md](./AWS_DEPLOYMENT_GUIDE.md#트러블슈팅)

---

**배포 날짜**: `___________________`  
**배포자**: `___________________`  
**버전**: `___________________`
