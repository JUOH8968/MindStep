# 🚀 AWS EC2 배포 가이드 모음

MindStep miniproject_v2를 AWS EC2에 배포하기 위한 완전한 가이드입니다.

---

## 📚 문서 목록

### 1. [빠른 시작 가이드](./QUICK_START.md) ⚡
**5분 안에 배포하기**
- EC2 인스턴스 생성
- 자동 배포 스크립트 실행
- 주요 명령어 모음

👉 **처음 배포하시는 분들은 여기서 시작하세요!**

---

### 2. [상세 배포 가이드](./AWS_DEPLOYMENT_GUIDE.md) 📖
**단계별 상세 설명**
- EC2 인스턴스 설정 방법
- 서버 환경 구축
- Nginx 설정
- PM2 프로세스 관리
- 도메인 연결 및 SSL 설정
- 트러블슈팅

👉 **각 단계를 이해하며 배포하고 싶으신 분들께 추천**

---

### 3. [배포 체크리스트](./DEPLOYMENT_CHECKLIST.md) ✅
**놓치지 말아야 할 항목들**
- 배포 전 준비사항
- 각 단계별 체크리스트
- 보안 설정
- 테스트 항목

👉 **배포 과정에서 확인용으로 사용하세요**

---

## 🛠️ 배포 스크립트

### 1. `deploy.sh` - 자동 배포 스크립트
전체 배포 과정을 자동화한 스크립트입니다.

```bash
# EC2에서 실행
chmod +x deploy.sh
./deploy.sh
```

**포함 기능:**
- 시스템 업데이트
- Python 3.11 설치
- Node.js 18.x 설치
- PM2 설치
- 백엔드 설정
- 프론트엔드 빌드
- Nginx 설정
- FastAPI 서버 실행

---

### 2. `update.sh` - 업데이트 스크립트
코드 변경 후 빠르게 재배포할 때 사용합니다.

```bash
# EC2에서 실행
chmod +x update.sh
./update.sh
```

**포함 기능:**
- Git Pull (Git 사용 시)
- Python 패키지 업데이트
- React 리빌드
- 서버 재시작

---

## 🎯 배포 방법 선택

### 방법 1: 자동 배포 (권장) 🌟
```bash
# 1. 프로젝트를 EC2에 업로드
scp -i key.pem -r miniproject_v2 ubuntu@EC2_IP:/home/ubuntu/

# 2. SSH 접속
ssh -i key.pem ubuntu@EC2_IP

# 3. 자동 배포 실행
cd /home/ubuntu/miniproject_v2
chmod +x deploy.sh
./deploy.sh
```

**장점:**
- ✅ 빠르고 간편함
- ✅ 실수 방지
- ✅ 일관된 배포 환경

---

### 방법 2: 수동 배포
[상세 배포 가이드](./AWS_DEPLOYMENT_GUIDE.md)를 참조하여 단계별로 진행합니다.

**장점:**
- ✅ 각 단계를 이해하며 진행
- ✅ 커스터마이징 가능
- ✅ 문제 발생 시 디버깅 용이

---

## 📋 배포 전 체크리스트

- [ ] AWS 계정 준비
- [ ] Gemini API 키 확인
- [ ] 로컬에서 정상 작동 확인
- [ ] EC2 인스턴스 타입 결정 (권장: t2.medium)
- [ ] 도메인 준비 (선택사항)

---

## 🔧 주요 설정 파일

### 백엔드 설정
- `loginmain.py` - FastAPI 메인 애플리케이션
- `chat_task_api.py` - 채팅 및 태스크 API
- `gemini_service.py` - Gemini AI 서비스
- `min_db.py` - 데이터베이스 초기화

### 프론트엔드 설정
- `src/App.js` - React 메인 컴포넌트
- `package.json` - npm 패키지 설정

### 환경 설정
- `.env.example` - 환경변수 템플릿
- `.gitignore` - Git 제외 파일 목록

---

## 🌐 배포 후 접속 정보

### 웹사이트
```
http://YOUR_EC2_PUBLIC_IP
```

### API 문서 (Swagger UI)
```
http://YOUR_EC2_PUBLIC_IP/api/docs
```

---

## 📞 주요 명령어

### PM2 (FastAPI 서버 관리)
```bash
pm2 status              # 상태 확인
pm2 logs mindstep-api   # 로그 확인
pm2 restart mindstep-api # 재시작
pm2 stop mindstep-api   # 중지
```

### Nginx (웹 서버)
```bash
sudo systemctl status nginx   # 상태 확인
sudo systemctl restart nginx  # 재시작
sudo nginx -t                 # 설정 테스트
```

### 데이터베이스
```bash
cd /home/ubuntu/miniproject_v2
source venv/bin/activate
python min_db.py  # DB 재초기화
```

---

## 🐛 문제 해결

### 1. React 빌드 시 메모리 부족
```bash
# 스왑 메모리 추가
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

### 2. 502 Bad Gateway
```bash
# FastAPI 서버 확인
pm2 status
pm2 logs mindstep-api
pm2 restart mindstep-api
```

### 3. CORS 에러
`loginmain.py`에서 EC2 IP 추가:
```python
allow_origins=[
    "http://localhost:3000",
    "http://YOUR_EC2_PUBLIC_IP",
]
```

더 많은 문제 해결 방법은 [상세 가이드](./AWS_DEPLOYMENT_GUIDE.md#트러블슈팅)를 참조하세요.

---

## 🔒 보안 권장사항

1. **SSH 키 관리**
   - `.pem` 파일을 안전한 곳에 보관
   - 권한 설정: `chmod 400 key.pem`

2. **환경변수 보안**
   - API 키를 `.env` 파일로 분리
   - `.env` 파일을 Git에 커밋하지 않기

3. **방화벽 설정**
   - 필요한 포트만 열기
   - SSH는 특정 IP만 허용 (가능하면)

4. **SSL 인증서**
   - 도메인 사용 시 Let's Encrypt로 HTTPS 설정

---

## 📈 배포 후 할 일

1. **모니터링 설정**
   - PM2 로그 정기 확인
   - 서버 리소스 모니터링

2. **백업 설정**
   - 데이터베이스 정기 백업
   - 코드 Git 저장소에 푸시

3. **성능 최적화**
   - 응답 시간 측정
   - 필요시 인스턴스 타입 업그레이드

4. **사용자 피드백**
   - 실제 사용자 테스트
   - 버그 수정 및 기능 개선

---

## 🎓 추가 학습 자료

### AWS 관련
- [AWS EC2 공식 문서](https://docs.aws.amazon.com/ec2/)
- [AWS 프리티어 가이드](https://aws.amazon.com/free/)

### 배포 관련
- [Nginx 공식 문서](https://nginx.org/en/docs/)
- [PM2 공식 문서](https://pm2.keymetrics.io/docs/)
- [Let's Encrypt 가이드](https://letsencrypt.org/getting-started/)

---

## 💡 팁

1. **비용 절감**
   - 사용하지 않을 때는 인스턴스 중지
   - 프리티어 한도 확인
   - CloudWatch로 비용 모니터링

2. **성능 향상**
   - CloudFront CDN 사용 (선택사항)
   - 정적 파일 캐싱 설정
   - 데이터베이스 인덱싱

3. **개발 효율**
   - Git을 통한 버전 관리
   - `update.sh`로 빠른 재배포
   - 개발/프로덕션 환경 분리

---

## 📞 지원

문제가 발생하거나 질문이 있으시면:

1. **로그 확인**
   - PM2: `pm2 logs mindstep-api`
   - Nginx: `sudo tail -f /var/log/nginx/error.log`

2. **문서 참조**
   - [트러블슈팅 가이드](./AWS_DEPLOYMENT_GUIDE.md#트러블슈팅)
   - [체크리스트](./DEPLOYMENT_CHECKLIST.md)

3. **커뮤니티**
   - AWS 포럼
   - Stack Overflow

---

## 📝 버전 정보

- **프로젝트**: MindStep miniproject_v2
- **Python**: 3.11
- **Node.js**: 18.x
- **React**: 19.x
- **FastAPI**: Latest
- **Nginx**: Latest

---

**배포 성공을 기원합니다! 🎉**

문서 작성일: 2026-01-09
