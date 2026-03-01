# 🚀 AWS EC2 빠른 배포 가이드

## 📌 5분 안에 배포하기

### 1️⃣ EC2 인스턴스 생성 (5분)

1. **AWS Console** → **EC2** → **인스턴스 시작**
2. 설정:
   - **AMI**: Ubuntu Server 22.04 LTS
   - **인스턴스 타입**: t2.small 이상 (권장: t2.medium)
   - **키 페어**: 새로 생성 후 다운로드
   - **보안 그룹**: 포트 22, 80, 443, 8000 허용
   - **스토리지**: 30GB
3. **인스턴스 시작** 클릭

---

### 2️⃣ 프로젝트 업로드 (2분)

#### 옵션 A: SCP로 업로드 (로컬 PC에서)
```powershell
# Windows PowerShell
scp -i mindstep-key.pem -r C:\myworkfolder\miniproj_MS\mindstep\miniproject_v2 ubuntu@YOUR_EC2_IP:/home/ubuntu/
```

#### 옵션 B: Git 사용
```bash
# EC2에서
cd /home/ubuntu
git clone YOUR_GITHUB_REPO
```

---

### 3️⃣ 자동 배포 실행 (10분)

```bash
# EC2에 SSH 접속
ssh -i mindstep-key.pem ubuntu@YOUR_EC2_IP

# 프로젝트 디렉토리로 이동
cd /home/ubuntu/miniproject_v2

# 배포 스크립트 실행 권한 부여
chmod +x deploy.sh

# 자동 배포 실행
./deploy.sh
```

**완료!** 🎉

---

### 4️⃣ 접속 확인

브라우저에서 접속:
```
http://YOUR_EC2_PUBLIC_IP
```

API 문서:
```
http://YOUR_EC2_PUBLIC_IP/api/docs
```

---

## 🔧 코드 업데이트 시

```bash
# EC2에서
cd /home/ubuntu/miniproject_v2

# 업데이트 스크립트 실행
chmod +x update.sh
./update.sh
```

---

## 📋 주요 명령어

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
sudo tail -f /var/log/nginx/error.log  # 에러 로그
```

### 데이터베이스
```bash
cd /home/ubuntu/miniproject_v2
source venv/bin/activate
python min_db.py  # DB 재초기화
```

---

## ⚠️ 주의사항

### 1. CORS 설정
`loginmain.py` 파일에서 EC2 IP 추가:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://YOUR_EC2_PUBLIC_IP",  # 추가
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### 2. React API URL 설정
`src/App.js` 또는 환경변수에서 API URL 설정:

```javascript
// Nginx 프록시 사용 시 (권장)
const API_URL = '';  // 같은 도메인 사용

// 또는 직접 지정
const API_URL = 'http://YOUR_EC2_PUBLIC_IP:8000';
```

### 3. 보안 그룹 확인
EC2 보안 그룹에서 다음 포트가 열려있는지 확인:
- **22** (SSH)
- **80** (HTTP)
- **443** (HTTPS)
- **8000** (FastAPI, 선택사항)

---

## 🐛 문제 해결

### React 빌드 시 메모리 부족
```bash
# 스왑 메모리 추가
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

### 502 Bad Gateway
```bash
# FastAPI 서버 확인
pm2 status
pm2 logs mindstep-api

# 서버 재시작
pm2 restart mindstep-api
```

### 데이터베이스 권한 오류
```bash
cd /home/ubuntu/miniproject_v2
chmod 664 *.db
chown ubuntu:ubuntu *.db
```

---

## 🌐 도메인 연결 (선택사항)

### 1. DNS 설정
도메인 관리 페이지에서:
```
A 레코드 추가
이름: @
값: YOUR_EC2_PUBLIC_IP
```

### 2. Nginx 설정 업데이트
```bash
sudo nano /etc/nginx/sites-available/mindstep
```

`server_name` 변경:
```nginx
server_name yourdomain.com www.yourdomain.com;
```

### 3. SSL 인증서 설치
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

---

## 📞 더 자세한 정보

전체 가이드: [AWS_DEPLOYMENT_GUIDE.md](./AWS_DEPLOYMENT_GUIDE.md)

---

**Happy Deploying! 🚀**
