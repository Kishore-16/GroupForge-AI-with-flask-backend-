import { apiFetch } from './api';

export interface StartAssessmentRequest {
    userId: string;
    skillVersion?: string | null;
}

export interface StartAssessmentResponse {
    sessionId: string;
    skillVersion: string | null;
}

export interface SubmitAssessmentRequest {
    responses: unknown[];
}

export interface SubmitAssessmentResponse {
    sessionId: string;
    status: string;
}

export interface CompleteAssessmentResponse {
    sessionId: string;
    status: string;
    skillProfile?: unknown;
}

export async function startAssessment(payload: StartAssessmentRequest): Promise<StartAssessmentResponse> {
    return apiFetch<StartAssessmentResponse>('/assessments/start', {
        method: 'POST',
        body: JSON.stringify(payload),
    });
}

export async function submitAssessment(
    sessionId: string,
    payload: SubmitAssessmentRequest
): Promise<SubmitAssessmentResponse> {
    return apiFetch<SubmitAssessmentResponse>(`/assessments/${sessionId}/submit`, {
        method: 'POST',
        body: JSON.stringify(payload),
    });
}

export async function completeAssessment(sessionId: string): Promise<CompleteAssessmentResponse> {
    return apiFetch<CompleteAssessmentResponse>(`/assessments/${sessionId}/complete`, {
        method: 'POST',
    });
}
