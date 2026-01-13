import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, useWebSocket } from '../contexts';
import { DashboardLayout } from '../components/layout';
import { Card, CardBody, CardHeader, Button, Input, ResumeUpload } from '../components/ui';
import { authApi } from '../services/authApi';
import { cn } from '../lib/utils';
import {
    User,
    Mail,
    Building2,
    Github,
    Save,
    Edit2,
    CheckCircle,
    CheckCircle2,
    ArrowRight,
    ArrowLeft,
    Briefcase,
    Target,
    Globe,
    Clock,
    Users,
    Linkedin
} from 'lucide-react';
import {
    StudentProfile,
    FacultyProfile,
    SkillLevel,
    UserSkill
} from '../types';

interface ProfileFormData {
    // Basic Info
    displayName: string;
    institutionId: string;
    department: string;

    // Student-specific fields
    major: string;
    enrollmentNumber: string;

    // Faculty-specific fields
    designation: 'Assistant Professor' | 'Associate Professor' | 'Professor' | '';
    employeeId: string;
    contactNumber: string;

    // Availability
    timezone: string;

    // Skills & Experience
    selectedSkills: UserSkill[];
    tools: string[];
    githubUsername: string;

    // Optional
    bio: string;
}

const STUDENT_STEPS = [
    { id: 1, title: 'Profile Information', icon: User },
];

const FACULTY_STEPS = [
    { id: 1, title: 'Basic Info', icon: User },
];

export function ProfilePage() {
    const { currentUser, userProfile, loading: authLoading, refreshUserProfile } = useAuth();
    const webSocket = useWebSocket();
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [isEditing, setIsEditing] = useState(false);
    const [isNewUser, setIsNewUser] = useState(false);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [resumeImport, setResumeImport] = useState<{ skills: string[]; tools: string[] }>({ skills: [], tools: [] });

    // Listen for real-time profile updates
    useEffect(() => {
        webSocket.onProfileUpdate((data) => {
            console.log('📬 Profile updated via WebSocket, refreshing...', data);
            refreshUserProfile();
        });

        return () => {
            webSocket.offProfileUpdate();
        };
    }, [webSocket, refreshUserProfile]);

    const [formData, setFormData] = useState<ProfileFormData>({
        displayName: '',
        institutionId: '',
        department: '',
        major: '',
        enrollmentNumber: '',
        designation: '',
        employeeId: '',
        contactNumber: '',
        timezone: 'Asia/Kolkata',
        selectedSkills: [],
        tools: [],
        githubUsername: '',
        bio: '',
    });

    useEffect(() => {
        if (authLoading) return;

        if (!currentUser) {
            navigate('/login');
            return;
        }

        if (userProfile) {
            const isNew = !userProfile.profileCompleted;
            setIsNewUser(isNew);
            setIsEditing(isNew);

            if (userProfile.role === 'student') {
                const studentProfile = userProfile as StudentProfile;
                setFormData({
                    displayName: userProfile.displayName || '',
                    institutionId: userProfile.institutionId || '',
                    department: studentProfile.department || '',
                    major: studentProfile.major || '',
                    enrollmentNumber: studentProfile.enrollmentNumber || '',
                    designation: '',
                    employeeId: '',
                    contactNumber: '',
                    timezone: studentProfile.timezone || 'Asia/Kolkata',
                    selectedSkills: studentProfile.userSkills || [],
                    tools: studentProfile.tools || [],
                    githubUsername: studentProfile.githubUsername || '',
                    bio: studentProfile.bio || '',
                });
            } else if (userProfile.role === 'faculty') {
                const facultyProfile = userProfile as FacultyProfile;
                setFormData({
                    displayName: userProfile.displayName || '',
                    institutionId: userProfile.institutionId || '',
                    department: facultyProfile.department || '',
                    designation: facultyProfile.designation || '',
                    employeeId: facultyProfile.employeeId || '',
                    contactNumber: facultyProfile.contactNumber || '',
                    major: '',
                    enrollmentNumber: '',
                    timezone: 'Asia/Kolkata',
                    selectedSkills: [],
                    tools: [],
                    githubUsername: '',
                    bio: '',
                });
            }
        } else if (currentUser) {
            setIsNewUser(true);
            setIsEditing(true);
            setFormData(prev => ({
                ...prev,
                displayName: currentUser.displayName || '',
            }));
        }
    }, [currentUser, userProfile, navigate, authLoading]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const toggleSkill = (skillName: string) => {
        setFormData(prev => {
            const existingSkill = prev.selectedSkills.find(s => s.name === skillName);
            if (existingSkill) {
                return {
                    ...prev,
                    selectedSkills: prev.selectedSkills.filter(s => s.name !== skillName)
                };
            } else {
                return {
                    ...prev,
                    selectedSkills: [...prev.selectedSkills, { name: skillName, level: 'intermediate' as SkillLevel }]
                };
            }
        });
    };

    const updateSkillLevel = (skillName: string, level: SkillLevel) => {
        setFormData(prev => ({
            ...prev,
            selectedSkills: prev.selectedSkills.map(s =>
                s.name === skillName ? { ...s, level } : s
            )
        }));
    };

    const removeTool = (toolName: string) => {
        setFormData(prev => ({
            ...prev,
            tools: prev.tools.filter(t => t.toLowerCase() !== toolName.toLowerCase())
        }));
    };

    const handleResumeSuccess = (resumeResult: { detectedSkills?: string[]; detectedTools?: string[] }) => {
        const detectedSkills = resumeResult.detectedSkills || [];
        const detectedTools = resumeResult.detectedTools || [];

        setResumeImport({ skills: detectedSkills, tools: detectedTools });

        setFormData((prev: ProfileFormData) => {
            const existingSkills = new Set(prev.selectedSkills.map((s: UserSkill) => s.name.toLowerCase()));
            const mergedSkills = [...prev.selectedSkills];

            detectedSkills.forEach((skill: string) => {
                if (skill && !existingSkills.has(skill.toLowerCase())) {
                    mergedSkills.push({ name: skill, level: 'intermediate' as SkillLevel });
                }
            });

            const existingTools = new Set(prev.tools.map((t: string) => t.toLowerCase()));
            const mergedTools = [...prev.tools];
            detectedTools.forEach((tool: string) => {
                if (tool && !existingTools.has(tool.toLowerCase())) {
                    mergedTools.push(tool);
                }
            });

            return { ...prev, selectedSkills: mergedSkills, tools: mergedTools };
        });
    };



    const isFacultyUser = userProfile?.role === 'faculty';
    const steps = isFacultyUser ? FACULTY_STEPS : STUDENT_STEPS;

    const validateStep = (step: number): boolean => {
        setError('');
        const isFaculty = userProfile?.role === 'faculty';

        switch (step) {
            case 1:
                if (!formData.displayName.trim()) {
                    setError('Full name is required');
                    return false;
                }
                if (!formData.institutionId.trim()) {
                    setError('University/Campus is required');
                    return false;
                }
                if (!formData.department.trim()) {
                    setError('Department is required');
                    return false;
                }
                if (isFaculty) {
                    if (!formData.designation) {
                        setError('Designation is required');
                        return false;
                    }
                    if (!formData.employeeId.trim()) {
                        setError('Employee ID is required');
                        return false;
                    }
                } else {
                    if (!formData.major.trim()) {
                        setError('Major/Program is required');
                        return false;
                    }
                    if (formData.selectedSkills.length === 0) {
                        setError('Please select at least one skill');
                        return false;
                    }
                }
                return true;
            default:
                return true;
        }
    };

    const handleNext = () => {
        if (validateStep(currentStep)) {
            setCurrentStep(prev => Math.min(prev + 1, steps.length));
        }
    };

    const handlePrev = () => {
        setCurrentStep(prev => Math.max(prev - 1, 1));
        setError('');
    };

    const handleSave = async () => {
        if (!currentUser || !userProfile) return;
        if (!validateStep(currentStep)) return;

        setError('');
        setSaving(true);

        try {
            const accessToken = localStorage.getItem('accessToken');
            if (!accessToken) {
                throw new Error('Not authenticated');
            }

            // Prepare profile data based on role (Following UserPlan.md)
            const profileData: any = {
                displayName: formData.displayName,
                institutionId: formData.institutionId,
                department: formData.department,
                timezone: formData.timezone,
                githubUsername: formData.githubUsername,
                bio: formData.bio,
                profileCompleted: true,
                tools: formData.tools,
            };

            // Add role-specific data (Following UserPlan.md)
            if (userProfile.role === 'student') {
                profileData.major = formData.major;
                profileData.enrollmentNumber = formData.enrollmentNumber;

                // Following UserPlan.md: selectedSkills stores skill names
                // skills stores skill scores (initialized to 0 before assessment)
                const selectedSkillNames = formData.selectedSkills.map(s => s.name.toLowerCase().replace(/\s+/g, '_'));
                profileData.selectedSkills = selectedSkillNames;

                // Initialize skills object with scores of 0 (will be updated after assessment)
                const skillsObject: Record<string, number> = {};
                selectedSkillNames.forEach(skillName => {
                    skillsObject[skillName] = 0;
                });
                profileData.skills = skillsObject;

                // Set GitHub connection status based on username
                profileData.githubConnected = !!formData.githubUsername.trim();

                // Self-reported skill levels (optional, for additional context)
                profileData.userSkills = formData.selectedSkills;
            } else if (userProfile.role === 'faculty') {
                profileData.designation = formData.designation;
                profileData.employeeId = formData.employeeId;
                profileData.contactNumber = formData.contactNumber;
            }

            // Update profile via auth profile endpoint (uses JWT from localStorage)
            await authApi.updateProfile(accessToken, profileData);

            setSuccess(true);
            setIsEditing(false);
            setIsNewUser(false);

            // Refresh the user profile in AuthContext
            await refreshUserProfile();

            setTimeout(() => {
                setSuccess(false);
                navigate('/dashboard');
            }, 1500);
        } catch (err: any) {
            console.error('Error saving profile:', err);
            setError(err.message || 'Failed to save profile');
        } finally {
            setSaving(false);
        }
    };

    if (authLoading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                </div>
            </DashboardLayout>
        );
    }

    // View mode for existing users
    if (!isEditing && !isNewUser) {
        return <ProfileViewMode
            userProfile={userProfile as StudentProfile | FacultyProfile | null}
            onEdit={() => setIsEditing(true)}
        />;
    }

    const isFaculty = userProfile?.role === 'faculty';

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {isNewUser ? 'Complete Your Profile' : 'Edit Profile'}
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        {isNewUser
                            ? isFaculty
                                ? 'Tell us about yourself so you can manage courses and teams effectively'
                                : 'Tell us about yourself so we can match you with the perfect team'
                            : 'Update your profile information'}
                    </p>
                    {isNewUser && (
                        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                            <div className="text-sm text-blue-800 dark:text-blue-200">
                                <p className="font-medium">Complete all steps to unlock features</p>
                                <p className="mt-1 text-blue-700 dark:text-blue-300">
                                    {isFaculty
                                        ? 'After completing your profile, you\'ll be able to create courses and manage teams.'
                                        : 'After completing your profile, you\'ll be able to access the dashboard, take assessments, and join teams.'}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Progress Steps */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        {steps.map((step, index) => {
                            const Icon = step.icon;
                            const isActive = currentStep === step.id;
                            const isCompleted = currentStep > step.id;

                            return (
                                <div key={step.id} className="flex items-center">
                                    <div className="flex flex-col items-center">
                                        <div className={`
                                            w-12 h-12 rounded-full flex items-center justify-center transition-colors
                                            ${isActive ? 'bg-primary-600 text-white' :
                                                isCompleted ? 'bg-green-500 text-white' :
                                                    'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}
                                        `}>
                                            {isCompleted ? <CheckCircle className="w-6 h-6" /> : <Icon className="w-6 h-6" />}
                                        </div>
                                        <span className={`mt-2 text-sm font-medium ${isActive ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400'}`}>
                                            {step.title}
                                        </span>
                                    </div>
                                    {index < steps.length - 1 && (
                                        <div className={`w-full h-1 mx-4 ${isCompleted ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'}`}
                                            style={{ minWidth: '60px' }} />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg">
                        {error}
                    </div>
                )}

                {/* Success Message */}
                {success && (
                    <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 rounded-lg flex items-center gap-2">
                        <CheckCircle className="w-5 h-5" />
                        Profile saved successfully! Redirecting to dashboard...
                    </div>
                )}

                {/* Step Content */}
                <Card>
                    <CardBody className="p-8">
                        {currentStep === 1 && (
                            isFaculty ? (
                                <Step1BasicInfoFaculty
                                    formData={formData}
                                    onChange={handleInputChange}
                                />
                            ) : (
                                <Step1BasicInfoStudent
                                    formData={formData}
                                    onChange={handleInputChange}
                                    toggleSkill={toggleSkill}
                                    updateSkillLevel={updateSkillLevel}
                                    setFormData={setFormData}
                                />
                            )
                        )}
                    </CardBody>
                </Card>

                {/* Resume Upload & Skill Extraction (students) */}
                {!isFaculty && (
                    <Card className="mt-6">
                        <CardHeader>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                <Briefcase className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                                Resume Upload & AI Skill Extraction
                            </h3>
                        </CardHeader>
                        <CardBody className="p-6">
                            <p className="text-gray-600 dark:text-gray-400 mb-4">
                                Upload your resume to quickly pull in skills and tools; you can toggle which ones to keep.
                            </p>
                            <ResumeUpload
                                onSuccess={handleResumeSuccess}
                                onError={(uploadError) => console.error('Resume upload error:', uploadError)}
                                hideResultDisplay={true}
                            />

                            {(resumeImport.skills.length > 0 || resumeImport.tools.length > 0) && (
                                <div className="mt-6 space-y-6 bg-gray-50 dark:bg-gray-800/60 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
                                    {resumeImport.skills.length > 0 && (
                                        <div>
                                            <p className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                                <Target className="w-4 h-4 text-primary-500" />
                                                Skills detected from resume
                                            </p>
                                            <div className="space-y-2">
                                                {resumeImport.skills.map((skill: string) => {
                                                    const selectedSkill = formData.selectedSkills.find((s: UserSkill) => s.name.toLowerCase() === skill.toLowerCase());
                                                    const isSelected = !!selectedSkill;
                                                    return (
                                                        <div key={skill} className={cn(
                                                            'flex items-center justify-between p-3 rounded-lg border transition-all',
                                                            isSelected
                                                                ? 'bg-primary-50 dark:bg-primary-900/30 border-primary-300 dark:border-primary-700'
                                                                : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 opacity-60'
                                                        )}>
                                                            <button
                                                                type="button"
                                                                onClick={() => toggleSkill(skill)}
                                                                className="flex items-center gap-2 flex-1 text-left"
                                                            >
                                                                <span className={cn(
                                                                    'w-5 h-5 rounded border-2 flex items-center justify-center transition-colors',
                                                                    isSelected
                                                                        ? 'bg-primary-500 border-primary-500 text-white'
                                                                        : 'border-gray-400 dark:border-gray-500'
                                                                )}>
                                                                    {isSelected && <CheckCircle2 className="w-3 h-3" />}
                                                                </span>
                                                                <span className={cn(
                                                                    'font-medium text-sm',
                                                                    isSelected ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'
                                                                )}>{skill}</span>
                                                            </button>
                                                            {isSelected && (
                                                                <div className="flex items-center gap-1">
                                                                    {(['beginner', 'intermediate', 'advanced'] as SkillLevel[]).map((level) => (
                                                                        <button
                                                                            key={level}
                                                                            type="button"
                                                                            onClick={() => updateSkillLevel(skill, level)}
                                                                            className={cn(
                                                                                'px-2 py-1 text-xs font-medium rounded-md transition-all capitalize',
                                                                                selectedSkill?.level === level
                                                                                    ? level === 'beginner' ? 'bg-yellow-500 text-white'
                                                                                        : level === 'intermediate' ? 'bg-blue-500 text-white'
                                                                                            : 'bg-green-500 text-white'
                                                                                    : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
                                                                            )}
                                                                        >
                                                                            {level.slice(0, 3)}
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {resumeImport.tools.length > 0 && (
                                        <div>
                                            <p className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                                <Briefcase className="w-4 h-4 text-purple-500" />
                                                Tools & Technologies detected
                                            </p>
                                            <div className="flex flex-wrap gap-2">
                                                {resumeImport.tools.map((tool: string) => {
                                                    const isSelected = formData.tools.some((t: string) => t.toLowerCase() === tool.toLowerCase());
                                                    return (
                                                        <button
                                                            key={tool}
                                                            type="button"
                                                            onClick={() => (isSelected ? removeTool(tool) : setFormData(prev => ({ ...prev, tools: [...prev.tools, tool] })))}
                                                            className={cn(
                                                                'px-3 py-1.5 rounded-lg text-sm font-medium border-2 transition-all flex items-center gap-1.5',
                                                                isSelected
                                                                    ? 'bg-purple-100 dark:bg-purple-900/40 border-purple-400 dark:border-purple-600 text-purple-800 dark:text-purple-200'
                                                                    : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500'
                                                            )}
                                                        >
                                                            {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                                                            {tool}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </CardBody>
                    </Card>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between mt-6">
                    <Button
                        variant="outline"
                        onClick={handlePrev}
                        disabled={currentStep === 1}
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Previous
                    </Button>

                    {currentStep === steps.length ? (
                        <Button onClick={handleSave} disabled={saving}>
                            {saving ? (
                                <span className="flex items-center gap-2">
                                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                                    Saving...
                                </span>
                            ) : (
                                <>
                                    <Save className="w-4 h-4 mr-2" />
                                    {isNewUser ? 'Complete Profile' : 'Save Changes'}
                                </>
                            )}
                        </Button>
                    ) : (
                        <Button onClick={handleNext}>
                            Next
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}

// Step 1: Basic Information for Students (simplified with skills)
function Step1BasicInfoStudent({ formData, onChange, toggleSkill, updateSkillLevel, setFormData }: {
    formData: ProfileFormData;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
    toggleSkill: (skill: string) => void;
    updateSkillLevel: (skill: string, level: SkillLevel) => void;
    setFormData: React.Dispatch<React.SetStateAction<ProfileFormData>>;
}) {
    const COMMON_SKILLS = [
        'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Go', 'Rust',
        'React', 'Angular', 'Vue', 'Node.js', 'Express', 'Django', 'Flask',
        'SQL', 'MongoDB', 'PostgreSQL', 'Firebase', 'AWS', 'Docker', 'Kubernetes',
        'Git', 'Machine Learning', 'Data Analysis', 'UI/UX Design', 'Figma',
        'Project Management', 'Agile', 'Scrum', 'Communication', 'Leadership',
        'Problem Solving', 'Critical Thinking', 'Research', 'Writing', 'Public Speaking',
        'Frontend', 'Backend', 'Full Stack', 'DevOps', 'Mobile Development',
        'Data Science', 'Deep Learning', 'NLP', 'Computer Vision', 'Cybersecurity'
    ];

    const COMMON_TOOLS = [
        'VS Code', 'IntelliJ', 'PyCharm', 'Jupyter', 'Git', 'GitHub', 'GitLab',
        'Slack', 'Discord', 'Zoom', 'Google Meet', 'Microsoft Teams',
        'Figma', 'Adobe XD', 'Canva', 'Notion', 'Trello', 'Jira', 'Asana',
        'Google Docs', 'Microsoft Office', 'LaTeX', 'Overleaf'
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/50 rounded-lg flex items-center justify-center">
                    <User className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Profile Information</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Tell us about yourself and your skills</p>
                </div>
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                    label="Full Name *"
                    name="displayName"
                    value={formData.displayName}
                    onChange={onChange}
                    placeholder="John Doe"
                    required
                />
                <Input
                    label="University / Campus *"
                    name="institutionId"
                    value={formData.institutionId}
                    onChange={onChange}
                    placeholder="e.g., Stanford University"
                    required
                />
                <Input
                    label="Department *"
                    name="department"
                    value={formData.department}
                    onChange={onChange}
                    placeholder="e.g., Computer Science"
                    required
                />
                <Input
                    label="Major / Program *"
                    name="major"
                    value={formData.major}
                    onChange={onChange}
                    placeholder="e.g., B.Tech Computer Science"
                    required
                />
                <Input
                    label="Enrollment Number"
                    name="enrollmentNumber"
                    value={formData.enrollmentNumber}
                    onChange={onChange}
                    placeholder="e.g., 2024CS001"
                />
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        <Clock className="w-4 h-4 inline mr-1" />
                        Timezone
                    </label>
                    <select
                        name="timezone"
                        value={formData.timezone}
                        onChange={onChange}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                        <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                        <option value="America/New_York">America/New_York (EST)</option>
                        <option value="America/Los_Angeles">America/Los_Angeles (PST)</option>
                        <option value="Europe/London">Europe/London (GMT)</option>
                        <option value="Europe/Paris">Europe/Paris (CET)</option>
                        <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
                        <option value="Asia/Singapore">Asia/Singapore (SGT)</option>
                        <option value="Australia/Sydney">Australia/Sydney (AEST)</option>
                    </select>
                </div>
            </div>

            {/* Bio */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Bio
                </label>
                <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={onChange}
                    placeholder="Tell us about yourself..."
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                />
            </div>

            {/* Skills Selection */}
            <div className="border-t dark:border-gray-700 pt-4 mt-6">
                <h3 className="text-md font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />
                    Skills *
                </h3>
                <label className="block text-sm text-gray-500 dark:text-gray-400 mb-3">Select at least one skill</label>
                <div className="flex flex-wrap gap-2 mb-4">
                    {COMMON_SKILLS.map(skill => {
                        const isSelected = formData.selectedSkills.some(s => s.name === skill);
                        return (
                            <button
                                key={skill}
                                onClick={() => toggleSkill(skill)}
                                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${isSelected
                                    ? 'bg-primary-500 text-white'
                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                                    }`}
                            >
                                {skill}
                            </button>
                        );
                    })}
                </div>

                {/* Selected Skills with Levels */}
                {formData.selectedSkills.length > 0 && (
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/70 dark:to-gray-800/50 rounded-xl p-5 mt-4 border border-gray-200 dark:border-gray-700">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <Target className="w-4 h-4 text-primary-500" />
                            Rate your proficiency
                        </p>
                        <div className="space-y-3">
                            {formData.selectedSkills.map(skill => (
                                <div key={skill.name} className="flex items-center justify-between bg-white dark:bg-gray-700/50 p-3 rounded-lg border border-gray-200 dark:border-gray-600">
                                    <span className="text-sm font-medium text-gray-900 dark:text-white">{skill.name}</span>
                                    <div className="flex items-center gap-1">
                                        {(['beginner', 'intermediate', 'advanced'] as SkillLevel[]).map((level) => (
                                            <button
                                                key={level}
                                                type="button"
                                                onClick={() => updateSkillLevel(skill.name, level)}
                                                className={cn(
                                                    'px-3 py-1.5 text-xs font-semibold rounded-md transition-all capitalize',
                                                    skill.level === level
                                                        ? level === 'beginner' ? 'bg-yellow-500 text-white shadow-sm'
                                                            : level === 'intermediate' ? 'bg-blue-500 text-white shadow-sm'
                                                                : 'bg-green-500 text-white shadow-sm'
                                                        : 'bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-500'
                                                )}
                                            >
                                                {level}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Tools & Links */}
            <div className="border-t dark:border-gray-700 pt-4 mt-6">
                <h3 className="text-md font-medium text-gray-900 dark:text-white mb-4">Tools & Links</h3>

                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Tools
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {COMMON_TOOLS.map(tool => {
                            const isSelected = formData.tools.includes(tool);
                            return (
                                <button
                                    key={tool}
                                    onClick={() => {
                                        setFormData(prev => ({
                                            ...prev,
                                            tools: prev.tools.includes(tool)
                                                ? prev.tools.filter(t => t !== tool)
                                                : [...prev.tools, tool]
                                        }));
                                    }}
                                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${isSelected
                                        ? 'bg-primary-500 text-white'
                                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                                        }`}
                                >
                                    {tool}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        <Github className="w-4 h-4 inline mr-1" />
                        GitHub Username
                    </label>
                    <Input
                        name="githubUsername"
                        value={formData.githubUsername}
                        onChange={onChange}
                        placeholder="johndoe"
                    />
                </div>
            </div>
        </div>
    );
}



// Step 1: Basic Information for Faculty
function Step1BasicInfoFaculty({ formData, onChange }: {
    formData: ProfileFormData;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
}) {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/50 rounded-lg flex items-center justify-center">
                    <User className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Basic Information</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Tell us about yourself and your professional background</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                    label="Full Name *"
                    name="displayName"
                    value={formData.displayName}
                    onChange={onChange}
                    placeholder="Dr. Jane Smith"
                    required
                />
                <Input
                    label="University / Campus *"
                    name="institutionId"
                    value={formData.institutionId}
                    onChange={onChange}
                    placeholder="e.g., Stanford University"
                    required
                />
                <Input
                    label="Department *"
                    name="department"
                    value={formData.department}
                    onChange={onChange}
                    placeholder="e.g., Computer Science"
                    required
                />
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Designation *
                    </label>
                    <select
                        name="designation"
                        value={formData.designation}
                        onChange={onChange}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        required
                    >
                        <option value="">Select designation</option>
                        <option value="Assistant Professor">Assistant Professor</option>
                        <option value="Associate Professor">Associate Professor</option>
                        <option value="Professor">Professor</option>
                    </select>
                </div>
                <Input
                    label="Employee ID *"
                    name="employeeId"
                    value={formData.employeeId}
                    onChange={onChange}
                    placeholder="e.g., EMP2024001"
                    required
                />
                <Input
                    label="Contact Number"
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={onChange}
                    placeholder="+1 234 567 8900"
                />
            </div>

            <div className="border-t dark:border-gray-700 pt-4 mt-6">
                <h3 className="text-md font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Additional Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            <Clock className="w-4 h-4 inline mr-1" />
                            Timezone
                        </label>
                        <select
                            name="timezone"
                            value={formData.timezone}
                            onChange={onChange}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        >
                            <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                            <option value="America/New_York">America/New_York (EST)</option>
                            <option value="America/Los_Angeles">America/Los_Angeles (PST)</option>
                            <option value="Europe/London">Europe/London (GMT)</option>
                            <option value="Europe/Paris">Europe/Paris (CET)</option>
                            <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
                            <option value="Asia/Singapore">Asia/Singapore (SGT)</option>
                            <option value="Australia/Sydney">Australia/Sydney (AEST)</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
    );
}

// View Mode Component for existing users
function ProfileViewMode({ userProfile, onEdit }: {
    userProfile: StudentProfile | FacultyProfile | null;
    onEdit: () => void;
}) {
    if (!userProfile) return null;

    const isFaculty = userProfile.role === 'faculty';
    const studentProfile = userProfile as StudentProfile;
    const facultyProfile = userProfile as FacultyProfile;

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Profile</h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">View and manage your profile information</p>
                    </div>
                    <Button onClick={onEdit} variant="outline">
                        <Edit2 className="w-4 h-4 mr-2" />
                        Edit Profile
                    </Button>
                </div>

                {/* Basic Info Card */}
                <Card>
                    <CardBody className="p-6">
                        <div className="flex items-start gap-6">
                            <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center flex-shrink-0">
                                {userProfile?.photoURL ? (
                                    <img src={userProfile.photoURL} alt={userProfile.displayName} className="w-24 h-24 rounded-2xl object-cover" />
                                ) : (
                                    <User className="w-12 h-12 text-white" />
                                )}
                            </div>
                            <div className="flex-1">
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{userProfile?.displayName}</h2>
                                {isFaculty ? (
                                    <p className="text-gray-500 dark:text-gray-400">{facultyProfile?.designation} • {userProfile?.department}</p>
                                ) : (
                                    <p className="text-gray-500 dark:text-gray-400">{studentProfile?.major} • {studentProfile?.year && `Year ${studentProfile.year}`}</p>
                                )}
                                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                                    <span className="flex items-center gap-1">
                                        <Mail className="w-4 h-4" />
                                        {userProfile?.email}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Building2 className="w-4 h-4" />
                                        {userProfile?.institutionId}
                                    </span>
                                </div>
                                {isFaculty && facultyProfile?.employeeId && (
                                    <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                        Employee ID: {facultyProfile.employeeId}
                                    </div>
                                )}
                                {isFaculty && facultyProfile?.contactNumber && (
                                    <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                        Contact: {facultyProfile.contactNumber}
                                    </div>
                                )}
                                {!isFaculty && studentProfile?.bio && (
                                    <p className="mt-3 text-gray-600 dark:text-gray-300">{studentProfile.bio}</p>
                                )}
                            </div>
                        </div>
                    </CardBody>
                </Card>

                {/* Journey Status Card - For students only (UserPlan.md) */}
                {!isFaculty && (
                    <Card className="border-l-4 border-l-primary-500">
                        <CardBody className="p-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Your Journey Status</h3>
                            <div className="grid grid-cols-3 gap-4">
                                {/* Profile Completion */}
                                <div className={`p-4 rounded-lg ${studentProfile?.profileCompleted ? 'bg-green-50 dark:bg-green-900/20' : 'bg-gray-50 dark:bg-gray-800/50'}`}>
                                    <div className="flex items-center gap-2 mb-2">
                                        {studentProfile?.profileCompleted ? (
                                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                                        ) : (
                                            <User className="w-5 h-5 text-gray-400" />
                                        )}
                                        <span className="font-medium text-gray-900 dark:text-white">Profile</span>
                                    </div>
                                    <p className={`text-sm ${studentProfile?.profileCompleted ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                                        {studentProfile?.profileCompleted ? 'Completed' : 'Incomplete'}
                                    </p>
                                </div>

                                {/* Assessment Status */}
                                <div className={`p-4 rounded-lg ${studentProfile?.attendedTest ? 'bg-green-50 dark:bg-green-900/20' : 'bg-gray-50 dark:bg-gray-800/50'}`}>
                                    <div className="flex items-center gap-2 mb-2">
                                        {studentProfile?.attendedTest ? (
                                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                                        ) : (
                                            <Target className="w-5 h-5 text-gray-400" />
                                        )}
                                        <span className="font-medium text-gray-900 dark:text-white">Assessment</span>
                                    </div>
                                    <p className={`text-sm ${studentProfile?.attendedTest ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                                        {studentProfile?.attendedTest ? 'Completed' : 'Not Taken'}
                                    </p>
                                </div>

                                {/* Team Status */}
                                <div className={`p-4 rounded-lg ${studentProfile?.inTeam ? 'bg-green-50 dark:bg-green-900/20' : 'bg-gray-50 dark:bg-gray-800/50'}`}>
                                    <div className="flex items-center gap-2 mb-2">
                                        {studentProfile?.inTeam ? (
                                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                                        ) : (
                                            <Users className="w-5 h-5 text-gray-400" />
                                        )}
                                        <span className="font-medium text-gray-900 dark:text-white">Team</span>
                                    </div>
                                    <p className={`text-sm ${studentProfile?.inTeam ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                                        {studentProfile?.inTeam ? 'In a Team' : 'Not in Team'}
                                    </p>
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                )}

                {/* Skills - Following UserPlan.md schema */}
                {!isFaculty && (studentProfile?.selectedSkills?.length > 0 || (studentProfile?.userSkills && studentProfile.userSkills.length > 0)) && (
                    <Card>
                        <CardHeader>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                <Briefcase className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                                Skills
                                {studentProfile?.attendedTest && (
                                    <span className="text-xs bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300 px-2 py-0.5 rounded-full font-normal">
                                        Assessed
                                    </span>
                                )}
                            </h3>
                        </CardHeader>
                        <CardBody className="p-6">
                            {/* Selected Skills with Scores (UserPlan.md) */}
                            {studentProfile?.selectedSkills?.length > 0 && (
                                <div className="mb-4">
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Selected Skills for Assessment:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {studentProfile.selectedSkills.map(skill => {
                                            const score = studentProfile.skills?.[skill] as number | undefined;
                                            const hasScore = typeof score === 'number' && score > 0;
                                            return (
                                                <span
                                                    key={skill}
                                                    className={`px-3 py-1 rounded-full text-sm font-medium ${hasScore
                                                        ? score >= 70
                                                            ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300'
                                                            : score >= 50
                                                                ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
                                                                : 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300'
                                                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                                                        }`}
                                                >
                                                    {skill.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                    {hasScore && <span className="ml-1">({score}%)</span>}
                                                </span>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Self-reported skill levels */}
                            {studentProfile?.userSkills && studentProfile.userSkills.length > 0 && (
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Self-Reported Proficiency:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {studentProfile.userSkills.map(skill => (
                                            <span
                                                key={skill.name}
                                                className={`px-3 py-1 rounded-full text-sm font-medium ${skill.level === 'advanced' ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300' :
                                                    skill.level === 'intermediate' ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300' :
                                                        'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300'
                                                    }`}
                                            >
                                                {skill.name} ({skill.level})
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Latest Assessment Info */}
                            {studentProfile?.latestAssessment && (
                                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-500 dark:text-gray-400">Latest Assessment Score</span>
                                        <span className="font-semibold text-primary-600 dark:text-primary-400">
                                            {studentProfile.latestAssessment.score}%
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm mt-1">
                                        <span className="text-gray-500 dark:text-gray-400">Taken On</span>
                                        <span className="text-gray-600 dark:text-gray-300">
                                            {new Date(studentProfile.latestAssessment.takenAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </CardBody>
                    </Card>
                )}



                {/* Links */}
                {!isFaculty && (studentProfile?.githubUsername || studentProfile?.portfolioUrl || studentProfile?.linkedinUrl) && (
                    <Card>
                        <CardHeader>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                <Globe className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                                Links
                            </h3>
                        </CardHeader>
                        <CardBody className="p-6">
                            <div className="flex flex-wrap gap-4">
                                {studentProfile?.githubUsername && (
                                    <a
                                        href={`https://github.com/${studentProfile.githubUsername}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400"
                                    >
                                        <Github className="w-5 h-5" />
                                        {studentProfile.githubUsername}
                                    </a>
                                )}
                                {studentProfile?.linkedinUrl && (
                                    <a
                                        href={studentProfile.linkedinUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400"
                                    >
                                        <Linkedin className="w-5 h-5" />
                                        LinkedIn
                                    </a>
                                )}
                                {studentProfile?.portfolioUrl && (
                                    <a
                                        href={studentProfile.portfolioUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400"
                                    >
                                        <Globe className="w-5 h-5" />
                                        Portfolio
                                    </a>
                                )}
                            </div>
                        </CardBody>
                    </Card>
                )}

            </div>
        </DashboardLayout>
    );
}
