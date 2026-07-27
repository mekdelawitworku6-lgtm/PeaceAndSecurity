import { AsyncLocalStorage } from "async_hooks";
import { UserRole, AuditSource } from "../../common/enums/enums";

export interface RequestContextData {
  userId: string;
  userName: string;
  userRole: UserRole;
  ipAddress: string;
  requestId: string;
  userAgent: string;
  deviceId: string;
  devicePlatform: string;
  appVersion: string;
  source: AuditSource;
  requestMethod: string;
  requestPath: string;
  sessionId: string;
}

export const RequestContext = new AsyncLocalStorage<RequestContextData>();
