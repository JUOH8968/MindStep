#!/bin/bash

# MindStep miniproject_v2 자동 배포 스크립트
# EC2 Ubuntu 22.04에서 실행

set -e  # 에러 발생 시 스크립트 중단

echo "=========================================="
echo "MindStep 자동 배포 시작"
echo "=========================================="

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 프로젝트 디렉토리
PROJECT_DIR="/home/ubuntu/miniproject_v2"
VENV_DIR="$PROJECT_DIR/venv"

# 1. 시스템 업데이트
echo -e "${GREEN}[1/10] 시스템 업데이트 중...${NC}"
sudo apt update && sudo apt upgrade -y

# 2. 필수 패키지 설치
echo -e "${GREEN}[2/10] 필수 패키지 설치 중...${NC}"
sudo apt install -y software-properties-common curl git nginx

# 3. Python 3.11 설치
echo -e "${GREEN}[3/10] Python 3.11 설치 중...${NC}"
if ! command -v python3.11 &> /dev/null; then
    sudo add-apt-repository -y ppa:deadsnakes/ppa
    sudo apt update
    sudo apt install -y python3.11 python3.11-venv python3.11-dev python3-pip
fi
python3.11 --version

# 4. Node.js 18.x 설치
echo -e "${GREEN}[4/10] Node.js 18.x 설치 중...${NC}"
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt install -y nodejs
fi
node --version
npm --version

# 5. PM2 설치
echo -e "${GREEN}[5/10] PM2 설치 중...${NC}"
if ! command -v pm2 &> /dev/null; then
    sudo npm install -g pm2
fi

# 6. 프로젝트 디렉토리로 이동
echo -e "${GREEN}[6/10] 프로젝트 디렉토리 확인 중...${NC}"
if [ ! -d "$PROJECT_DIR" ]; then
    echo -e "${RED}오류: $PROJECT_DIR 디렉토리가 없습니다.${NC}"
    echo "프로젝트를 먼저 업로드하세요."
    exit 1
fi
cd $PROJECT_DIR

# 7. Python 백엔드 설정
echo -e "${GREEN}[7/10] Python 백엔드 설정 중...${NC}"

# 가상환경 생성
if [ ! -d "$VENV_DIR" ]; then
    python3.11 -m venv venv
fi

# 가상환경 활성화 및 패키지 설치
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

# 데이터베이스 초기화
if [ ! -f "task.db" ]; then
    echo "데이터베이스 초기화 중..."
    python min_db.py
fi

# 8. React 프론트엔드 빌드
echo -e "${GREEN}[8/10] React 프론트엔드 빌드 중...${NC}"

# npm 패키지 설치
if [ ! -d "node_modules" ]; then
    npm install
fi

# 프로덕션 빌드
export NODE_OPTIONS="--max-old-space-size=2048"
npm run build

# 9. Nginx 설정
echo -e "${GREEN}[9/10] Nginx 설정 중...${NC}"

# EC2 퍼블릭 IP 가져오기
EC2_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)
echo "EC2 퍼블릭 IP: $EC2_IP"

# Nginx 설정 파일 생성
sudo tee /etc/nginx/sites-available/mindstep > /dev/null <<EOF
server {
    listen 80;
    server_name $EC2_IP;

    # React 프론트엔드
    location / {
        root $PROJECT_DIR/build;
        index index.html;
        try_files \$uri \$uri/ /index.html;
    }

    # FastAPI 백엔드 프록시
    location /api {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # 정적 파일 캐싱
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        root $PROJECT_DIR/build;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# Nginx 설정 활성화
sudo ln -sf /etc/nginx/sites-available/mindstep /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Nginx 설정 테스트
sudo nginx -t

# Nginx 재시작
sudo systemctl restart nginx
sudo systemctl enable nginx

# 10. FastAPI 서버 PM2로 실행
echo -e "${GREEN}[10/10] FastAPI 서버 실행 중...${NC}"

# 기존 프로세스 중지 (있다면)
pm2 delete mindstep-api 2>/dev/null || true

# PM2로 FastAPI 실행
cd $PROJECT_DIR
pm2 start "venv/bin/uvicorn loginmain:app --host 0.0.0.0 --port 8000" --name mindstep-api

# PM2 자동 시작 설정
pm2 startup systemd -u ubuntu --hp /home/ubuntu
pm2 save

# 완료
echo ""
echo "=========================================="
echo -e "${GREEN}배포 완료!${NC}"
echo "=========================================="
echo ""
echo "접속 정보:"
echo "- 웹사이트: http://$EC2_IP"
echo "- API 문서: http://$EC2_IP/api/docs"
echo ""
echo "유용한 명령어:"
echo "- PM2 상태 확인: pm2 status"
echo "- PM2 로그 확인: pm2 logs mindstep-api"
echo "- Nginx 재시작: sudo systemctl restart nginx"
echo "- Nginx 로그: sudo tail -f /var/log/nginx/error.log"
echo ""
echo -e "${YELLOW}참고: loginmain.py의 CORS 설정에 EC2 IP를 추가해야 할 수 있습니다.${NC}"
echo ""
