import { useState, useEffect, useRef } from "react";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, LabelList,
  PieChart, Pie,
} from "recharts";

// ── Design Tokens ──────────────────────────────────────────
const T = {
  blue:   "#3b82f6",
  green:  "#10b981",
  amber:  "#f59e0b",
  purple: "#8b5cf6",
  red:    "#ef4444",
  blueL:  "#eff6ff",
  greenL: "#ecfdf5",
  amberL: "#fffbeb",
  purpleL:"#f5f3ff",
  bg:     "#f7f8fc",
  white:  "#ffffff",
  border: "#e4eaf4",
  text:   "#111827",
  sub:    "#64748b",
  muted:  "#94a3b8",
};

// ── Raw Data ───────────────────────────────────────────────
const MODEL_DATA = [
  {
    name: "GPT-4o mini",
    ttftMin: 1.4, ttftMax: 2.0,
    ttftAvg: 1.7,
    jsonStability: 72,
    context: 128,
    costScore: 40,
    selected: false,
    jsonLabel: "보통",
    costLabel: "고비용",
    jsonColor: T.red,
    costColor: T.red,
  },
  {
    name: "Claude 3.5 Haiku",
    ttftMin: 1.2, ttftMax: 1.8,
    ttftAvg: 1.5,
    jsonStability: 83,
    context: 200,
    costScore: 65,
    selected: false,
    jsonLabel: "양호",
    costLabel: "중간",
    jsonColor: T.amber,
    costColor: T.amber,
  },
  {
    name: "Gemini 2.0 Flash",
    ttftMin: 0.8, ttftMax: 1.2,
    ttftAvg: 1.0,
    jsonStability: 98.2,
    context: 1000,
    costScore: 95,
    selected: true,
    jsonLabel: "98.2% 우수",
    costLabel: "최고 효율",
    jsonColor: T.green,
    costColor: T.green,
  },
];

const ENTITY_DATA = [
  { name: "Date (날짜 추론)",     score: 94.5, color: T.blue   },
  { name: "의도 인식 (Intent)",   score: 92.0, color: T.purple },
  { name: "Title / Detail 요약",  score: 91.2, color: T.green  },
  { name: "Time (시간 추론)",     score: 89.0, color: T.amber  },
];

const KPI_DATA = [
  { label: "JSON 파싱 성공률",  value: 98.2, unit: "%", color: T.green,  colorL: T.greenL,  desc: "Task 구조화 출력\n(Title·Date·Time) 안정성" },
  { label: "의도 인식 일치율",  value: 92,   unit: "%", color: T.blue,   colorL: T.blueL,   desc: "일상 발화에서\nTask 도메인 인지 정확도" },
  { label: "평균 응답 시간",    value: 0.8,  unit: "s", color: T.amber,  colorL: T.amberL,  desc: "일반 챗봇 응답\n(1~2문장 생성 기준)" },
  { label: "API 가용성",        value: 99.9, unit: "%", color: T.purple, colorL: T.purpleL, desc: "에러·타임아웃\n발생률 0.1% 미만" },
];

const RADAR_DATA = [
  { subject: "JSON 파싱",    value: 98.2 },
  { subject: "의도 인식",    value: 92   },
  { subject: "날짜 추론",    value: 94.5 },
  { subject: "시간 추론",    value: 89   },
  { subject: "성향 일치",    value: 86   },
  { subject: "MBTI 매칭",   value: 100  },
];

const LATENCY_DATA = [
  { name: "일반 챗봇 응답",    value: 0.8, color: T.green,  label: "1~2문장 생성" },
  { name: "Nudge 생성 (복합)", value: 1.5, color: T.amber,  label: "DB+컨텍스트+AI" },
];

const CONCLUSION_STATS = [
  { value: "98.2%", label: "파싱 성공"  },
  { value: "86%",   label: "성향 일치"  },
  { value: "+23%",  label: "완료율 향상" },
  { value: "99.9%", label: "API 가용성" },
];

const TABS = ["개요", "모델 비교", "성능 지표", "페르소나 & 코칭"];

// ── Tiny helpers ───────────────────────────────────────────
function useCountUp(target, duration = 1200) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      setVal(+(target * p).toFixed(1));
      if (p < 1) requestAnimationFrame(step);
      else setVal(target);
    };
    requestAnimationFrame(step);
  }, [target, duration]);
  return val;
}

// ── Styled sub-components ──────────────────────────────────
function Card({ children, style = {}, accent }) {
  return (
    <div style={{
      background: T.white,
      border: `1px solid ${T.border}`,
      borderRadius: 16,
      padding: "22px 20px",
      position: "relative",
      overflow: "hidden",
      transition: "transform .22s ease, box-shadow .22s ease",
      ...style,
    }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = "translateY(-3px)";
        e.currentTarget.style.boxShadow = "0 12px 32px rgba(0,0,0,.08)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {accent && (
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: accent, borderRadius: "16px 16px 0 0" }} />
      )}
      {children}
    </div>
  );
}

function SectionHead({ num, title, color }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 22 }}>
      <div style={{ width: 28, height: 28, borderRadius: "50%", background: color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
        {num}
      </div>
      <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: "-.3px", color: T.text }}>
        {title}
      </div>
      <div style={{ flex: 1, height: 1, background: T.border }} />
    </div>
  );
}

function KpiCard({ label, value, unit, color, colorL, desc }) {
  const displayed = useCountUp(value);
  return (
    <Card accent={color} style={{ minWidth: 0 }}>
      <div style={{ fontSize: 44, fontWeight: 900, letterSpacing: -2, lineHeight: 1, color, marginBottom: 4 }}>
        {displayed}<span style={{ fontSize: 18, fontWeight: 700 }}>{unit}</span>
      </div>
      <div style={{ fontSize: 13, fontWeight: 700, color: T.text, marginBottom: 6, marginTop: 10 }}>{label}</div>
      <div style={{ fontSize: 11.5, color: T.sub, lineHeight: 1.6, whiteSpace: "pre-line" }}>{desc}</div>
    </Card>
  );
}

function HBar({ name, score, color }) {
  const [width, setWidth] = useState(0);
  useEffect(() => { const t = setTimeout(() => setWidth(score), 80); return () => clearTimeout(t); }, [score]);
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontSize: 12, fontWeight: 500, color: T.text }}>{name}</span>
        <span style={{ fontSize: 13, fontWeight: 700, color }}>{score}%</span>
      </div>
      <div style={{ height: 8, background: T.bg, borderRadius: 100, overflow: "hidden", border: `1px solid ${T.border}` }}>
        <div style={{ height: "100%", width: `${width}%`, background: color, borderRadius: 100, transition: "width 1s cubic-bezier(.4,0,.2,1)" }} />
      </div>
    </div>
  );
}

// Donut for 86% persona match
function DonutGauge({ value, color, size = 110 }) {
  const r = 42, circ = 2 * Math.PI * r;
  const filled = (value / 100) * circ;
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 110 110">
        <circle cx="55" cy="55" r={r} fill="none" stroke="#f0f4ff" strokeWidth="12" />
        <circle cx="55" cy="55" r={r} fill="none" stroke={color} strokeWidth="12"
          strokeDasharray={`${filled} ${circ - filled}`}
          strokeDashoffset={circ * 0.25}
          strokeLinecap="round"
          style={{ transition: "stroke-dasharray 1.2s cubic-bezier(.4,0,.2,1)" }}
        />
      </svg>
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", textAlign: "center" }}>
        <div style={{ fontSize: 22, fontWeight: 900, color, lineHeight: 1 }}>{value}%</div>
      </div>
    </div>
  );
}

// Custom tooltip for charts
function CustomTooltip({ active, payload, label, suffix = "" }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: 10, padding: "10px 14px", fontSize: 12 }}>
      <div style={{ fontWeight: 700, marginBottom: 4, color: T.text }}>{label || payload[0]?.name}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color || T.sub }}>{p.name}: <strong>{p.value}{suffix}</strong></div>
      ))}
    </div>
  );
}

// ── Tabs ────────────────────────────────────────────────────

// TAB 0: Overview
function TabOverview() {
  return (
    <div>
      {/* KPI Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 32 }}>
        {KPI_DATA.map(k => <KpiCard key={k.label} {...k} />)}
      </div>

      {/* Entity accuracy + latency side-by-side */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 32 }}>
        <Card accent={T.blue}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 18, marginTop: 4 }}>🎯 Task 엔티티 추출 정확도 (F1-Score)</div>
          {ENTITY_DATA.map(e => <HBar key={e.name} name={e.name} score={e.score} color={e.color} />)}
          <div style={{ marginTop: 14, padding: "10px 12px", background: T.bg, borderRadius: 8, border: `1px solid ${T.border}` }}>
            <div style={{ fontSize: 10, color: T.muted, letterSpacing: .5, textTransform: "uppercase", marginBottom: 4 }}>평가 방식</div>
            <div style={{ fontSize: 11.5, color: T.sub, lineHeight: 1.6 }}>100세트 더미 대화 시나리오 기반<br />Automated Batch Testing</div>
          </div>
        </Card>

        <Card accent={T.amber}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 18, marginTop: 4 }}>⚡ 시스템 레이턴시 비교</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ background: T.greenL, border: "1px solid rgba(16,185,129,.2)", borderRadius: 12, padding: "14px 16px" }}>
              <div style={{ fontSize: 11, color: T.green, fontWeight: 700, letterSpacing: .5, textTransform: "uppercase", marginBottom: 6 }}>일반 챗봇 응답</div>
              <div style={{ fontSize: 36, fontWeight: 900, color: T.green, letterSpacing: -2, lineHeight: 1 }}>0.8<span style={{ fontSize: 16, fontWeight: 700 }}>s</span></div>
              <div style={{ fontSize: 11, color: T.sub, marginTop: 4 }}>1~2문장 생성</div>
            </div>
            <div style={{ background: T.amberL, border: "1px solid rgba(245,158,11,.2)", borderRadius: 12, padding: "14px 16px" }}>
              <div style={{ fontSize: 11, color: T.amber, fontWeight: 700, letterSpacing: .5, textTransform: "uppercase", marginBottom: 6 }}>Nudge 생성 (복합)</div>
              <div style={{ fontSize: 36, fontWeight: 900, color: T.amber, letterSpacing: -2, lineHeight: 1 }}>1.5<span style={{ fontSize: 16, fontWeight: 700 }}>s</span></div>
              <div style={{ fontSize: 11, color: T.sub, marginTop: 4 }}>DB 조회 + 컨텍스트 병합 + AI 생성</div>
            </div>
            <div style={{ background: T.blueL, border: "1px solid rgba(59,130,246,.2)", borderRadius: 12, padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: 11, color: T.blue, fontWeight: 700, letterSpacing: .5, textTransform: "uppercase", marginBottom: 4 }}>API 성공률</div>
                <div style={{ fontSize: 11, color: T.sub }}>에러·타임아웃 0.1% 미만</div>
              </div>
              <div style={{ fontSize: 30, fontWeight: 900, color: T.blue, letterSpacing: -1 }}>99.9<span style={{ fontSize: 14 }}>%</span></div>
            </div>
          </div>
        </Card>
      </div>

      {/* Radar overview */}
      <Card accent={T.purple}>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4, marginTop: 4 }}>🧠 AI 성능 종합 레이더</div>
        <div style={{ fontSize: 12, color: T.sub, marginBottom: 16 }}>모든 핵심 지표의 종합 분포</div>
        <ResponsiveContainer width="100%" height={280}>
          <RadarChart data={RADAR_DATA} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
            <PolarGrid stroke={T.border} />
            <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: T.sub }} />
            <PolarRadiusAxis angle={30} domain={[70, 100]} tick={{ fontSize: 9, fill: T.muted }} />
            <Radar name="MindStep AI" dataKey="value" stroke={T.purple} fill={T.purple} fillOpacity={0.18} strokeWidth={2} />
            <Tooltip content={<CustomTooltip suffix="%" />} />
          </RadarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}

// TAB 1: Model comparison
function TabModel() {
  const [metric, setMetric] = useState("ttftAvg");
  const metricOptions = [
    { key: "ttftAvg",        label: "응답 속도 (s)",     suffix: "s"  },
    { key: "jsonStability",  label: "JSON 안정성 (%)",   suffix: "%" },
    { key: "context",        label: "컨텍스트 (K 토큰)", suffix: "K" },
    { key: "costScore",      label: "비용 효율 점수",    suffix: ""  },
  ];

  const barColors = [T.red, T.amber, T.blue];

  return (
    <div>
      {/* Comparison Table */}
      <Card accent={T.blue} style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 16, marginTop: 4 }}>
          모델 비교 분석 (GPT-4o mini · Claude 3.5 Haiku · Gemini 2.0 Flash)
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {["모델", "평균 TTFT", "JSON 파싱 안정성", "컨텍스트 윈도우", "비용 효율", "선정"].map(h => (
                <th key={h} style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: T.muted, padding: "8px 10px", textAlign: "left", borderBottom: `1px solid ${T.border}` }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MODEL_DATA.map((m, i) => (
              <tr key={m.name} style={{ background: m.selected ? "#eff6ff" : "transparent" }}>
                <td style={{ padding: "10px 10px", fontSize: 12, fontWeight: m.selected ? 700 : 400, color: m.selected ? T.blue : T.text, borderBottom: i < 2 ? `1px solid ${T.border}` : "none" }}>
                  {m.selected ? "✅ " : ""}{m.name}
                </td>
                <td style={{ padding: "10px 10px", fontSize: 12, fontWeight: m.selected ? 700 : 400, color: m.selected ? T.blue : T.text, borderBottom: i < 2 ? `1px solid ${T.border}` : "none" }}>
                  {m.ttftMin}~{m.ttftMax}s
                </td>
                <td style={{ padding: "10px 10px", borderBottom: i < 2 ? `1px solid ${T.border}` : "none" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 100, background: m.jsonColor + "22", color: m.jsonColor }}>
                    {m.jsonLabel}
                  </span>
                </td>
                <td style={{ padding: "10px 10px", fontSize: 12, fontWeight: m.selected ? 700 : 400, color: m.selected ? T.blue : T.text, borderBottom: i < 2 ? `1px solid ${T.border}` : "none" }}>
                  {m.context}K 토큰
                </td>
                <td style={{ padding: "10px 10px", borderBottom: i < 2 ? `1px solid ${T.border}` : "none" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 100, background: m.costColor + "22", color: m.costColor }}>
                    {m.costLabel}
                  </span>
                </td>
                <td style={{ padding: "10px 10px", borderBottom: i < 2 ? `1px solid ${T.border}` : "none" }}>
                  {m.selected ? (
                    <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 100, background: T.blue, color: "#fff" }}>✔ 채택</span>
                  ) : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* Highlight */}
        <div style={{ background: T.blueL, border: "1px solid rgba(59,130,246,.2)", borderRadius: 10, padding: "14px 16px", marginTop: 14, display: "flex", alignItems: "flex-start", gap: 10 }}>
          <span style={{ fontSize: 18, flexShrink: 0 }}>💡</span>
          <div style={{ fontSize: 12, color: "#1e40af", lineHeight: 1.6 }}>
            Gemini 2.0 Flash는 타사 동급 모델 대비 TTFT 약 <strong>15~20% 빠른 응답</strong>과 <strong>최대 100만 토큰 컨텍스트 윈도우</strong>를 지원하여 사용자의 누적 대화 내역 및 행동 키워드 로그를 손실 없이 지속 공급합니다.
          </div>
        </div>
      </Card>

      {/* Interactive Bar Chart */}
      <Card accent={T.green}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, marginTop: 4, flexWrap: "wrap", gap: 10 }}>
          <div style={{ fontSize: 13, fontWeight: 700 }}>📊 지표별 모델 비교 차트</div>
          <div style={{ display: "flex", gap: 6 }}>
            {metricOptions.map(o => (
              <button
                key={o.key}
                onClick={() => setMetric(o.key)}
                style={{
                  padding: "4px 10px", fontSize: 11, borderRadius: 8, border: `1px solid ${metric === o.key ? T.blue : T.border}`,
                  background: metric === o.key ? T.blueL : T.white, color: metric === o.key ? T.blue : T.sub,
                  fontWeight: metric === o.key ? 700 : 400, cursor: "pointer", transition: "all .15s"
                }}
              >{o.label}</button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={MODEL_DATA} margin={{ top: 16, right: 20, left: 0, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={T.border} vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: T.sub }} />
            <YAxis tick={{ fontSize: 11, fill: T.muted }} />
            <Tooltip content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null;
              const suf = metricOptions.find(o => o.key === metric)?.suffix || "";
              return (
                <div style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: 10, padding: "10px 14px", fontSize: 12 }}>
                  <div style={{ fontWeight: 700, marginBottom: 4, color: T.text }}>{label}</div>
                  <div style={{ color: payload[0]?.fill }}>{metricOptions.find(o => o.key === metric)?.label}: <strong>{payload[0]?.value}{suf}</strong></div>
                </div>
              );
            }} />
            <Bar dataKey={metric} radius={[6, 6, 0, 0]}>
              {MODEL_DATA.map((_, i) => <Cell key={i} fill={barColors[i]} />)}
              <LabelList dataKey={metric} position="top" style={{ fontSize: 11, fill: T.sub }} formatter={(v) => {
                const suf = metricOptions.find(o => o.key === metric)?.suffix || "";
                return `${v}${suf}`;
              }} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}

// TAB 2: Performance metrics
function TabPerformance() {
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 28 }}>
        {KPI_DATA.map(k => <KpiCard key={k.label} {...k} />)}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Entity bar chart */}
        <Card accent={T.blue}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 18, marginTop: 4 }}>🎯 엔티티 추출 정확도 (F1-Score)</div>
          {ENTITY_DATA.map(e => <HBar key={e.name} name={e.name} score={e.score} color={e.color} />)}
          <div style={{ marginTop: 14, padding: "10px 12px", background: T.bg, borderRadius: 8, border: `1px solid ${T.border}` }}>
            <div style={{ fontSize: 10, color: T.muted, letterSpacing: .5, textTransform: "uppercase", marginBottom: 4 }}>평가 방식</div>
            <div style={{ fontSize: 11.5, color: T.sub, lineHeight: 1.6 }}>100세트 더미 대화 시나리오 기반<br />Automated Batch Testing</div>
          </div>
        </Card>

        {/* Latency bar chart via recharts */}
        <Card accent={T.amber}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 18, marginTop: 4 }}>⚡ 레이턴시 비교 차트</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={LATENCY_DATA} margin={{ top: 16, right: 20, left: 0, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={T.border} vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: T.sub }} />
              <YAxis tick={{ fontSize: 11, fill: T.muted }} unit="s" domain={[0, 2]} />
              <Tooltip content={<CustomTooltip suffix="s" />} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {LATENCY_DATA.map((d, i) => <Cell key={i} fill={d.color} />)}
                <LabelList dataKey="value" position="top" style={{ fontSize: 11, fill: T.sub }} formatter={v => `${v}s`} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          {/* API success rate inline */}
          <div style={{ background: T.blueL, border: "1px solid rgba(59,130,246,.2)", borderRadius: 12, padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 16 }}>
            <div>
              <div style={{ fontSize: 11, color: T.blue, fontWeight: 700, letterSpacing: .5, textTransform: "uppercase", marginBottom: 4 }}>API 성공률</div>
              <div style={{ fontSize: 11, color: T.sub }}>에러·타임아웃 0.1% 미만</div>
            </div>
            <div style={{ fontSize: 28, fontWeight: 900, color: T.blue, letterSpacing: -1 }}>99.9<span style={{ fontSize: 13 }}>%</span></div>
          </div>
        </Card>
      </div>
    </div>
  );
}

// TAB 3: Persona & coaching
function TabPersona() {
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 28 }}>

        {/* Donut — persona match */}
        <Card accent={T.purple}>
          <div style={{ fontSize: 12, fontWeight: 700, color: T.purple, letterSpacing: .5, textTransform: "uppercase", marginBottom: 12, marginTop: 4 }}>🧪 성향 일치도</div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", margin: "8px 0 16px" }}>
            <DonutGauge value={86} color={T.purple} />
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, textAlign: "center", color: T.text }}>페르소나 적합도 응답</div>
          <div style={{ fontSize: 11.5, color: T.sub, textAlign: "center", marginTop: 6, lineHeight: 1.6 }}>
            테스터 50명 중 <strong>43명</strong>이<br />"코칭 스타일이 내 약점 보완에<br />적합하다"고 응답
          </div>
        </Card>

        {/* MBTI 100% */}
        <Card accent={T.green}>
          <div style={{ fontSize: 12, fontWeight: 700, color: T.green, letterSpacing: .5, textTransform: "uppercase", marginBottom: 12, marginTop: 4 }}>✅ MBTI 매칭 정확도</div>
          <div style={{ textAlign: "center", margin: "8px 0 16px" }}>
            <div style={{ fontSize: 58, fontWeight: 900, color: T.green, letterSpacing: -3, lineHeight: 1 }}>100<span style={{ fontSize: 24 }}>%</span></div>
            <div style={{ fontSize: 11, color: T.sub, marginTop: 6 }}>단위 테스트 전체 통과</div>
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, color: T.text, marginBottom: 6 }}>알고리즘 일치율</div>
          <div style={{ fontSize: 11.5, color: T.sub, lineHeight: 1.6 }}>
            심리학적 지표(P성향 → 데드라인 압박형, J성향 → 완벽주의 완화형)와 매칭 알고리즘 결괏값 <strong>완전 일치</strong>
          </div>
        </Card>

        {/* Coaching effects */}
        <Card accent={T.amber}>
          <div style={{ fontSize: 12, fontWeight: 700, color: T.amber, letterSpacing: .5, textTransform: "uppercase", marginBottom: 12, marginTop: 4 }}>📈 코칭 효과성</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 8 }}>
            <div style={{ background: T.amberL, border: "1px solid rgba(245,158,11,.2)", borderRadius: 10, padding: 14 }}>
              <div style={{ fontSize: 10, color: T.amber, fontWeight: 700, letterSpacing: .5, textTransform: "uppercase", marginBottom: 4 }}>Task 완료 전환율</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                <span style={{ fontSize: 36, fontWeight: 900, color: T.amber, letterSpacing: -1 }}>+23</span>
                <span style={{ fontSize: 18, fontWeight: 700, color: T.amber }}>%</span>
              </div>
              <div style={{ fontSize: 10.5, color: T.sub, marginTop: 2, lineHeight: 1.5 }}>일반 알람 대비 맞춤형 Nudge<br />장기 대기 Task 완료율 향상</div>
            </div>
            <div style={{ background: T.purpleL, border: "1px solid rgba(139,92,246,.2)", borderRadius: 10, padding: 14 }}>
              <div style={{ fontSize: 10, color: T.purple, fontWeight: 700, letterSpacing: .5, textTransform: "uppercase", marginBottom: 4 }}>대화 지속성 (Engagement)</div>
              <div style={{ fontSize: 36, fontWeight: 900, color: T.purple, letterSpacing: -1 }}>×1.5</div>
              <div style={{ fontSize: 10.5, color: T.sub, marginTop: 2, lineHeight: 1.5 }}>감정 피드백·조언 요청 Turn<br />평균 1.5배 증가</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Conclusion banner */}
      <div style={{ background: "linear-gradient(135deg,#1e3a8a 0%,#1d4ed8 100%)", border: "none", borderRadius: 16, padding: "24px 22px" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 24, alignItems: "center" }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2.5, textTransform: "uppercase", color: "rgba(255,255,255,.6)", marginBottom: 10 }}>Conclusion</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#fff", lineHeight: 1.5, marginBottom: 10 }}>
              Gemini 2.0 Flash의 속도·안정성과<br />페르소나 매칭이 만든 성과
            </div>
            <div style={{ fontSize: 12.5, color: "rgba(255,255,255,.7)", lineHeight: 1.7 }}>
              실시간 응답성 및 JSON 파싱 안정성을 극대화하는 동시에, MBTI 기반 철저한 페르소나 매칭 라우팅을 통해 행동 교정과 작업 완료율을 유의미하게 끌어올리는 객관적 성능 지표를 갖추었습니다.
            </div>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {CONCLUSION_STATS.map(s => (
              <div key={s.label} style={{ background: "rgba(255,255,255,.12)", borderRadius: 12, padding: "14px 18px", textAlign: "center", minWidth: 90 }}>
                <div style={{ fontSize: 26, fontWeight: 900, color: "#fff", letterSpacing: -1 }}>{s.value}</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,.6)", marginTop: 3 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Dashboard ──────────────────────────────────────────
export default function MindStepDashboard() {
  const [activeTab, setActiveTab] = useState(0);
  const PANELS = [TabOverview, TabModel, TabPerformance, TabPersona];
  const Panel = PANELS[activeTab];

  return (
    <div style={{ background: T.bg, minHeight: "100vh", fontFamily: "'Noto Sans KR', sans-serif", padding: "48px 40px 72px" }}>
      <div style={{ width: "100%", margin: "0 auto" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{ display: "inline-block", fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: T.blue, background: T.blueL, border: "1px solid rgba(59,130,246,.2)", padding: "5px 18px", borderRadius: 100, marginBottom: 16 }}>
            📊 Quantitative Evaluation Report
          </div>
          <h1 style={{ fontSize: 38, fontWeight: 900, letterSpacing: -1, color: T.text, marginBottom: 10, lineHeight: 1.2 }}>
            MindStep <span style={{ color: T.blue }}>AI 성능</span> 정량적 평가
          </h1>
          <p style={{ fontSize: 14, color: T.sub, fontWeight: 300 }}>
            LLM 모델 선정 근거 · AI 기능 성능 지표 · 페르소나 매칭 검증 결과
          </p>
        </div>

        {/* Tab bar */}
        <div style={{ display: "flex", gap: 4, borderBottom: `1px solid ${T.border}`, marginBottom: 28 }}>
          {TABS.map((tab, i) => (
            <button key={tab} onClick={() => setActiveTab(i)} style={{
              padding: "10px 18px", fontSize: 13, fontWeight: activeTab === i ? 700 : 400,
              color: activeTab === i ? T.blue : T.sub,
              background: "transparent", border: "none",
              borderBottom: `2px solid ${activeTab === i ? T.blue : "transparent"}`,
              cursor: "pointer", transition: "all .15s", marginBottom: -1,
            }}>
              {tab}
            </button>
          ))}
        </div>

        {/* Panel */}
        <Panel />

        {/* Footer */}
        <div style={{ textAlign: "center", marginTop: 56, fontSize: 11, color: T.muted, letterSpacing: 1.5, textTransform: "uppercase" }}>
          MindStep · AI 정량적 평가 보고서 · Quantitative Evaluation Report
        </div>
      </div>
    </div>
  );
}
