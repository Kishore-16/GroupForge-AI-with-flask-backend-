// Assessment context - Firebase database removed
import { createContext, useContext, useState, ReactNode } from 'react';
import {
    AssessmentSession,
    AssessmentQuestion,
    AssessmentResponse,
    AssessmentType,
    SkillProfile
} from '../types';
import { assessmentModel } from '../config/gemini';
import { useAuth } from './AuthContext';

interface AssessmentContextType {
    currentSession: AssessmentSession | null;
    isAssessing: boolean;
    startAssessment: (type: AssessmentType) => Promise<void>;
    submitResponse: (response: AssessmentResponse) => Promise<AssessmentQuestion | null>;
    completeAssessment: () => Promise<SkillProfile | null>;
    abandonAssessment: () => void;
}

const AssessmentContext = createContext<AssessmentContextType | undefined>(undefined);

export function useAssessment() {
    const context = useContext(AssessmentContext);
    if (context === undefined) {
        throw new Error('useAssessment must be used within an AssessmentProvider');
    }
    return context;
}

interface AssessmentProviderProps {
    children: ReactNode;
}

export function AssessmentProvider({ children }: AssessmentProviderProps) {
    const { currentUser } = useAuth();
    const [currentSession, setCurrentSession] = useState<AssessmentSession | null>(null);
    const [isAssessing, setIsAssessing] = useState(false);

    // Generate initial questions using Gemini
    async function generateInitialQuestions(type: AssessmentType): Promise<AssessmentQuestion[]> {
        const prompt = `You are an expert skill assessment designer for academic team formation.
Generate 3 initial assessment questions for a "${type}" evaluation.

Each question should evaluate one of these skills: leadership, analyticalThinking, creativity, executionStrength, communication, teamwork.

Return a JSON array with this structure:
[
  {
    "id": "q1",
    "type": "scenario",
    "skillTargeted": "leadership",
    "difficulty": "medium",
    "question": "Your question here",
    "context": "Optional context",
    "timeLimit": 120
  }
]

Make questions practical, scenario-based, and relevant to college students working on group projects.
Return ONLY the JSON array, no other text.`;

        try {
            const result = await assessmentModel.generateContent(prompt);
            const text = result.response.text();
            const jsonMatch = text.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            throw new Error('Failed to parse questions');
        } catch (error) {
            console.error('Error generating questions:', error);
            // Return fallback questions
            return getDefaultQuestions(type);
        }
    }

    // Generate next adaptive question based on responses
    async function generateNextQuestion(
        session: AssessmentSession,
        lastResponse: AssessmentResponse
    ): Promise<AssessmentQuestion | null> {
        if (session.responses.length >= 10) {
            return null; // Max questions reached
        }

        const prompt = `You are an adaptive skill assessment system.

Previous responses in this session:
${JSON.stringify(session.responses.slice(-3), null, 2)}

Last question asked:
${JSON.stringify(session.questions[session.currentQuestionIndex], null, 2)}

Last response:
${JSON.stringify(lastResponse, null, 2)}

Based on the response quality and skills already assessed, generate ONE follow-up question.
If the previous answer was strong, increase difficulty. If weak, try a different skill area.

Skills to evaluate: leadership, analyticalThinking, creativity, executionStrength, communication, teamwork

Return a single JSON object:
{
  "id": "q${session.responses.length + 1}",
  "type": "scenario" | "open_ended" | "multiple_choice",
  "skillTargeted": "one of the skills",
  "difficulty": "easy" | "medium" | "hard",
  "question": "Your adaptive question",
  "options": ["only if multiple_choice"],
  "timeLimit": 120
}

Return ONLY the JSON object.`;

        try {
            const result = await assessmentModel.generateContent(prompt);
            const text = result.response.text();
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            return null;
        } catch (error) {
            console.error('Error generating next question:', error);
            return null;
        }
    }

    // Start a new assessment session
    async function startAssessment(type: AssessmentType) {
        if (!currentUser) throw new Error('User not authenticated');

        setIsAssessing(true);
        const questions = await generateInitialQuestions(type);

        const session: AssessmentSession = {
            id: `session_${Date.now()}`,
            userId: currentUser.uid,
            type,
            questions,
            responses: [],
            currentQuestionIndex: 0,
            startedAt: new Date(),
            status: 'active',
        };

        setCurrentSession(session);
        console.warn('Firebase database removed - session not persisted');
    }

    // Submit a response and get next question
    async function submitResponse(response: AssessmentResponse): Promise<AssessmentQuestion | null> {
        if (!currentSession) throw new Error('No active session');

        const updatedSession: AssessmentSession = {
            ...currentSession,
            responses: [...currentSession.responses, response],
        };

        // Generate next adaptive question
        const nextQuestion = await generateNextQuestion(updatedSession, response);

        if (nextQuestion) {
            updatedSession.questions.push(nextQuestion);
            updatedSession.currentQuestionIndex = updatedSession.questions.length - 1;
        }

        setCurrentSession(updatedSession);
        console.warn('Firebase database removed - response not persisted');

        return nextQuestion;
    }

    // Complete assessment and calculate scores
    async function completeAssessment(): Promise<SkillProfile | null> {
        if (!currentSession || !currentUser) return null;

        const prompt = `You are an expert skill evaluator analyzing assessment responses.

Assessment Session:
${JSON.stringify({
            type: currentSession.type,
            questions: currentSession.questions,
            responses: currentSession.responses,
        }, null, 2)}

Evaluate the student's skills based on their responses. Provide scores from 0-100 for each skill.

Return a JSON object with this exact structure:
{
  "leadership": { "score": 75, "confidence": "medium" },
  "analyticalThinking": { "score": 80, "confidence": "high" },
  "creativity": { "score": 65, "confidence": "medium" },
  "executionStrength": { "score": 70, "confidence": "medium" },
  "communication": { "score": 85, "confidence": "high" },
  "teamwork": { "score": 78, "confidence": "medium" },
  "overallConfidence": "medium",
  "insights": "Brief summary of strengths and areas for growth"
}

Be fair but critical. Base scores on actual demonstrated ability in responses.
Return ONLY the JSON object.`;

        try {
            const result = await assessmentModel.generateContent(prompt);
            const text = result.response.text();
            const jsonMatch = text.match(/\{[\s\S]*\}/);

            if (!jsonMatch) throw new Error('Failed to parse scores');

            const scores = JSON.parse(jsonMatch[0]);

            const skillProfile: SkillProfile = {
                leadership: { score: scores.leadership.score, confidence: scores.leadership.confidence, assessmentCount: 1 },
                analyticalThinking: { score: scores.analyticalThinking.score, confidence: scores.analyticalThinking.confidence, assessmentCount: 1 },
                creativity: { score: scores.creativity.score, confidence: scores.creativity.confidence, assessmentCount: 1 },
                executionStrength: { score: scores.executionStrength.score, confidence: scores.executionStrength.confidence, assessmentCount: 1 },
                communication: { score: scores.communication.score, confidence: scores.communication.confidence, assessmentCount: 1 },
                teamwork: { score: scores.teamwork.score, confidence: scores.teamwork.confidence, assessmentCount: 1 },
                lastAssessedAt: new Date(),
                overallConfidence: scores.overallConfidence,
            };

            // Calculate overall score
            const overallScore = (
                scores.leadership.score +
                scores.analyticalThinking.score +
                scores.creativity.score +
                scores.executionStrength.score +
                scores.communication.score +
                scores.teamwork.score
            ) / 6;

            // Persist to backend
            try {
                const token = await currentUser.getIdToken();
                const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/assessments/complete`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        skills: {
                            leadership: scores.leadership.score,
                            analyticalThinking: scores.analyticalThinking.score,
                            creativity: scores.creativity.score,
                            executionStrength: scores.executionStrength.score,
                            communication: scores.communication.score,
                            teamwork: scores.teamwork.score
                        },
                        overallScore: overallScore
                    })
                });

                if (!response.ok) {
                    console.error('Failed to persist assessment to backend');
                }
            } catch (backendError) {
                console.error('Error calling backend:', backendError);
            }

            setCurrentSession(null);
            setIsAssessing(false);

            return skillProfile;
        } catch (error) {
            console.error('Error completing assessment:', error);
            return null;
        }
    }

    // Abandon current assessment
    function abandonAssessment() {
        console.warn('Firebase database removed - session abandonment not persisted');
        setCurrentSession(null);
        setIsAssessing(false);
    }

    const value: AssessmentContextType = {
        currentSession,
        isAssessing,
        startAssessment,
        submitResponse,
        completeAssessment,
        abandonAssessment,
    };

    return (
        <AssessmentContext.Provider value={value}>
            {children}
        </AssessmentContext.Provider>
    );
}

// Fallback default questions
function getDefaultQuestions(_type: AssessmentType): AssessmentQuestion[] {
    return [
        {
            id: 'q1',
            type: 'scenario',
            skillTargeted: 'leadership',
            difficulty: 'medium',
            question: 'Your team has missed two consecutive deadlines. As the team lead, how would you address this situation in your next meeting?',
            timeLimit: 180,
        },
        {
            id: 'q2',
            type: 'open_ended',
            skillTargeted: 'analyticalThinking',
            difficulty: 'medium',
            question: 'Describe your approach to breaking down a complex problem you\'ve never encountered before.',
            timeLimit: 180,
        },
        {
            id: 'q3',
            type: 'scenario',
            skillTargeted: 'teamwork',
            difficulty: 'medium',
            question: 'A teammate strongly disagrees with your proposed solution. How do you handle the disagreement while maintaining team cohesion?',
            timeLimit: 180,
        },
    ];
}
