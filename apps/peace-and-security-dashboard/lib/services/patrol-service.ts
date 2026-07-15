import { mockPatrols } from "../mock-store";

// FormData helper
function fd(fd: FormData, key: string): string {
  const v = fd.get(key);
  return v !== null ? String(v) : "";
}

class PatrolService {
  async getAllPatrols(params?: any) {
    return mockPatrols.query({
      page: params?.page,
      limit: params?.limit,
      search: params?.search,
      status: params?.status,
    });
  }

  async registerPatrol(formData: FormData) {
    const now = new Date().toISOString();
    const item = {
      fullName: fd(formData, "fullName"),
      email: fd(formData, "email"),
      phoneNumber: fd(formData, "phoneNumber"),
      role: fd(formData, "role") || "PATROL",
      status: "ACTIVE",
      isStaffUser: false,
      officeAddress: fd(formData, "officeAddress"),
      officeLatitude: fd(formData, "officeLatitude"),
      officeLongitude: fd(formData, "officeLongitude"),
      assignedArea: fd(formData, "assignedArea"),
      createdAt: now,
      updatedAt: now,
    };
    return mockPatrols.create(item);
  }

  async updatePatrol(id: string, formData: FormData) {
    const patch: any = { updatedAt: new Date().toISOString() };
    const fn = fd(formData, "fullName");
    if (fn) patch.fullName = fn;
    const em = fd(formData, "email");
    if (em) patch.email = em;
    const ph = fd(formData, "phoneNumber");
    if (ph) patch.phoneNumber = ph;
    const oa = fd(formData, "officeAddress");
    if (oa) patch.officeAddress = oa;
    const ol = fd(formData, "officeLatitude");
    if (ol) patch.officeLatitude = ol;
    const olg = fd(formData, "officeLongitude");
    if (olg) patch.officeLongitude = olg;
    const aa = fd(formData, "assignedArea");
    if (aa) patch.assignedArea = aa;
    return mockPatrols.update(id, patch);
  }

  async getPatrolById(id: string) {
    return mockPatrols.getById(id);
  }

  async deletePatrol(id: string) {
    mockPatrols.toggleStatus(id);
    return { success: true };
  }

  async getNearby(_params: any) {
    return { data: [], success: true };
  }
}

export const patrolService = new PatrolService();
