"""
Task 피드백 시스템 테스트 스크립트
"""

import sys
import os
import io

# Windows 콘솔 인코딩 문제 해결
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

# 현재 디렉토리를 Python 경로에 추가
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from task_feedback_service import feedback_service
from mbti_guides import get_mbti_guide


def test_mbti_guide():
    """MBTI 가이드 테스트"""
    print("=" * 60)
    print("1. MBTI 가이드 테스트")
    print("=" * 60)
    
    test_types = ["INFP", "ESTJ", "ENTP", "ISFJ"]
    
    for mbti_type in test_types:
        guide = get_mbti_guide(mbti_type)
        print(f"\n[{mbti_type}]")
        print(f"특성: {guide.get('trait', 'N/A')}")
        print(f"강점: {guide.get('strength', 'N/A')}")
        print(f"오프닝: {guide.get('intro_phrase', 'N/A')}")
        print(f"사고방식: {guide.get('focus_pattern', 'N/A')}")
        print(f"행동패턴: {guide.get('action_pattern', 'N/A')}")


def test_psychology_framework():
    """심리학 프레임워크 선택 테스트"""
    print("\n" + "=" * 60)
    print("2. 심리학 프레임워크 선택 테스트")
    print("=" * 60)
    
    test_statuses = ["포기", "완료", "진행중", "보류", "대기"]
    
    for status in test_statuses:
        framework = feedback_service.select_psychology_framework(status)
        print(f"\n[{status}]")
        print(f"프레임워크: {framework['title']}")
        print(f"핵심 원리: {framework['principle'][:50]}...")


def test_default_feedback():
    """기본 피드백 생성 테스트 (API 호출 없이)"""
    print("\n" + "=" * 60)
    print("3. 기본 피드백 생성 테스트")
    print("=" * 60)
    
    test_cases = [
        ("INFP", "일기 쓰기", "대기", "완료"),
        ("ESTJ", "운동 루틴 만들기", "진행중", "포기"),
        ("ENTP", "새로운 아이디어 브레인스토밍", "대기", "진행중"),
        ("ISFJ", "친구에게 선물 준비하기", "진행중", "완료"),
    ]
    
    for mbti, task_title, old_status, new_status in test_cases:
        guide = get_mbti_guide(mbti)
        feedback = feedback_service._get_default_feedback(new_status, task_title, guide)
        print(f"\n[{mbti}] {task_title}: {old_status} → {new_status}")
        print(f"피드백: {feedback}")


def test_full_feedback_generation():
    """전체 피드백 생성 테스트 (API 호출 포함)"""
    print("\n" + "=" * 60)
    print("4. 전체 피드백 생성 테스트 (Gemini API 호출)")
    print("=" * 60)
    
    # API 키가 설정되어 있는지 확인
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key or api_key == "your_api_key_here":
        print("\n[경고] Gemini API 키가 설정되지 않았습니다.")
        print("gemini_service.py 파일의 7번 줄에 API 키를 입력하거나")
        print(".env 파일에 GEMINI_API_KEY를 설정해주세요.")
        return
    
    print("\n테스트 케이스: INFP 사용자가 '프로젝트 기획서 작성'을 완료")
    
    try:
        feedback = feedback_service.generate_feedback(
            user_name="테스트사용자",
            user_mbti="INFP",
            task_title="프로젝트 기획서 작성",
            task_detail="Q1 프로젝트 기획서 초안 작성",
            old_status="진행중",
            new_status="완료",
            persona_type="Strategist"
        )
        
        print(f"\n생성된 피드백:\n{feedback}")
        
    except Exception as e:
        print(f"\n[실패] 피드백 생성 실패: {e}")
        print("기본 피드백으로 대체됩니다.")


if __name__ == "__main__":
    print("\n[Task 피드백 시스템 테스트 시작]\n")
    
    # 1. MBTI 가이드 테스트
    test_mbti_guide()
    
    # 2. 심리학 프레임워크 테스트
    test_psychology_framework()
    
    # 3. 기본 피드백 테스트
    test_default_feedback()
    
    # 4. 전체 피드백 생성 테스트 (선택사항)
    user_input = input("\n\nGemini API를 호출하여 실제 피드백을 생성해보시겠습니까? (y/n): ")
    if user_input.lower() == 'y':
        test_full_feedback_generation()
    
    print("\n\n[완료] 테스트 완료!")
