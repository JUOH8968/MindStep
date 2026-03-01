import React, { useState, useEffect, useRef } from 'react';
import TypingIndicator from '../TypingIndicator';
import { api } from '../../utils/api';
import ConfettiEffect from '../effects/ConfettiEffect';
import StartEffect from '../effects/StartEffect';
import PauseEffect from '../effects/PauseEffect';
import GiveUpEffect from '../effects/GiveUpEffect';
import PostponeEffect from '../effects/PostponeEffect';

const styles = {
    appContainer: { display: 'flex', height: '100vh', width: '100vw', transition: 'background-color 0.5s ease', overflow: 'hidden', fontFamily: 'sans-serif' },
    sidebar: { backgroundColor: 'rgba(255, 255, 255, 0.9)', transition: '0.3s ease', overflowX: 'hidden', overflowY: 'auto' },
    sideContent: { width: '300px', padding: '20px', boxSizing: 'border-box' },
    sideTitle: { fontSize: '18px', fontWeight: 'bold', marginBottom: '15px' },
    dateGroup: { marginBottom: '25px' },
    dateHeader: { fontSize: '14px', fontWeight: 'bold', color: '#555', paddingBottom: '8px', borderBottom: '2px solid #eee', marginBottom: '10px' },
    taskCard: { padding: '12px', backgroundColor: '#fff', borderRadius: '10px', marginBottom: '8px', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' },
    taskHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    taskTitle: { fontSize: '15px', marginRight: '8px' },
    statusTag: { display: 'inline-block', padding: '2px 8px', borderRadius: '10px', color: '#fff', fontSize: '10px', fontWeight: 'bold' },
    taskDetail: { marginTop: '8px', paddingTop: '8px', borderTop: '1px dashed #eee', fontSize: '13px' },
    btnGroup: { display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '8px' },
    statusBtn: { border: 'none', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer' },
    editInput: { width: '70%', padding: '4px', fontSize: '14px', borderRadius: '4px', border: '1px solid #ddd' },
    editTextarea: { width: '100%', minHeight: '60px', padding: '8px', fontSize: '13px', borderRadius: '4px', border: '1px solid #ddd', marginTop: '5px', boxSizing: 'border-box' },
    editActions: { display: 'flex', gap: '5px', marginTop: '10px', justifyContent: 'flex-end' },
    actionBtn: { padding: '4px 12px', fontSize: '12px', border: 'none', borderRadius: '4px', cursor: 'pointer' },
    smallEditBtn: { background: 'none', border: 'none', cursor: 'pointer', opacity: 0.6, fontSize: '14px' },
    smallDeleteBtn: { padding: '4px 8px', fontSize: '12px', backgroundColor: '#fff', color: '#e74c3c', border: '1px solid #e74c3c', borderRadius: '4px', cursor: 'pointer', transition: '0.2s' },
    main: { flex: 1, display: 'flex', flexDirection: 'column', height: '100%', minWidth: '400px' },
    header: { display: 'flex', justifyContent: 'space-between', padding: '15px 20px', alignItems: 'center' },
    headerTitle: { fontSize: '18px', margin: 0 },
    chatArea: { flex: 1, overflowY: 'auto', padding: '30px 10%', display: 'flex', flexDirection: 'column', gap: '25px' },
    aiRow: { display: 'flex', gap: '12px', alignSelf: 'flex-start' },
    userRow: { display: 'flex', alignSelf: 'flex-end', flexDirection: 'row-reverse' },
    aiAvatar: { minWidth: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center' },
    aiMessageWrapper: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start' },
    userMessageWrapper: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end' },
    aiBubble: { padding: '14px 18px', backgroundColor: '#fff', borderRadius: '0 20px 20px 20px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', fontSize: '15px' },
    userBubble: { padding: '14px 18px', backgroundColor: '#333', color: '#fff', borderRadius: '20px 20px 0 20px', fontSize: '15px' },
    timeText: { fontSize: '11px', color: '#888', marginTop: '8px' },
    inputContainer: { padding: '20px 10%' },
    inputWrapper: { display: 'flex', backgroundColor: '#fff', borderRadius: '30px', padding: '8px 25px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' },
    inputField: { flex: 1, border: 'none', background: 'none', outline: 'none', fontSize: '16px' },
    sendBtn: { background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' },
    iconBtn: { background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' },
    settingItem: { marginBottom: '25px' },
    label: { fontSize: '13px', color: '#666', display: 'block', marginBottom: '8px' },
    idDisplayBox: { padding: '10px', backgroundColor: '#f0f0f0', borderRadius: '8px', fontSize: '15px' },
    inputIn: { width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' },
    clearChatBtn: { width: '100%', padding: '12px', backgroundColor: '#fff', border: '1px solid #f39c12', color: '#f39c12', borderRadius: '8px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s', marginBottom: '10px' },
    logoutBtn: { width: '100%', padding: '12px', backgroundColor: '#fdfdfd', border: '1px solid #e74c3c', color: '#e74c3c', borderRadius: '8px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s' }
};

export default function PersonaCoachApp({ userData, onLogout }) {
    const [leftOpen, setLeftOpen] = useState(true);
    const [rightOpen, setRightOpen] = useState(false);
    const [inputText, setInputText] = useState('');
    const [expandedTaskId, setExpandedTaskId] = useState(null);
    const [editingTaskId, setEditingTaskId] = useState(null);
    const [editValue, setEditValue] = useState({ title: '', detail: '', time: '' });
    const [showConfetti, setShowConfetti] = useState(false);
    const [completedTaskTitle, setCompletedTaskTitle] = useState('');
    const [activeEffect, setActiveEffect] = useState(null);
    const [effectTaskTitle, setEffectTaskTitle] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [nudgeEnabled, setNudgeEnabled] = useState(true);
    const nudgeTimerRef = useRef(null);
    const [collapsedDates, setCollapsedDates] = useState({}); // 날짜별 접기/펴기 상태 관리

    const toggleDateCollapse = (date) => {
        setCollapsedDates(prev => ({
            ...prev,
            [date]: !prev[date]
        }));
    };

    const getPersonaByType = (type) => {
        if (type === 'Type A') return 'Lighthouse';
        if (type === 'Type B') return 'DrillSergeantFocus';
        if (type === 'Type C') return 'DrillSergeantPace';
        return 'Strategist';
    };

    const [settings, setSettings] = useState({
        login_id: userData.nickname || (typeof userData === 'string' ? userData : '사용자'),
        user_type: userData.type || '일반',
        persona_type: userData.type ? getPersonaByType(userData.type) : 'Strategist'
    });

    const personaStyles = {
        Lighthouse: { bg: '#FFFDE7', header: '#FFF9C4', point: '#FBC02D', title: '온화한 등대 코치', img: '/LightHouse_A.png' },
        DrillSergeantFocus: { bg: '#FFEBEE', header: '#FFCDD2', point: '#D32F2F', title: '단호한 교관 (집중 가이드)', img: '/Instructor_B.png' },
        DrillSergeantPace: { bg: '#FCE4EC', header: '#F8BBD0', point: '#C2185B', title: '단호한 교관 (완주 페이스메이커)', img: '/Instructor_C.png' },
        Strategist: { bg: '#E3F2FD', header: '#BBDEFB', point: '#1976D2', title: '냉철한 전략가 코치', img: '/Strategist_D.png' }
    };

    const statusColors = { '시작': '#3498db', '일시정지': '#f39c12', '완료': '#2ecc71', '포기': '#e74c3c', '미루기': '#9b59b6', '대기': '#95a5a6' };
    const currentTheme = personaStyles[settings.persona_type] || personaStyles.Strategist;
    const chatEndRef = useRef(null);
    // nudgeEnabled 상태를 즉시 참조하기 위한 Ref (setInterval 클로저 문제 해결용)
    const nudgeEnabledRef = useRef(nudgeEnabled);

    const [chatLogs, setChatLogs] = useState([]);
    const [tasks, setTasks] = useState([]);

    // 방해 금지 시간 체크 (23:00~05:00)
    const isDoNotDisturbTime = () => {
        const now = new Date();
        const hour = now.getHours();
        return hour >= 23 || hour < 5;
    };

    // 넛지 폴링 함수
    const pollNudge = async () => {
        // 방해 금지 시간이거나 넛지가 비활성화되면 실행하지 않음 (Ref 사용)
        if (!nudgeEnabledRef.current || isDoNotDisturbTime()) {
            return;
        }

        try {
            const result = await api("/api/nudge/poll");

            if (result.nudge_message && result.enabled) {
                setChatLogs(prev => [...prev, {
                    id: Date.now(),
                    sender: 'AI',
                    content: result.nudge_message,
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    persona: result.persona_type || settings.persona_type
                }]);
            }
        } catch (err) {
            console.error("넛지 폴링 실패:", err);
        }
    };

    // 넛지 타이머 시작/재시작 함수
    const startNudgeTimer = () => {
        // 기존 타이머 제거
        if (nudgeTimerRef.current) {
            clearInterval(nudgeTimerRef.current);
            nudgeTimerRef.current = null;
        }

        // 넛지가 비활성화되어 있으면 시작하지 않음 (Ref 사용)
        if (!nudgeEnabledRef.current) {
            return;
        }

        // ===== 테스트용 짧은 간격 (5-10초) =====
        const TEST_INTERVALS = {
            'Lighthouse': 10000,           // 10초 (Type A)
            'DrillSergeantFocus': 5000,    // 5초 (Type B)
            'DrillSergeantPace': 7000,     // 7초 (Type C)
            'Strategist': 8000             // 8초 (Type D)
        };

        // ===== 프로덕션용 긴 간격 (분 단위) - 주석 처리 =====
        // const PRODUCTION_INTERVALS = {
        //     'Lighthouse': 75 * 60 * 1000,          // 75분
        //     'DrillSergeantFocus': 7.5 * 60 * 1000, // 7.5분
        //     'DrillSergeantPace': 25 * 60 * 1000,   // 25분
        //     'Strategist': 45 * 60 * 1000           // 45분
        // };

        const interval = TEST_INTERVALS[settings.persona_type] || 10000; // 기본 10초

        console.log(`넛지 타이머 시작 - ${settings.persona_type}: ${interval / 1000}초 간격 폴링`);

        // 첫 넛지는 1초 후에 바로 실행 (매우 빠른 반응)
        setTimeout(pollNudge, 1000);

        // 설정된 간격마다 넛지 폴링
        nudgeTimerRef.current = setInterval(pollNudge, interval);
        console.log(`[넛지 시스템] 타이머 인터벌 시작됨 (간격: ${interval}ms)`);
    };

    // 넛지 타이머 중지 함수
    const stopNudgeTimer = () => {
        if (nudgeTimerRef.current) {
            clearInterval(nudgeTimerRef.current);
            nudgeTimerRef.current = null;
        }
        console.log("넛지 타이머 중지");
    };

    // 초기 데이터 로드
    useEffect(() => {
        const loadInitialData = async () => {
            setIsLoading(true);
            try {
                const taskResult = await api("/api/tasks");
                setTasks(taskResult.tasks || []);

                const chatResult = await api("/api/chat/history?limit=50");
                if (chatResult.chats && chatResult.chats.length > 0) {
                    const formattedChats = chatResult.chats.map(chat => ({
                        id: chat.id,
                        sender: chat.speaker === 'User' ? 'User' : 'AI',
                        content: chat.message,
                        time: new Date(chat.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        persona: chat.speaker === 'AI' ? settings.persona_type : null
                    }));
                    setChatLogs(formattedChats);
                } else {
                    setChatLogs([{
                        id: Date.now(),
                        sender: 'AI',
                        content: `안녕하세요 ${settings.login_id}님! 오늘의 행동 분석을 시작합니다.`,
                        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        persona: settings.persona_type
                    }]);
                }
            } catch (err) {
                console.error("데이터 로드 실패:", err);
            } finally {
                setIsLoading(false);
                // 데이터 로드 완료 후 넛지 타이머 시작
                if (nudgeEnabled) {
                    console.log("초기 데이터 로드 완료 - 넛지 타이머 시작");
                    startNudgeTimer();
                }
            }
        };
        loadInitialData();
    }, [settings.persona_type, settings.login_id]);

    // 넛지 타이머 관리
    useEffect(() => {
        // Ref 동기화
        nudgeEnabledRef.current = nudgeEnabled;

        if (nudgeEnabled) {
            startNudgeTimer();
        } else {
            stopNudgeTimer();
        }

        return () => {
            stopNudgeTimer();
        };
    }, [nudgeEnabled]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatLogs]);

    const saveEdit = async (e, id) => {
        e.stopPropagation();
        const oldTask = tasks.find(t => t.id === id);
        let changeDetails = [];
        if (oldTask.title !== editValue.title) changeDetails.push(`제목이 [${oldTask.title}]에서 [${editValue.title}](으)로`);
        if (oldTask.detail !== editValue.detail) changeDetails.push(`상세 내용이 수정`);
        if (oldTask.time !== editValue.time) changeDetails.push(`시간이 [${oldTask.time || '설정안됨'}]에서 [${editValue.time || '설정안됨'}](으)로`);

        try {
            await api(`/api/tasks/${id}`, "PUT", {
                title: editValue.title,
                detail: editValue.detail,
                time: editValue.time || null,
                priority: oldTask.priority,
                date: oldTask.date
            });

            if (changeDetails.length > 0) {
                const changeText = changeDetails.join(' 그리고 ');
                const editCommentPool = {
                    Lighthouse: [`${changeText} 로 바뀌었네요! ✨`, `${changeText} 수정되었군요.`],
                    DrillSergeantFocus: [`${changeText} 변경 확인했다! 딴짓 말고 실시!`, `${changeText} 업데이트 완료.`],
                    DrillSergeantPace: [`${changeText} 페이스 수정 확인.`, `${changeText} 다시 뛰어라!`],
                    Strategist: [`${changeText} 데이터 업데이트를 완료했습니다.`, `${changeText} 변경 사항이 감지되었습니다.`]
                };
                const currentTemplates = editCommentPool[settings.persona_type] || editCommentPool.Strategist;
                const randomMessage = currentTemplates[Math.floor(Math.random() * currentTemplates.length)];

                setTasks(tasks.map(t => t.id === id ? { ...t, title: editValue.title, detail: editValue.detail, time: editValue.time } : t));
                setChatLogs(prev => [...prev, {
                    id: Date.now(), sender: 'AI', content: `[일정변경 알림] ${randomMessage}`,
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    persona: settings.persona_type
                }]);
            }
            setEditingTaskId(null);
        } catch (err) {
            console.error("태스크 수정 실패:", err);
            alert("태스크 수정에 실패했습니다.");
        }
    };

    const updateTaskStatus = async (id, newStatus) => {
        const targetTask = tasks.find(t => t.id === id);

        try {
            const result = await api(`/api/tasks/${id}/status`, "PATCH", {
                status: newStatus,
                persona_type: settings.persona_type
            });

            // 모든 Task 완료 시 축하 메시지 및 넛지 중지
            if (result.all_tasks_completed) {
                setNudgeEnabled(false);
                stopNudgeTimer();
                setTimeout(() => {
                    setChatLogs(prev => [...prev, {
                        id: Date.now(),
                        sender: 'AI',
                        content: '🎉 모든 할 일을 완료하셨습니다! 정말 수고하셨어요!',
                        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        persona: settings.persona_type
                    }]);
                }, 1000);
            }

            // ===== 넛지 제어 로직 =====
            // '시작' 버튼: 넛지 타이머 시작
            if (newStatus === '시작') {
                console.log(`Task 시작 → 넛지 타이머 재시작`);
                // 중요: 모든 Task 완료로 넛지가 비활성화되었을 수 있으므로 다시 활성화
                setNudgeEnabled(true);
                // ⚠️ 핵심 수정: useState는 비동기이므로 Ref를 즉시 업데이트해야 startNudgeTimer가 바로 작동함
                nudgeEnabledRef.current = true;
                startNudgeTimer();
            }

            if (newStatus === '완료') {
                setCompletedTaskTitle(targetTask.title);
                setShowConfetti(true);
                setTasks(tasks.filter(task => task.id !== id));

                if (expandedTaskId === id) {
                    setExpandedTaskId(null);
                }

                setTimeout(() => {
                    setShowConfetti(false);
                    setCompletedTaskTitle('');
                }, 3000);
            } else {
                setTasks(tasks.map(task => task.id === id ? { ...task, status: newStatus } : task));

                const effectMap = {
                    '시작': 'Start',
                    '일시정지': 'Pause',
                    '포기': 'GiveUp',
                    '미루기': 'Postpone'
                };

                if (effectMap[newStatus]) {
                    setEffectTaskTitle(targetTask.title);
                    setActiveEffect(effectMap[newStatus]);

                    setTimeout(() => {
                        setActiveEffect(null);
                        setEffectTaskTitle('');
                    }, 3000);
                }
            }

            const commentPool = {
                Lighthouse: {
                    시작: ["따뜻한 시작이네요!", "작은 발걸음이 큰 변화를 만듭니다.", "천천히 나아가봐요."],
                    완료: ["정말 대단해요! 🎉", "오늘도 한 걸음 성장하셨군요!", "마음껏 기뻐해도 좋아요!"],
                    일시정지: ["잠시 쉬어가요. 숨 고르기도 중요하니까요.", "지치지 않게 속도를 조절해봐요."],
                    포기: ["그럴 수도 있죠. 자책하지 마세요.", "오늘은 쉬고 내일 다시 시작해도 괜찮아요."],
                    미루기: ["조금 더 준비가 필요하신가요? 기다릴게요.", "마음이 편안할 때 다시 시작해봐요."]
                },
                DrillSergeantFocus: {
                    시작: ["드디어 움직이는군! 딴 길로 새지 말고 전진!", "지금 이 순간에만 집중해라! 스마트폰 내려놔!", "망설임은 사치다. 당장 눈앞의 일에 몰입하라!"],
                    완료: ["훌륭하다. 임무 완수! 집중력 좋았다.", "딴짓 안 하고 잘 끝냈군. 역시 내 눈은 틀리지 않았어!", "성공이다. 이 몰입감을 기억해라!"],
                    일시정지: ["정신 차려! 목표가 코앞인데 어디 가나?", "휴식은 짧게! 딴짓할 생각 말고 즉시 복귀해라!", "집중력이 흐트러지고 있다. 다시 위치로!"],
                    포기: ["여기서 멈출 셈인가? 다시 일어서!", "실패도 경험이지만, 포기는 습관이다. 정신 똑바로 차려라!", "약해지지 마라. 넌 이것보다 강하다."],
                    미루기: ["미루는 습관은 네 최대의 적이다!", "내일로 미루면 내일의 네가 힘들 뿐이다. 지금 당장 해라!", "지금 하지 않으면 영원히 못 한다. 엔진 재가동!"]
                },
                DrillSergeantPace: {
                    시작: ["좋아, 출발한다! 하지만 너무 무리하게 달리진 마라.", "페이스 조절 잘해라. 끝까지 가는 놈이 이기는 거다.", "기세는 좋지만 오버페이스는 금물이다. 일정하게 가자."],
                    완료: ["완주 성공! 역시 끈기 있군. 고생했다.", "피니시 라인을 통과했다! 이 속도감을 유지해라.", "승리의 맛이 어떤가? 끝까지 해낸 네가 자랑스럽다!"],
                    일시정지: ["호흡 가다듬고 다시 뛰어라!", "잠깐의 휴식은 필요하지만, 몸이 식기 전에 다시 움직여라.", "지친 건가? 아니, 넌 완주할 수 있다. 다시 호흡해라!"],
                    포기: ["뒤돌아보지 마라. 이탈은 곧 패배다.", "포기는 없다! 끝까지 완주해라. 다시 뛰어!", "여기서 멈추면 지금까지의 질주가 무의미해진다. 일어나라!"],
                    미루기: ["지연되면 완주는 멀어진다. 일정에 맞춰라.", "지금 속도를 늦추면 나중에 두 배로 힘들어진다.", "지금 하지 않으면 완주 시계가 멈춘다. 즉시 이동!"]
                },
                Strategist: {
                    시작: ["효율적인 시작입니다. 최적화된 경로로 진행하세요.", "실행 데이터 수집을 시작합니다.", "가장 논리적인 판단입니다. 실행하세요."],
                    완료: ["목표 달성 완료. 성공 확률 100% 도달.", "정확한 실행이었습니다. 수고하셨습니다.", "예상 시간 내에 완료되었습니다."],
                    일시정지: ["시스템 재정비 중인가요? 효율을 점검하세요.", "잠시 에너지를 최적화하는 시간을 가지세요.", "흐름이 끊기지 않도록 주의바랍니다."],
                    포기: ["데이터를 수정합니다. 대안 경로를 탐색하세요.", "리스크 관리 차원의 판단인가요? 분석이 필요합니다.", "손실을 최소화하는 방향으로 재설정하세요."],
                    미루기: ["기한 엄수 권장. 일정 지연이 예상됩니다.", "우선순위를 다시 계산해보는 것이 좋겠습니다.", "지연이 반복되면 전체 계획에 차질이 생깁니다."]
                }
            };

            const currentPool = commentPool[settings.persona_type]?.[newStatus] || ["진행 상황을 확인했습니다."];
            const randomComment = currentPool[Math.floor(Math.random() * currentPool.length)];

            setChatLogs(prev => [...prev, {
                id: Date.now(), sender: 'AI', content: `[${newStatus}] '${targetTask.title}': ${randomComment}`,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                persona: settings.persona_type
            }]);
        } catch (err) {
            console.error("상태 업데이트 실패:", err);
            alert("상태 업데이트에 실패했습니다.");
        }
    };

    const deleteTask = async (e, id) => {
        e.stopPropagation();
        const targetTask = tasks.find(t => t.id === id);
        if (!window.confirm(`'${targetTask.title}' 태스크를 삭제하시겠습니까?`)) {
            return;
        }

        try {
            await api(`/api/tasks/${id}`, "DELETE");
            setTasks(tasks.filter(task => task.id !== id));

            const deleteCommentPool = {
                Lighthouse: ["할 일을 정리했어요. 부담을 덜어내는 것도 중요하죠.", "괜찮아요. 필요 없는 건 내려놓는 것도 용기예요."],
                DrillSergeantFocus: ["불필요한 임무 제거 완료! 집중력을 흐트러뜨리는 요소는 제거하는 게 맞다.", "삭제 확인! 목표에 집중하기 위한 선택이다."],
                DrillSergeantPace: ["일정 조정 완료. 완주 가능한 목표만 남겨라.", "삭제했다. 무리한 일정은 완주를 방해한다."],
                Strategist: ["데이터 삭제 완료. 우선순위를 재조정하세요.", "태스크 제거. 효율적인 판단입니다."]
            };

            const currentTemplates = deleteCommentPool[settings.persona_type] || ["태스크를 삭제했습니다."];
            const randomMessage = currentTemplates[Math.floor(Math.random() * currentTemplates.length)];

            setChatLogs(prev => [...prev, {
                id: Date.now(),
                sender: 'AI',
                content: `[삭제 완료] '${targetTask.title}': ${randomMessage}`,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                persona: settings.persona_type
            }]);

            if (expandedTaskId === id) {
                setExpandedTaskId(null);
            }
        } catch (err) {
            console.error("태스크 삭제 실패:", err);
            alert("태스크 삭제에 실패했습니다.");
        }
    };

    const clearChatHistory = async () => {
        if (!window.confirm('모든 채팅 기록을 삭제하시겠습니까?')) {
            return;
        }

        try {
            await api("/api/chat/history", "DELETE");
            setChatLogs([{
                id: Date.now(),
                sender: 'AI',
                content: `안녕하세요 ${settings.login_id}님! 채팅 기록이 삭제되었습니다. 새로운 대화를 시작해보세요.`,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                persona: settings.persona_type
            }]);
        } catch (err) {
            console.error("채팅 삭제 실패:", err);
            alert("채팅 기록 삭제에 실패했습니다.");
        }
    };

    const deleteTasksByDate = async (e, date) => {
        e.stopPropagation();
        if (!window.confirm(`${date}의 모든 태스크를 삭제하시겠습니까?`)) {
            return;
        }

        try {
            await api(`/api/tasks/date/${date}`, "DELETE");
            // 해당 날짜의 태스크만 제거
            setTasks(tasks.filter(task => task.date !== date));
        } catch (err) {
            console.error("날짜별 태스크 삭제 실패:", err);
            alert("태스크 삭제에 실패했습니다.");
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!inputText.trim()) return;

        const userMessage = inputText;
        setInputText('');

        const userChatLog = {
            id: Date.now(),
            sender: 'User',
            content: userMessage,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            persona: settings.persona_type
        };
        setChatLogs(prev => [...prev, userChatLog]);

        setIsLoading(true);

        try {
            const result = await api("/api/chat/send", "POST", {
                message: userMessage,
                persona_type: settings.persona_type
            });

            setChatLogs(prev => [...prev, {
                id: result.ai_message_id || Date.now(),
                sender: 'AI',
                content: result.ai_response,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                persona: settings.persona_type
            }]);

            // 키워드 감지 시 넛지 중지
            if (result.nudge_stopped) {
                setNudgeEnabled(false);
                stopNudgeTimer();
                await api("/api/nudge/stop", "POST");

                setTimeout(() => {
                    setChatLogs(prev => [...prev, {
                        id: Date.now(),
                        sender: 'AI',
                        content: '수고하셨어요! 넛지 알림을 중지했습니다. 🎉',
                        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        persona: settings.persona_type
                    }]);
                }, 500);
            } else {
                // 일반 메시지 전송 시 넛지 타이머 재시작
                startNudgeTimer();
            }

            if (result.extracted_tasks && result.extracted_tasks.length > 0) {
                setTasks(prev => [...prev, ...result.extracted_tasks]);
                // 새 Task 추가 시: 넛지 타이머 시작하지 않음 (대기 상태이므로)
                // '시작' 버튼을 누를 때 넛지가 활성화되도록 함
                console.log("새 Task 추가 (대기 상태) - 넛지 대기");
            }
        } catch (err) {
            console.error("메시지 전송 실패:", err);
            setChatLogs(prev => [...prev, {
                id: Date.now(),
                sender: 'AI',
                content: '죄송합니다. 메시지 전송에 실패했습니다. 다시 시도해주세요.',
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                persona: settings.persona_type
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const groupedTasks = tasks.reduce((groups, task) => {
        const date = task.date;
        if (!groups[date]) groups[date] = [];
        groups[date].push(task);
        return groups;
    }, {});

    // Sort tasks within each date group by time
    Object.keys(groupedTasks).forEach(date => {
        groupedTasks[date].sort((a, b) => {
            const timeA = a.time || '';
            const timeB = b.time || '';
            if (timeA !== timeB) return timeA.localeCompare(timeB);
            // If times are equal, sort by creation order (newest first)
            return b.id - a.id;
        });
    });

    return (
        <div style={{ ...styles.appContainer, backgroundColor: currentTheme.bg }}>
            <aside style={{ ...styles.sidebar, width: leftOpen ? '340px' : '0' }}>
                <div style={styles.sideContent}>
                    <h3 style={styles.sideTitle}>📅 날짜별 할 일</h3>
                    {Object.keys(groupedTasks).sort().map(date => (
                        <div key={date} style={styles.dateGroup}>
                            <div
                                style={{ ...styles.dateHeader, cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                                onClick={() => toggleDateCollapse(date)}
                            >
                                <span>{date.replace(/-/g, '. ')}</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <button
                                        onClick={(e) => deleteTasksByDate(e, date)}
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', padding: 0 }}
                                        title="이 날짜의 모든 태스크 삭제"
                                    >
                                        🗑️
                                    </button>
                                    <span style={{ fontSize: '12px', color: '#888' }}>
                                        {collapsedDates[date] ? '▶' : '▼'}
                                    </span>
                                </div>
                            </div>
                            {!collapsedDates[date] && groupedTasks[date].map(task => (
                                <div key={task.id} style={{ ...styles.taskCard, borderLeft: `5px solid ${expandedTaskId === task.id ? currentTheme.point : '#ddd'}` }}>
                                    <div style={styles.taskHeader} onClick={() => setExpandedTaskId(expandedTaskId === task.id ? null : task.id)}>
                                        <div style={{ flex: 1 }}>
                                            {editingTaskId === task.id ? (
                                                <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                                                    <input value={editValue.title} onChange={(e) => setEditValue({ ...editValue, title: e.target.value })} style={{ ...styles.editInput, width: '60%' }} onClick={(e) => e.stopPropagation()} />
                                                    <input type="time" value={editValue.time} onChange={(e) => setEditValue({ ...editValue, time: e.target.value })} style={{ ...styles.editInput, width: '35%' }} onClick={(e) => e.stopPropagation()} />
                                                </div>
                                            ) : (
                                                <div>
                                                    <strong style={styles.taskTitle}>{task.title}</strong>
                                                    {task.time && <span style={{ fontSize: '12px', color: '#888', marginLeft: '5px' }}>⏰ {task.time}</span>}
                                                </div>
                                            )}
                                            <div style={{ ...styles.statusTag, backgroundColor: statusColors[task.status] || '#999' }}>{task.status}</div>
                                        </div>
                                        {editingTaskId !== task.id && (<button onClick={(e) => { e.stopPropagation(); setEditingTaskId(task.id); setEditValue({ title: task.title, detail: task.detail, time: task.time || '' }); }} style={styles.smallEditBtn}>✏️</button>)}
                                    </div>
                                    {expandedTaskId === task.id && (
                                        <div style={styles.taskDetail}>
                                            {editingTaskId === task.id ? (<textarea value={editValue.detail} onChange={(e) => setEditValue({ ...editValue, detail: e.target.value })} style={styles.editTextarea} onClick={(e) => e.stopPropagation()} />) : (<p>{task.detail}</p>)}
                                            <div style={editingTaskId === task.id ? styles.editActions : styles.btnGroup}>
                                                {editingTaskId === task.id ? (
                                                    <>
                                                        <button onClick={(e) => saveEdit(e, task.id)} style={{ ...styles.actionBtn, backgroundColor: currentTheme.point, color: '#fff' }}>저장</button>
                                                        <button onClick={(e) => { e.stopPropagation(); setEditingTaskId(null); }} style={styles.actionBtn}>취소</button>
                                                        <button onClick={(e) => deleteTask(e, task.id)} style={styles.smallDeleteBtn}>🗑️</button>
                                                    </>
                                                ) : (['시작', '일시정지', '완료', '포기', '미루기'].map(s => (<button key={s} onClick={() => updateTaskStatus(task.id, s)} style={{ ...styles.statusBtn, backgroundColor: task.status === s ? statusColors[s] : '#f0f0f0', color: task.status === s ? '#fff' : '#333' }}>{s}</button>)))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </aside>

            <main style={styles.main}>
                <header style={{ ...styles.header, backgroundColor: currentTheme.header }}>
                    <button onClick={() => setLeftOpen(!leftOpen)} style={styles.iconBtn}>☰</button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', border: `2px solid ${currentTheme.point}`, backgroundColor: '#fff', overflow: 'hidden' }}>
                            <img src={currentTheme.img} alt="P" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <h2 style={styles.headerTitle}>{currentTheme.title}</h2>
                    </div>
                    <button onClick={() => setRightOpen(!rightOpen)} style={styles.iconBtn}>⚙️</button>
                </header>

                <div style={styles.chatArea}>
                    {chatLogs.map((chat) => (
                        <div key={chat.id} style={chat.sender === 'User' ? styles.userRow : styles.aiRow}>
                            {chat.sender === 'AI' && (
                                <div style={{ ...styles.aiAvatar, border: `2px solid ${personaStyles[chat.persona]?.point || '#ccc'}`, overflow: 'hidden' }}>
                                    <img src={personaStyles[chat.persona]?.img || personaStyles.Strategist.img} alt="AI" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </div>
                            )}
                            <div style={chat.sender === 'User' ? styles.userMessageWrapper : styles.aiMessageWrapper}>
                                <div style={chat.sender === 'User' ? styles.userBubble : { ...styles.aiBubble, borderLeft: `4px solid ${personaStyles[chat.persona]?.point || '#ccc'}` }}>{chat.content}</div>
                                <span style={styles.timeText}>{chat.time}</span>
                            </div>
                        </div>
                    ))}
                    {isLoading && <TypingIndicator personaTheme={currentTheme} />}
                    <div ref={chatEndRef} />
                </div>

                <div style={styles.inputContainer}>
                    <form onSubmit={handleSendMessage} style={styles.inputWrapper}>
                        <input value={inputText} onChange={(e) => setInputText(e.target.value)} placeholder="메시지를 입력하세요..." style={styles.inputField} />
                        <button type="submit" style={{ ...styles.sendBtn, color: inputText ? currentTheme.point : '#ccc' }}>➤</button>
                    </form>
                </div>
            </main>

            <aside style={{ ...styles.sidebar, width: rightOpen ? '300px' : '0', borderLeft: rightOpen ? '1px solid #eee' : 'none' }}>
                <div style={styles.sideContent}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                        <h3 style={{ margin: 0 }}>설정</h3>
                        <button onClick={() => setRightOpen(false)} style={styles.iconBtn}>×</button>
                    </div>
                    <div style={styles.settingItem}><label style={styles.label}>사용자 ID</label><div style={styles.idDisplayBox}><strong>{settings.login_id}</strong></div></div>
                    <div style={styles.settingItem}><label style={styles.label}>페르소나 변경</label>
                        <select value={settings.persona_type} onChange={(e) => setSettings({ ...settings, persona_type: e.target.value })} style={styles.inputIn}>
                            <option value="Lighthouse">온화한 등대</option>
                            <option value="DrillSergeantFocus">단호한 교관 (집중)</option>
                            <option value="DrillSergeantPace">단호한 교관 (완주)</option>
                            <option value="Strategist">냉철한 전략가</option>
                        </select>
                    </div>
                    <div style={styles.settingItem}>
                        <button onClick={clearChatHistory} style={styles.clearChatBtn}>💬 채팅 기록 삭제</button>
                    </div>
                    <div style={{ marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #eee' }}>
                        <button onClick={onLogout} style={styles.logoutBtn}>로그아웃</button>
                    </div>
                </div>
            </aside>
            {showConfetti && <ConfettiEffect taskTitle={completedTaskTitle} />}
            {activeEffect === 'Start' && <StartEffect taskTitle={effectTaskTitle} />}
            {activeEffect === 'Pause' && <PauseEffect taskTitle={effectTaskTitle} />}
            {activeEffect === 'GiveUp' && <GiveUpEffect taskTitle={effectTaskTitle} />}
            {activeEffect === 'Postpone' && <PostponeEffect taskTitle={effectTaskTitle} />}
        </div>
    );
}
