import type { InternalAxiosRequestConfig } from "axios";
import {
    buildAnalytics,
    buildDashboardStats,
    buildFleetLocations,
    demoDatabase,
} from "./demo-data";

type Params = Record<string, any>;

const ok = (data: any, message = "Request successful", extra: Params = {}) => ({
    success: true,
    message,
    statusCode: 200,
    data,
    ...extra,
});

const fail = (message = "Not found", statusCode = 404) => ({
    success: false,
    message,
    statusCode,
});

const parseBody = (raw: any): Params => {
    if (!raw) return {};
    if (typeof raw === "string") {
        try {
            return JSON.parse(raw);
        } catch {
            return {};
        }
    }
    if (typeof FormData !== "undefined" && raw instanceof FormData) {
        return Object.fromEntries(raw.entries()) as Params;
    }
    return raw;
};

const normalize = (url = "") => url.split("?")[0].replace(/^\/+/, "").replace(/\/+$/, "");

const matches = (item: any, params: Params) => {
    if (params.search) {
        const term = String(params.search).toLowerCase();
        if (!JSON.stringify(item).toLowerCase().includes(term)) return false;
    }
    const direct = ["status", "role", "entity", "entityId", "action", "accessType", "targetEntity", "eventType", "performedByUserId", "actorId", "cityId", "subcityId", "woredaId"];
    for (const key of direct) {
        if (params[key] && params[key] !== "ALL" && String(item[key]) !== String(params[key])) return false;
    }
    if (params.isActive !== undefined && String(item.isActive) !== String(params.isActive)) return false;
    if (params.success !== undefined && String(item.success) !== String(params.success)) return false;
    if (params.isStaffUser !== undefined && String(!!item.isStaffUser) !== String(params.isStaffUser)) return false;
    if (params.startDate && item.createdAt && new Date(item.createdAt) < new Date(params.startDate)) return false;
    if (params.endDate && item.createdAt && new Date(item.createdAt) > new Date(params.endDate)) return false;
    return true;
};

const list = (items: any[], params: Params, message = "Records retrieved successfully") => {
    const filtered = items.filter((item) => matches(item, params));
    const page = Math.max(1, Number(params.page) || 1);
    const limit = params.limit ? Math.max(1, Number(params.limit)) : filtered.length || 10;
    const start = (page - 1) * limit;
    return ok(filtered.slice(start, start + limit), message, {
        total: filtered.length,
        page,
        limit,
        totalPages: Math.max(1, Math.ceil(filtered.length / limit)),
    });
};

const findById = (items: any[], id: string) => items.find((item) => String(item.id) === String(id));

const before = (items: any[], id: string) => findById(items, id) || findById(items, decodeURIComponent(id));

const publicUser = (user: any) => {
    if (!user) return user;
    const { password, ...safe } = user;
    return safe;
};

const currentUser = (config: InternalAxiosRequestConfig) => {
    const headers = config.headers as any;
    const auth = String(headers?.Authorization || headers?.get?.("Authorization") || "");
    const id = auth.replace(/^Bearer\s+demo-access-/, "");
    return findById(demoDatabase.users, id) || demoDatabase.users[0];
};

const newId = (prefix: string) => `${prefix}-${Date.now().toString(36)}`;

const collectionRoutes: Record<string, any[]> = {
    "users/all": demoDatabase.users,
    users: demoDatabase.users,
    patrols: demoDatabase.patrols,
    citizens: demoDatabase.citizens,
    "report-types": demoDatabase.reportTypes,
    cameras: demoDatabase.cameras,
    "geo/cities": demoDatabase.cities,
    "geo/subcities": demoDatabase.subcities,
    "geo/woredas": demoDatabase.woredas,
    "patrol-teams": demoDatabase.patrolTeams,
    "work-reports": demoDatabase.workReports,
    "audit-logs": demoDatabase.auditLogs,
};

const singular: Record<string, string> = {
    users: "User",
    patrols: "Patrol",
    citizens: "Citizen",
    "report-types": "Report type",
    cameras: "Camera",
    "geo/cities": "City",
    "geo/subcities": "Subcity",
    "geo/woredas": "Woreda",
    "patrol-teams": "Patrol team",
    "work-reports": "Work report",
};

export function resolveDemoRequest(config: InternalAxiosRequestConfig): any {
    const method = (config.method || "get").toUpperCase();
    const rawUrl = config.url || "";
    const path = normalize(rawUrl);
    const query = rawUrl.includes("?") ? rawUrl.slice(rawUrl.indexOf("?") + 1) : "";
    const queryParams = Object.fromEntries(new URLSearchParams(query).entries());
    const params: Params = { ...queryParams, ...(config.params || {}) };
    const body = parseBody(config.data);
    const segments = path.split("/");
    const db = demoDatabase;

    if (path === "auth/user/login" && method === "POST") {
        const identifier = String(body.email || body.phoneNumber || "").toLowerCase();
        const user = db.users.find(
            (u) =>
                String(u.email).toLowerCase() === identifier ||
                String(u.phoneNumber) === identifier
        );
        if (!user || body.password !== user.password) {
            return fail("Invalid email or password", 401);
        }
        return ok(
            {
                accessToken: `demo-access-${user.id}`,
                refreshToken: `demo-refresh-${user.id}`,
                user: publicUser(user),
            },
            "Login successful"
        );
    }

    if (path === "auth/user/pre-login" && method === "POST") {
        const identifier = String(body.email || body.phoneNumber || "").toLowerCase();
        const user = db.users.find(
            (u) =>
                String(u.email).toLowerCase() === identifier ||
                String(u.phoneNumber) === identifier
        );
        return user
            ? ok({ isPasswordSet: true }, "Account found")
            : fail("Account not found", 404);
    }

    if (path.startsWith("auth/") || path === "auth/logout") {
        return ok({ success: true }, "Request successful");
    }

    if (path === "settings") {
        if (method === "PUT" || method === "PATCH") {
            Object.assign(db.settings, body);
            return ok(db.settings, "Settings updated successfully");
        }
        return ok(db.settings, "Settings retrieved successfully");
    }

    if (path === "dashboard/stats") return ok(buildDashboardStats(), "Statistics retrieved successfully");
    if (path === "dashboard/fleet-locations") return ok(buildFleetLocations(), "Fleet locations retrieved successfully");
    if (path === "dashboard/recent-reports") {
        return ok([...db.reports].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)).slice(0, 5), "Recent reports retrieved successfully");
    }
    if (path === "dashboard/analytics") return ok(buildAnalytics(params.timeRange || "week"), "Analytics retrieved successfully");

    if (path === "cameras/alerts") return list(db.cameraAlerts, params, "Camera alerts retrieved successfully");
    if (path === "patrols/nearby") return list(db.patrols, params, "Nearby patrols retrieved successfully");

    if (path === "notifications") {
        if (method === "POST") {
            const notification = {
                id: newId("not"),
                title: body.title || "Broadcast message",
                message: body.message || "This is a demo notification.",
                type: body.type || "GENERAL",
                data: body.data || null,
                isRead: false,
                read: false,
                createdAt: new Date().toISOString(),
            };
            db.notifications.unshift(notification);
            return ok(notification, "Notification created successfully");
        }
        return list(db.notifications, { ...params, limit: params.limit || db.notifications.length }, "Notifications retrieved successfully");
    }
    if (path === "notifications/mark-all-read") {
        db.notifications.forEach((n) => {
            n.isRead = true;
            n.read = true;
        });
        return ok({ updated: db.notifications.length }, "All notifications marked as read");
    }
    if (path === "notifications/fcm-token" || path === "notifications/test-notify" || path === "notifications/broadcast") {
        return ok({ success: true }, "Notification request accepted");
    }
    if (segments[0] === "notifications" && segments[2] === "mark-read") {
        const notification = before(db.notifications, segments[1]);
        if (notification) {
            notification.isRead = true;
            notification.read = true;
        }
        return ok(notification || {}, "Notification marked as read");
    }

    if (path === "audit-logs/security-events") return list(db.securityEvents, params, "Security events retrieved successfully");
    if (path === "audit-logs/data-access-events") return list(db.dataAccessEvents, params, "Data access events retrieved successfully");
    if (path === "audit-logs/verify-chain") return ok({ valid: true, total: db.auditLogs.length }, "Audit chain verified");
    if (path === "audit-logs/export/csv") {
        const rows = ["id,entity,entityId,action,actorName,timestamp,description"];
        db.auditLogs.forEach((log) =>
            rows.push([log.id, log.entity, log.entityId, log.action, log.actorName, log.timestamp, `"${log.description}"`].join(","))
        );
        return rows.join("\n");
    }
    if (path === "audit-logs/export/pdf") {
        return `<html><body><h1>Peace & Security Audit Logs</h1><table border="1"><tr><th>Time</th><th>Actor</th><th>Action</th><th>Description</th></tr>${db.auditLogs
            .map((log) => `<tr><td>${log.timestamp}</td><td>${log.actorName}</td><td>${log.action}</td><td>${log.description}</td></tr>`)
            .join("")}</table></body></html>`;
    }
    if (path.startsWith("audit-logs/entity/")) {
        return list(db.auditLogs.filter((log) => log.entity === segments[2] && log.entityId === segments[3]), params, "Audit logs retrieved successfully");
    }

    if (path === "reports/nearby") return list(db.reports, params, "Nearby reports retrieved successfully");
    if (path === "reports/my-reports") {
        return list(db.reports.filter((r) => r.reporterPhoneNumber === currentUser(config)?.phoneNumber), params, "Reports retrieved successfully");
    }
    if (segments[0] === "reports" && segments[1] === "track") {
        const report = db.reports.find((r) => r.caseId === segments[2]);
        return report ? ok(report, "Report found") : fail("Report not found");
    }
    if (path === "reports" && method === "POST") {
        const report = {
            id: newId("rep"),
            caseId: `REP-${Math.floor(100000 + Math.random() * 899999)}`,
            violationType: body.violationType || body.type || "OTHERS",
            type: body.violationType || body.type || "OTHERS",
            reportDescription: body.description || body.reportDescription || "",
            description: body.description || body.reportDescription || "",
            address: body.address || "Addis Ababa",
            location: body.address || "Addis Ababa",
            latitude: Number(body.latitude) || 9.01,
            longitude: Number(body.longitude) || 38.75,
            area: body.area || "Addis Ababa",
            imageUrls: body.evidenceUrls || [],
            videoUrls: [],
            audioUrls: [],
            evidenceUrls: body.evidenceUrls || [],
            patrolImageUrls: [],
            patrolAudioUrls: [],
            patrolEvidenceUrls: [],
            status: "SUBMITTED",
            priority: body.severity || "Medium",
            severity: body.severity || "Medium",
            reporter: currentUser(config) || db.citizens[0],
            reporterPhoneNumber: body.reporterPhoneNumber || db.citizens[0].phoneNumber,
            assignedPatrol: null,
            assignedTo: null,
            createdAt: new Date().toISOString(),
            incidentDateTime: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            resolvedAt: null,
            history: [{ status: "SUBMITTED", notes: "Status changed to SUBMITTED", createdAt: new Date().toISOString() }],
        };
        db.reports.unshift(report);
        return ok(report, "Report created successfully");
    }
    if (segments[0] === "reports" && segments.length >= 3 && segments[2] === "history") {
        const report = before(db.reports, segments[1]);
        return report ? ok(report.history || [], "Report history retrieved successfully") : fail("Report not found");
    }
    if (segments[0] === "reports" && segments.length >= 3 && method === "PATCH") {
        const report = before(db.reports, segments[1]);
        if (!report) return fail("Report not found");
        const action = segments[2];
        if (action === "assign") {
            const patrol = before(db.patrols, body.patrolId);
            report.assignedPatrol = patrol || null;
            report.assignedPatrolId = patrol?.id || null;
            report.assignedTo = patrol?.fullName || null;
            report.status = "ASSIGNED";
        } else if (action === "accept") {
            report.status = "IN_PROGRESS";
        } else if (action === "close") {
            report.status = "CLOSED";
            report.resolvedAt = new Date().toISOString();
        } else if (action === "review") {
            report.status = String(body.status || "UNDER_REVIEW").toUpperCase();
            report.rejectionReason = body.rejectionReason || null;
        } else if (action === "escalate") {
            report.status = "ESCALATED";
            report.patrolNotes = body.notes || report.patrolNotes;
        } else if (action === "follow-up") {
            report.patrolNotes = body.notes || report.patrolNotes;
            report.status = report.status === "SUBMITTED" ? "IN_PROGRESS" : report.status;
        } else {
            Object.assign(report, body);
        }
        report.updatedAt = new Date().toISOString();
        report.history = [
            ...(report.history || []),
            { status: report.status, notes: `Status changed to ${report.status}`, createdAt: report.updatedAt },
        ];
        return ok(report, "Report updated successfully");
    }

    if (path === "chat/conversations" && method === "POST") {
        const report = before(db.reports, body.reportId) || db.reports[0];
        const conversation = {
            id: newId("conv"),
            reportId: report.id,
            report: { id: report.id, title: report.violationType, type: report.violationType, caseId: report.caseId, status: report.status },
            unreadCount: 0,
            lastMessage: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        db.conversations.unshift(conversation);
        db.messages[conversation.id] = [];
        return ok(conversation, "Conversation created successfully");
    }
    if (segments[0] === "chat" && segments[1] === "conversations" && segments[3] === "messages") {
        const conversationId = segments[2];
        if (method === "POST") {
            const user = currentUser(config);
            const message = {
                id: newId("msg"),
                conversationId,
                senderId: user.id,
                senderName: user.fullName || "Admin",
                senderType: "admin",
                content: body.content || "",
                isRead: false,
                readBy: [],
                createdAt: new Date().toISOString(),
            };
            if (!db.messages[conversationId]) db.messages[conversationId] = [];
            db.messages[conversationId].push(message);
            const conversation = before(db.conversations, conversationId);
            if (conversation) {
                conversation.lastMessage = {
                    content: message.content,
                    senderName: message.senderName,
                    senderType: message.senderType,
                    createdAt: message.createdAt,
                };
                conversation.updatedAt = message.createdAt;
            }
            return ok(message, "Message sent successfully");
        }
        const messages = db.messages[conversationId] || [];
        return list(messages, { ...params, limit: params.limit || messages.length }, "Messages retrieved successfully");
    }
    if (segments[0] === "chat" && segments[1] === "conversations" && segments[3] === "read") {
        const conversation = before(db.conversations, segments[2]);
        if (conversation) conversation.unreadCount = 0;
        return ok({ success: true }, "Conversation marked as read");
    }
    if (path === "chat/conversations") return list(db.conversations, params, "Conversations retrieved successfully");
    if (segments[0] === "chat" && segments[1] === "conversations") {
        const conversation = before(db.conversations, segments[2]);
        return conversation ? ok(conversation, "Conversation retrieved successfully") : fail("Conversation not found");
    }

    if (path === "users/profile") {
        const user = currentUser(config);
        if (method === "PUT" || method === "PATCH") {
            Object.assign(user, body);
            return ok(publicUser(user), "Profile updated successfully");
        }
        return ok(publicUser(user), "Profile retrieved successfully");
    }

    for (const [route, items] of Object.entries(collectionRoutes)) {
        if (path === route) {
            if (method === "POST") {
                const created = {
                    id: newId(route.split("/").pop() || "item"),
                    ...body,
                    status: body.status || "ACTIVE",
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                };
                items.unshift(created);
                return ok(route === "users" ? publicUser(created) : created, `${singular[route] || "Record"} created successfully`);
            }
            return list(items.map((item) => (route === "users" ? publicUser(item) : item)), params, `${singular[route] || "Records"} retrieved successfully`);
        }

        const id = segments.length === route.split("/").length + 1 ? segments[segments.length - 1] : null;
        if (!id || segments.slice(0, segments.length - 1).join("/") !== route) continue;
        const item = before(items, id);
        if (!item) return fail(`${singular[route] || "Record"} not found`);
        if (method === "DELETE") {
            items.splice(items.indexOf(item), 1);
            return ok({ id }, `${singular[route] || "Record"} deleted successfully`);
        }
        if (method === "PUT" || method === "PATCH" || method === "POST") {
            if (segments.length > route.split("/").length + 1) {
                const action = segments[segments.length - 1];
                if (action === "toggle-status") {
                    item.status = item.status === "ACTIVE" ? "DISABLED" : "ACTIVE";
                    return ok(item, "Status updated successfully");
                }
                if (action === "reset-password" || action === "reset-pin") {
                    return ok({ success: true }, "Credentials reset successfully");
                }
                if (action === "location") {
                    Object.assign(item, body);
                    return ok(item, "Location updated successfully");
                }
                if (action === "review") {
                    item.status = body.status || "APPROVED";
                    item.reviewNote = body.reviewNote || body.reviewNote === "" ? body.reviewNote || null : item.reviewNote;
                    item.reviewedAt = new Date().toISOString();
                    return ok(item, "Work report reviewed successfully");
                }
                if (action === "members") {
                    const members = (body.memberIds || []).map((memberId: string) => before(db.users, memberId)).filter(Boolean);
                    item.members = members;
                    return ok(item, "Team members updated successfully");
                }
            }
            Object.assign(item, body);
            item.updatedAt = new Date().toISOString();
            return ok(route === "users" ? publicUser(item) : item, `${singular[route] || "Record"} updated successfully`);
        }
        return ok(route === "users" ? publicUser(item) : item, `${singular[route] || "Record"} retrieved successfully`);
    }

    if (segments[0] === "reports") {
        const report = path === "reports" ? null : before(db.reports, segments[1]);
        if (method === "DELETE" && report) {
            db.reports.splice(db.reports.indexOf(report), 1);
            return ok({ id: report.id }, "Report deleted successfully");
        }
        if (method === "PATCH" || method === "PUT") {
            if (!report) return fail("Report not found");
            Object.assign(report, body);
            report.updatedAt = new Date().toISOString();
            return ok(report, "Report updated successfully");
        }
        if (report) return ok(report, "Report retrieved successfully");
        return list(db.reports, params, "Reports retrieved successfully");
    }

    return ok([], "Request successful");
}
