"""
MindStep 프로젝트: 사용자 성향 및 페르소나 매칭 구성 파일
작성자: 정이 (행동 코칭 설계자)
내용: 심리 테스트 문항, 성향별 소프트 라벨링, 페르소나 매칭 및 동률 처리 로직
"""

from typing import List, Dict, Any, Union
from collections import Counter

# 1. 사용자 성향 및 페르소나 정의
USER_TYPES: Dict[str, Dict[str, Any]] = {
    "A": {
        "label": "에너지를 아껴 쓰는 '쉼표 여행자'",
        "original_trait": "번아웃 / PMS",
        "persona": "온화한 등대",
        "description": "수용, 자기 자비, 정서적 지지 중심의 코칭 제공",
        "nudge_config": {
            "short_interval_min": 60, # 60분~90분
            "philosophy": "압박 금지, 자가 회복 지지",
            "msg_style": "매우 여유롭게"
        }
    },
    "B": {
        "label": "아이디어가 반짝이는 '자유로운 영혼'",
        "original_trait": "ADHD (주의력 분산)",
        "persona": "단호한 교관",
        "subtype": "집중 가이드",
        "description": "딴 길로 새지 않도록 경로를 잡아주는 든든한 가이드라인 제공",
        "nudge_config": {
            "short_interval_min": 5, # 5분~10분
            "philosophy": "즉각적 피드백, 울타리 형성",
            "msg_style": "초단기 확인"
        }
    },
    "C": {
        "label": "일단 시작하고 보는 '열정 엔진'",
        "original_trait": "무작정 돌진형 (충동형)",
        "persona": "단호한 교관",
        "subtype": "완주 페이스메이커",
        "description": "너무 빨리 달려 지치지 않게 속도를 조절해주는 페이스메이커 역할",
        "nudge_config": {
            "short_interval_min": 20, # 20분~30분
            "philosophy": "완주 독려, 속도 조절",
            "msg_style": "중간 점검"
        }
    },
    "D": {
        "label": "최고를 꿈꾸는 '세밀한 설계자'",
        "original_trait": "완벽주의 (호소형)",
        "persona": "냉철한 전략가",
        "description": "복잡한 생각을 정리하고 우선순위를 정해주는 인지 재구성 코칭",
        "nudge_config": {
            "short_interval_min": 40, # 40분~50분
            "philosophy": "인지 재구성, 시작 독려",
            "msg_style": "방향 확인"
        }
    }
}

# 2. 온보딩 심리 테스트 문항 (6문항)
# 문항 순서: [0: Q1] ... [4: Q5 (가중치)] ...
SURVEY_QUESTIONS: List[Dict[str, Any]] = [
    {
        "id": 1,
        "question": "오늘 할 일을 처음 떠올렸을 때, 내 마음의 온도는?",
        "options": {
            "A": "벌써 지친다... 조금만 더 누워 있고 싶어.",
            "B": "이것도 재밌겠고 저것도 해야지! (근데 뭐부터 하더라?)",
            "C": "좋아, 바로 시작하자! (이미 몸이 움직이고 있음)",
            "D": "제대로 계획을 세워야 해. 완벽한 타이밍을 기다리는 중이야."
        }
    },
    {
        "id": 2,
        "question": "일을 시작하기 전, 나의 책상 위 풍경은?",
        "options": {
            "A": "정리는커녕 물건들이 늘어져 있지만, 치울 기운도 없다.",
            "B": "쓰던 물건, 새로 꺼낸 물건이 뒤섞여서 조금 어수선한 편이다.",
            "C": "딱히 상관없다. 노트북 펴는 곳이 곧 내 책상이다.",
            "D": "주변이 정돈되어야 비로소 안심하고 시작할 수 있다."
        }
    },
    {
        "id": 3,
        "question": "집중해서 일하던 중, 흥미로운 메시지 알림이 왔을 때?",
        "options": {
            "A": "휴, 차라리 잘됐다 하며 자연스럽게 딴짓으로 도망친다.",
            "B": "나도 모르게 이미 클릭해서 보고 있다가 10분 뒤에 '아차' 한다.",
            "C": "오, 재밌겠는데? 하고 일단 본 뒤, 원래 하던 일은 잊어버린다.",
            "D": "신경은 쓰이지만, 지금 하는 일을 망치고 싶지 않아 꾹 참는다."
        }
    },
    {
        "id": 4,
        "question": "업무 도중 예상치 못한 오류나 실수가 발생했다면?",
        "options": {
            "A": "역시 난 안 되나 봐... 무력감에 빠져 노트북을 덮고 싶어진다.",
            "B": "아 맞다, 저번에 그것도 안 했지? 하며 갑자기 다른 생각으로 튄다.",
            "C": "괜찮아, 대충 넘어가고 다음 거 하자! 일단 끝내는 데 의의를 둔다.",
            "D": "처음부터 다시 해야 하나? 작은 오점 때문에 전체 흐름이 깨진다."
        }
    },
    {
        "id": 5,
        "question": "나에게 가장 필요한 '외부의 도움'은 어떤 형태인가요?",
        "options": {
            "A": "천천히 해도 괜찮아라고 말해주는 따뜻한 위로와 공감",
            "B": "내가 딴 길로 새지 않게 경로를 딱 잡아주는 든든한 가이드라인",
            "C": "내가 너무 빨리 달려서 지치지 않게 속도를 조절해주는 페이스메이커",
            "D": "복잡한 생각들을 정리해주고 우선순위를 정해주는 냉철한 조언"
        }
    },
    {
        "id": 6,
        "question": "일을 마친 후, 내가 가장 자주 느끼는 감정은?",
        "options": {
            "A": "오늘도 겨우 버텼다... 기진맥진한 해방감",
            "B": "다 끝내긴 했는데, 뭔가 빼먹은 건 없을까? 하는 찜찜함",
            "C": "드디어 끝! 이제 다음 재밌는 거 뭐 있지? 하는 들뜬 마음",
            "D": "조금 더 잘할 수 있었는데... 하는 아쉬움과 피로감"
        }
    }
]

# 3. 성향 결정 로직 (동률 처리 포함)
def calculate_user_persona(responses: List[str]) -> Dict[str, Any]:
    """
    사용자의 응답 리스트를 기반으로 최적의 페르소나를 계산합니다.
    
    Args:
        responses: 유저가 선택한 알파벳 리스트 (예: ['A', 'B', 'A', 'D', 'A', 'C'])
        
    Returns:
        Dict: 결과 상태, 결정된 타입, 해당 타입의 데이터, (동률 여부)
    """
    if not responses:
        # 응답이 없을 경우 기본값 반환 (Type D - 전략가)
        return {"status": "error", "type": "D", "data": USER_TYPES["D"]}

    counts = Counter(responses)
    if not counts:
        return {"status": "error", "type": "D", "data": USER_TYPES["D"]}
        
    max_count = max(counts.values())
    candidates = [k for k, v in counts.items() if v == max_count]
    
    # 1. 단독 1위일 경우
    if len(candidates) == 1:
        selected_type = candidates[0]
        return {
            "status": "success", 
            "type": selected_type, 
            "data": USER_TYPES[selected_type]
        }
    
    # 2. 동률 발생 시
    else:
        # 가중치 질문(Q5: index 4)의 답변을 확인하여 후보군 중에 있다면 우선순위 부여
        # Q5가 도움이 외부의 도움 형태를 묻는 질문이므로 성향 매칭에 중요함
        tie_breaker_index = 4 
        selected_type = candidates[0] # Default Fallback
        
        if len(responses) > tie_breaker_index:
            important_choice = responses[tie_breaker_index]
            if important_choice in candidates:
                selected_type = important_choice
        
        return {
            "status": "success", 
            "type": selected_type, 
            "data": USER_TYPES[selected_type], 
            "is_tie": True
        }
