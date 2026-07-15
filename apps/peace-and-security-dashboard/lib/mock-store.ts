import { UserStatus, UserRole } from "./enums";

// ── Helpers ──────────────────────────────────────────────────────────
function uid(): string {
  return (
    "id-" +
    Date.now().toString(36) +
    "-" +
    Math.random().toString(36).substring(2, 10)
  );
}

function load<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function save<T>(key: string, data: T) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(data));
}

// ── Seed data ────────────────────────────────────────────────────────
const SEED_USERS = [
  {
    id: "usr-admin-001",
    fullName: "Abebe Tolossa",
    email: "admin@example.com",
    phoneNumber: "+251900000000",
    role: UserRole.SYSTEM_SUPER_ADMIN,
    status: UserStatus.ACTIVE,
    isStaffUser: true,
    permissions: ["*"],
    createdAt: "2024-01-10T08:00:00.000Z",
    updatedAt: "2024-06-01T10:00:00.000Z",
  },
  {
    id: "usr-admin-002",
    fullName: "Hana Desta",
    email: "hana@example.com",
    phoneNumber: "+251911223344",
    role: UserRole.SYSTEM_ADMIN,
    status: UserStatus.ACTIVE,
    isStaffUser: true,
    permissions: [
      "DASHBOARD_VIEW",
      "REPORT_VIEW",
      "REPORT_ASSIGN",
      "USER_VIEW",
      "USER_CREATE",
    ],
    createdAt: "2024-03-15T09:30:00.000Z",
    updatedAt: "2024-06-01T10:00:00.000Z",
  },
  {
    id: "usr-admin-003",
    fullName: "Yonas Birhanu",
    email: "yonas@example.com",
    phoneNumber: "+251922334455",
    role: UserRole.SYSTEM_ADMIN,
    status: UserStatus.PENDING,
    isStaffUser: true,
    permissions: ["DASHBOARD_VIEW", "REPORT_VIEW"],
    createdAt: "2024-06-01T12:00:00.000Z",
    updatedAt: "2024-06-01T12:00:00.000Z",
  },
];

const SEED_PATROLS = [
  {
    id: "ptr-001",
    fullName: "Yamlak Fantahun",
    email: "yamlak@example.com",
    phoneNumber: "+251933445566",
    role: UserRole.PATROL,
    status: UserStatus.ACTIVE,
    officeAddress: "Bole Sub-City Division",
    officeLatitude: "9.0054",
    officeLongitude: "38.7636",
    assignedArea: "Bole",
    latitude: 9.0054,
    longitude: 38.7636,
    lastLocationUpdate: new Date(Date.now() - 300000).toISOString(),
    createdAt: "2024-02-10T08:00:00.000Z",
    updatedAt: "2024-06-01T10:00:00.000Z",
  },
  {
    id: "ptr-002",
    fullName: "Daniel Tadesse",
    email: "daniel@example.com",
    phoneNumber: "+251944556677",
    role: UserRole.PATROL,
    status: UserStatus.ACTIVE,
    officeAddress: "Arada Sub-City Division",
    officeLatitude: "9.0340",
    officeLongitude: "38.7510",
    assignedArea: "Arada",
    latitude: 9.034,
    longitude: 38.751,
    lastLocationUpdate: new Date(Date.now() - 600000).toISOString(),
    createdAt: "2024-02-15T08:00:00.000Z",
    updatedAt: "2024-06-01T10:00:00.000Z",
  },
  {
    id: "ptr-003",
    fullName: "Sara Mulugeta",
    email: "sara@example.com",
    phoneNumber: "+251955667788",
    role: UserRole.PATROL,
    status: UserStatus.ACTIVE,
    officeAddress: "Kirkos Sub-City Division",
    officeLatitude: "9.0185",
    officeLongitude: "38.7625",
    assignedArea: "Kirkos",
    latitude: 9.0185,
    longitude: 38.7625,
    lastLocationUpdate: new Date(Date.now() - 900000).toISOString(),
    createdAt: "2024-03-01T08:00:00.000Z",
    updatedAt: "2024-06-01T10:00:00.000Z",
  },
  {
    id: "ptr-004",
    fullName: "Dawit Tesfaye",
    email: "dawit@example.com",
    phoneNumber: "+251966778899",
    role: UserRole.PATROL,
    status: UserStatus.PENDING,
    officeAddress: "Yeka Sub-City Division",
    assignedArea: "Yeka",
    createdAt: "2024-06-10T08:00:00.000Z",
    updatedAt: "2024-06-10T08:00:00.000Z",
  },
  {
    id: "ptr-005",
    fullName: "Getachew Kebede",
    email: "getachew@example.com",
    phoneNumber: "+251977889900",
    role: UserRole.PATROL,
    status: UserStatus.DISABLED,
    officeAddress: "Lideta Sub-City Division",
    assignedArea: "Lideta",
    createdAt: "2024-01-20T08:00:00.000Z",
    updatedAt: "2024-05-15T10:00:00.000Z",
  },
];

const SEED_CITIZENS = [
  {
    id: "ctz-001",
    fullName: "Meron Girma",
    phoneNumber: "+251981112233",
    role: UserRole.CITIZEN,
    status: UserStatus.ACTIVE,
    createdAt: "2024-04-01T10:00:00.000Z",
    updatedAt: "2024-06-01T10:00:00.000Z",
  },
  {
    id: "ctz-002",
    fullName: "Berhan Tesfaye",
    phoneNumber: "+251982223344",
    role: UserRole.CITIZEN,
    status: UserStatus.ACTIVE,
    createdAt: "2024-04-05T11:00:00.000Z",
    updatedAt: "2024-06-01T10:00:00.000Z",
  },
  {
    id: "ctz-003",
    fullName: "Kidist Alemayehu",
    phoneNumber: "+251983334455",
    role: UserRole.CITIZEN,
    status: UserStatus.ACTIVE,
    createdAt: "2024-04-10T09:00:00.000Z",
    updatedAt: "2024-06-01T10:00:00.000Z",
  },
  {
    id: "ctz-004",
    fullName: "Abebech Worku",
    phoneNumber: "+251984445566",
    role: UserRole.CITIZEN,
    status: UserStatus.DISABLED,
    createdAt: "2024-03-20T08:00:00.000Z",
    updatedAt: "2024-05-10T10:00:00.000Z",
  },
];

const SEED_REPORT_TYPES = [
  { id: "rt-001", name: "Noise Pollution", description: "Excessive noise from construction, events, or commercial activities in residential or quiet zones.", isActive: true, residentialDecibelThreshold: 55, commercialDecibelThreshold: 70 },
  { id: "rt-002", name: "Littering", description: "Illegal dumping or littering in public spaces.", isActive: true },
  { id: "rt-003", name: "Vandalism", description: "Destruction or damage to public or private property.", isActive: true },
  { id: "rt-004", name: "Air Pollution", description: "Smoke, dust, or emissions contaminating the air.", isActive: true },
  { id: "rt-005", name: "Water Pollution", description: "Contamination of water sources or drainage systems.", isActive: true },
  { id: "rt-006", name: "Soil Contamination", description: "Hazardous substances contaminating soil.", isActive: true },
  { id: "rt-007", name: "Illegal Dumping", description: "Unauthorized disposal of waste in non-designated areas.", isActive: true },
  { id: "rt-008", name: "Deforestation", description: "Unauthorized cutting or burning of trees.", isActive: true },
  { id: "rt-009", name: "Hazardous Waste", description: "Improper handling or disposal of hazardous materials.", isActive: true },
  { id: "rt-010", name: "Wildlife Poaching", description: "Illegal hunting or capturing of wildlife.", isActive: true },
  { id: "rt-011", name: "Others", description: "General environmental or peace concerns not covered above.", isActive: true },
];

const SEED_CAMERAS = [
  { id: "cam-001", cameraId: "CAM-BLE-001", locationName: "Bole Road Junction", latitude: 9.0054, longitude: 38.7636, isActive: true, lastMaintenanceDate: "2024-05-20" },
  { id: "cam-002", cameraId: "CAM-ARA-002", locationName: "Arat Kilo Square", latitude: 9.0340, longitude: 38.7510, isActive: true, lastMaintenanceDate: "2024-06-01" },
  { id: "cam-003", cameraId: "CAM-MER-003", locationName: "Merkato Main Gate", latitude: 9.0185, longitude: 38.7450, isActive: false, lastMaintenanceDate: "2024-04-10" },
  { id: "cam-004", cameraId: "CAM-PIA-004", locationName: "Piazza Area", latitude: 9.0350, longitude: 38.7570, isActive: true, lastMaintenanceDate: "2024-06-05" },
];

// ── Keys ─────────────────────────────────────────────────────────────
const KEYS = {
  users: "pas_mock_users",
  patrols: "pas_mock_patrols",
  citizens: "pas_mock_citizens",
  reportTypes: "pas_mock_report_types",
  cameras: "pas_mock_cameras",
} as const;

// ── Generic CRUD helpers ─────────────────────────────────────────────
function getAll<T extends { id: string }>(key: string, seed: T[]): T[] {
  const stored = load<T[] | null>(key, null);
  if (stored) return stored;
  save(key, seed);
  return seed;
}

function getById<T extends { id: string }>(key: string, id: string): T | undefined {
  return getAll<T>(key, []).find((item) => item.id === id);
}

function create<T extends { id: string }>(key: string, seed: T[], item: Omit<T, "id">): T {
  const items = getAll<T>(key, seed);
  const newItem = { ...item, id: uid() } as T;
  items.push(newItem);
  save(key, items);
  return newItem;
}

function update<T extends { id: string }>(key: string, seed: T[], id: string, patch: Partial<T>): T | undefined {
  const items = getAll<T>(key, seed);
  const idx = items.findIndex((i) => i.id === id);
  if (idx === -1) return undefined;
  items[idx] = { ...items[idx], ...patch, id } as T;
  save(key, items);
  return items[idx];
}

function remove<T extends { id: string }>(key: string, seed: T[], id: string): boolean {
  const items = getAll<T>(key, seed);
  const filtered = items.filter((i) => i.id !== id);
  if (filtered.length === items.length) return false;
  save(key, filtered);
  return true;
}

function search<T extends Record<string, any>>(items: T[], term: string, fields: (keyof T)[]): T[] {
  if (!term) return items;
  const q = term.toLowerCase();
  return items.filter((item) =>
    fields.some((f) => String(item[f] || "").toLowerCase().includes(q))
  );
}

function paginate<T>(items: T[], page: number, limit: number) {
  const start = (page - 1) * limit;
  return {
    data: items.slice(start, start + limit),
    total: items.length,
    totalPages: Math.ceil(items.length / limit) || 1,
    page,
    limit,
  };
}

// ── Public API ───────────────────────────────────────────────────────

// Users
export const mockUsers = {
  getAll: () => getAll<any>(KEYS.users, SEED_USERS),
  getById: (id: string) => getById<any>(KEYS.users, id),
  create: (data: any) => create<any>(KEYS.users, SEED_USERS, data),
  update: (id: string, patch: any) => update<any>(KEYS.users, SEED_USERS, id, patch),
  toggleStatus: (id: string) => {
    const items = getAll<any>(KEYS.users, SEED_USERS);
    const idx = items.findIndex((i) => i.id === id);
    if (idx === -1) return;
    const cur = items[idx].status;
    items[idx].status = cur === UserStatus.ACTIVE ? UserStatus.DISABLED : UserStatus.ACTIVE;
    items[idx].updatedAt = new Date().toISOString();
    save(KEYS.users, items);
  },
  resetPassword: (_id: string) => ({ success: true }),
  query: (params: { page?: number; limit?: number; search?: string; role?: string; status?: string }) => {
    let items = getAll<any>(KEYS.users, SEED_USERS).filter((u) => u.isStaffUser);
    if (params.search) items = search(items, params.search, ["fullName", "email", "phoneNumber"]);
    if (params.role) items = items.filter((u) => u.role === params.role);
    if (params.status) items = items.filter((u) => u.status === params.status);
    items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return paginate(items, params.page || 1, params.limit || 10);
  },
};

// PatROLS
export const mockPatrols = {
  getAll: () => getAll<any>(KEYS.patrols, SEED_PATROLS),
  getById: (id: string) => getById<any>(KEYS.patrols, id),
  create: (data: any) => create<any>(KEYS.patrols, SEED_PATROLS, data),
  update: (id: string, patch: any) => update<any>(KEYS.patrols, SEED_PATROLS, id, patch),
  toggleStatus: (id: string) => {
    const items = getAll<any>(KEYS.patrols, SEED_PATROLS);
    const idx = items.findIndex((i) => i.id === id);
    if (idx === -1) return;
    const cur = items[idx].status;
    items[idx].status = cur === UserStatus.ACTIVE ? UserStatus.DISABLED : UserStatus.ACTIVE;
    items[idx].updatedAt = new Date().toISOString();
    save(KEYS.patrols, items);
  },
  resetPassword: (_id: string) => ({ success: true }),
  query: (params: { page?: number; limit?: number; search?: string; status?: string }) => {
    let items = getAll<any>(KEYS.patrols, SEED_PATROLS);
    if (params.search) items = search(items, params.search, ["fullName", "email", "phoneNumber", "assignedArea"]);
    if (params.status) items = items.filter((u) => u.status === params.status);
    items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return paginate(items, params.page || 1, params.limit || 10);
  },
};

// Citizens
export const mockCitizens = {
  getAll: () => getAll<any>(KEYS.citizens, SEED_CITIZENS),
  getById: (id: string) => getById<any>(KEYS.citizens, id),
  toggleStatus: (id: string) => {
    const items = getAll<any>(KEYS.citizens, SEED_CITIZENS);
    const idx = items.findIndex((i) => i.id === id);
    if (idx === -1) return;
    const cur = items[idx].status;
    items[idx].status = cur === UserStatus.ACTIVE ? UserStatus.DISABLED : UserStatus.ACTIVE;
    items[idx].updatedAt = new Date().toISOString();
    save(KEYS.citizens, items);
  },
  resetPassword: (_id: string) => ({ success: true }),
  query: (params: { page?: number; limit?: number; search?: string; status?: string }) => {
    let items = getAll<any>(KEYS.citizens, SEED_CITIZENS);
    if (params.search) items = search(items, params.search, ["fullName", "phoneNumber"]);
    if (params.status) items = items.filter((u) => u.status === params.status);
    items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return paginate(items, params.page || 1, params.limit || 10);
  },
};

// Report Types
export const mockReportTypes = {
  getAll: (search?: string) => {
    let items = getAll<any>(KEYS.reportTypes, SEED_REPORT_TYPES);
    if (search) items = search(items, search, ["name", "description"]);
    return { data: items, total: items.length };
  },
  getById: (id: string) => getById<any>(KEYS.reportTypes, id),
  create: (data: any) => create<any>(KEYS.reportTypes, SEED_REPORT_TYPES, data),
  update: (id: string, patch: any) => update<any>(KEYS.reportTypes, SEED_REPORT_TYPES, id, patch),
  delete: (id: string) => remove<any>(KEYS.reportTypes, SEED_REPORT_TYPES, id),
};

// Cameras
export const mockCameras = {
  getAll: () => ({ data: getAll<any>(KEYS.cameras, SEED_CAMERAS), total: getAll<any>(KEYS.cameras, SEED_CAMERAS).length }),
  getById: (id: string) => getById<any>(KEYS.cameras, id),
  create: (data: any) => create<any>(KEYS.cameras, SEED_CAMERAS, data),
  update: (id: string, patch: any) => update<any>(KEYS.cameras, SEED_CAMERAS, id, patch),
  delete: (id: string) => remove<any>(KEYS.cameras, SEED_CAMERAS, id),
};

// ── Reset (for dev) ─────────────────────────────────────────────────
export function resetMockStore() {
  Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
}
