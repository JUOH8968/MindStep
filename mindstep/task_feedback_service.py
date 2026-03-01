"""
Task 피드백 서비스
사용자의 MBTI 기반으로 Task 상태 변경 시 맞춤형 피드백 제공
"""
import os
import logging
from typing import Dict, Any
from dotenv import load_dotenv

from mbti_guides import get_mbti_guide
from gemini_service import call_gemini_api

# 로깅 설정
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

load_dotenv()


class TaskFeedbackService:
    """
    Task 상태 변경 시 MBTI 기반 맞춤형 피드백을 생성하는 서비스
    """
    
    # 심리학 프레임워크 정의
    PSYCHOLOGY_FRAMEWORKS = {
        "anxiety": {
            "title": "수용전념치료 (Acceptance and Commitment Therapy)",
            "principle": "부정적 감정을 통제하거나 없애려 하지 말고, 있는 그대로 '수용'하며 가치 있는 행동을 선택하게 하세요.",
            "character_hint": "따뜻하고 넓은 마음을 가진 '현자'처럼, 지금의 힘든 감정을 날씨처럼 지나가게 두고 안아주세요.",
            "key_question": "불안한 마음을 안고서도 우리가 할 수 있는 소중한 일은 뭘까?"
        },
        "depression": {
            "title": "행동 활성화 (Behavioral Activation)",
            "principle": "기분이 좋아져야 행동하는 것이 아니라, '행동'을 해야 기분이 좋아집니다. 아주 작은 마이크로 행동을 제안하세요.",
            "character_hint": "활기찬 '페이스메이커'처럼, 거창한 목표 대신 지금 당장 할 수 있는 1분짜리 행동을 경쾌하게 제안해주세요.",
            "key_question": "지금 당장 침대에서 일어나 물 한 잔 마시는 건 어때?"
        },
        "neutral": {
            "title": "인지행동치료 (Cognitive Behavioral Therapy)",
            "principle": "부정적 사고(인지적 왜곡)를 포착하고, 이를 현실적이고 합리적인 생각으로 대체하도록 유도하세요.",
            "character_hint": "감정에 휩쓸리지 않는 '논리적인 탐정'처럼, 팩트를 체크하며 차분하게 문제를 재구성해주세요.",
            "key_question": "그 생각이 정말 100% 사실일까? 다른 관점은 없을까?"
        }
    }
    
    # Task 상태별 감정 매핑
    STATUS_EMOTION_MAP = {
        "포기": "depression",
        "완료": "neutral",
        "진행중": "neutral",
        "대기": "neutral",
        "보류": "anxiety"
    }
    
    def __init__(self):
        # API Key lazy loading or check
        self.api_key = os.getenv("GEMINI_API_KEY")
    
    def select_psychology_framework(self, task_status: str) -> Dict[str, str]:
        """Task 상태에 따라 적절한 심리학 프레임워크 선택"""
        emotion = self.STATUS_EMOTION_MAP.get(task_status, "neutral")
        return self.PSYCHOLOGY_FRAMEWORKS.get(emotion, self.PSYCHOLOGY_FRAMEWORKS["neutral"])
    
    def generate_feedback(
        self,
        user_name: str,
        user_mbti: str,
        task_title: str,
        task_detail: str,
        old_status: str,
        new_status: str,
        persona_type: str = "Strategist"
    ) -> str:
        """
        Task 상태 변경에 대한 MBTI 기반 맞춤형 피드백 생성
        """
        
        # MBTI 가이드 가져오기
        mbti_guide = get_mbti_guide(user_mbti)
        
        # 심리학 프레임워크 선택
        psych_guide = self.select_psychology_framework(new_status)
        
        # 상태별 특별 지시사항
        task_instruction = self._get_task_instruction(new_status, task_title, psych_guide, mbti_guide)
        
        # 시스템 프롬프트 구성
        system_prompt = f"""
### 당신의 페르소나 (Identity)
당신은 사용자의 성향({user_mbti})을 완벽히 이해하는 AI 코치입니다.
사용자 이름: {user_name}
페르소나 타입: {persona_type}

### [가이드라인 1: 심리학적 접근 전략 - {psych_guide['title']}]
- **핵심 원리:** {psych_guide['principle']}
- **연기 지침(Acting Hint):** {psych_guide['character_hint']}
- **참고 질문:** "{psych_guide['key_question']}" (이 뉘앙스를 대화에 녹여내세요)

### [가이드라인 2: MBTI 맞춤 화법 - {user_mbti}]
- 특성: {mbti_guide.get('trait', '')}
- 강점: {mbti_guide.get('strength', '')}
- 사고 방식: {mbti_guide.get('focus_pattern', '')}
- 성장 조언: {mbti_guide.get('growth_tip', '')}
- 오프닝 멘트: "{mbti_guide.get('intro_phrase', '')}" 느낌으로 시작
- 행동 패턴: {mbti_guide.get('action_pattern', '')}

### [가이드라인 3: 말투 및 톤앤매너]
- 말투: 친근한 반말(친구 모드)
- 스타일: 공감하지만 핵심은 찌르는 말투
- 이모지: 문장 끝마다 🌿, 🔥, ✨ 등을 적절히 사용

{task_instruction}

### [최종 지시사항]
위의 모든 가이드라인(심리학+MBTI+페르소나)을 통합하여,
의 Task 상태 변경에 대한 최적의 피드백을 한국어로 답변하세요.
응답은 2-3문장으로 간결하게 작성하세요.
"""
        
        # 사용자 메시지 구성
        user_message = f"""
Task: {task_title}
상세: {task_detail}
상태 변경: {old_status} → {new_status}

위 Task의 상태가 변경되었습니다. 사용자에게 적절한 피드백을 제공해주세요.
"""
        
        # Gemini API 호출
        try:
            feedback = call_gemini_api(system_prompt, user_message)
            return feedback
        except Exception as e:
            logger.error(f"피드백 생성 API 호출 실패: {e}")
            return self._get_default_feedback(new_status, task_title, mbti_guide)
    
    def _get_task_instruction(self, new_status: str, task_title: str, psych_guide: Dict, mbti_guide: Dict) -> str:
        """상태별 특별 지시사항 생성"""
        
        # 템플릿 딕셔너리로 관리하여 가독성 향상
        templates = {
            "포기": f"""
[⚠️ 중요 이벤트: 사용자가 '{new_status}' 상태로 변경]
- 상황: 사용자가 Task '{task_title}'를 포기했습니다.
- 지시: 위 심리학 원칙({psych_guide['title']})을 적용해 이 선택을 피드백해줄 것.
- 포기 시: 비난 금지. {mbti_guide.get('growth_tip', '')} 인용하여 위로.
- 다시 시작할 수 있다는 희망을 전달하세요.
""",
            "완료": f"""
[🎉 축하 이벤트: 사용자가 '{new_status}' 상태로 변경]
- 상황: 사용자가 Task '{task_title}'를 완료했습니다!
- 지시: 강력한 칭찬과 성취감을 전달하세요.
- {mbti_guide.get('strength', '')}를 언급하며 구체적으로 칭찬하세요.
""",
            "진행중": f"""
[💪 행동 이벤트: 사용자가 '{new_status}' 상태로 변경]
- 상황: 사용자가 Task '{task_title}'를 시작했습니다.
- 지시: 시작한 것에 대한 격려와 함께 지속할 수 있는 동기를 부여하세요.
- {mbti_guide.get('action_pattern', '')}를 참고하여 실천 방법을 제안하세요.
""",
            "보류": f"""
[⏸️ 보류 이벤트: 사용자가 '{new_status}' 상태로 변경]
- 상황: 사용자가 Task '{task_title}'를 보류했습니다.
- 지시: 보류 결정을 존중하되, 다시 시작할 수 있는 가능성을 열어두세요.
- 불안감을 줄이고 유연성을 강조하세요.
""",
            "대기": f"""
[📋 대기 이벤트: 사용자가 '{new_status}' 상태로 설정]
- 상황: 사용자가 Task '{task_title}'를 대기 상태로 두었습니다.
- 지시: 계획 단계의 중요성을 인정하고, 준비가 되면 시작하도록 격려하세요.
"""
        }
        
        return templates.get(new_status, f"[상태 변경: {new_status}] 적절한 피드백을 제공하세요.")
    
    def _get_default_feedback(self, new_status: str, task_title: str, mbti_guide: Dict) -> str:
        """API 호출 실패 시 기본 피드백 반환"""
        
        intro = mbti_guide.get('intro_phrase', '')
        growth = mbti_guide.get('growth_tip', '')
        strength = mbti_guide.get('strength', '')
        pattern = mbti_guide.get('action_pattern', '')
        
        # 템플릿 간소화
        feedback_templates = {
            "포기": f"{intro} '{task_title}'를 포기하기로 했구나. 지금은 힘들지만, 언제든 다시 시작할 수 있어. {growth} 🌿",
            "완료": f"와! '{task_title}'를 완료했네! 🎉 {strength}이 빛을 발했어. 정말 자랑스러워! ✨",
            "진행중": f"{intro} '{task_title}'를 시작했구나! 💪 {pattern} 🔥",
            "보류": f"'{task_title}'를 잠시 보류하기로 했구나. 괜찮아, 유연하게 대처하는 것도 중요해. 준비되면 다시 시작하자! 🌿",
            "대기": f"'{task_title}'를 계획 중이구나. 차근차근 준비해서 시작해봐! 📋"
        }
        
        return feedback_templates.get(new_status, f"'{task_title}'의 상태가 '{new_status}'로 변경되었어. 화이팅! 💪")


# 싱글톤 인스턴스
feedback_service = TaskFeedbackService()
