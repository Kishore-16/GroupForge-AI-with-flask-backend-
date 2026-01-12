/**
 * WebSocket Context for React components
 * Provides WebSocket functionality throughout the application
 */

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { webSocketService } from '../services/websocketService';
import { useAuth } from './AuthContext';

interface WebSocketContextType {
    isConnected: boolean;
    connectionError: string | null;
    connect: () => Promise<boolean>;
    disconnect: () => void;
    subscribeToUpdates: (types: string[]) => void;
    joinRoom: (room: string) => void;
    leaveRoom: (room: string) => void;

    // Event handlers
    onProfileUpdate: (callback: (data: any) => void) => void;
    onAssessmentCompleted: (callback: (data: any) => void) => void;
    onTeamFormed: (callback: (data: any) => void) => void;
    onTeamUpdated: (callback: (data: any) => void) => void;
    onTeamFormationUpdate: (callback: (data: any) => void) => void;
    onEligibilityChanged: (callback: (data: any) => void) => void;
    onStudentEligibilityChanged: (callback: (data: any) => void) => void;
    onAnalyticsUpdate: (callback: (data: any) => void) => void;
    onNotification: (callback: (data: any) => void) => void;

    // Remove event handlers
    offProfileUpdate: () => void;
    offAssessmentCompleted: () => void;
    offTeamFormed: () => void;
    offTeamUpdated: () => void;
    offTeamFormationUpdate: () => void;
    offEligibilityChanged: () => void;
    offStudentEligibilityChanged: () => void;
    offAnalyticsUpdate: () => void;
    offNotification: () => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export function useWebSocket() {
    const context = useContext(WebSocketContext);
    if (context === undefined) {
        throw new Error('useWebSocket must be used within a WebSocketProvider');
    }
    return context;
}

interface WebSocketProviderProps {
    children: ReactNode;
}

export function WebSocketProvider({ children }: WebSocketProviderProps) {
    const { currentUser, token, getToken } = useAuth();
    const [isConnected, setIsConnected] = useState(false);
    const [connectionError, setConnectionError] = useState<string | null>(null);

    // Auto-connect when user is authenticated
    useEffect(() => {
        const authToken = token || getToken();
        if (currentUser && authToken) {
            console.log('User authenticated, connecting WebSocket...', {
                hasUser: !!currentUser,
                tokenLength: authToken?.length
            });
            connectWebSocket();
        } else {
            console.log('User not authenticated or token missing, disconnecting WebSocket', {
                hasUser: !!currentUser,
                hasToken: !!authToken
            });
            disconnect();
        }

        return () => {
            disconnect();
        };
    }, [currentUser, token]);

    const connectWebSocket = async (): Promise<boolean> => {
        const currentToken = token || getToken();

        if (!currentToken) {
            const errorMsg = 'No authentication token available';
            console.error(errorMsg);
            setConnectionError(errorMsg);
            return false;
        }

        console.log('Attempting WebSocket connection with token...');

        try {
            setConnectionError(null);

            // Setup connection event handlers BEFORE connecting
            webSocketService.on('connected', (data) => {
                console.log('✅ Backend authenticated connection', data);
                setIsConnected(true);
                setConnectionError(null);

                // Subscribe to updates AFTER backend confirms authentication
                const updateTypes = ['profile_updates', 'notifications'];
                const userRole = currentUser?.role;
                if (userRole === 'student') {
                    updateTypes.push('team_updates', 'assessment_updates');
                } else if (userRole === 'faculty') {
                    updateTypes.push('team_updates', 'assessment_updates', 'analytics_updates');
                }

                console.log('📡 Subscribing to update types:', updateTypes);
                webSocketService.subscribeToUpdates(updateTypes);
            });

            webSocketService.on('disconnected', () => {
                setIsConnected(false);
            });

            webSocketService.on('error', (error) => {
                console.error('WebSocket error event:', error);
                setConnectionError(error.message || 'WebSocket error');
            });

            const success = await webSocketService.connect(currentToken);
            return success;
        } catch (error: any) {
            setConnectionError(error.message || 'Failed to connect to WebSocket');
            setIsConnected(false);
            return false;
        }
    };

    const connect = (): Promise<boolean> => {
        return connectWebSocket();
    };

    const disconnect = () => {
        webSocketService.disconnect();
        setIsConnected(false);
        setConnectionError(null);
    };

    const subscribeToUpdates = (types: string[]) => {
        webSocketService.subscribeToUpdates(types);
    };

    const joinRoom = (room: string) => {
        webSocketService.joinRoom(room);
    };

    const leaveRoom = (room: string) => {
        webSocketService.leaveRoom(room);
    };

    // Event handler registration methods
    const onProfileUpdate = (callback: (data: any) => void) => {
        webSocketService.on('profile_updated', callback);
    };

    const onAssessmentCompleted = (callback: (data: any) => void) => {
        webSocketService.on('assessment_completed', callback);
    };

    const onTeamFormed = (callback: (data: any) => void) => {
        webSocketService.on('team_formed', callback);
    };

    const onTeamUpdated = (callback: (data: any) => void) => {
        webSocketService.on('team_updated', callback);
    };

    const onTeamFormationUpdate = (callback: (data: any) => void) => {
        webSocketService.on('team_formation_update', callback);
    };

    const onEligibilityChanged = (callback: (data: any) => void) => {
        webSocketService.on('eligibility_changed', callback);
    };

    const onStudentEligibilityChanged = (callback: (data: any) => void) => {
        webSocketService.on('student_eligibility_changed', callback);
    };

    const onAnalyticsUpdate = (callback: (data: any) => void) => {
        webSocketService.on('analytics_update', callback);
    };

    const onNotification = (callback: (data: any) => void) => {
        webSocketService.on('notification', callback);
    };

    // Event handler removal methods
    const offProfileUpdate = () => {
        webSocketService.off('profile_updated');
    };

    const offAssessmentCompleted = () => {
        webSocketService.off('assessment_completed');
    };

    const offTeamFormed = () => {
        webSocketService.off('team_formed');
    };

    const offTeamUpdated = () => {
        webSocketService.off('team_updated');
    };

    const offTeamFormationUpdate = () => {
        webSocketService.off('team_formation_update');
    };

    const offEligibilityChanged = () => {
        webSocketService.off('eligibility_changed');
    };

    const offStudentEligibilityChanged = () => {
        webSocketService.off('student_eligibility_changed');
    };

    const offAnalyticsUpdate = () => {
        webSocketService.off('analytics_update');
    };

    const offNotification = () => {
        webSocketService.off('notification');
    };

    const value: WebSocketContextType = {
        isConnected,
        connectionError,
        connect,
        disconnect,
        subscribeToUpdates,
        joinRoom,
        leaveRoom,

        // Event handlers
        onProfileUpdate,
        onAssessmentCompleted,
        onTeamFormed,
        onTeamUpdated,
        onTeamFormationUpdate,
        onEligibilityChanged,
        onStudentEligibilityChanged,
        onAnalyticsUpdate,
        onNotification,

        // Remove event handlers
        offProfileUpdate,
        offAssessmentCompleted,
        offTeamFormed,
        offTeamUpdated,
        offTeamFormationUpdate,
        offEligibilityChanged,
        offStudentEligibilityChanged,
        offAnalyticsUpdate,
        offNotification
    };

    return (
        <WebSocketContext.Provider value={value}>
            {children}
        </WebSocketContext.Provider>
    );
}
