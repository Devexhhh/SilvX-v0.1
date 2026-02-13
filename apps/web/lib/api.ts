const BASE_URL = "http://localhost:4000";

export async function apiPost(path: string, body: any) {
    const res = await fetch(`${BASE_URL}${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });

    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Request failed");
    }

    return res.json();
}

export async function apiGet(path: string) {
    const res = await fetch(`${BASE_URL}${path}`);
    if (!res.ok) throw new Error("Request failed");
    return res.json();
}
