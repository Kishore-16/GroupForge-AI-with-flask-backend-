import { apiFetch } from './api';

export interface Skill {
    name: string;
    level: string;
    endorsements?: number;
    category?: 'technical' | 'soft';
    source: string;
}

export interface ResumeUploadResponse {
    success: boolean;
    error?: string;
    message?: string;
    data: {
        detectedSkills: string[];
        detectedTools: string[];
        confidenceScores: Record<string, number>;
        name?: string;
        email?: string;
        summary?: string;
    };
}

export interface ResumeJobStatusResponse {
    jobId: string;
    status: 'queued' | 'processing' | 'done' | 'error';
    result?: unknown;
    error?: string;
}

export async function uploadResume(file: File, userId?: string): Promise<ResumeUploadResponse> {
    const formData = new FormData();
    formData.append('resume', file);

    if (userId) {
        formData.append('userId', userId);
    }

    return apiFetch<ResumeUploadResponse>('/resumes/upload', {
        method: 'POST',
        body: formData,
    });
}

export async function getResumeJobStatus(jobId: string): Promise<ResumeJobStatusResponse> {
    return apiFetch<ResumeJobStatusResponse>(`/resumes/${jobId}`, {
        method: 'GET',
    });
}

/**
 * Alternative function for extracting text and skills from a resume
 * Can be used for preview/validation before submitting
 */
export async function parseResumeText(text: string): Promise<Partial<ResumeParsedData>> {
    // This would call a backend endpoint to parse resume text directly
    // For now, we'll use the upload endpoint which handles file parsing
    return {};
}
