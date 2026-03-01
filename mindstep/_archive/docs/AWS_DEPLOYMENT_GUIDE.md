# AWS EC2 배포 가이드 - MindStep miniproject_v2

## 📋 목차
1. [사전 준비](#사전-준비)
2. [EC2 인스턴스 생성](#ec2-인스턴스-생성)
3. [서버 환경 설정](#서버-환경-설정)
4. [프로젝트 배포](#프로젝트-배포)
5. [백엔드 설정](#백엔드-설정)
6. [프론트엔드 빌드 및 배포](#프론트엔드-빌드-및-배포)
7. [Nginx 설정](#nginx-설정)
8. [프로세스 관리 (PM2)](#프로세스-관리-pm2)
9. [도메인 연결 (선택사항)](#도메인-연결-선택사항)
10. [트러블슈팅](#트러블슈팅)

---

## 🎯 사전 준비

### 필요한 것들
- [ ] AWS 계정
- [ ] Gemini API 키 (이미 있음: `gemini_service.py`에 설정됨)
- [ ] SSH 클라이언트 (Windows Terminal, PuTTY 등)
- [ ] 도메인 (선택사항)

---

## 🖥️ EC2 인스턴스 생성

### 1. AWS Console 접속
1. [AWS Console](https://console.aws.amazon.com/) 로그인
2. EC2 서비스로 이동
3. "인스턴스 시작" 클릭

### 2. 인스턴스 설정

#### 이름 및 태그
```
이름: mindstep-server
```

#### AMI 선택
```
Ubuntu Server 22.04 LTS (HVM), SSD Volume Type
- 64비트 (x86)
```

#### 인스턴스 유형
```
권장: t2.small (2GB RAM) 또는 t2.medium (4GB RAM)
- t2.micro는 React 빌드 시 메모리 부족 가능
```

#### 키 페어
```
1. "새 키 페어 생성" 클릭
2. 키 페어 이름: mindstep-key
3. 키 페어 유형: RSA
4. 프라이빗 키 파일 형식: .pem
5. "키 페어 생성" 후 .pem 파일 다운로드 및 안전한 곳에 보관
```

#### 네트워크 설정

##### VPC 및 서브넷 (기본값 사용)
```
VPC: 기본 VPC 선택 (자동)
서브넷: 기본 서브넷 선택 (자동)
가용 영역: 자동 선택 (권장)
```
**💡 팁**: 처음 배포하시는 경우 모두 기본값으로 두시면 됩니다.

##### 퍼블릭 IP 자동 할당 ⚠️ **중요!**
```
⚠️ 반드시 "활성화"로 설정하세요!
```
- 이 옵션을 활성화하지 않으면 외부에서 접속할 수 없습니다
- 기본값이 "비활성화"일 수 있으니 꼭 확인하세요

##### 방화벽 (보안 그룹) 생성
```
새 보안 그룹 생성:
- SSH (포트 22): 내 IP (또는 0.0.0.0/0)
- HTTP (포트 80): 0.0.0.0/0
- HTTPS (포트 443): 0.0.0.0/0
- Custom TCP (포트 8000): 0.0.0.0/0 (FastAPI 백엔드)
- Custom TCP (포트 3000): 0.0.0.0/0 (React 개발 서버, 선택사항)
```

**보안 그룹 규칙 상세:**

| 유형 | 프로토콜 | 포트 범위 | 소스 | 설명 |
|------|----------|-----------|------|------|
| SSH | TCP | 22 | 내 IP | SSH 접속 (보안 강화) |
| HTTP | TCP | 80 | 0.0.0.0/0 | 웹 접속 |
| HTTPS | TCP | 443 | 0.0.0.0/0 | HTTPS 접속 |
| Custom TCP | TCP | 8000 | 0.0.0.0/0 | FastAPI API |
| Custom TCP | TCP | 3000 | 0.0.0.0/0 | React Dev (선택) |

**💡 보안 팁**: SSH 포트는 "내 IP"로 제한하는 것이 안전합니다.

#### 스토리지 구성
```
30 GB gp3 (권장)
```

### 3. 인스턴스 시작
"인스턴스 시작" 클릭 후 인스턴스가 실행될 때까지 대기 (약 1-2분)

---

## 🔧 서버 환경 설정

### 1. SSH 접속

#### Windows (PowerShell 또는 CMD)
```powershell
# .pem 파일이 있는 디렉토리로 이동
cd C:\path\to\your\key

# SSH 접속 (EC2 퍼블릭 IP 주소 확인 필요)
ssh -i mindstep-key.pem ubuntu@YOUR_EC2_PUBLIC_IP
```

#### 처음 접속 시
```
Are you sure you want to continue connecting (yes/no/[fingerprint])? yes
```

### 2. 시스템 업데이트
```bash
sudo apt update && sudo apt upgrade -y
```

### 3. Python 3.11 설치
```bash
sudo apt install -y software-properties-common
sudo add-apt-repository -y ppa:deadsnakes/ppa
sudo apt update
sudo apt install -y python3.11 python3.11-venv python3.11-dev python3-pip
```

### 4. Node.js 18.x 설치
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
node --version  # v18.x.x 확인
npm --version   # 9.x.x 확인
```

### 5. Git 설치
```bash
sudo apt install -y git
```

### 6. Nginx 설치
```bash
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

---

## 📦 프로젝트 배포

### 1. 프로젝트 업로드 방법

#### 옵션 A: Git 사용 (권장)
```bash
# GitHub에 프로젝트 푸시 후
cd /home/ubuntu
git clone https://github.com/YOUR_USERNAME/mindstep.git
cd mindstep/miniproject_v2
```

#### 옵션 B: SCP로 직접 업로드
```powershell
# 로컬 PC에서 실행 (Windows PowerShell)
scp -i mindstep-key.pem -r C:\myworkfolder\miniproj_MS\mindstep\miniproject_v2 ubuntu@YOUR_EC2_PUBLIC_IP:/home/ubuntu/
```

### 2. 프로젝트 디렉토리로 이동
```bash
cd /home/ubuntu/miniproject_v2
```

---

## 🐍 백엔드 설정

### 1. Python 가상환경 생성
```bash
python3.11 -m venv venv
source venv/bin/activate
```

### 2. Python 패키지 설치
```bash
pip install --upgrade pip
pip install -r requirements.txt
```

### 3. 데이터베이스 초기화
```bash
python min_db.py
```

### 4. 환경변수 설정 (선택사항)
```bash
# .env 파일 생성
nano .env
```

`.env` 파일 내용:
```env
GEMINI_API_KEY=AIzaSyDrFQtqTbflHigJNNFDpG3uAz6gK3iucOs
SECRET_KEY=MINIPROJECT_SECRET_KEY
```

### 5. FastAPI 서버 테스트
```bash
# 테스트 실행
uvicorn loginmain:app --host 0.0.0.0 --port 8000

# 브라우저에서 확인
# http://YOUR_EC2_PUBLIC_IP:8000/docs
```

테스트 성공 시 `Ctrl+C`로 종료

---

## ⚛️ 프론트엔드 빌드 및 배포

### 1. 프론트엔드 설정 수정

#### API URL 변경
```bash
nano src/App.js
```

API 호출 부분을 EC2 IP로 변경:
```javascript
// 기존
const API_URL = 'http://localhost:8000';

// 변경 (EC2 퍼블릭 IP 사용)
const API_URL = 'http://YOUR_EC2_PUBLIC_IP:8000';
```

또는 Nginx 프록시 사용 시:
```javascript
const API_URL = '';  // 같은 도메인 사용
```

### 2. npm 패키지 설치
```bash
npm install
```

### 3. 프로덕션 빌드
```bash
# 메모리 부족 방지
export NODE_OPTIONS="--max-old-space-size=2048"

# 빌드 실행
npm run build
```

빌드 완료 시 `build/` 디렉토리 생성됨

---

## 🌐 Nginx 설정

### 1. Nginx 설정 파일 생성
```bash
sudo nano /etc/nginx/sites-available/mindstep
```

### 2. 설정 내용 입력

#### 옵션 A: 단일 서버 설정 (권장)
```nginx
server {
    listen 80;
    server_name YOUR_EC2_PUBLIC_IP;  # 또는 도메인

    # React 프론트엔드
    location / {
        root /home/ubuntu/miniproject_v2/build;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # FastAPI 백엔드 프록시
    location /api {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 정적 파일 캐싱
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        root /home/ubuntu/miniproject_v2/build;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

#### 옵션 B: 개발 서버 분리 설정
```nginx
# 백엔드만 프록시
server {
    listen 80;
    server_name YOUR_EC2_PUBLIC_IP;

    location / {
        proxy_pass http://127.0.0.1:3000;  # React dev server
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://127.0.0.1:8000;  # FastAPI
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 3. 설정 활성화
```bash
# 심볼릭 링크 생성
sudo ln -s /etc/nginx/sites-available/mindstep /etc/nginx/sites-enabled/

# 기본 설정 비활성화 (선택사항)
sudo rm /etc/nginx/sites-enabled/default

# 설정 테스트
sudo nginx -t

# Nginx 재시작
sudo systemctl restart nginx
```

### 4. loginmain.py CORS 설정 업데이트

EC2에서 파일 수정:
```bash
nano loginmain.py
```

CORS 설정 변경:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://YOUR_EC2_PUBLIC_IP",
        "http://YOUR_DOMAIN.com"  # 도메인 사용 시
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## 🔄 프로세스 관리 (PM2)

### 1. PM2 설치
```bash
sudo npm install -g pm2
```

### 2. FastAPI 서버 PM2로 실행
```bash
cd /home/ubuntu/miniproject_v2

# 가상환경 활성화
source venv/bin/activate

# PM2로 FastAPI 실행
pm2 start "uvicorn loginmain:app --host 0.0.0.0 --port 8000" --name mindstep-api
```

### 3. PM2 자동 시작 설정
```bash
# 부팅 시 자동 시작
pm2 startup systemd
# 출력된 명령어 복사해서 실행

# 현재 프로세스 저장
pm2 save
```

### 4. PM2 명령어
```bash
# 상태 확인
pm2 status

# 로그 확인
pm2 logs mindstep-api

# 재시작
pm2 restart mindstep-api

# 중지
pm2 stop mindstep-api

# 삭제
pm2 delete mindstep-api
```

---

## 🌍 도메인 연결 (선택사항)

### 1. 도메인 구매
- AWS Route 53, GoDaddy, Namecheap 등에서 구매

### 2. DNS 설정
```
A 레코드 추가:
이름: @ (또는 www)
값: YOUR_EC2_PUBLIC_IP
TTL: 300
```

### 3. Nginx 설정 업데이트
```bash
sudo nano /etc/nginx/sites-available/mindstep
```

`server_name` 변경:
```nginx
server_name yourdomain.com www.yourdomain.com;
```

### 4. SSL 인증서 설치 (Let's Encrypt)
```bash
# Certbot 설치
sudo apt install -y certbot python3-certbot-nginx

# SSL 인증서 발급
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# 자동 갱신 테스트
sudo certbot renew --dry-run
```

---

## 🔍 트러블슈팅

### 문제 1: React 빌드 시 메모리 부족
```bash
# 스왑 메모리 추가
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# 영구 설정
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

### 문제 2: 포트 접근 불가
```bash
# 방화벽 확인
sudo ufw status

# 포트 허용 (필요 시)
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 8000
```

### 문제 3: 데이터베이스 권한 오류
```bash
# 권한 설정
chmod 664 *.db
chown ubuntu:ubuntu *.db
```

### 문제 4: Nginx 502 Bad Gateway
```bash
# FastAPI 서버 실행 확인
pm2 status

# 로그 확인
pm2 logs mindstep-api
sudo tail -f /var/log/nginx/error.log
```

### 문제 5: CORS 에러
- `loginmain.py`의 `allow_origins`에 EC2 IP 또는 도메인 추가
- Nginx 프록시 헤더 확인

---

## 📝 배포 체크리스트

### 배포 전
- [ ] Gemini API 키 확인
- [ ] EC2 인스턴스 생성 및 보안 그룹 설정
- [ ] SSH 키 페어 다운로드 및 보관

### 서버 설정
- [ ] SSH 접속 성공
- [ ] Python 3.11 설치
- [ ] Node.js 18.x 설치
- [ ] Nginx 설치

### 프로젝트 배포
- [ ] 프로젝트 파일 업로드
- [ ] Python 가상환경 생성 및 패키지 설치
- [ ] 데이터베이스 초기화
- [ ] React 빌드 완료

### 서비스 실행
- [ ] PM2로 FastAPI 서버 실행
- [ ] Nginx 설정 및 재시작
- [ ] 브라우저에서 접속 확인

### 최종 확인
- [ ] 회원가입 테스트
- [ ] 로그인 테스트
- [ ] 채팅 및 태스크 추출 테스트
- [ ] 모든 기능 정상 작동 확인

---

## 🚀 빠른 배포 스크립트

전체 과정을 자동화한 스크립트를 별도로 제공합니다.
`deploy.sh` 파일을 참조하세요.

---

## 📞 지원

문제가 발생하면 다음을 확인하세요:
1. PM2 로그: `pm2 logs mindstep-api`
2. Nginx 로그: `sudo tail -f /var/log/nginx/error.log`
3. 시스템 로그: `sudo journalctl -xe`

---

**배포 성공을 기원합니다! 🎉**
