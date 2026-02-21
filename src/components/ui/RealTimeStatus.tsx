/**
 * Real-time Status Indicator
 * Shows WebSocket connection status and real-time capabilities
 */

import { useState } from 'react';
import { useWebSocket } from '../../contexts';
import { Wifi, WifiOff, Loader2 } from 'lucide-react';

interface RealTimeStatusProps {
    className?: string;
    showText?: boolean;
}

export function RealTimeStatus({ className = '', showText = false }: RealTimeStatusProps) {
    const { isConnected, connectionError, connect } = useWebSocket();
    const [isReconnecting, setIsReconnecting] = useState(false);
    const [showError, setShowError] = useState(false);

    const handleReconnect = async () => {
        setIsReconnecting(true);
        console.log('Manual reconnect triggered...');
        try {
            await connect();
        } catch (error) {
            console.error('Manual reconnection failed:', error);
        } finally {
            setIsReconnecting(false);
        }
    };

    // Show error details on hover
    const handleMouseEnter = () => {
        if (connectionError) setShowError(true);
    };

    const handleMouseLeave = () => {
        setShowError(false);
    };

    const getStatusColor = () => {
        if (isReconnecting) return 'text-yellow-500';
        if (isConnected) return 'text-green-500';
        return 'text-red-500';
    };

    const getStatusText = () => {
        if (isReconnecting) return 'Reconnecting...';
        if (isConnected) return 'Real-time Connected';
        return 'Real-time Disconnected';
    };

    const getIcon = () => {
        if (isReconnecting) {
            return <Loader2 className="w-4 h-4 animate-spin" />;
        }
        if (isConnected) {
            return <Wifi className="w-4 h-4" />;
        }
        return <WifiOff className="w-4 h-4" />;
    };

    if (!showText) {
        return (
            <div
                className={`flex items-center ${className}`}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                <button
                    onClick={!isConnected && !isReconnecting ? handleReconnect : undefined}
                    className={`${getStatusColor()} hover:opacity-80 transition-opacity relative`}
                    disabled={isConnected || isReconnecting}
                    title={getStatusText()}
                >
                    {getIcon()}
                    {showError && connectionError && (
                        <div className="absolute left-0 top-full mt-2 bg-red-900 text-white text-xs p-2 rounded shadow-lg whitespace-nowrap z-50">
                            {connectionError}
                        </div>
                    )}
                </button>
            </div>
        );
    }

    return (
        <div className={`flex items-center space-x-2 ${className}`}>
            <span className={getStatusColor()}>
                {getIcon()}
            </span>
            <span className={`text-sm ${getStatusColor()}`}>
                {getStatusText()}
            </span>
            {!isConnected && !isReconnecting && (
                <button
                    onClick={handleReconnect}
                    className="text-xs text-blue-500 hover:text-blue-700 underline ml-2"
                >
                    Retry
                </button>
            )}
            {connectionError && (
                <span className="text-xs text-red-500" title={connectionError}>
                    ({connectionError})
                </span>
            )}
        </div>
    );
}