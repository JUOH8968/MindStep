#!/bin/bash

# MindStep 업데이트 스크립트
# 코드 변경 후 빠르게 재배포할 때 사용

set -e

echo "=========================================="
echo "MindStep 업데이트 시작"
echo "=========================================="

PROJECT_DIR="/home/ubuntu/miniproject_v2"
cd $PROJECT_DIR

# 1. Git Pull (Git 사용 시)
if [ -d ".git" ]; then
    echo "[1/5] Git Pull 중..."
    git pull
fi

# 2. Python 패키지 업데이트
echo "[2/5] Python 패키지 업데이트 중..."
source venv/bin/activate
pip install -r requirements.txt

# 3. 데이터베이스 마이그레이션 (필요 시)
# echo "[3/5] 데이터베이스 업데이트 중..."
# python min_db.py

# 4. React 리빌드
echo "[3/5] React 리빌드 중..."
npm install
export NODE_OPTIONS="--max-old-space-size=2048"
npm run build

# 5. FastAPI 재시작
echo "[4/5] FastAPI 서버 재시작 중..."
pm2 restart mindstep-api

# 6. Nginx 재시작
echo "[5/5] Nginx 재시작 중..."
sudo systemctl restart nginx

echo ""
echo "=========================================="
echo "업데이트 완료!"
echo "=========================================="
echo ""
pm2 status
