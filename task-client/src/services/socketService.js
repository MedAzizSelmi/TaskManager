import { io } from 'socket.io-client';
import { API_URL } from '../config/api';

let socket;
let reconnectTimer;

export const initSocket = (token) => {
    if (socket) {
        socket.disconnect();
    }

    socket = io(API_URL, {
        auth: { token },
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 20000,
    });

    socket.on('connect', () => {
        console.log('Connected to WebSocket server');
        if (reconnectTimer) {
            clearTimeout(reconnectTimer);
            reconnectTimer = null;
        }
    });

    socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        if (!reconnectTimer) {
            reconnectTimer = setTimeout(() => {
                console.log('Attempting to reconnect...');
                initSocket(token);
            }, 5000);
        }
    });

    socket.on('reconnect', (attempt) => {
        console.log('Reconnected on attempt:', attempt);
    });

    socket.on('reconnect_error', (error) => {
        console.error('Socket reconnection error:', error);
    });

    socket.on('reconnect_failed', () => {
        console.error('Socket reconnection failed');
    });

    return socket;
};

export const getSocket = () => {
    if (!socket) {
        throw new Error('Socket not initialized');
    }
    return socket;
};
