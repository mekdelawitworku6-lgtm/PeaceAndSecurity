const getBaseUrl = () => {
    // 1. Priority: Environment variable (baked in at build time)
    const envUrl = process.env.NEXT_PUBLIC_API_URL;
    if (envUrl && envUrl !== 'undefined') {
        return envUrl.endsWith('/') ? envUrl : `${envUrl}/`;
    }

    // 2. Fallback: use same origin (nginx proxies /api/ to backend)
    if (typeof window === 'undefined') {
        return 'http://127.0.0.1:52500/api/';
    }

    return `${window.location.origin}/api/`;
};

export const API_CONFIG = {
    BASE_URL: getBaseUrl(),
    TIMEOUT: 30000,
} as const;

export const DEMO_MODE =
    process.env.NEXT_PUBLIC_DEMO_MODE === "true" ||
    (process.env.NEXT_PUBLIC_DEMO_MODE !== "false" && !process.env.NEXT_PUBLIC_API_URL);

// API Endpoints
export const API_ENDPOINTS = {
    // ── Auth ──────────────────────────────────────────────────────────
    AUTH: {
        // Dashboard users (System Admin / Super Admin) — email or phone + password
        USER_LOGIN: 'auth/user/login',
        USER_PRE_LOGIN: 'auth/user/pre-login',
        USER_VERIFY: 'auth/user/verify',
        USER_SET_PASSWORD: 'auth/user/set-password',
        USER_PASSWORD_RESET_REQUEST: 'auth/user/password-reset/request',
        USER_PASSWORD_RESET_CONFIRM: 'auth/user/password-reset/confirm',
        USER_PASSWORD_CHANGE: 'auth/user/password/change',
        USER_REFRESH: 'auth/user/refresh',

        // Patrol (phone + PIN)
        PATROL_LOGIN: 'auth/patrol/login',
        PATROL_PIN_RESET_REQUEST: 'auth/patrol/pin-reset/request',
        PATROL_PIN_RESET_CONFIRM: 'auth/patrol/pin-reset/confirm',

        // Citizen (phone + PIN)
        CITIZEN_REGISTER: 'auth/citizen/register',
        CITIZEN_LOGIN: 'auth/citizen/login',
        CITIZEN_PIN_RESET_REQUEST: 'auth/citizen/pin-reset/request',
        CITIZEN_PIN_RESET_CONFIRM: 'auth/citizen/pin-reset/confirm',

        // PIN management (Admin sets PIN for patrol/citizen)
        SET_USER_PIN: (userId: string) => `auth/users/${userId}/set-pin`,
        CHANGE_PIN: 'auth/pin/change',
    },

    // ── Dashboard Users (admins) ──────────────────────────────────────
    USERS: {
        REGISTER: 'users/register',
        GET_ALL: 'users/all',
        GET_PROFILE: 'users/profile',
        UPDATE_PROFILE: 'users/profile',
        GET_BY_ID: (id: string) => `users/${id}`,
        UPDATE: (id: string) => `users/${id}`,
        TOGGLE_STATUS: (id: string) => `users/${id}/toggle-status`,
        RESET_PASSWORD: (id: string) => `users/${id}/reset-password`,
        DELETE: (id: string) => `users/${id}`,
    },

    // ── Reports ───────────────────────────────────────────────────────
    REPORTS: {
        BASE: 'reports',
        GET_ALL: 'reports',
        GET_NEARBY: 'reports/nearby',
        MY_REPORTS: 'reports/my-reports',
        TRACK: (caseId: string) => `reports/track/${caseId}`,
        GET_BY_ID: (id: string) => `reports/${id}`,
        GET_HISTORY: (id: string) => `reports/${id}/history`,
        CREATE: 'reports',
        UPDATE: (id: string) => `reports/${id}`,
        DELETE: (id: string) => `reports/${id}`,
        ASSIGN: (id: string) => `reports/${id}/assign`,
        ACCEPT: (id: string) => `reports/${id}/accept`,
        FOLLOW_UP: (id: string) => `reports/${id}/follow-up`,
        CLOSE: (id: string) => `reports/${id}/close`,
        REVIEW: (id: string) => `reports/${id}/review`,
        ESCALATE: (id: string) => `reports/${id}/escalate`,
    },

    // ── Report Types ────────────────────────────────────────────────
    REPORT_TYPES: {
        GET_ALL: 'report-types',
        GET_BY_ID: (id: string) => `report-types/${id}`,
        CREATE: 'report-types',
        UPDATE: (id: string) => `report-types/${id}`,
        DELETE: (id: string) => `report-types/${id}`,
    },

    // ── Cameras ───────────────────────────────────────────────────────
    CAMERAS: {
        GET_ALL: 'cameras',
        GET_BY_ID: (id: string) => `cameras/${id}`,
        CREATE: 'cameras',
        UPDATE: (id: string) => `cameras/${id}`,
        DELETE: (id: string) => `cameras/${id}`,
    },

    // ── Patrol Officers (dashboard admin management) ───────────────────
    PATROLS: {
        GET_ALL: 'patrols',
        CREATE: 'patrols',
        GET_BY_ID: (id: string) => `patrols/${id}`,
        UPDATE: (id: string) => `patrols/${id}`,
        DELETE: (id: string) => `patrols/${id}`,
        UPDATE_LOCATION: (id: string) => `patrols/${id}/location`,
        GET_NEARBY: 'patrols/nearby',
    },

    // ── Citizens (dashboard admin management) ─────────────────────────
    CITIZENS: {
        GET_ALL: 'citizens',
        CREATE: 'citizens',
        GET_BY_ID: (id: string) => `citizens/${id}`,
        UPDATE: (id: string) => `citizens/${id}`,
        DELETE: (id: string) => `citizens/${id}`,
    },

    // ── Geographic Units ──────────────────────────────────────────────
    GEO: {
        CITIES: {
            GET_ALL: 'geo/cities',
            GET_BY_ID: (id: string) => `geo/cities/${id}`,
            CREATE: 'geo/cities',
            UPDATE: (id: string) => `geo/cities/${id}`,
            DELETE: (id: string) => `geo/cities/${id}`,
        },
        SUBCITIES: {
            GET_ALL: 'geo/subcities',
            GET_BY_ID: (id: string) => `geo/subcities/${id}`,
            GET_BY_CITY: (cityId: string) => `geo/subcities?cityId=${cityId}`,
            CREATE: 'geo/subcities',
            UPDATE: (id: string) => `geo/subcities/${id}`,
            DELETE: (id: string) => `geo/subcities/${id}`,
        },
        WOREDAS: {
            GET_ALL: 'geo/woredas',
            GET_BY_ID: (id: string) => `geo/woredas/${id}`,
            GET_BY_SUBCITY: (subcityId: string) => `geo/woredas?subcityId=${subcityId}`,
            CREATE: 'geo/woredas',
            UPDATE: (id: string) => `geo/woredas/${id}`,
            DELETE: (id: string) => `geo/woredas/${id}`,
        },
    },

    // ── Patrol Teams ──────────────────────────────────────────────────
    PATROL_TEAMS: {
        GET_ALL: 'patrol-teams',
        GET_BY_ID: (id: string) => `patrol-teams/${id}`,
        CREATE: 'patrol-teams',
        UPDATE: (id: string) => `patrol-teams/${id}`,
        DELETE: (id: string) => `patrol-teams/${id}`,
        ADD_MEMBERS: (id: string) => `patrol-teams/${id}/members`,
        REMOVE_MEMBER: (id: string, userId: string) => `patrol-teams/${id}/members/${userId}`,
    },

    // ── Chat / Conversations ──────────────────────────────────────────
    CHAT: {
        CONVERSATIONS: {
            GET_ALL: 'chat/conversations',
            GET_BY_ID: (id: string) => `chat/conversations/${id}`,
            CREATE: 'chat/conversations',
        },
        MESSAGES: {
            GET_ALL: (conversationId: string) => `chat/conversations/${conversationId}/messages`,
            SEND: (conversationId: string) => `chat/conversations/${conversationId}/messages`,
        },
        MARK_READ: (conversationId: string) => `chat/conversations/${conversationId}/read`,
        WS_GATEWAY: 'chat',
    },

    // ── Work Reports ──────────────────────────────────────────────────
    WORK_REPORTS: {
        GET_ALL: 'work-reports',
        GET_BY_ID: (id: string) => `work-reports/${id}`,
        CREATE: 'work-reports',
        UPDATE: (id: string) => `work-reports/${id}`,
        REVIEW: (id: string) => `work-reports/${id}/review`,
        DELETE: (id: string) => `work-reports/${id}`,
    },

    // ── Audit Logs ────────────────────────────────────────────────────
    AUDIT_LOGS: {
        GET_ALL: 'audit-logs',
        GET_BY_ID: (id: string) => `audit-logs/${id}`,
        GET_BY_ENTITY: (entity: string, entityId: string) => `audit-logs/entity/${entity}/${entityId}`,
        SECURITY_EVENTS: 'audit-logs/security-events',
        DATA_ACCESS_EVENTS: 'audit-logs/data-access-events',
        VERIFY_CHAIN: 'audit-logs/verify-chain',
        EXPORT_CSV: 'audit-logs/export/csv',
        EXPORT_PDF: 'audit-logs/export/pdf',
    },

    // ── Analytics ─────────────────────────────────────────────────────
    ANALYTICS: {
        GET: (timeRange: string) => `dashboard/analytics?timeRange=${timeRange}`,
    },
} as const;

export const getApiBaseUrl = () => {
    return API_CONFIG.BASE_URL;
};
