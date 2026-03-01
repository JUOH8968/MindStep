import os
import json
import logging
from datetime import datetime
from typing import List, Dict, Any, Optional

from dotenv import load_dotenv

load_dotenv()

try:
    from google import genai
    from google.genai import types
except ImportError:
    print("google-genai 패키지가 설치되지 않았거나 로드할 수 없습니다.")
    genai = None


# ==================== Configuration & Constants ====================

# API Key Handling: Load from Environment Variable
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")

# Logging Setup
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Initialize Client
client = None
if GEMINI_API_KEY and genai:
    try:
        client = genai.Client(api_key=GEMINI_API_KEY)
    except Exception as e:
        logger.error(f"Gemini Client 초기화 실패: {e}")

# System Prompts Definition
SYSTEM_PROMPTS = {
    "Lighthouse": {
        "name": "온화한 등대",
        "instruction": (
            "당신은 '자기 자비'와 '수용'을 제1원칙으로 삼는 코치 '온화한 등대'입니다. "
            "사용자가 무기력하거나 마감을 어겨도 '그럴 수 있다'고 먼저 인정하세요. (ACT 기법 활용) "
            "심리적 문턱을 낮추기 위해 아주 사소한 행동(기지개, 물 마시기)을 제안하고, "
            "마감을 넘겼다면 비난 대신 '예상보다 에너지가 더 필요했나 봐요. 일정을 조금 늦춰볼까요?'라며 재조정을 돕습니다."
        )
    },
    "DrillSergeantFocus": {
        "name": "단호한 교관 (집중 가이드)",
        "instruction": (
            "당신은 사용자의 주의력이 흩어지지 않게 돕는 '단호한 교관'입니다. "
            "군더더기 없는 명령조를 사용하되 비난은 하지 마세요. 행동 활성화(BA) 기법을 적용해 "
            "여러 아이디어 중 '딱 한 가지'에만 집중하도록 지시합니다. "
            "마감을 넘겼거나 딴짓을 할 경우 즉각적으로 본 궤도로 복귀시키는 '엔진 재가동' 명령을 내리세요."
        )
    },
    "DrillSergeantPace": {
        "name": "단호한 교관 (완주 페이스메이커)",
        "instruction": (
            "당신은 사용자가 오버페이스로 지치지 않고 끝까지 완주하게 돕는 '단호한 교관'입니다. "
            "속도보다는 '마무리와 품질'을 강조하세요. "
            "대충 끝내려는 충동을 제어하고 완료 조건을 구체적으로 점검하게 합니다. "
            "마감을 넘겼다면 '속도는 좋았지만 디테일에서 시간이 걸렸군요. 남은 25%를 완벽히 끝냅시다'라고 독려하세요."
        )
    },
    "Strategist": {
        "name": "냉철한 전략가",
        "instruction": (
            "당신은 논리적 근거로 사용자의 결단을 돕는 '냉철한 전략가'입니다. "
            "완벽주의로 시작을 못 할 때 '우선순위 수치화'를 제안하고 CBT(인지행동치료)를 통해 "
            "'완료가 완벽보다 낫다'는 가치를 주입하세요. "
            "마감을 넘겼다면 실패 원인을 객관적으로 분석하게 하고, '80% 수준에서 일단 마무리하는 것'의 전략적 이점을 설명하세요."
        )
    }
}


# ==================== Helper Functions ====================

def _get_client_check():
    """Client availability check helper"""
    if not client:
        raise ValueError("Gemini API Client가 초기화되지 않았습니다. API 키를 확인하세요.")
    return client

def _clean_json_response(text: str) -> str:
    """Clean markdown formatting from JSON response"""
    text = text.strip()
    if text.startswith("```json"):
        text = text[7:]
    elif text.startswith("```"):
        text = text[3:]
    if text.endswith("```"):
        text = text[:-3]
    return text.strip()

def _format_tasks_for_prompt(tasks: List[Dict]) -> str:
    """Format task list into a string for prompts"""
    # Filter and Sort: Only '시작' tasks, sorted by date/time
    active_tasks = [t for t in tasks if t.get('status', '대기').strip() == '시작']
    active_tasks.sort(key=lambda x: (x.get('date', '9999-99-99'), x.get('time', '99:99')))
    
    if not active_tasks:
        return ""
        
    task_lines = []
    for task in active_tasks:
        line = f"- {task.get('title', '제목없음')}"
        if task.get('date'): line += f" (날짜: {task['date']})"
        if task.get('time'): line += f" (시간: {task['time']})"
        line += f" [상태: {task.get('status')}]"
        task_lines.append(line)
        
    return "\n".join(task_lines)

def format_conversation_history(chat_logs: List[Dict], limit: int = 10) -> str:
    """Format chat logs into readable history string"""
    if not chat_logs:
        return "(대화 기록 없음)"
    
    recent_logs = chat_logs[-limit:] if len(chat_logs) > limit else chat_logs
    formatted = []
    for log in recent_logs:
        speaker = "사용자" if log.get('speaker') == 'User' else "AI"
        formatted.append(f"{speaker}: {log.get('message', '')}")
    
    return "\n".join(formatted)

def is_do_not_disturb_time() -> bool:
    """Check if current time is within DND hours (23:00 - 05:00)"""
    h = datetime.now().hour
    return h >= 23 or h < 5


# ==================== Main Service Functions ====================

def call_gemini_api(system_prompt: str, user_message: str) -> str:
    """Generic Gemini API Call"""
    try:
        c = _get_client_check()
        full_prompt = f"{system_prompt}\n\n===\n\n{user_message}"
        
        response = c.models.generate_content(
            model='gemini-2.0-flash',
            contents=full_prompt
        )
        return response.text.strip()
    except Exception as e:
        logger.error(f"Gemini API 호출 오류: {e}")
        return "죄송합니다. AI 서비스에 일시적인 문제가 발생했습니다."


def generate_simple_response(persona_type: str, user_message: str) -> str:
    """Generate a simple response without task extraction"""
    try:
        persona = SYSTEM_PROMPTS.get(persona_type, SYSTEM_PROMPTS["Strategist"])
        prompt = f"""당신은 {persona['name']}입니다.
{persona['instruction']}

사용자 메시지: {user_message}

{persona['name']} 스타일로 간단히 응답하세요 (1-2문장)."""
        
        return call_gemini_api("", prompt) # Empty system prompt as it's built-in
    except Exception as e:
        logger.error(f"응답 생성 오류: {e}")
        return "응답을 생성할 수 없습니다."


def extract_tasks_from_conversation(persona_type: str, conversation_history: str, user_message: str, user_keywords: Optional[str] = None) -> Dict[str, Any]:
    """Extract tasks and analyzed user keywords from conversation"""
    try:
        _get_client_check()
        
        persona = SYSTEM_PROMPTS.get(persona_type, SYSTEM_PROMPTS["Strategist"])
        keywords_str = user_keywords if user_keywords else "(아직 파악된 성향이 없습니다)"
        today_date = datetime.now().strftime('%Y-%m-%d')
        
        prompt = f"""당신은 {persona['name']}입니다.
{persona['instruction']}

대화 분석 및 Task 추출 요청:
1. 사용자의 메시지에서 '할 일(Task)'을 식별하세요.
   - 미래의 스케쥴로 등록 가능한 명확한 항목만 추출.
   - 날짜 불명확 시 오늘({today_date}) 기준. 과거 날짜 제외.
2. 사용자 성향 키워드를 갱신하세요. (말투, 행동 패턴 분석)

=== 사용자 성향 ===
{keywords_str}

=== 대화 기록 ===
{conversation_history}

=== 새 메시지 ===
{user_message}

반드시 아래 JSON 형식으로만 응답하세요:
{{
  "tasks": [
    {{
      "title": "할 일 제목",
      "detail": "상세 설명",
      "date": "YYYY-MM-DD",
      "time": "HH:MM",
      "priority": "medium"
    }}
  ],
  "user_keywords": ["키워드1", "키워드2"],
  "response": "{persona['name']} 스타일의 응답 메시지"
}}
"""
        response = client.models.generate_content(
            model='gemini-2.0-flash',
            contents=prompt
        )
        
        result_text = _clean_json_response(response.text)
        result_json = json.loads(result_text)
        
        # Ensure default keys
        result_json.setdefault("tasks", [])
        result_json.setdefault("user_keywords", [])
        result_json.setdefault("response", "응답을 생성할 수 없습니다.")
        
        return result_json
        
    except json.JSONDecodeError:
        logger.error("JSON 파싱 실패")
        return {
            "tasks": [],
            "user_keywords": [],
            "response": "죄송합니다. 응답 처리 중 오류가 발생했습니다."
        }
    except Exception as e:
        logger.error(f"Task 추출 오류: {e}")
        return {
            "tasks": [],
            "user_keywords": [],
            "response": f"오류가 발생했습니다: {str(e)}"
        }


def generate_nudge_message(persona_type: str, tasks: List[Dict], conversation_history: Optional[str] = None, nudge_count: int = 1, idle_time: int = 0) -> Optional[str]:
    """Generate a persona-specific nudge message"""
    
    # 1. Pre-checks
    if is_do_not_disturb_time():
        logger.info("[넛지] 방해금지 시간")
        return None
        
    if not tasks:
        return None

    try:
        _get_client_check()
    except:
        return None

    # 2. Prepare Context
    tasks_text = _format_tasks_for_prompt(tasks)
    if not tasks_text:
        logger.info("[넛지] 대상 Task 없음 (모두 대기/완료 상태)")
        return None
        
    persona = SYSTEM_PROMPTS.get(persona_type, SYSTEM_PROMPTS["Strategist"])
    
    # 3. Determine Nudge Strategy
    if nudge_count == 1:
        strategy = "1회차: 부드럽게 환기하거나 상태를 확인하는 정도."
    else:
        if persona_type in ['DrillSergeantFocus', 'DrillSergeantPace']:
            strategy = f"{nudge_count}회차: 더 직설적이고 강한 어조. '집중력이 끊겼습니까?' 등"
        else:
            strategy = f"{nudge_count}회차: 걱정과 대안 제시. '잠깐 쉬는 것도 전략입니다' 등"

    # 4. Build Prompt
    prompt = f"""당신은 {persona['name']}입니다.
{persona['instruction']}

[진행 중인 할 일 목록 (급한 순)]
{tasks_text}

[상황 정보]
- 부재 시간: {idle_time}분
- 넛지 횟수: {nudge_count}회차
- 전략: {strategy}

[지침]
1. 목록의 최상단 Task를 우선 언급하세요.
2. 완료된 일은 절대 언급하지 마세요.
3. {persona['name']}의 말투를 유지하며 2-3문장으로 짧게 독려하세요.
4. 긍정적인 이모지를 사용하세요.

위 내용을 바탕으로 사용자에게 보낼 메시지만 작성하세요."""

    # 5. Generate
    try:
        logger.info(f"[넛지 생성] API 호출 (Count: {nudge_count})")
        response = client.models.generate_content(
            model='gemini-2.0-flash',
            contents=prompt
        )
        msg = response.text.strip()
        logger.info("[넛지 생성] 완료")
        return msg
    except Exception as e:
        logger.error(f"넛지 생성 실패: {e}")
        return None
