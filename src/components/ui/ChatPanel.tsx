import React, { useState, useEffect, useRef } from 'react';
import { Send, Paperclip, MoreVertical, Trash2, Edit2, X, Check } from 'lucide-react';
import { teamChatService, ChatMessage } from '../../services/teamChatService';
import { Card, CardHeader } from './index';

interface ChatPanelProps {
    teamId: string;
    teamName: string;
    currentUserId: string;
    currentUserName: string;
    currentUserPhoto?: string;
    participants: string[];
    onClose?: () => void;
}

interface TypingUser {
    userId: string;
    displayName: string;
}

export function ChatPanel({
    teamId,
    teamName,
    currentUserId,
    currentUserName,
    currentUserPhoto,
    participants,
    onClose
}: ChatPanelProps) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [typingUsers, setTypingUsers] = useState<Map<string, TypingUser>>(new Map());
    const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
    const [editingText, setEditingText] = useState('');
    const [menuOpenMessageId, setMenuOpenMessageId] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const typingTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

    // Initialize chat room and load messages
    useEffect(() => {
        teamChatService.initializeTeamChat(teamId, teamName, participants);
        setMessages(teamChatService.getMessages(teamId));

        // Subscribe to new messages
        const unsubscribeMessages = teamChatService.onMessage(teamId, (message) => {
            setMessages(prev => [...prev, message]);
        });

        // Subscribe to typing notifications
        const unsubscribeTyping = teamChatService.onTyping(teamId, (data) => {
            setTypingUsers(prev => {
                const next = new Map(prev);
                if (data.typing) {
                    next.set(data.userId, { userId: data.userId, displayName: data.displayName });
                } else {
                    next.delete(data.userId);
                }
                return next;
            });
        });

        return () => {
            unsubscribeMessages();
            unsubscribeTyping();
        };
    }, [teamId, teamName, participants]);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = () => {
        if (!inputValue.trim()) return;

        teamChatService.sendMessage(
            teamId,
            currentUserId,
            currentUserName,
            inputValue,
            currentUserPhoto
        );

        setInputValue('');
        // Stop typing notification
        teamChatService.notifyTyping(teamId, currentUserId, currentUserName, false);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInputValue(e.target.value);

        // Notify typing
        teamChatService.notifyTyping(teamId, currentUserId, currentUserName, true);

        // Clear typing after 2 seconds of inactivity
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        typingTimeoutRef.current = setTimeout(() => {
            teamChatService.notifyTyping(teamId, currentUserId, currentUserName, false);
        }, 2000);
    };

    const handleDeleteMessage = (messageId: string) => {
        teamChatService.deleteMessage(teamId, messageId);
        setMessages(prev => prev.filter(m => m.id !== messageId));
        setMenuOpenMessageId(null);
    };

    const handleEditMessage = (message: ChatMessage) => {
        setEditingMessageId(message.id);
        setEditingText(message.message);
        setMenuOpenMessageId(null);
    };

    const handleSaveEdit = (messageId: string) => {
        if (!editingText.trim()) return;

        const updated = teamChatService.editMessage(teamId, messageId, editingText);
        if (updated) {
            setMessages(prev =>
                prev.map(m => m.id === messageId ? updated : m)
            );
        }

        setEditingMessageId(null);
        setEditingText('');
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <Card className="h-full flex flex-col border-0 shadow-xl bg-white dark:bg-gray-900">
            {/* Header */}
            <CardHeader className="border-b border-gray-100 dark:border-gray-800 p-4 flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white truncate">
                        {teamName}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-1">
                        <div className="flex -space-x-2">
                            {participants.slice(0, 3).map((_, i) => (
                                <div
                                    key={i}
                                    className="w-5 h-5 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-xs font-bold border-2 border-white dark:border-gray-900"
                                >
                                    {String.fromCharCode(65 + i)}
                                </div>
                            ))}
                            {participants.length > 3 && (
                                <div className="w-5 h-5 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-300 border-2 border-white dark:border-gray-900">
                                    +{participants.length - 3}
                                </div>
                            )}
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                            {participants.length} members
                        </span>
                    </div>
                </div>
                {onClose && (
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors flex-shrink-0"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                )}
            </CardHeader>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3">
                                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                </svg>
                            </div>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">No messages yet. Start the conversation!</p>
                        </div>
                    </div>
                ) : (
                    <>
                        {messages.map((message, idx) => {
                            const prevMessage = idx > 0 ? messages[idx - 1] : null;
                            const isConsecutive = prevMessage && prevMessage.userId === message.userId;
                            
                            return (
                                <div
                                    key={message.id}
                                    className={`flex gap-2 group ${message.userId === currentUserId ? 'justify-end' : 'justify-start'}`}
                                >
                                    {message.userId !== currentUserId && (
                                        <div className={`${isConsecutive ? 'w-8' : ''} flex-shrink-0 flex items-start`}>
                                            {!isConsecutive && (
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                                                    {message.photoURL ? (
                                                        <img
                                                            src={message.photoURL}
                                                            alt={message.displayName}
                                                            className="w-8 h-8 rounded-full"
                                                        />
                                                    ) : (
                                                        <span className="text-white text-xs font-bold">
                                                            {message.displayName.charAt(0).toUpperCase()}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    <div className={`flex flex-col ${message.userId === currentUserId ? 'items-end' : 'items-start'}`}>
                                        {!isConsecutive && message.userId !== currentUserId && (
                                            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 ml-2 mb-1">
                                                {message.displayName}
                                            </p>
                                        )}
                                        
                                        <div
                                            className={`px-3 py-2 rounded-lg text-sm ${message.userId === currentUserId
                                                ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-br-none'
                                                : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-none'
                                                }`}
                                        >
                                            {editingMessageId === message.id ? (
                                                <div className="flex gap-2 items-center">
                                                    <textarea
                                                        value={editingText}
                                                        onChange={(e) => setEditingText(e.target.value)}
                                                        className="flex-1 p-2 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm resize-none"
                                                        rows={2}
                                                    />
                                                    <div className="flex gap-1">
                                                        <button
                                                            onClick={() => handleSaveEdit(message.id)}
                                                            className="p-1 hover:bg-opacity-75 rounded transition-all"
                                                        >
                                                            <Check className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => setEditingMessageId(null)}
                                                            className="p-1 hover:bg-opacity-75 rounded transition-all"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    <p className="text-sm break-words">{message.message}</p>
                                                    {message.edited && (
                                                        <p className="text-xs opacity-70 mt-1">(edited)</p>
                                                    )}
                                                </>
                                            )}
                                        </div>

                                        <p className="text-xs opacity-60 mt-1 px-2">
                                            {new Date(message.timestamp).toLocaleTimeString([], {
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </p>
                                    </div>

                                    {/* Message Actions */}
                                    {message.userId === currentUserId && (
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div className="relative">
                                            <button
                                                onClick={() => setMenuOpenMessageId(
                                                    menuOpenMessageId === message.id ? null : message.id
                                                )}
                                                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                                            >
                                                <MoreVertical className="w-4 h-4 text-gray-500" />
                                            </button>

                                            {menuOpenMessageId === message.id && (
                                                <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg z-10 border border-gray-200 dark:border-gray-700">
                                                    <button
                                                        onClick={() => handleEditMessage(message)}
                                                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors first:rounded-t-lg"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteMessage(message.id)}
                                                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors last:rounded-b-lg"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                        Delete
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                            );
                        })}

                        {/* Typing Indicator */}
                        {typingUsers.size > 0 && (
                            <div className="flex gap-3">
                                <div className="flex gap-1 items-center">
                                    <div className="flex gap-1">
                                        {Array.from(typingUsers.values()).slice(0, 2).map((user) => (
                                            <span key={user.userId} className="text-xs text-gray-500 dark:text-gray-400">
                                                {user.displayName}
                                            </span>
                                        ))}
                                    </div>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                        {typingUsers.size > 1 ? 'are' : 'is'} typing
                                    </span>
                                    <div className="flex gap-0.5">
                                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </>
                )}
            </div>

            {/* Input Area */}
            <div className="border-t border-gray-100 dark:border-gray-800 p-3 space-y-2">
                <div className="flex gap-2">
                    <textarea
                        value={inputValue}
                        onChange={handleInputChange}
                        onKeyPress={handleKeyPress}
                        placeholder="Type a message... (Shift+Enter for new line)"
                        rows={2}
                        className="flex-1 p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none text-sm"
                    />
                    <div className="flex flex-col gap-1">
                        <button
                            onClick={() => alert('File upload not yet implemented')}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors flex-shrink-0"
                            title="Attach file"
                        >
                            <Paperclip className="w-4 h-4 text-gray-500" />
                        </button>
                        <button
                            onClick={handleSendMessage}
                            disabled={!inputValue.trim()}
                            className="p-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg hover:from-primary-600 hover:to-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex-shrink-0"
                            title="Send message"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </div>
                </div>
                <p className="text-xs text-gray-400 px-2">💡 Shift+Enter for new line</p>
            </div>
        </Card>
    );
}
