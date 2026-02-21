/**
 * WebSocket Service for real-time communication
 * Handles connection to backend WebSocket server and manages real-time events
 */

import { io, Socket } from 'socket.io-client';

interface WebSocketEventHandlers {
    // Connection events
    connected: (data: any) => void;
    disconnected: (data: any) => void;
    error: (data: any) => void;

    // Profile events
    profile_updated: (data: any) => void;

    // Assessment events
    assessment_completed: (data: any) => void;
    student_assessment_completed: (data: any) => void;

    // Team events
    team_formed: (data: any) => void;
    team_updated: (data: any) => void;
    team_formation_update: (data: any) => void;

    // Student eligibility events
    eligibility_changed: (data: any) => void;
    student_eligibility_changed: (data: any) => void;

    // Analytics events
    analytics_update: (data: any) => void;

    // Notification events
    notification: (data: any) => void;
}

class WebSocketService {
    private socket: Socket | null = null;
    private isConnected: boolean = false;
    private eventHandlers: Partial<WebSocketEventHandlers> = {};
    private reconnectAttempts: number = 0;
    private maxReconnectAttempts: number = 5;

    constructor() {
        this.socket = null;
    }

    /**
     * Connect to WebSocket server
     */
    connect(token: string): Promise<boolean> {
        return new Promise((resolve, reject) => {
            try {
                console.log('🔌 Initializing WebSocket connection...');

                if (!token) {
                    const error = 'Token is required for WebSocket connection';
                    console.error('❌', error);
                    reject(new Error(error));
                    return;
                }

                // Get backend URL from environment or use default
                const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
                console.log('📡 Backend URL:', backendUrl);
                console.log('🔑 Token length:', token.length);

                // Initialize socket connection
                this.socket = io(backendUrl, {
                    auth: {
                        token: token
                    },
                    transports: ['polling', 'websocket'],
                    upgrade: true,
                    timeout: 20000,
                    reconnection: true,
                    reconnectionAttempts: this.maxReconnectAttempts,
                    reconnectionDelay: 1000,
                    withCredentials: false
                });

                console.log('🚀 Socket.IO client initialized');

                // Connection event handlers
                this.socket.on('connect', () => {
                    console.log('✅ WebSocket connected');
                    this.isConnected = true;
                    this.reconnectAttempts = 0;
                    resolve(true);
                });

                this.socket.on('connected', (data) => {
                    console.log('✅ WebSocket authentication successful', data);
                    if (this.eventHandlers.connected) {
                        this.eventHandlers.connected(data);
                    }
                });

                this.socket.on('connect_error', (error) => {
                    console.error('❌ WebSocket connection error:', error);
                    this.isConnected = false;
                    this.reconnectAttempts++;

                    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
                        reject(new Error(`Failed to connect after ${this.maxReconnectAttempts} attempts`));
                    }
                });

                this.socket.on('disconnect', (reason) => {
                    console.log('🔌 WebSocket disconnected:', reason);
                    this.isConnected = false;
                    if (this.eventHandlers.disconnected) {
                        this.eventHandlers.disconnected({ reason });
                    }
                });

                this.socket.on('error', (error) => {
                    console.error('❌ WebSocket error:', error);
                    if (this.eventHandlers.error) {
                        this.eventHandlers.error(error);
                    }
                });

                // Register all event handlers
                this.setupEventHandlers();

            } catch (error) {
                console.error('❌ Failed to initialize WebSocket:', error);
                reject(error);
            }
        });
    }

    /**
     * Disconnect from WebSocket server
     */
    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.isConnected = false;
            console.log('🔌 WebSocket disconnected');
        }
    }

    /**
     * Check if WebSocket is connected
     */
    getConnectionStatus(): boolean {
        return this.isConnected && this.socket?.connected || false;
    }

    /**
     * Subscribe to specific event types
     */
    subscribeToUpdates(updateTypes: string[]) {
        if (this.socket && this.isConnected) {
            this.socket.emit('subscribe_to_updates', { types: updateTypes });
        }
    }

    /**
     * Join a specific room
     */
    joinRoom(room: string) {
        if (this.socket && this.isConnected) {
            this.socket.emit('join_room', { room });
        }
    }

    /**
     * Leave a specific room
     */
    leaveRoom(room: string) {
        if (this.socket && this.isConnected) {
            this.socket.emit('leave_room', { room });
        }
    }

    /**
     * Send a ping to test connection
     */
    ping() {
        if (this.socket && this.isConnected) {
            this.socket.emit('ping');
        }
    }

    /**
     * Register event handler
     */
    on<K extends keyof WebSocketEventHandlers>(event: K, callback: WebSocketEventHandlers[K]) {
        this.eventHandlers[event] = callback;
    }

    /**
     * Unregister event handler
     */
    off<K extends keyof WebSocketEventHandlers>(event: K) {
        delete this.eventHandlers[event];
    }

    /**
     * Setup internal event handlers
     */
    private setupEventHandlers() {
        if (!this.socket) return;

        // Profile events
        this.socket.on('profile_updated', (data) => {
            console.log('📝 Profile updated:', data);
            if (this.eventHandlers.profile_updated) {
                this.eventHandlers.profile_updated(data);
            }
        });

        // Assessment events
        this.socket.on('assessment_completed', (data) => {
            console.log('✅ Assessment completed:', data);
            if (this.eventHandlers.assessment_completed) {
                this.eventHandlers.assessment_completed(data);
            }
        });

        this.socket.on('student_assessment_completed', (data) => {
            console.log('👩‍🎓 Student assessment completed:', data);
            if (this.eventHandlers.student_assessment_completed) {
                this.eventHandlers.student_assessment_completed(data);
            }
        });

        // Team events
        this.socket.on('team_formed', (data) => {
            console.log('👥 Team formed:', data);
            if (this.eventHandlers.team_formed) {
                this.eventHandlers.team_formed(data);
            }
        });

        this.socket.on('team_updated', (data) => {
            console.log('🔄 Team updated:', data);
            if (this.eventHandlers.team_updated) {
                this.eventHandlers.team_updated(data);
            }
        });

        this.socket.on('team_formation_update', (data) => {
            console.log('📊 Team formation update:', data);
            if (this.eventHandlers.team_formation_update) {
                this.eventHandlers.team_formation_update(data);
            }
        });

        // Student eligibility events
        this.socket.on('eligibility_changed', (data) => {
            console.log('🎯 Eligibility changed:', data);
            if (this.eventHandlers.eligibility_changed) {
                this.eventHandlers.eligibility_changed(data);
            }
        });

        this.socket.on('student_eligibility_changed', (data) => {
            console.log('📋 Student eligibility changed:', data);
            if (this.eventHandlers.student_eligibility_changed) {
                this.eventHandlers.student_eligibility_changed(data);
            }
        });

        // Analytics events
        this.socket.on('analytics_update', (data) => {
            console.log('📈 Analytics update:', data);
            if (this.eventHandlers.analytics_update) {
                this.eventHandlers.analytics_update(data);
            }
        });

        // Notification events
        this.socket.on('notification', (data) => {
            console.log('🔔 Notification:', data);
            if (this.eventHandlers.notification) {
                this.eventHandlers.notification(data);
            }
        });

        // Connection test events
        this.socket.on('pong', (data) => {
            console.log('🏓 Pong received:', data);
        });

        this.socket.on('joined_room', (data) => {
            console.log('🏠 Joined room:', data);
        });

        this.socket.on('left_room', (data) => {
            console.log('🚪 Left room:', data);
        });

        this.socket.on('subscribed', (data) => {
            console.log('📬 Subscribed to updates:', data);
        });
    }
}

// Export singleton instance
export const webSocketService = new WebSocketService();
export default webSocketService;