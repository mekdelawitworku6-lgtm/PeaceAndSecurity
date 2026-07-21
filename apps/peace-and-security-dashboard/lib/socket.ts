import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const getSocket = (userId?: string, role?: string): Socket => {
    if (!socket) {
        socket = io(typeof window !== "undefined" ? window.location.origin : "", {
            transports: ["websocket"],
            reconnection: true,
        });
    }

    if (userId && role) {
        socket.emit("authenticate", { userId, role });
    }

    return socket;
};

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};
