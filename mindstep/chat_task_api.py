"""
채팅 및 Task 관리 API 엔드포인트
Refactored for efficiency, readability, and maintainability.
"""

from fastapi import Request, Body
from fastapi.responses import JSONResponse
from datetime import datetime
import json
import sqlite3
import os
from contextlib import contextmanager
from typing import Optional, Tuple, Dict, Any, List

from gemini_service import extract_tasks_from_conversation, format_conversation_history, generate_nudge_message
from task_feedback_service import feedback_service

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Database File Paths
DB_FILES = {
    "user": os.path.join(BASE_DIR, "User.db"),
    "udata": os.path.join(BASE_DIR, "UData.db"),
    "chatlog": os.path.join(BASE_DIR, "chatlog.db"),
    "chatroom": os.path.join(BASE_DIR, "chatroom.db"),
    "task": os.path.join(BASE_DIR, "task.db")
}

# 넛지 활성화 상태 관리 (메모리 기반)
# {user_id: {"enabled": True/False, "last_nudge_time": datetime, "nudge_count": int}}
nudge_status: Dict[str, Dict[str, Any]] = {}

# ==================== Helper Functions ====================

@contextmanager
def get_db_connection(db_name: str):
    """
    Context manager for database connections.
    Usage:
        with get_db_connection('user') as conn:
            cur = conn.cursor()
            ...
    """
    db_path = DB_FILES.get(db_name)
    if not db_path:
        raise ValueError(f"Unknown database name: {db_name}")
    
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
    finally:
        conn.close()

def get_authorized_user_info(request: Request) -> Tuple[Optional[sqlite3.Row], Optional[JSONResponse]]:
    """
    Validates session and retrieves user info from UData.db.
    Returns (user_row, error_response).
    If error_response is not None, it should be returned by the endpoint.
    """
    user_pk = request.session.get("user_pk")
    if not user_pk:
        return None, JSONResponse(status_code=401, content={"error": "로그인이 필요합니다."})
    
    with get_db_connection("udata") as conn:
        cur = conn.cursor()
        cur.execute("SELECT ID, User_ID, Personalist FROM UData WHERE ID=?", (user_pk,))
        user_row = cur.fetchone()
        
    if not user_row:
        return None, JSONResponse(status_code=404, content={"error": "사용자 없음"})
        
    return user_row, None

def get_user_keywords(user_pk: int) -> List[str]:
    """Retrieves user keywords from User.db."""
    try:
        with get_db_connection("user") as conn:
            cur = conn.cursor()
            cur.execute("SELECT keywords FROM User WHERE ID=?", (user_pk,))
            row = cur.fetchone()
            if row and row["keywords"]:
                return json.loads(row["keywords"])
    except Exception as e:
        print(f"키워드 조회 실패: {e}")
    return []

# ==================== Chat Handlers ====================

def send_chat_message_handler(app):
    @app.post("/api/chat/send")
    def send_chat_message(request: Request, data: dict = Body(...)):
        user_row, error = get_authorized_user_info(request)
        if error: return error
        
        user_id = user_row["User_ID"]
        user_pk = user_row["ID"]
        
        message = data.get("message", "").strip()
        persona_type = data.get("persona_type", "Strategist")
        
        if not message:
            return JSONResponse(status_code=400, content={"error": "메시지를 입력하세요."})
            
        current_keywords = get_user_keywords(user_pk)
        
        # --- Smart Keyword Detection Logic ---
        stop_keywords = [
            "완료", "끝", "다했다", "종료", "다했어", "끝났어", "완료했어",
            "다됐어", "다됐다", "끝냈어", "끝냈다", "끝냄", 
            "마쳤어", "마쳤다", "마침", "마무리",
            "다끝", "다 끝", "올클", "올클리어", "클리어",
            "finish", "finished", "done", "complete", "completed",
            "피니쉬", "피니시", "던"
        ]
        
        # Check if message contains any stop keywords (case-insensitive)
        message_lower = message.lower()
        keyword_detected = any(k in message_lower for k in stop_keywords)
        should_stop_nudge = False

        if keyword_detected:
            with get_db_connection("task") as conn:
                cur = conn.cursor()
                cur.execute("SELECT COUNT(*) as count FROM task WHERE User_ID=? AND status != '완료'", (user_id,))
                remaining_tasks = cur.fetchone()["count"]
            
            if remaining_tasks == 0:
                should_stop_nudge = True
                print(f"[스마트 감지] 키워드 감지 + 남은 Task 0개 → 넛지 중지")
            else:
                print(f"[스마트 감지] 키워드 감지됨, 남은 Task {remaining_tasks}개 → 넛지 유지")

        # 1. Save User Message
        with get_db_connection("chatlog") as conn:
            cur = conn.cursor()
            cur.execute("INSERT INTO chatlog (User_ID, speaker, message) VALUES (?, ?, ?)", (user_id, "User", message))
            conn.commit()
            user_message_id = cur.lastrowid
            
            # Fetch user context for AI
            cur.execute("SELECT speaker, message FROM chatlog WHERE User_ID=? ORDER BY created_at DESC LIMIT 10", (user_id,))
            recent_chats = [{"speaker": r["speaker"], "message": r["message"]} for r in cur.fetchall()][::-1]

        # 2. Call AI Service
        conversation_history = format_conversation_history(recent_chats[:-1]) # Exclude current message from history to avoid dupes if strictly needed, or logic specific
        keywords_str = ", ".join(current_keywords) if current_keywords else None
        
        result = extract_tasks_from_conversation(persona_type, conversation_history, message, keywords_str)
        
        ai_response = result.get("response", "응답을 생성할 수 없습니다.")
        extracted_tasks = result.get("tasks", [])
        new_keywords = result.get("user_keywords", [])

        # 3. Update Keywords if changed
        if new_keywords:
            try:
                updated_keywords_json = json.dumps(list(set(new_keywords)), ensure_ascii=False)
                with get_db_connection("user") as conn:
                    conn.execute("UPDATE User SET keywords=? WHERE ID=?", (updated_keywords_json, user_pk))
                    conn.commit()
            except Exception as e:
                print(f"키워드 업데이트 실패: {e}")

        # 4. Save AI Response
        with get_db_connection("chatlog") as conn:
            cur = conn.cursor()
            cur.execute("INSERT INTO chatlog (User_ID, speaker, message) VALUES (?, ?, ?)", (user_id, "AI", ai_response))
            conn.commit()
            ai_message_id = cur.lastrowid

        # 5. Save Extracted Tasks
        saved_tasks = []
        if extracted_tasks:
            with get_db_connection("task") as conn:
                cur = conn.cursor()
                for task in extracted_tasks:
                    cur.execute(
                        """INSERT INTO task (User_ID, title, todo, date, time, priority, status, extracted_from_chat) 
                           VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
                        (user_id, task.get("title"), task.get("detail"), task.get("date"), task.get("time"),
                         task.get("priority", "medium"), "대기", 1)
                    )
                    task_id = cur.lastrowid
                    
                    # Log creation
                    cur.execute(
                        "INSERT INTO action_log (Task_ID, User_ID, action, new_value) VALUES (?, ?, ?, ?)",
                        (task_id, user_id, "created", f"자동 추출: {task.get('title')}")
                    )
                    
                    # Log extraction context
                    extraction_context = json.dumps({
                        "persona_type": persona_type, 
                        "task_data": task, 
                        "keywords": new_keywords
                    }, ensure_ascii=False)
                    
                    cur.execute(
                        """INSERT INTO task_extraction_log 
                           (Task_ID, User_ID, user_message_id, ai_message_id, user_message, ai_response, extraction_context) 
                           VALUES (?, ?, ?, ?, ?, ?, ?)""",
                        (task_id, user_id, user_message_id, ai_message_id, message, ai_response, extraction_context)
                    )
                    
                    saved_tasks.append({
                        "id": task_id,
                        "title": task.get("title"),
                        "detail": task.get("detail"),
                        "date": task.get("date"),
                        "time": task.get("time"),
                        "priority": task.get("priority", "medium"),
                        "status": "대기",
                        "extracted_from_chat": 1
                    })
                conn.commit()

        # Reset Nudge Count on user interaction
        if user_id in nudge_status:
            nudge_status[user_id]["nudge_count"] = 0

        return {
            "ok": True,
            "ai_response": ai_response,
            "extracted_tasks": saved_tasks,
            "user_message_id": user_message_id,
            "ai_message_id": ai_message_id,
            "user_keywords": new_keywords,
            "nudge_stopped": should_stop_nudge
        }

def get_chat_history_handler(app):
    @app.get("/api/chat/history")
    def get_chat_history(request: Request, limit: int = 50):
        user_row, error = get_authorized_user_info(request)
        if error: return error
        
        with get_db_connection("chatlog") as conn:
            cur = conn.cursor()
            cur.execute(
                "SELECT ID, speaker, message, created_at FROM chatlog WHERE User_ID=? ORDER BY created_at ASC LIMIT ?",
                (user_row["User_ID"], limit)
            )
            chats = [{"id": r["ID"], "speaker": r["speaker"], "message": r["message"], "created_at": r["created_at"]} for r in cur.fetchall()]
            
        return {"chats": chats}

def clear_chat_history_handler(app):
    @app.delete("/api/chat/history")
    def clear_chat_history(request: Request):
        user_row, error = get_authorized_user_info(request)
        if error: return error
        
        with get_db_connection("chatlog") as conn:
            conn.execute("DELETE FROM chatlog WHERE User_ID=?", (user_row["User_ID"],))
            conn.commit()
            
        return {"ok": True, "message": "채팅 기록이 삭제되었습니다."}

# ==================== Task Handlers ====================

def get_tasks_handler(app):
    @app.get("/api/tasks")
    def get_tasks(request: Request):
        user_row, error = get_authorized_user_info(request)
        if error: return error
        
        user_id = user_row["User_ID"]
        today_str = datetime.now().strftime("%Y-%m-%d")
        
        with get_db_connection("task") as conn:
            cur = conn.cursor()
            # Clean up old tasks
            cur.execute("DELETE FROM task WHERE User_ID=? AND date < ?", (user_id, today_str))
            conn.commit()
            
            cur.execute(
                """SELECT ID, title, todo, date, time, priority, status, created_at, extracted_from_chat 
                   FROM task WHERE User_ID=? 
                   ORDER BY date DESC, time ASC, created_at DESC""", 
                (user_id,)
            )
            tasks = [{
                "id": r["ID"], "title": r["title"], "detail": r["todo"],
                "date": r["date"], "time": r["time"], "priority": r["priority"],
                "status": r["status"], "created_at": r["created_at"],
                "extracted_from_chat": r["extracted_from_chat"]
            } for r in cur.fetchall()]
            
        return {"tasks": tasks}

def create_task_handler(app):
    @app.post("/api/tasks")
    def create_task(request: Request, data: dict = Body(...)):
        user_row, error = get_authorized_user_info(request)
        if error: return error
        user_id = user_row["User_ID"]
        
        title = data.get("title", "").strip()
        if not title: return JSONResponse(status_code=400, content={"error": "제목은 필수입니다."})
        
        with get_db_connection("task") as conn:
            cur = conn.cursor()
            cur.execute(
                """INSERT INTO task (User_ID, title, todo, date, time, priority, status, extracted_from_chat) 
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
                (user_id, title, data.get("detail", ""), data.get("date", datetime.now().strftime("%Y-%m-%d")), 
                 data.get("time"), data.get("priority", "medium"), "대기", 0)
            )
            task_id = cur.lastrowid
            
            cur.execute(
                "INSERT INTO action_log (Task_ID, User_ID, action, new_value) VALUES (?, ?, ?, ?)",
                (task_id, user_id, "created", f"수동 생성: {title}")
            )
            conn.commit()
            
        return {"ok": True, "task_id": task_id}

def update_task_handler(app):
    @app.put("/api/tasks/{task_id}")
    def update_task(request: Request, task_id: int, data: dict = Body(...)):
        user_row, error = get_authorized_user_info(request)
        if error: return error
        user_id = user_row["User_ID"]
        
        with get_db_connection("task") as conn:
            cur = conn.cursor()
            cur.execute("SELECT * FROM task WHERE ID=? AND User_ID=?", (task_id, user_id))
            old_task = cur.fetchone()
            
            if not old_task:
                return JSONResponse(status_code=404, content={"error": "Task를 찾을 수 없습니다."})
            
            # Prepare Update Data
            updates = {
                "title": data.get("title", old_task["title"]),
                "todo": data.get("detail", old_task["todo"]),
                "date": data.get("date", old_task["date"]),
                "time": data.get("time", old_task["time"]),
                "priority": data.get("priority", old_task["priority"])
            }
            
            cur.execute(
                """UPDATE task SET title=:title, todo=:todo, date=:date, time=:time, priority=:priority, 
                   updated_at=CURRENT_TIMESTAMP WHERE ID=:task_id""",
                {**updates, "task_id": task_id}
            )
            
            # Log Action
            old_val_json = json.dumps({k: old_task[k] for k in ["title", "todo", "date", "time", "priority"]}, default=str)
            new_val_json = json.dumps(updates, default=str)
            
            cur.execute(
                "INSERT INTO action_log (Task_ID, User_ID, action, old_value, new_value) VALUES (?, ?, ?, ?, ?)",
                (task_id, user_id, "updated", old_val_json, new_val_json)
            )
            conn.commit()
            
        return {"ok": True}

def delete_task_handler(app):
    @app.delete("/api/tasks/{task_id}")
    def delete_task(request: Request, task_id: int):
        user_row, error = get_authorized_user_info(request)
        if error: return error
        user_id = user_row["User_ID"]
        
        with get_db_connection("task") as conn:
            cur = conn.cursor()
            cur.execute("SELECT title FROM task WHERE ID=? AND User_ID=?", (task_id, user_id))
            task = cur.fetchone()
            
            if not task:
                return JSONResponse(status_code=404, content={"error": "Task를 찾을 수 없습니다."})
                
            cur.execute("INSERT INTO action_log (Task_ID, User_ID, action, old_value) VALUES (?, ?, ?, ?)",
                        (task_id, user_id, "deleted", task["title"]))
            cur.execute("DELETE FROM task WHERE ID=?", (task_id,))
            conn.commit()
            
        return {"ok": True}

def update_task_status_handler(app):
    @app.patch("/api/tasks/{task_id}/status")
    def update_task_status(request: Request, task_id: int, data: dict = Body(...)):
        user_row, error = get_authorized_user_info(request)
        if error: return error
        
        user_id = user_row["User_ID"]
        user_pk = user_row["ID"]
        new_status = data.get("status", "")
        persona_type = data.get("persona_type", "Strategist")
        
        if not new_status: return JSONResponse(status_code=400, content={"error": "상태를 입력하세요."})
        
        with get_db_connection("task") as conn:
            cur = conn.cursor()
            cur.execute("SELECT status, title, todo FROM task WHERE ID=? AND User_ID=?", (task_id, user_id))
            task = cur.fetchone()
            
            if not task: return JSONResponse(status_code=404, content={"error": "Task를 찾을 수 없습니다."})
            
            old_status = task["status"]
            task_title = task["title"]
            task_todo = task["todo"]
            
            # Handle Nudge Reactivation
            if new_status == "시작":
                user_nudge = nudge_status.setdefault(user_id, {"enabled": True, "last_nudge_time": None, "nudge_count": 0})
                user_nudge["enabled"] = True
                print(f"[API] Task 시작 → 넛지 재활성화 (User: {user_id})")

            # Update DB based on Status
            if new_status == "완료":
                cur.execute(
                    "INSERT INTO action_log (Task_ID, User_ID, action, old_value, new_value) VALUES (?, ?, ?, ?, ?)",
                    (task_id, user_id, "completed_and_deleted", old_status, new_status)
                )
                cur.execute("DELETE FROM task WHERE ID=?", (task_id,))
            else:
                cur.execute("UPDATE task SET status=?, updated_at=CURRENT_TIMESTAMP WHERE ID=?", (new_status, task_id))
                cur.execute(
                    "INSERT INTO action_log (Task_ID, User_ID, action, old_value, new_value) VALUES (?, ?, ?, ?, ?)",
                    (task_id, user_id, "status_changed", old_status, new_status)
                )
            conn.commit()
            
            # Check for remaining tasks if completed
            all_tasks_completed = False
            if new_status == "완료":
                cur.execute("SELECT COUNT(*) as count FROM task WHERE User_ID=?", (user_id,))
                if cur.fetchone()["count"] == 0:
                    all_tasks_completed = True
                    if user_id in nudge_status:
                        nudge_status[user_id]["enabled"] = False

        # Generate Feedback
        feedback = None
        try:
            # Re-query user for MBTI (could be optimized, but separate DB)
            with get_db_connection("user") as conn:
                cur = conn.cursor()
                cur.execute("SELECT MBTI FROM User WHERE ID=?", (user_pk,))
                u_info = cur.fetchone()
                
            if u_info and u_info["MBTI"]:
                feedback = feedback_service.generate_feedback(
                    user_name=user_id, user_mbti=u_info["MBTI"],
                    task_title=task_title, task_detail=task_todo or "",
                    old_status=old_status, new_status=new_status, persona_type=persona_type
                )
        except Exception as e:
            print(f"피드백 생성 오류: {e}")

        return {
            "ok": True, 
            "feedback": feedback, 
            "deleted": new_status == "완료",
            "all_tasks_completed": all_tasks_completed
        }

def get_task_actions_handler(app):
    @app.get("/api/tasks/{task_id}/actions")
    def get_task_actions(request: Request, task_id: int):
        user_row, error = get_authorized_user_info(request)
        if error: return error
        
        with get_db_connection("task") as conn:
            cur = conn.cursor()
            cur.execute(
                "SELECT ID, action, old_value, new_value, created_at FROM action_log WHERE Task_ID=? ORDER BY created_at DESC", 
                (task_id,)
            )
            actions = [{"id": r["ID"], "action": r["action"], "old_value": r["old_value"], 
                        "new_value": r["new_value"], "created_at": r["created_at"]} for r in cur.fetchall()]
        return {"actions": actions}

def delete_tasks_by_date_handler(app):
    @app.delete("/api/tasks/date/{date_str}")
    def delete_tasks_by_date(request: Request, date_str: str):
        user_row, error = get_authorized_user_info(request)
        if error: return error
        user_id = user_row["User_ID"]
        
        with get_db_connection("task") as conn:
            cur = conn.cursor()
            cur.execute("INSERT INTO action_log (Task_ID, User_ID, action, old_value) VALUES (?, ?, ?, ?)",
                        (0, user_id, "bulk_deleted_by_date", date_str))
            cur.execute("DELETE FROM task WHERE User_ID=? AND date=?", (user_id, date_str))
            deleted_count = cur.rowcount
            conn.commit()
            
        return {"ok": True, "deleted_count": deleted_count}

# ==================== Nudge Handlers ====================

def get_nudge_poll_handler(app):
    @app.get("/api/nudge/poll")
    def get_nudge_poll(request: Request):
        user_row, error = get_authorized_user_info(request)
        if error: return error
        
        user_id = user_row["User_ID"]
        user_type = user_row["Personalist"]
        
        persona_map = {"Type A": "Lighthouse", "Type B": "DrillSergeantFocus", 
                       "Type C": "DrillSergeantPace", "Type D": "Strategist"}
        persona_type = persona_map.get(user_type, "Strategist")
        
        user_nudge = nudge_status.setdefault(user_id, {"enabled": True, "last_nudge_time": None, "nudge_count": 0})
        
        if not user_nudge["enabled"]:
            return {"nudge_message": None, "enabled": False}
        
        # Check Tasks
        with get_db_connection("task") as conn:
            cur = conn.cursor()
            cur.execute(
                "SELECT ID, title, todo, date, time, status FROM task WHERE User_ID=? AND status != '완료' ORDER BY date ASC, time ASC",
                (user_id,)
            )
            tasks = [{"id": r["ID"], "title": r["title"], "detail": r["todo"], "date": r["date"], 
                      "time": r["time"], "status": r["status"]} for r in cur.fetchall()]
        
        # Check Recent Chat History (for idle time)
        with get_db_connection("chatlog") as conn:
            cur = conn.cursor()
            cur.execute("SELECT created_at, speaker, message FROM chatlog WHERE User_ID=? ORDER BY created_at DESC LIMIT 5", (user_id,))
            recent_chats = [{"speaker": r["speaker"], "message": r["message"], "created_at": r["created_at"]} for r in cur.fetchall()]
            recent_chats.reverse()
            
        idle_time = 0
        if recent_chats:
            try:
                last_time = datetime.strptime(recent_chats[-1]["created_at"], "%Y-%m-%d %H:%M:%S")
                idle_time = int((datetime.now() - last_time).total_seconds() / 60)
            except: pass
            
        # Logic
        user_nudge["nudge_count"] += 1
        current_nudge_count = user_nudge["nudge_count"]
        
        conversation_history = format_conversation_history(recent_chats) if recent_chats else None
        
        # Generate Nudge (Expensive Call)
        print(f"[넛지 폴링] 생성 시작 (Count: {current_nudge_count}, Idle: {idle_time}분)")
        nudge_message = generate_nudge_message(
            persona_type, tasks, conversation_history, nudge_count=current_nudge_count, idle_time=idle_time
        )
        
        if nudge_message:
            user_nudge["last_nudge_time"] = datetime.now()
        else:
            user_nudge["nudge_count"] = 0 # Reset if no nudge generated (strategy decision)
            
        return {
            "nudge_message": nudge_message,
            "enabled": True,
            "persona_type": persona_type,
            "nudge_count": current_nudge_count
        }

def stop_nudge_handler(app):
    @app.post("/api/nudge/stop")
    def stop_nudge(request: Request):
        user_row, error = get_authorized_user_info(request)
        if error: return error
        
        user_id = user_row["User_ID"]
        nudge_status.setdefault(user_id, {})["enabled"] = False
        return {"ok": True, "message": "넛지가 중지되었습니다."}

def get_nudge_status_handler(app):
    @app.get("/api/nudge/status")
    def get_nudge_status(request: Request):
        user_row, error = get_authorized_user_info(request)
        if error: return error
        
        user_id = user_row["User_ID"]
        status = nudge_status.setdefault(user_id, {"enabled": True, "last_nudge_time": None})
        
        return {
            "enabled": status["enabled"],
            "last_nudge_time": status["last_nudge_time"].isoformat() if status["last_nudge_time"] else None
        }

# ==================== Registration ====================

def register_chat_and_task_apis(app):
    """모든 채팅 및 Task API 엔드포인트를 FastAPI 앱에 등록"""
    handlers = [
        send_chat_message_handler,
        get_chat_history_handler,
        clear_chat_history_handler,
        get_tasks_handler,
        create_task_handler,
        update_task_handler,
        delete_task_handler,
        update_task_status_handler,
        get_task_actions_handler,
        delete_tasks_by_date_handler,
        get_nudge_poll_handler,
        stop_nudge_handler,
        get_nudge_status_handler
    ]
    
    for handler in handlers:
        handler(app)
