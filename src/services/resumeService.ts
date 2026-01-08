import { apiFetch } from './api';

export interface ResumeUploadResponse {
    jobId: string;
    status: 'queued' | 'processing' | 'done' | 'error';
}

export interface ResumeJobStatusResponse extends ResumeUploadResponse {
    result?: unknown;
    error?: string;
}

export async function uploadResume(file: File, userId: string): Promise<ResumeUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', userId);

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
