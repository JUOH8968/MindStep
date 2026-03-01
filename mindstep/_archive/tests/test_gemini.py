"""
Gemini API 및 Task 추출 테스트 스크립트
"""
# -*- coding: utf-8 -*-
import sys
import os

# UTF-8 출력 설정
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

sys.path.append('.')

from gemini_service import extract_tasks_from_conversation, GEMINI_API_KEY

print("=" * 60)
print("Gemini API 테스트")
print("=" * 60)

# API 키 확인
if not GEMINI_API_KEY:
    print("[ERROR] Gemini API 키가 설정되지 않았습니다!")
    print("gemini_service.py 파일의 7번 줄에 API 키를 입력하세요.")
    sys.exit(1)

print(f"[OK] API 키 설정됨: {GEMINI_API_KEY[:10]}...")

# 테스트 메시지
test_messages = [
    "내일 운동하기",
    "다음 주 월요일 회의 있어",
    "오늘 저녁에 친구 만나기로 했어"
]

print("\n" + "=" * 60)
print("Task 추출 테스트")
print("=" * 60)

for i, message in enumerate(test_messages, 1):
    print(f"\n테스트 {i}: '{message}'")
    print("-" * 60)
    
    try:
        result = extract_tasks_from_conversation(
            persona_type="Strategist",
            conversation_history="(대화 기록 없음)",
            user_message=message
        )
        
        print(f"AI 응답: {result.get('response', 'N/A')}")
        
        tasks = result.get('tasks', [])
        if tasks:
            print(f"[OK] 추출된 Task 개수: {len(tasks)}")
            for j, task in enumerate(tasks, 1):
                print(f"  Task {j}:")
                print(f"    - 제목: {task.get('title')}")
                print(f"    - 상세: {task.get('detail')}")
                print(f"    - 날짜: {task.get('date')}")
                print(f"    - 우선순위: {task.get('priority')}")
        else:
            print("[WARNING] 추출된 Task 없음")
            
    except Exception as e:
        print(f"[ERROR] 오류 발생: {e}")
        import traceback
        traceback.print_exc()

print("\n" + "=" * 60)
print("테스트 완료")
print("=" * 60)
