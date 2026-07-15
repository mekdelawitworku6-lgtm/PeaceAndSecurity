import { mockCitizens } from "../mock-store";

class CitizenService {
  async getAllCitizens(params?: any) {
    return mockCitizens.query({
      page: params?.page,
      limit: params?.limit,
      search: params?.search,
      status: params?.status,
    });
  }

  async registerCitizen(_formData: FormData) {
    return { success: true };
  }

  async updateCitizen(_id: string, _formData: FormData) {
    return { success: true };
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
