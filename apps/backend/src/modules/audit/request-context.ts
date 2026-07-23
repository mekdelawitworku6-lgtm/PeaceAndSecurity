import { AsyncLocalStorage } from "async_hooks";
import { UserRole } from "../../common/enums/enums";

export interface RequestContextData {
  userId: string;
  userName: string;
  userRole: UserRole;
  ipAddress: string;
}

export const RequestContext = new AsyncLocalStorage<RequestContextData>();
