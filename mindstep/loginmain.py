import os
import sqlite3
import logging
from contextlib import contextmanager
from typing import Optional

from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI, Request, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from pydantic import BaseModel
from fastapi.responses import JSONResponse

# Import external route registration
from chat_task_api import register_chat_and_task_apis

# ==================== Configuration ====================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# Security Note: In production, load SECRET_KEY from environment variables.
SECRET_KEY = os.environ.get("SECRET_KEY", "MINIPROJECT_SECRET_KEY")

DB_FILES = {
    "udata": os.path.join(BASE_DIR, "UData.db"),
    "user": os.path.join(BASE_DIR, "User.db"),
}

# Logging Setup
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

app = FastAPI(
    title="MindStep Backend",
    description="Backend API for MindStep application",
    version="6.0.0"
)

# ==================== Middleware ====================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(SessionMiddleware, secret_key=SECRET_KEY)


# ==================== Database ====================

@contextmanager
def get_db_connection(db_key: str):
    """
    Context manager for database connections.
    db_key: 'udata' or 'user'
    """
    db_path = DB_FILES.get(db_key)
    if not db_path:
        raise ValueError(f"Unknown database key: {db_key}")
    
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row  # Access columns by name
    try:
        yield conn
    finally:
        conn.close()


# ==================== Pydantic Models ====================

class RegisterRequest(BaseModel):
    user_id: str
    password: str
    type: str = "Type A"
    gender: str = ""
    age: Optional[str] = ""
    job: str = ""
    mbti: str = ""
    email: str = ""

class LoginRequest(BaseModel):
    user_id: str
    password: str


# ==================== Auth Endpoints ====================

@app.post("/api/register")
def register(data: RegisterRequest):
    """
    Register a new user.
    Transactional: Creates User in UData.db (Auth) and User.db (Profile).
    """
    if not data.user_id.strip() or not data.password.strip():
        raise HTTPException(status_code=400, detail="아이디와 비밀번호는 필수입니다.")

    try:
        with get_db_connection("udata") as udata_conn:
            cursor = udata_conn.cursor()
            
            # Check for existing user
            cursor.execute("SELECT 1 FROM UData WHERE User_ID=?", (data.user_id,))
            if cursor.fetchone():
                return JSONResponse(status_code=409, content={"error": "이미 존재하는 아이디입니다."})

            # Begin Transaction
            try:
                # 1. Insert Auth Data
                cursor.execute(
                    "INSERT INTO UData (User_ID, PASSWORD, Personalist) VALUES (?, ?, ?)",
                    (data.user_id, data.password, data.type)
                )
                user_pk = cursor.lastrowid
                
                # 2. Insert Profile Data
                # Note: These are separate DB files in SQLite without distributed transaction support.
                # We attempt to insert into User.db immediately.
                try:
                    with get_db_connection("user") as user_conn:
                        user_conn.execute(
                            "INSERT INTO User (ID, Gender, age, job, MBTI, email) VALUES (?, ?, ?, ?, ?, ?)",
                            (user_pk, data.gender, data.age, data.job, data.mbti, data.email)
                        )
                        user_conn.commit()
                except Exception as profile_error:
                    # If profile insert fails, we rollback the auth insert to keep data consistent(ish)
                    udata_conn.rollback()
                    raise profile_error

                udata_conn.commit()
                logger.info(f"New user registered: {data.user_id} (PK: {user_pk})")
                return {"ok": True, "message": "회원가입 완료"}

            except Exception as e:
                udata_conn.rollback()
                logger.error(f"Registration failed: {e}")
                return JSONResponse(status_code=500, content={"error": "회원가입 처리 중 오류가 발생했습니다."})

    except Exception as e:
        logger.error(f"Unexpected error in register: {e}")
        return JSONResponse(status_code=500, content={"error": str(e)})


@app.post("/api/login")
def login(request: Request, data: LoginRequest):
    """
    Authenticate user and set session.
    """
    if not data.user_id.strip() or not data.password.strip():
        raise HTTPException(status_code=400, detail="아이디와 비밀번호를 입력하세요.")

    with get_db_connection("udata") as conn:
        cursor = conn.cursor()
        cursor.execute(
            "SELECT ID, Personalist FROM UData WHERE User_ID=? AND PASSWORD=?",
            (data.user_id, data.password)
        )
        user = cursor.fetchone()

    if not user:
        return JSONResponse(status_code=401, content={"error": "아이디 또는 비밀번호가 올바르지 않습니다."})

    # Set Session
    request.session["user_pk"] = user["ID"]
    logger.info(f"User logged in: {data.user_id} (PK: {user['ID']})")
    
    return {"ok": True, "type": user["Personalist"]}


@app.post("/api/logout")
def logout(request: Request):
    """Clear user session."""
    request.session.clear()
    return {"ok": True}


@app.get("/api/home")
def home(request: Request):
    """
    Get current logged-in user's profile info.
    """
    user_pk = request.session.get("user_pk")
    if not user_pk:
        return JSONResponse(status_code=401, content={"error": "로그인이 필요합니다."})

    # Fetch Auth Info
    with get_db_connection("udata") as conn:
        auth_user = conn.execute("SELECT User_ID, Personalist FROM UData WHERE ID=?", (user_pk,)).fetchone()

    if not auth_user:
        request.session.clear()
        return JSONResponse(status_code=404, content={"error": "사용자 정보를 찾을 수 없습니다."})

    # Fetch Profile Info
    with get_db_connection("user") as conn:
        profile_user = conn.execute(
            "SELECT Gender, age, job, MBTI, email FROM User WHERE ID=?", 
            (user_pk,)
        ).fetchone()

    # Construct Response
    return {
        "user_id": auth_user["User_ID"],
        "type": auth_user["Personalist"],
        "user": {
            "Gender": profile_user["Gender"] if profile_user else "",
            "age": profile_user["age"] if profile_user else "",
            "job": profile_user["job"] if profile_user else "",
            "MBTI": profile_user["MBTI"] if profile_user else "",
            "email": profile_user["email"] if profile_user else "",
        }
    }


# ==================== External Routes ====================

# Register endpoints from chat_task_api.py
register_chat_and_task_apis(app)

if __name__ == "__main__":
    import uvicorn
    # Reload=True allows auto-restart on code changes
    uvicorn.run("loginmain:app", host="0.0.0.0", port=8000, reload=True)
