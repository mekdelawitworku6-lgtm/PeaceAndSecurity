import { mockUsers } from "../mock-store";

// FormData helper
function fd(fd: FormData, key: string): string {
  const v = fd.get(key);
  return v !== null ? String(v) : "";
}

class UserService {
  async getAllUsers(params?: any) {
    return mockUsers.query({
      page: params?.page,
      limit: params?.limit,
      search: params?.search,
      role: params?.role,
      status: params?.status,
    });
  }

  async registerUser(formData: FormData) {
    const now = new Date().toISOString();
    const permissions: string[] = [];
    formData.forEach((v, k) => {
      if (k === "permissions") permissions.push(String(v));
    });
    const item = {
      fullName: fd(formData, "fullName"),
      email: fd(formData, "email"),
      phoneNumber: fd(formData, "phoneNumber"),
      role: fd(formData, "role") || "SYSTEM_ADMIN",
      status: "ACTIVE",
      isStaffUser: true,
      permissions,
      createdAt: now,
      updatedAt: now,
    };
    return mockUsers.create(item);
  }

  async updateUser(id: string, formData: FormData) {
    const patch: any = { updatedAt: new Date().toISOString() };
    const fn = fd(formData, "fullName");
    if (fn) patch.fullName = fn;
    const em = fd(formData, "email");
    if (em) patch.email = em;
    const ph = fd(formData, "phoneNumber");
    if (ph) patch.phoneNumber = ph;
    const rl = fd(formData, "role");
    if (rl) patch.role = rl;
    const permissions: string[] = [];
    formData.forEach((v, k) => {
      if (k === "permissions") permissions.push(String(v));
    });
    if (permissions.length) patch.permissions = permissions;
    return mockUsers.update(id, patch);
  }

  async updateProfile(formData: FormData) {
    return this.updateUser("usr-admin-001", formData);
  }

  async toggleUserStatus(id: string) {
    mockUsers.toggleStatus(id);
    return { success: true };
  }

  async getUserProfile() {
    return mockUsers.getById("usr-admin-001");
  }

  async getUserById(id: string) {
    return mockUsers.getById(id);
  }

  async resetUserPassword(id: string) {
    mockUsers.resetPassword(id);
    return { success: true };
  }
}

export const userService = new UserService();
