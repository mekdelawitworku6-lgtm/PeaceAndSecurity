import { mockCitizens } from "../mock-store";

function fd(formData: FormData, key: string): string {
  const v = formData.get(key);
  return v !== null ? String(v) : "";
}

class CitizenService {
  async getAllCitizens(params?: any) {
    return mockCitizens.query({
      page: params?.page,
      limit: params?.limit,
      search: params?.search,
      status: params?.status,
    });
  }

  async registerCitizen(formData: FormData) {
    const now = new Date().toISOString();
    const item = {
      fullName: fd(formData, "fullName"),
      email: fd(formData, "email"),
      phoneNumber: fd(formData, "phoneNumber"),
      role: "CITIZEN",
      status: "ACTIVE",
      isPasswordSet: false,
      createdAt: now,
      updatedAt: now,
    };
    return mockCitizens.create(item);
  }

  async updateCitizen(id: string, formData: FormData) {
    const patch: any = { updatedAt: new Date().toISOString() };
    const fn = fd(formData, "fullName");
    if (fn) patch.fullName = fn;
    const ph = fd(formData, "phoneNumber");
    if (ph) patch.phoneNumber = ph;
    const em = fd(formData, "email");
    if (em) patch.email = em;
    return mockCitizens.update(id, patch);
  }

  async getCitizenById(id: string) {
    return mockCitizens.getById(id);
  }

  async deleteCitizen(id: string) {
    mockCitizens.toggleStatus(id);
    return { success: true };
  }
}

export const citizenService = new CitizenService();
