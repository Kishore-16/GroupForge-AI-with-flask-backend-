const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000/api';

export class ApiError extends Error {
    status: number;
    body: unknown;

    constructor(message: string, status: number, body: unknown) {
        super(message);
        this.status = status;
        this.body = body;
    }
}

function buildHeaders(init?: RequestInit): HeadersInit {
    // Preserve caller-provided headers (e.g., for FormData) and add JSON defaults when appropriate.
    const hasContentType = init?.headers && 'Content-Type' in (init.headers as any);
    if (hasContentType) return init!.headers as HeadersInit;
    if (init?.body && init.body instanceof FormData) return init.headers ?? {};
    return { 'Content-Type': 'application/json', ...(init?.headers ?? {}) };
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${path}`, {
        ...init,
        headers: buildHeaders(init),
    });

    let data: unknown = null;
    try {
        data = await response.json();
    } catch (err) {
        data = null;
    }

    if (!response.ok) {
        throw new ApiError(`API request failed: ${response.status}`, response.status, data);
    }

    return data as T;
}
