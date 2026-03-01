const API_BASE = process.env.NODE_ENV === 'production' ? "" : "http://localhost:8000";

export async function api(path, method = "GET", body) {
    const res = await fetch(API_BASE + path, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include", // 세션 쿠키 사용
        body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "요청 실패");
    }
    return res.json().catch(() => ({}));
}
