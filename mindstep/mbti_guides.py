# ------------------------------------------------------------
# 💾 mbti_guides.py
# MBTI 16유형 성향 + 스트레스 반응 + 성장 방향 + 피드백 스타일 요약
# ------------------------------------------------------------
import random
from typing import Dict, Any

# ==================== MBTI Data ====================

MBTI_GUIDES = {
    "INFP": {
        "trait": "감정형, 이상주의적, 내면 가치 중심형",
        "strength": "공감 능력, 자기 이해력, 창의적 사고",
        "stress_reaction": "비판이나 무시당할 때 깊이 상처받고 회피함.",
        "growth_tip": "감정을 표현하고, 완벽함보다 진전에 집중하세요.",
        "feedback_style": "감정 수용을 우선하며 진심 어린 격려를 제공합니다."
    },
    "INFJ": {
        "trait": "통찰력 있고 사려 깊은 조언자형",
        "strength": "타인의 감정을 깊이 이해하고 미래를 계획함",
        "stress_reaction": "자신의 가치가 무시될 때 회의감과 피로감이 커짐.",
        "growth_tip": "타인에게 기대기보다 스스로의 감정도 돌보세요.",
        "feedback_style": "감정의 흐름을 존중하며 내면의 안정에 집중하게 합니다."
    },
    "ENFP": {
        "trait": "열정적이고 창의적인 탐험가형",
        "strength": "새로운 아이디어와 사람에게 에너지 얻음",
        "stress_reaction": "자유가 제한되거나 반복 업무 시 번아웃 가능.",
        "growth_tip": "루틴과 휴식을 설정해 에너지를 관리하세요.",
        "feedback_style": "감정에 공감하며 새로운 시도를 격려합니다."
    },
    "ENFJ": {
        "trait": "리더십 있고 따뜻한 지도자형",
        "strength": "타인을 동기부여시키고 관계를 이끄는 능력",
        "stress_reaction": "타인 문제를 너무 책임질 때 번아웃 발생.",
        "growth_tip": "모든 사람을 도우려 하기보다 자기 돌봄을 포함하세요.",
        "feedback_style": "타인의 감정과 조화를 유지하며 따뜻한 방향을 제시합니다."
    },
    "ISFP": {
        "trait": "따뜻하고 감성적인 예술가형",
        "strength": "감정 표현력과 순간의 아름다움에 몰입",
        "stress_reaction": "비난받으면 자신을 닫고 조용히 후퇴함.",
        "growth_tip": "감정을 억누르지 말고 솔직하게 표현하세요.",
        "feedback_style": "감성적 공감을 바탕으로 위로와 지지를 제공합니다."
    },
    "ISFJ": {
        "trait": "헌신적이고 세심한 수호자형",
        "strength": "꾸준함과 책임감, 타인을 돕는 헌신적인 태도",
        "stress_reaction": "비판을 받거나 불안정한 환경에서 과도한 자기비판",
        "growth_tip": "완벽함보다 유연함을, 타인을 돕듯 자신도 돌보세요.",
        "feedback_style": "작은 성취를 인정하고 꾸준함을 칭찬하는 어조 유지."
    },
    "ESFP": {
        "trait": "에너지 넘치고 현실적인 즉흥형",
        "strength": "즉각적인 행동력, 주변 분위기 활력화",
        "stress_reaction": "통제받거나 지루한 일상에서 급격한 피로감",
        "growth_tip": "충동 대신 즐거운 루틴을 만들어 안정감을 느껴보세요.",
        "feedback_style": "밝은 톤으로 실천 가능한 행동을 제시합니다."
    },
    "ESFJ": {
        "trait": "사교적이고 조화로운 협력형",
        "strength": "타인의 필요를 빠르게 파악하고 배려함",
        "stress_reaction": "갈등이 생기면 감정적으로 크게 흔들림",
        "growth_tip": "모든 사람을 만족시키려 하기보다 자신에게도 여유를 주세요.",
        "feedback_style": "따뜻하고 조화로운 분위기를 유지하며 안정감을 줍니다."
    },
    "INTP": {
        "trait": "논리적이고 분석적인 사색가형",
        "strength": "문제 해결 능력, 독창적 사고, 객관성",
        "stress_reaction": "감정 표현 부족으로 오해받거나 고립될 수 있음",
        "growth_tip": "감정 표현을 훈련하고 주변과의 연결을 유지하세요.",
        "feedback_style": "객관적 분석과 유연한 사고를 장려합니다."
    },
    "INTJ": {
        "trait": "독립적이고 전략적인 계획가형",
        "strength": "체계적 사고와 장기적 비전 수립 능력",
        "stress_reaction": "비효율적인 상황에서 예민함과 비판적 태도 증가",
        "growth_tip": "타인의 속도도 존중하며, 협력 속에서 비전을 조정하세요.",
        "feedback_style": "목표 지향적이고 효율 중심의 피드백 제공."
    },
    "ENTP": {
        "trait": "도전적이고 혁신적인 아이디어형",
        "strength": "즉흥적 문제 해결력, 논쟁에서의 설득력",
        "stress_reaction": "제한되거나 반복되는 업무에서 쉽게 지루해함",
        "growth_tip": "지속 가능한 루틴을 만들어 집중력을 유지하세요.",
        "feedback_style": "유연한 사고를 독려하며 창의적 시도를 장려합니다."
    },
    "ENTJ": {
        "trait": "리더십 강하고 목표 지향적 관리형",
        "strength": "결단력, 분석력, 높은 목표 달성력",
        "stress_reaction": "비효율이나 무질서에 분노하며 통제 욕구 증가",
        "growth_tip": "결과뿐 아니라 과정과 팀 감정을 존중하세요.",
        "feedback_style": "구체적 목표와 효율적 전략을 강조하는 조언 제공."
    },
    "ESTP": {
        "trait": "현실적이고 행동 중심의 실행가형",
        "strength": "위기 대처력, 즉각적 판단, 모험심",
        "stress_reaction": "구속되거나 단조로운 환경에서 흥미 상실",
        "growth_tip": "단기 목표를 설정하고 결과를 시각화하세요.",
        "feedback_style": "실행 중심 피드백으로 즉각적 동기를 부여합니다."
    },
    "ESTJ": {
        "trait": "조직적이고 실용적인 관리자형",
        "strength": "체계적 사고, 리더십, 실행력",
        "stress_reaction": "비효율과 계획 혼란에서 스트레스 급증",
        "growth_tip": "유연함과 감정 소통을 함께 연습하세요.",
        "feedback_style": "구체적 행동 지침을 명확하게 제시합니다."
    },
    "ISTP": {
        "trait": "논리적이고 실험적인 기술가형",
        "strength": "문제 해결 능력, 실용적 판단, 독립성",
        "stress_reaction": "통제받거나 감정적인 상황에서 피로감",
        "growth_tip": "감정도 하나의 정보로 받아들이세요.",
        "feedback_style": "실용적이고 간결한 피드백 제공."
    },
    "ISTJ": {
        "trait": "책임감 있고 신중한 현실주의자형",
        "strength": "체계적 사고, 신뢰성, 꾸준함",
        "stress_reaction": "실수 반복 시 자기비판 심화 및 완벽주의 경향",
        "growth_tip": "자신에게도 실수와 휴식을 허용하세요.",
        "feedback_style": "성실함과 안정감을 기반으로 격려합니다."
    }
}

# ==================== Style Phrases ====================

PHRASES = {
    "E": [
        "좋아, 에너지 넘치는 하루로 만들어보자!",
        "오늘도 주변 사람들과 즐겁게 소통해보자!",
        "너의 밝은 에너지가 주변을 움직일 거야!"
    ],
    "I": [
        "조용히 내면을 들여다볼 시간 같아.",
        "혼자만의 공간에서 차분히 정리해보자.",
        "지금은 깊은 생각을 정리하기에 좋은 때야."
    ],
    "S": [
        "지금 눈앞의 일부터 하나씩 해결하자.",
        "구체적인 행동이 마음을 편하게 해줄 거야.",
        "현실적인 방법부터 차근차근 해보자."
    ],
    "N": [
        "큰 그림을 떠올려보자. 방향이 보일 거야.",
        "지금은 아이디어를 확장할 타이밍이야.",
        "가능성에 집중하자. 새로운 길이 열릴지도 몰라."
    ],
    "T": [
        "지금 상황을 정리해보자.",
        "한 번에 하나씩 처리하자.",
        "우선순위를 정리하면 마음이 편해질 거야."
    ],
    "F": [
        "지금 마음 충분히 이해돼.",
        "조금만 쉬면 괜찮아질 거야.",
        "너무 스스로를 몰아붙이지 말자."
    ],
    "J": [
        "계획을 세워보자. 그러면 마음이 한결 안정될 거야.",
        "지금 해야 할 일을 명확히 정하자.",
        "체계적으로 진행하면 훨씬 수월해질 거야."
    ],
    "P": [
        "조금은 자유롭게 흘러가보자.",
        "완벽하지 않아도 괜찮아. 지금의 흐름을 즐겨봐.",
        "상황에 맞게 유연하게 움직이자."
    ]
}


# ==================== Logic ====================

def get_mbti_style(mbti_type: str) -> Dict[str, str]:
    """
    MBTI 4가지 축(E/I, S/N, T/F, J/P)에 따라 자연스러운 문체 스타일을 생성합니다.
    """
    mbti_type = mbti_type.upper()
    style = {}

    # Helper to pick phrase
    def pick_phrase(key_map: Dict[str, str], default: str) -> str:
        for char, key in key_map.items():
            if char in mbti_type:
                return random.choice(PHRASES[key])
        return default

    # 1. intro_phrase (E vs I)
    style["intro_phrase"] = pick_phrase(
        {"E": "E", "I": "I"}, 
        default="오늘은 자연스럽게 자신답게 시작하자."
    )

    # 2. focus_pattern (S vs N)
    style["focus_pattern"] = pick_phrase(
        {"S": "S", "N": "N"}, 
        default="지금의 상황을 균형 있게 바라보자."
    )

    # 3. sentence_pattern (T vs F)
    style["sentence_pattern"] = pick_phrase(
        {"T": "T", "F": "F"}, 
        default="지금 상황을 부드럽게 이어가보자."
    )

    # 4. action_pattern (J vs P)
    style["action_pattern"] = pick_phrase(
        {"J": "J", "P": "P"}, 
        default="오늘은 자연스럽게 흘러가도 괜찮아."
    )

    return style


def get_mbti_guide(mbti_type: str) -> Dict[str, Any]:
    """
    주어진 MBTI 유형에 대한 가이드 정보와 스타일 문구를 반환합니다.
    존재하지 않는 MBTI 유형일 경우 빈 정보를 반환합니다.
    """
    if not mbti_type or len(mbti_type) != 4:
        return {}
        
    mbti_type = mbti_type.upper()
    
    base_info = MBTI_GUIDES.get(mbti_type, {})
    if not base_info:
        # Fallback for invalid types if 4 chars provided but not in dict
        return {}
        
    style_info = get_mbti_style(mbti_type)
    
    return {**base_info, **style_info}
