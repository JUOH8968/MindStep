import React, { useState } from 'react';

const signUpStyles = {
    container: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', width: '100vw', backgroundColor: '#E8EDF4', padding: '40px 0' },
    card: { width: '100%', maxWidth: '550px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '18px', backgroundColor: '#fff', borderRadius: '15px' },
    title: { fontSize: '32px', fontWeight: 'bold', color: '#1A2B45', marginBottom: '10px' },
    inputGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
    label: { fontSize: '14px', color: '#666', fontWeight: '600' },
    input: { padding: '14px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '16px', outline: 'none' },
    typeGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' },
    typeCard: { padding: '15px', borderRadius: '8px', border: '2px solid transparent', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '4px' },
    typeHeader: { display: 'flex', alignItems: 'center', gap: '6px' },
    typeIcon: { fontSize: '14px' },
    typeTitle: { fontSize: '14px', fontWeight: 'bold' },
    typeDesc: { fontSize: '11px', color: '#888' },
    row: { display: 'flex', gap: '15px' },
    submitBtn: { padding: '18px', backgroundColor: '#6C7EE1', color: 'white', border: 'none', borderRadius: '8px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer' },
    cancelLink: { background: 'none', border: 'none', color: '#6C7EE1', cursor: 'pointer', fontSize: '14px' }
};

export default function SignUpPage({ onSignUp, onCancel }) {
    const [formData, setFormData] = useState({
        ID: '',
        password: '',
        age: '',
        gender: '남성',
        job: '',
        mbti: '미공개',
        email: ''
    });

    const [surveyStep, setSurveyStep] = useState(0);
    const [surveyAnswers, setSurveyAnswers] = useState([]);
    const [isMbtiOpen, setIsMbtiOpen] = useState(false);

    const mbtiOptions = [
        "미공개", "ENFJ", "ENFP", "ENTJ", "ENTP", "ESFJ", "ESFP", "ESTJ", "ESTP",
        "INFJ", "INFP", "INTJ", "INTP", "ISFJ", "ISFP", "ISTJ", "ISTP"
    ];

    const QUESTIONS = [
        {
            text: "오늘 할 일을 처음 떠올렸을 때, 먼저 드는 생각은?",
            options: {
                A: "벌써 지친다... 조금만 더 누워 있고 싶어.",
                B: "이것도 재밌겠고 저것도 해야지! (근데 뭐부터 하더라?)",
                C: "좋아, 바로 시작하자! (이미 몸이 움직이고 있음)",
                D: "제대로 계획을 세워야 해. 완벽한 타이밍을 기다리는 중이야."
            }
        },
        {
            text: "일을 시작하기 전, 나의 책상 위 풍경은?",
            options: {
                A: "정리는커녕 물건들이 늘어져 있지만, 치울 기운도 없다.",
                B: "쓰던 물건, 새로 꺼낸 물건이 뒤섞여서 조금 어수선한 편이다.",
                C: "딱히 상관없다. 노트북 펴는 곳이 곧 내 책상이다.",
                D: "주변이 정돈되어야 비로소 안심하고 시작할 수 있다."
            }
        },
        {
            text: "집중해서 일하던 중, 흥미로운 메시지 알림이 왔을 때?",
            options: {
                A: "휴, 차라리 잘됐다 하며 자연스럽게 딴짓으로 도망친다.",
                B: "나도 모르게 이미 클릭해서 보고 있다가 10분 뒤에 '아차' 한다.",
                C: "오, 재밌겠는데? 하고 일단 본 뒤, 원래 하던 일은 잊어버린다.",
                D: "신경은 쓰이지만, 지금 하는 일을 망치고 싶지 않아 꾹 참는다."
            }
        },
        {
            text: "업무 도중 예상치 못한 오류나 실수가 발생했다면?",
            options: {
                A: "역시 난 안 되나 봐... 무력감에 빠져 노트북을 덮고 싶어진다.",
                B: "아 맞다, 저번에 그것도 안 했지? 하며 잠시 다른 것을 하러간다.",
                C: "괜찮아, 대충 넘어가고 다음 거 하자! 일단 끝내는 데 의의를 둔다.",
                D: "처음부터 다시 해야 하나? 작은 오점 때문에 전체 흐름이 깨진다."
            }
        },
        {
            text: "나에게 가장 필요한 '외부의 도움'은 어떤 형태인가요?",
            options: {
                A: "천천히 해도 괜찮아라고 말해주는 따뜻한 위로와 공감",
                B: "내가 딴 길로 새지 않게 경로를 딱 잡아주는 든든한 가이드라인",
                C: "내가 너무 빨리 달려서 지치지 않게 속도를 조절해주는 페이스메이커",
                D: "복잡한 생각들을 정리해주고 우선순위를 정해주는 냉철한 조언"
            }
        },
        {
            text: "일을 마친 후, 내가 가장 자주 느끼는 감정은?",
            options: {
                A: "오늘도 겨우 버텼다... 기진맥진한 해방감",
                B: "다 끝내긴 했는데, 뭔가 빼먹은 건 없을까? 하는 찜찜함",
                C: "드디어 끝! 이제 다음 재밌는 거 뭐 있지? 하는 들뜬 마음",
                D: "조금 더 잘할 수 있었는데... 하는 아쉬움과 피로감"
            }
        }
    ];

    const handleSurveyAnswer = (key) => {
        const newAnswers = [...surveyAnswers, key];
        setSurveyAnswers(newAnswers);

        // 마지막 질문에 답변했으면 회원가입 완료
        if (newAnswers.length === QUESTIONS.length) {
            const finalType = calculateType(newAnswers);
            onSignUp({ ...formData, type: finalType });
        } else {
            setSurveyStep(surveyStep + 1);
        }
    };

    const handleSurveyBack = () => {
        if (surveyStep > 1) {
            // 이전 질문으로 돌아가기
            setSurveyStep(surveyStep - 1);
            // 마지막 답변 제거
            setSurveyAnswers(surveyAnswers.slice(0, -1));
        }
    };

    const calculateType = (answers) => {
        const count = { A: 0, B: 0, C: 0, D: 0 };
        answers.forEach(a => count[a]++);

        const max = Math.max(...Object.values(count));
        const winners = Object.keys(count).filter(k => count[k] === max);

        // 동률일 경우 우선순위에 따라 선택: A(1) > D(4) > B(2) > C(3)
        const priority = ['A', 'D', 'B', 'C'];
        const typeKey = priority.find(key => winners.includes(key)) || winners[0];

        const typeMap = { A: 'Type A', B: 'Type B', C: 'Type C', D: 'Type D' };
        return typeMap[typeKey];
    };

    const handlePersonalInfoSubmit = () => {
        if (!formData.ID || !formData.password) {
            alert("아이디와 비밀번호는 필수입니다.");
            return;
        }

        // 나이 유효성 검사 추가 (0~200 범위 체크) YU
        if (formData.age !== "") {
            const ageNum = parseInt(formData.age, 10);
            // 숫자가 아니거나 범위를 벗어난 경우
            if (isNaN(ageNum) || ageNum < 0 || ageNum > 200) {
                alert("나이는 0에서 200 사이의 숫자로 입력해주세요.");
                return;
            }
        }

        // 개인정보 입력 완료 후 설문조사 시작
        setSurveyStep(1);
    };

    // 설문조사 진행 중 (surveyStep이 1 이상이고 QUESTIONS.length 이하)
    if (surveyStep > 0 && surveyStep <= QUESTIONS.length) {
        const q = QUESTIONS[surveyStep - 1];

        return (
            <div style={signUpStyles.container}>
                <div style={signUpStyles.card}>
                    <h2 style={signUpStyles.title}>설문조사 {surveyStep}/6</h2>
                    <p style={{ fontSize: '16px', color: '#333', marginBottom: '20px', lineHeight: '1.5' }}>{q.text}</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {Object.entries(q.options).map(([key, text]) => (
                            <button
                                key={key}
                                onClick={() => handleSurveyAnswer(key)}
                                style={{
                                    padding: '15px',
                                    backgroundColor: '#F0F2F5',
                                    border: '2px solid transparent',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    cursor: 'pointer',
                                    textAlign: 'left',
                                    transition: 'all 0.2s',
                                    ':hover': { backgroundColor: '#E8EDF4', borderColor: '#6C7EE1' }
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.backgroundColor = '#E8EDF4';
                                    e.target.style.borderColor = '#6C7EE1';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.backgroundColor = '#F0F2F5';
                                    e.target.style.borderColor = 'transparent';
                                }}
                            >
                                {text}
                            </button>
                        ))}
                    </div>
                    <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <button
                            onClick={handleSurveyBack}
                            disabled={surveyStep === 1}
                            style={{
                                ...signUpStyles.cancelLink, // Using common style for simplicity or custom
                                padding: '10px 20px',
                                backgroundColor: surveyStep === 1 ? '#E0E0E0' : '#F0F2F5',
                                border: '2px solid transparent',
                                borderRadius: '8px',
                                fontSize: '14px',
                                cursor: surveyStep === 1 ? 'not-allowed' : 'pointer',
                                color: surveyStep === 1 ? '#999' : '#333',
                                fontWeight: 'bold',
                                transition: 'all 0.2s',
                                textAlign: 'center'
                            }}
                            onMouseEnter={(e) => {
                                if (surveyStep > 1) {
                                    e.target.style.backgroundColor = '#E8EDF4';
                                    e.target.style.borderColor = '#6C7EE1';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (surveyStep > 1) {
                                    e.target.style.backgroundColor = '#F0F2F5';
                                    e.target.style.borderColor = 'transparent';
                                }
                            }}
                        >
                            ← 이전
                        </button>
                        <div style={{ fontSize: '12px', color: '#999' }}>
                            진행률: {surveyStep} / {QUESTIONS.length}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // 기본 정보 입력 화면 (surveyStep === 0)
    return (
        <div style={signUpStyles.container}>
            <div style={signUpStyles.card}>
                <h2 style={signUpStyles.title}>회원가입</h2>
                <div style={signUpStyles.inputGroup}>
                    <label style={signUpStyles.label}>ID (필수)</label>
                    <input style={{ ...signUpStyles.input, backgroundColor: '#E8F0FE' }} value={formData.ID} onChange={(e) => setFormData({ ...formData, ID: e.target.value })} />
                </div>
                <div style={signUpStyles.inputGroup}>
                    <label style={signUpStyles.label}>비밀번호 (필수)</label>
                    <input type="password" style={{ ...signUpStyles.input, backgroundColor: '#E8F0FE' }} value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
                </div>
                <div style={signUpStyles.row}>
                    <div style={{ flex: 1 }}><label style={signUpStyles.label}>나이 </label><input style={signUpStyles.input} value={formData.age} onChange={(e) => setFormData({ ...formData, age: e.target.value })} /></div>
                    <div style={{ flex: 1 }}><label style={signUpStyles.label}>성별 </label>
                        <select style={signUpStyles.input} value={formData.gender} onChange={(e) => setFormData({ ...formData, gender: e.target.value })}>
                            <option>남성</option><option>여성</option>
                        </select>
                    </div>
                </div>
                <div style={signUpStyles.row}>
                    <div style={{ flex: 1 }}><label style={signUpStyles.label}>직업 </label><input style={signUpStyles.input} value={formData.job} onChange={(e) => setFormData({ ...formData, job: e.target.value })} /></div>
                    <div style={{ flex: 1 }}> <label style={{ ...signUpStyles.label, flexShrink: 0, marginRight: '10px' }}>MBTI</label>
                        <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', verticalAlign: 'middle' }}>
                            <div
                                onClick={() => setIsMbtiOpen(!isMbtiOpen)}
                                style={{
                                    ...signUpStyles.input,      // 원래 style (배경색, 테두리 등) 그대로 사용
                                    cursor: 'pointer',
                                    display: 'inline-flex',    // 내부 요소들을 위해 flex 적용
                                    alignItems: 'center',      // 상자 내부 수직 중앙 정렬
                                    justifyContent: 'space-between',
                                    height: '45px',            // 다른 입력창과 높이 통일
                                    width: '140px',            // 너비 축소
                                    boxSizing: 'border-box',
                                    padding: '0 12px',
                                    margin: 0,
                                    lineHeight: 'normal'       // 글자 쏠림 방지
                                }}
                            >
                                <span style={{
                                    fontSize: '14px',
                                    color: '#333',
                                    display: 'flex',
                                    alignItems: 'center'       // 글자 자체의 정렬 보정
                                }}>
                                    {formData.mbti}
                                </span>

                                {/* 원래 화살표 디자인 유지 */}
                                <div style={{
                                    width: '0',
                                    height: '0',
                                    borderLeft: '5px solid transparent',
                                    borderRight: '5px solid transparent',
                                    borderTop: isMbtiOpen ? '0' : '6px solid #666',
                                    borderBottom: isMbtiOpen ? '6px solid #666' : '0',
                                }}></div>
                            </div>
                            {isMbtiOpen && (
                                <div style={{
                                    position: 'absolute',
                                    top: '100%',
                                    left: 0,
                                    width: '140px',
                                    backgroundColor: 'white',
                                    border: '1px solid #ccc',
                                    borderRadius: '4px',
                                    marginTop: '2px',
                                    maxHeight: '160px',
                                    overflowY: 'auto',
                                    zIndex: 1000,
                                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                                }}>
                                    {mbtiOptions.map((option) => (
                                        <div
                                            key={option}
                                            onClick={() => {
                                                setFormData({ ...formData, mbti: option });
                                                setIsMbtiOpen(false);
                                            }}
                                            style={{
                                                padding: '10px 12px',
                                                cursor: 'pointer',
                                                fontSize: '14px',
                                                color: '#333',
                                                borderBottom: '1px solid #f5f5f5'
                                            }}
                                            onMouseEnter={(e) => e.target.style.backgroundColor = '#f0f4ff'}
                                            onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                                        >
                                            {option}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div style={signUpStyles.inputGroup}>
                    <label style={signUpStyles.label}>이메일 (선택)</label>
                    <input style={signUpStyles.input} value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                    <button onClick={handlePersonalInfoSubmit} style={signUpStyles.submitBtn}>다음 (설문조사)</button>
                    <button onClick={onCancel} style={signUpStyles.cancelLink}>취소</button>
                </div>
            </div>
        </div>
    );
}
