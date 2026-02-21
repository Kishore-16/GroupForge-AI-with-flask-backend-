// Team formation services
export {
    getStudentsForCourse,
    getAllStrategiesComparison,
    saveTeamsToFirestore,
    getStudentTeam,
    type TeamFormationStrategy
} from './teamFormation';

export {
    formTeamsWithAI,
    approveAndSaveTeams,
    swapTeamMembers,
    type AIFormationResult
} from './aiTeamFormation';

export { parseResumeText, mergeSkillProfiles } from './resumeParser';
export * from './githubAnalyzer';
export * from './metaService';
export * from './userManagement';
export { uploadResume, getResumeJobStatus } from './resumeService';
export * from './assessmentApi';
export * from './api';
export { default as webSocketService } from './websocketService';
export { teamChatService } from './teamChatService';
