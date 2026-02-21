import { useState, useRef } from 'react';
import { Button } from './Button';
import { Card } from './Card';
import { cn } from '../../lib/utils';

interface ResumeResult {
    candidateId?: string;
    detectedSkills: string[];
    detectedTools: string[];
    confidenceScores: Record<string, number>;
    name?: string;
    email?: string;
    summary?: string;
}

interface ResumeUploadProps {
    onSuccess?: (result: ResumeResult) => void;
    onError?: (error: string) => void;
    /** If true, hides the internal result display (use when parent handles display) */
    hideResultDisplay?: boolean;
}

export const ResumeUpload = ({ onSuccess, onError, hideResultDisplay = false }: ResumeUploadProps) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [result, setResult] = useState<ResumeResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [dragActive, setDragActive] = useState(false);

    const allowedFormats = ['PDF', 'TXT', 'DOCX', 'DOC', 'PNG', 'JPG', 'JPEG'];

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        const files = e.dataTransfer.files;
        if (files && files[0]) {
            setSelectedFile(files[0]);
            setError(null);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files[0]) {
            setSelectedFile(files[0]);
            setError(null);
        }
    };

    const uploadResume = async () => {
        if (!selectedFile) {
            setError('Please select a file');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('resume', selectedFile);

            const response = await fetch('/api/resumes/upload', {
                method: 'POST',
                body: formData,
            });

            // Check if response is ok first
            if (!response.ok) {
                const contentType = response.headers.get('content-type');
                let errorMessage = `Upload failed with status ${response.status}`;

                if (contentType?.includes('application/json')) {
                    try {
                        const errorData = await response.json();
                        errorMessage = errorData.error || errorData.message || errorMessage;
                    } catch {
                        errorMessage = `Upload failed with status ${response.status}`;
                    }
                }

                throw new Error(errorMessage);
            }

            // Parse JSON response
            const contentType = response.headers.get('content-type');
            if (!contentType?.includes('application/json')) {
                throw new Error('Server returned non-JSON response');
            }

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error || data.message || 'Upload failed');
            }

            const resumeResult: ResumeResult = {
                detectedSkills: data.data?.detectedSkills || [],
                detectedTools: data.data?.detectedTools || [],
                confidenceScores: data.data?.confidenceScores || {},
                name: data.data?.name,
                email: data.data?.email,
                summary: data.data?.summary,
            };

            setResult(resumeResult);
            setSelectedFile(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
            onSuccess?.(resumeResult);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to upload resume';
            setError(errorMessage);
            onError?.(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const clearResult = () => {
        setResult(null);
        setSelectedFile(null);
    };

    return (
        <Card className="w-full max-w-2xl mx-auto p-6 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Upload Resume</h3>

            {result && !hideResultDisplay ? (
                <div className="space-y-4">
                    <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg p-4">
                        <h4 className="font-semibold text-green-900 dark:text-green-300 mb-3">
                            Skills Detected ({result.detectedSkills.length})
                        </h4>
                        <div className="flex flex-wrap gap-2 mb-4">
                            {result.detectedSkills.map((skill, idx) => (
                                <div
                                    key={idx}
                                    className="inline-flex items-center gap-2 bg-white dark:bg-green-900/50 px-3 py-1 rounded-full border border-green-100 dark:border-green-700 text-sm text-gray-900 dark:text-green-100"
                                >
                                    <span>{skill}</span>
                                    {result.confidenceScores[skill] && (
                                        <span className="text-xs text-gray-600 dark:text-green-300">
                                            ({Math.round(result.confidenceScores[skill] * 100)}%)
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {result.detectedTools && result.detectedTools.length > 0 && (
                        <div className="bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                            <h4 className="font-semibold text-purple-900 dark:text-purple-300 mb-3">
                                Tools & Technologies ({result.detectedTools.length})
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {result.detectedTools.map((tool, idx) => (
                                    <div
                                        key={idx}
                                        className="inline-flex items-center gap-2 bg-white dark:bg-purple-900/50 px-3 py-1 rounded-full border border-purple-100 dark:border-purple-700 text-sm text-gray-900 dark:text-purple-100"
                                    >
                                        <span>{tool}</span>
                                        {result.confidenceScores[tool] && (
                                            <span className="text-xs text-gray-600 dark:text-purple-300">
                                                ({Math.round(result.confidenceScores[tool] * 100)}%)
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {(result.name || result.email || result.summary) && (
                        <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                            <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">Resume Information</h4>
                            <div className="space-y-2 text-sm text-gray-800 dark:text-blue-100">
                                {result.name && <p><strong>Name:</strong> {result.name}</p>}
                                {result.email && <p><strong>Email:</strong> {result.email}</p>}
                                {result.summary && <p><strong>Summary:</strong> {result.summary.substring(0, 150)}...</p>}
                            </div>
                        </div>
                    )}

                    <Button
                        onClick={clearResult}
                        className="w-full"
                    >
                        Upload Another Resume
                    </Button>
                </div>
            ) : result && hideResultDisplay ? (
                <div className="space-y-4">
                    <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <div>
                            <p className="font-semibold text-green-900 dark:text-green-300">Resume processed successfully!</p>
                            <p className="text-sm text-green-700 dark:text-green-400">
                                Found {result.detectedSkills.length} skills and {result.detectedTools.length} tools. Select the ones you want below.
                            </p>
                        </div>
                    </div>
                    <Button
                        onClick={clearResult}
                        variant="outline"
                        className="w-full"
                    >
                        Upload Different Resume
                    </Button>
                </div>
            ) : (
                <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    className={cn(
                        'relative border-2 border-dashed rounded-lg p-8 text-center transition cursor-pointer',
                        dragActive
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                            : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 hover:border-gray-400 dark:hover:border-gray-500'
                    )}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        onChange={handleFileSelect}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        accept={allowedFormats.map(fmt => {
                            if (fmt === 'DOCX' || fmt === 'DOC') return '.doc,.docx';
                            if (fmt === 'PDF') return '.pdf';
                            if (fmt === 'TXT') return '.txt';
                            if (fmt === 'PNG') return '.png';
                            if (fmt === 'JPG' || fmt === 'JPEG') return '.jpg,.jpeg';
                            return '';
                        }).join(',')}
                    />

                    <div className="pointer-events-none">
                        <div className="text-4xl mb-2">📄</div>
                        <p className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                            {selectedFile ? selectedFile.name : 'Drop your resume here'}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            or click to select a file
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                            Supported formats: {allowedFormats.join(', ')}
                        </p>
                    </div>
                </div>
            )}

            {error && (
                <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded text-red-700 dark:text-red-300 text-sm">
                    {error}
                </div>
            )}

            {!result && (
                <div className="flex gap-3 mt-4">
                    <Button
                        onClick={uploadResume}
                        disabled={!selectedFile || isLoading}
                        className="flex-1"
                    >
                        {isLoading ? 'Processing...' : 'Upload & Extract Skills'}
                    </Button>
                    {selectedFile && (
                        <Button
                            onClick={() => {
                                setSelectedFile(null);
                                if (fileInputRef.current) {
                                    fileInputRef.current.value = '';
                                }
                            }}
                            variant="outline"
                        >
                            Clear
                        </Button>
                    )}
                </div>
            )}
        </Card>
    );
};
