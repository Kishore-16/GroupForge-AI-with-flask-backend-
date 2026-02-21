// Team Chat Service - Real-time messaging for team members
export interface ChatMessage {
    id: string;
    teamId: string;
    userId: string;
    displayName: string;
    photoURL?: string;
    message: string;
    timestamp: number;
    edited?: boolean;
    editedAt?: number;
}

export interface ChatRoom {
    teamId: string;
    teamName: string;
    messages: ChatMessage[];
    participants: string[]; // User IDs
    createdAt: number;
}

// In-memory storage for development (replace with backend in production)
class TeamChatService {
    private chatRooms: Map<string, ChatRoom> = new Map();
    private messageListeners: Map<string, ((message: ChatMessage) => void)[]> = new Map();
    private typingListeners: Map<string, ((data: { userId: string; displayName: string; typing: boolean }) => void)[]> = new Map();

    // Initialize or get a chat room for a team
    initializeTeamChat(teamId: string, teamName: string, participants: string[]) {
        if (!this.chatRooms.has(teamId)) {
            this.chatRooms.set(teamId, {
                teamId,
                teamName,
                messages: [],
                participants,
                createdAt: Date.now()
            });

            this.messageListeners.set(teamId, []);
            this.typingListeners.set(teamId, []);
        }

        return this.chatRooms.get(teamId)!;
    }

    // Send a message to team chat
    sendMessage(
        teamId: string,
        userId: string,
        displayName: string,
        message: string,
        photoURL?: string
    ): ChatMessage {
        const room = this.chatRooms.get(teamId);
        if (!room) {
            throw new Error(`Chat room for team ${teamId} not initialized`);
        }

        const chatMessage: ChatMessage = {
            id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            teamId,
            userId,
            displayName,
            photoURL,
            message,
            timestamp: Date.now()
        };

        room.messages.push(chatMessage);

        // Notify listeners
        const listeners = this.messageListeners.get(teamId) || [];
        listeners.forEach(listener => listener(chatMessage));

        return chatMessage;
    }

    // Get chat history for a team
    getMessages(teamId: string, limit: number = 50): ChatMessage[] {
        const room = this.chatRooms.get(teamId);
        if (!room) return [];

        return room.messages.slice(-limit);
    }

    // Subscribe to new messages in a team
    onMessage(teamId: string, callback: (message: ChatMessage) => void) {
        if (!this.messageListeners.has(teamId)) {
            this.messageListeners.set(teamId, []);
        }

        this.messageListeners.get(teamId)!.push(callback);

        // Return unsubscribe function
        return () => {
            const listeners = this.messageListeners.get(teamId) || [];
            const index = listeners.indexOf(callback);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        };
    }

    // Notify typing status
    notifyTyping(teamId: string, userId: string, displayName: string, typing: boolean) {
        const listeners = this.typingListeners.get(teamId) || [];
        listeners.forEach(listener => listener({ userId, displayName, typing }));
    }

    // Subscribe to typing notifications
    onTyping(teamId: string, callback: (data: { userId: string; displayName: string; typing: boolean }) => void) {
        if (!this.typingListeners.has(teamId)) {
            this.typingListeners.set(teamId, []);
        }

        this.typingListeners.get(teamId)!.push(callback);

        return () => {
            const listeners = this.typingListeners.get(teamId) || [];
            const index = listeners.indexOf(callback);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        };
    }

    // Delete a message
    deleteMessage(teamId: string, messageId: string) {
        const room = this.chatRooms.get(teamId);
        if (!room) return false;

        const index = room.messages.findIndex(m => m.id === messageId);
        if (index > -1) {
            room.messages.splice(index, 1);
            return true;
        }

        return false;
    }

    // Edit a message
    editMessage(teamId: string, messageId: string, newMessage: string): ChatMessage | null {
        const room = this.chatRooms.get(teamId);
        if (!room) return null;

        const message = room.messages.find(m => m.id === messageId);
        if (!message) return null;

        message.message = newMessage;
        message.edited = true;
        message.editedAt = Date.now();

        // Notify listeners of edit
        const listeners = this.messageListeners.get(teamId) || [];
        listeners.forEach(listener => listener(message));

        return message;
    }

    // Get room info
    getRoom(teamId: string): ChatRoom | undefined {
        return this.chatRooms.get(teamId);
    }
}

// Export singleton instance
export const teamChatService = new TeamChatService();
