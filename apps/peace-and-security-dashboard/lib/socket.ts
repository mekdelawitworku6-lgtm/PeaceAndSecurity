import { io, Socket } from "socket.io-client";
import { getApiBaseUrl } from "./api-config";

let socket: Socket | null = null;

const getApiOrigin = () =>
    getApiBaseUrl().replace(/\/api\/?$/, "").replace(/\/$/, "");

export const getSocket = (userId?: string, role?: string): Socket => {
    if (!socket) {
        socket = io(getApiOrigin(), {
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
