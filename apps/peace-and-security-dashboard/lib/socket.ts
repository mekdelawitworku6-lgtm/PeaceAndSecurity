import { io, Socket } from "socket.io-client";
import { DEMO_MODE, getApiBaseUrl } from "./api-config";

let socket: Socket | null = null;

const getApiOrigin = () =>
    getApiBaseUrl().replace(/\/api\/?$/, "").replace(/\/$/, "");

const createOfflineSocket = (): Socket => {
    const handlers = new Map<string, Set<(...args: any[]) => void>>();
    const offline: any = {
        connected: false,
        on: (event: string, callback: (...args: any[]) => void) => {
            if (!handlers.has(event)) handlers.set(event, new Set());
            handlers.get(event)?.add(callback);
            return offline;
        },
        off: (event: string, callback?: (...args: any[]) => void) => {
            if (callback) handlers.get(event)?.delete(callback);
            else handlers.delete(event);
            return offline;
        },
        emit: () => offline,
        disconnect: () => offline,
    };
    return offline as Socket;
};

export const getSocket = (userId?: string, role?: string): Socket => {
    if (DEMO_MODE) return createOfflineSocket();

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

export const getChatSocket = (token?: string | null): Socket => {
    if (DEMO_MODE) return createOfflineSocket();

    return io(`${getApiOrigin()}/chat`, {
        auth: { token },
        transports: ["websocket"],
    });
};

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};
