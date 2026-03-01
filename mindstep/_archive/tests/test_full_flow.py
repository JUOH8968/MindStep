# -*- coding: utf-8 -*-
"""
전체 흐름 테스트: 대화 → Task 추출 → DB 저장
"""
import sys
import os
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

sys.path.append('.')

import sqlite3
from gemini_service import extract_tasks_from_conversation

print("=" * 70)
print("대화 기반 Task 추출 및 DB 저장 테스트")
print("=" * 70)

# 테스트 사용자 ID
test_user_id = "test_user"

# 1. Task 추출
print("\n[1단계] Gemini API로 Task 추출 중...")
message = "내일 오후 3시에 회의 있고, 저녁에 운동하기"
result = extract_tasks_from_conversation("Strategist", "", message)

print(f"AI 응답: {result.get('response')}")
print(f"추출된 Task 개수: {len(result.get('tasks', []))}")

# 2. DB에 저장
print("\n[2단계] task.db에 저장 중...")
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
task_db = sqlite3.connect(os.path.join(BASE_DIR, "task.db"))
task_cur = task_db.cursor()

saved_count = 0
for task in result.get('tasks', []):
    task_cur.execute(
        """INSERT INTO task (User_ID, title, todo, date, priority, status, extracted_from_chat) 
           VALUES (?, ?, ?, ?, ?, ?, ?)""",
        (test_user_id, task.get("title"), task.get("detail"), task.get("date"), 
         task.get("priority", "medium"), "대기", 1)
    )
    task_id = task_cur.lastrowid
    
    # Action 로그 기록
    task_cur.execute(
        """INSERT INTO action_log (Task_ID, User_ID, action, new_value) 
           VALUES (?, ?, ?, ?)""",
        (task_id, test_user_id, "created", f"자동 추출: {task.get('title')}")
    )
    
    print(f"  [OK] Task 저장: {task.get('title')} (ID: {task_id})")
    saved_count += 1

task_db.commit()
task_db.close()

print(f"\n총 {saved_count}개 Task 저장 완료!")

# 3. DB에서 확인
print("\n[3단계] task.db에서 확인...")
task_db = sqlite3.connect(os.path.join(BASE_DIR, "task.db"))
task_db.row_factory = sqlite3.Row
cur = task_db.cursor()

cur.execute("SELECT * FROM task WHERE User_ID=? ORDER BY created_at DESC", (test_user_id,))
tasks = cur.fetchall()

print(f"\n저장된 Task 목록 (총 {len(tasks)}개):")
print("-" * 70)
for task in tasks:
    print(f"ID: {task['ID']}")
    print(f"  제목: {task['title']}")
    print(f"  상세: {task['todo']}")
    print(f"  날짜: {task['date']}")
    print(f"  우선순위: {task['priority']}")
    print(f"  상태: {task['status']}")
    print(f"  자동추출: {'예' if task['extracted_from_chat'] else '아니오'}")
    print(f"  생성일: {task['created_at']}")
    print("-" * 70)

# 4. Action 로그 확인
cur.execute("SELECT * FROM action_log WHERE User_ID=? ORDER BY created_at DESC LIMIT 5", (test_user_id,))
actions = cur.fetchall()

print(f"\nAction 로그 (최근 {len(actions)}개):")
print("-" * 70)
for action in actions:
    print(f"Task ID: {action['Task_ID']}")
    print(f"  액션: {action['action']}")
    print(f"  값: {action['new_value']}")
    print(f"  시간: {action['created_at']}")
    print("-" * 70)

task_db.close()

print("\n" + "=" * 70)
print("테스트 완료! ✓")
print("=" * 70)
print("\n[정리] 테스트 데이터 삭제하려면:")
print(f"  DELETE FROM task WHERE User_ID='{test_user_id}';")
print(f"  DELETE FROM action_log WHERE User_ID='{test_user_id}';")
