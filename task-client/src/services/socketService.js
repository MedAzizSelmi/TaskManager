import { io } from 'socket.io-client';
import { API_URL } from '../config/api';

let socket;
let reconnectTimer;

export const initSocket = (token) => {
    if (!token) {
        console.error("❌ WebSocket Init Error: No token provided");
        return;
    }

    if (socket) {
        socket.disconnect();
    }

    console.log("🔌 Connecting to WebSocket with token:", token);

    socket = io(API_URL, {
        auth: { token },
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 20000,
    });

    socket.on('connect', () => {
        console.log(`✅ Connected to WebSocket server: ${socket.id}`);
        if (reconnectTimer) {
            clearTimeout(reconnectTimer);
            reconnectTimer = null;
        }
    });

    socket.on('connect_error', (error) => {
        console.error("❌ WebSocket Connection Error:", error.message);
        if (!reconnectTimer) {
            reconnectTimer = setTimeout(() => {
                console.log("🔄 Attempting to reconnect...");
                initSocket(token);
            }, 5000);
        }
    });

    socket.on('reconnect', (attempt) => {
        console.log(`🔄 Reconnected on attempt: ${attempt}`);
    });

    socket.on('reconnect_error', (error) => {
        console.error("❌ WebSocket Reconnection Error:", error.message);
    });

    socket.on('reconnect_failed', () => {
        console.error("❌ WebSocket Reconnection Failed");
    });

    // ✅ Listen for a test event from the backend
    socket.on("testEvent", (data) => {
        console.log("📥 Received test event:", data);
    });

    return socket;
};

export const getSocket = () => {
    if (!socket) {
        throw new Error("❌ Socket not initialized");
    }
    return socket;
};
