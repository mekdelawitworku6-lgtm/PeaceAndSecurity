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

// ── Seed: Admin Users ────────────────────────────────────────────────
const SEED_USERS = [
  {
    id: "usr-admin-001",
    fullName: "Abebe Tolossa",
    email: "admin@example.com",
    phoneNumber: "+251900000000",
    password: "admin123",
    role: UserRole.SYSTEM_SUPER_ADMIN,
    status: UserStatus.ACTIVE,
    isStaffUser: true,
    isPasswordSet: true,
    permissions: ["*"],
    createdAt: "2024-01-10T08:00:00.000Z",
    updatedAt: "2024-06-01T10:00:00.000Z",
  },
  {
    id: "usr-admin-002",
    fullName: "Hana Desta",
    email: "hana@example.com",
    phoneNumber: "+251911223344",
    password: "admin123",
    role: UserRole.SYSTEM_ADMIN,
    status: UserStatus.ACTIVE,
    isStaffUser: true,
    isPasswordSet: true,
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
    password: "admin123",
    role: UserRole.SYSTEM_ADMIN,
    status: UserStatus.PENDING,
    isStaffUser: true,
    isPasswordSet: false,
    permissions: ["DASHBOARD_VIEW", "REPORT_VIEW"],
    createdAt: "2024-06-01T12:00:00.000Z",
    updatedAt: "2024-06-01T12:00:00.000Z",
  },
  {
    id: "usr-admin-004",
    fullName: "Samuel Kibebe",
    email: "samuel@example.com",
    phoneNumber: "+251933445566",
    password: "admin123",
    role: UserRole.SYSTEM_ADMIN,
    status: UserStatus.ACTIVE,
    isStaffUser: true,
    isPasswordSet: true,
    permissions: ["DASHBOARD_VIEW", "REPORT_VIEW", "REPORT_ASSIGN", "USER_VIEW"],
    createdAt: "2024-04-20T08:00:00.000Z",
    updatedAt: "2024-06-15T10:00:00.000Z",
  },
  {
    id: "usr-admin-005",
    fullName: "Fatima Ahmed",
    email: "fatima@example.com",
    phoneNumber: "+251944556677",
    password: "admin123",
    role: UserRole.SYSTEM_SUPER_ADMIN,
    status: UserStatus.ACTIVE,
    isStaffUser: true,
    isPasswordSet: true,
    permissions: ["*"],
    createdAt: "2024-02-01T08:00:00.000Z",
    updatedAt: "2024-07-01T10:00:00.000Z",
  },
];

// ── Seed: Patrol Officers ────────────────────────────────────────────
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
    status: UserStatus.ACTIVE,
    officeAddress: "Yeka Sub-City Division",
    officeLatitude: "9.0420",
    officeLongitude: "38.7800",
    assignedArea: "Yeka",
    latitude: 9.042,
    longitude: 38.78,
    lastLocationUpdate: new Date(Date.now() - 1200000).toISOString(),
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
    officeLatitude: "9.0130",
    officeLongitude: "38.7450",
    assignedArea: "Lideta",
    latitude: 9.013,
    longitude: 38.745,
    lastLocationUpdate: new Date(Date.now() - 86400000).toISOString(),
    createdAt: "2024-01-20T08:00:00.000Z",
    updatedAt: "2024-05-15T10:00:00.000Z",
  },
  {
    id: "ptr-006",
    fullName: "Hanna Tadesse",
    email: "hanna.t@example.com",
    phoneNumber: "+251988990011",
    role: UserRole.PATROL,
    status: UserStatus.ACTIVE,
    officeAddress: "Addis Ketema Sub-City Division",
    officeLatitude: "9.0380",
    officeLongitude: "38.7480",
    assignedArea: "Addis Ketema",
    latitude: 9.038,
    longitude: 38.748,
    lastLocationUpdate: new Date(Date.now() - 450000).toISOString(),
    createdAt: "2024-03-12T08:00:00.000Z",
    updatedAt: "2024-06-20T10:00:00.000Z",
  },
  {
    id: "ptr-007",
    fullName: "Bereket Alemayehu",
    email: "bereket@example.com",
    phoneNumber: "+251999001122",
    role: UserRole.PATROL,
    status: UserStatus.ACTIVE,
    officeAddress: "Nifas Silk Lafto Sub-City Division",
    officeLatitude: "9.0050",
    officeLongitude: "38.7800",
    assignedArea: "Nifas Silk Lafto",
    latitude: 9.005,
    longitude: 38.78,
    lastLocationUpdate: new Date(Date.now() - 180000).toISOString(),
    createdAt: "2024-04-01T08:00:00.000Z",
    updatedAt: "2024-07-01T10:00:00.000Z",
  },
  {
    id: "ptr-008",
    fullName: "Tigist Gebremedhin",
    email: "tigist@example.com",
    phoneNumber: "+251900112233",
    role: UserRole.PATROL,
    status: UserStatus.ACTIVE,
    officeAddress: "Kolfe Keranio Sub-City Division",
    officeLatitude: "9.0250",
    officeLongitude: "38.7200",
    assignedArea: "Kolfe Keranio",
    latitude: 9.025,
    longitude: 38.72,
    lastLocationUpdate: new Date(Date.now() - 600000).toISOString(),
    createdAt: "2024-04-15T08:00:00.000Z",
    updatedAt: "2024-06-25T10:00:00.000Z",
  },
  {
    id: "ptr-009",
    fullName: "Alemayehu Bekele",
    email: "alemu@example.com",
    phoneNumber: "+251911223345",
    role: UserRole.PATROL,
    status: UserStatus.ACTIVE,
    officeAddress: "Gulele Sub-City Division",
    officeLatitude: "9.0430",
    officeLongitude: "38.7400",
    assignedArea: "Gulele",
    latitude: 9.043,
    longitude: 38.74,
    lastLocationUpdate: new Date(Date.now() - 720000).toISOString(),
    createdAt: "2024-05-01T08:00:00.000Z",
    updatedAt: "2024-07-05T10:00:00.000Z",
  },
  {
    id: "ptr-010",
    fullName: "Meseret Worku",
    email: "meseret@example.com",
    phoneNumber: "+251922334456",
    role: UserRole.PATROL,
    status: UserStatus.ACTIVE,
    officeAddress: "Akaki Kality Sub-City Division",
    officeLatitude: "8.9850",
    officeLongitude: "38.7950",
    assignedArea: "Akaki Kality",
    latitude: 8.985,
    longitude: 38.795,
    lastLocationUpdate: new Date(Date.now() - 360000).toISOString(),
    createdAt: "2024-05-10T08:00:00.000Z",
    updatedAt: "2024-07-10T10:00:00.000Z",
  },
  {
    id: "ptr-011",
    fullName: "Solomon Teshome",
    email: "solomon@example.com",
    phoneNumber: "+251933445567",
    role: UserRole.PATROL,
    status: UserStatus.PENDING,
    officeAddress: "Lemi Kura Sub-City Division",
    assignedArea: "Lemi Kura",
    createdAt: "2024-07-01T08:00:00.000Z",
    updatedAt: "2024-07-01T08:00:00.000Z",
  },
  {
    id: "ptr-012",
    fullName: "Rahel Zewde",
    email: "rahel@example.com",
    phoneNumber: "+251944556678",
    role: UserRole.PATROL,
    status: UserStatus.ACTIVE,
    officeAddress: "Bole Sub-City Division",
    officeLatitude: "9.0080",
    officeLongitude: "38.7700",
    assignedArea: "Bole",
    latitude: 9.008,
    longitude: 38.77,
    lastLocationUpdate: new Date(Date.now() - 240000).toISOString(),
    createdAt: "2024-05-20T08:00:00.000Z",
    updatedAt: "2024-07-15T10:00:00.000Z",
  },
  {
    id: "ptr-013",
    fullName: "Kidist Alemayehu",
    email: "kidist@example.com",
    phoneNumber: "+251955667789",
    role: UserRole.PATROL,
    status: UserStatus.ACTIVE,
    officeAddress: "Arada Sub-City Division",
    officeLatitude: "9.0320",
    officeLongitude: "38.7530",
    assignedArea: "Arada",
    latitude: 9.032,
    longitude: 38.753,
    lastLocationUpdate: new Date(Date.now() - 540000).toISOString(),
    createdAt: "2024-06-01T08:00:00.000Z",
    updatedAt: "2024-07-12T10:00:00.000Z",
  },
  {
    id: "ptr-014",
    fullName: "Ephrem Mekonnen",
    email: "ephrem@example.com",
    phoneNumber: "+251966778890",
    role: UserRole.PATROL,
    status: UserStatus.ACTIVE,
    officeAddress: "Yeka Sub-City Division",
    officeLatitude: "9.0400",
    officeLongitude: "38.7850",
    assignedArea: "Yeka",
    latitude: 9.04,
    longitude: 38.785,
    lastLocationUpdate: new Date(Date.now() - 150000).toISOString(),
    createdAt: "2024-06-15T08:00:00.000Z",
    updatedAt: "2024-07-14T10:00:00.000Z",
  },
  {
    id: "ptr-015",
    fullName: "Meron Girma",
    email: "meron.p@example.com",
    phoneNumber: "+251977889901",
    role: UserRole.PATROL,
    status: UserStatus.ACTIVE,
    officeAddress: "Kirkos Sub-City Division",
    officeLatitude: "9.0170",
    officeLongitude: "38.7600",
    assignedArea: "Kirkos",
    latitude: 9.017,
    longitude: 38.76,
    lastLocationUpdate: new Date(Date.now() - 900000).toISOString(),
    createdAt: "2024-06-20T08:00:00.000Z",
    updatedAt: "2024-07-13T10:00:00.000Z",
  },
];

// ── Seed: Citizens ───────────────────────────────────────────────────
const SEED_CITIZENS = [
  { id: "ctz-001", fullName: "Meron Girma", phoneNumber: "+251981112233", role: UserRole.CITIZEN, status: UserStatus.ACTIVE, createdAt: "2024-04-01T10:00:00.000Z", updatedAt: "2024-06-01T10:00:00.000Z" },
  { id: "ctz-002", fullName: "Berhan Tesfaye", phoneNumber: "+251982223344", role: UserRole.CITIZEN, status: UserStatus.ACTIVE, createdAt: "2024-04-05T11:00:00.000Z", updatedAt: "2024-06-01T10:00:00.000Z" },
  { id: "ctz-003", fullName: "Kidist Alemayehu", phoneNumber: "+251983334455", role: UserRole.CITIZEN, status: UserStatus.ACTIVE, createdAt: "2024-04-10T09:00:00.000Z", updatedAt: "2024-06-01T10:00:00.000Z" },
  { id: "ctz-004", fullName: "Abebech Worku", phoneNumber: "+251984445566", role: UserRole.CITIZEN, status: UserStatus.DISABLED, createdAt: "2024-03-20T08:00:00.000Z", updatedAt: "2024-05-10T10:00:00.000Z" },
  { id: "ctz-005", fullName: "Dawit Mulugeta", phoneNumber: "+251985556677", role: UserRole.CITIZEN, status: UserStatus.ACTIVE, createdAt: "2024-04-15T10:30:00.000Z", updatedAt: "2024-06-10T10:00:00.000Z" },
  { id: "ctz-006", fullName: "Tigist Haile", phoneNumber: "+251986667788", role: UserRole.CITIZEN, status: UserStatus.ACTIVE, createdAt: "2024-04-20T09:00:00.000Z", updatedAt: "2024-06-15T10:00:00.000Z" },
  { id: "ctz-007", fullName: "Yonas Desta", phoneNumber: "+251987778899", role: UserRole.CITIZEN, status: UserStatus.ACTIVE, createdAt: "2024-05-01T08:00:00.000Z", updatedAt: "2024-06-20T10:00:00.000Z" },
  { id: "ctz-008", fullName: "Hana Mekonnen", phoneNumber: "+251988889900", role: UserRole.CITIZEN, status: UserStatus.ACTIVE, createdAt: "2024-05-05T07:30:00.000Z", updatedAt: "2024-06-25T10:00:00.000Z" },
  { id: "ctz-009", fullName: "Solomon Bekele", phoneNumber: "+251989990011", role: UserRole.CITIZEN, status: UserStatus.ACTIVE, createdAt: "2024-05-10T11:00:00.000Z", updatedAt: "2024-07-01T10:00:00.000Z" },
  { id: "ctz-010", fullName: "Rahel Tadesse", phoneNumber: "+251990001122", role: UserRole.CITIZEN, status: UserStatus.ACTIVE, createdAt: "2024-05-15T10:00:00.000Z", updatedAt: "2024-07-05T10:00:00.000Z" },
  { id: "ctz-011", fullName: "Samuel Teshome", phoneNumber: "+251991112233", role: UserRole.CITIZEN, status: UserStatus.ACTIVE, createdAt: "2024-05-20T09:30:00.000Z", updatedAt: "2024-07-10T10:00:00.000Z" },
  { id: "ctz-012", fullName: "Meron Alemayehu", phoneNumber: "+251992223344", role: UserRole.CITIZEN, status: UserStatus.ACTIVE, createdAt: "2024-06-01T08:00:00.000Z", updatedAt: "2024-07-12T10:00:00.000Z" },
  { id: "ctz-013", fullName: "Daniel Gebremedhin", phoneNumber: "+251993334455", role: UserRole.CITIZEN, status: UserStatus.ACTIVE, createdAt: "2024-06-05T07:00:00.000Z", updatedAt: "2024-07-13T10:00:00.000Z" },
  { id: "ctz-014", fullName: "Fatima Yussuf", phoneNumber: "+251994445566", role: UserRole.CITIZEN, status: UserStatus.ACTIVE, createdAt: "2024-06-10T12:00:00.000Z", updatedAt: "2024-07-14T10:00:00.000Z" },
  { id: "ctz-015", fullName: "Abebe Kebede", phoneNumber: "+251995556677", role: UserRole.CITIZEN, status: UserStatus.DISABLED, createdAt: "2024-03-15T08:00:00.000Z", updatedAt: "2024-05-20T10:00:00.000Z" },
  { id: "ctz-016", fullName: "Sara Tesfaye", phoneNumber: "+251996667788", role: UserRole.CITIZEN, status: UserStatus.ACTIVE, createdAt: "2024-06-15T09:00:00.000Z", updatedAt: "2024-07-15T10:00:00.000Z" },
  { id: "ctz-017", fullName: "Getachew Anwar", phoneNumber: "+251997778899", role: UserRole.CITIZEN, status: UserStatus.ACTIVE, createdAt: "2024-06-20T10:00:00.000Z", updatedAt: "2024-07-15T10:00:00.000Z" },
  { id: "ctz-018", fullName: "Almaz Zewde", phoneNumber: "+251998889900", role: UserRole.CITIZEN, status: UserStatus.ACTIVE, createdAt: "2024-06-25T08:30:00.000Z", updatedAt: "2024-07-15T10:00:00.000Z" },
  { id: "ctz-019", fullName: "Bereket Hailu", phoneNumber: "+251999990011", role: UserRole.CITIZEN, status: UserStatus.PENDING, createdAt: "2024-07-01T07:00:00.000Z", updatedAt: "2024-07-15T10:00:00.000Z" },
  { id: "ctz-020", fullName: "Hawaa Ibrahim", phoneNumber: "+251910001122", role: UserRole.CITIZEN, status: UserStatus.ACTIVE, createdAt: "2024-07-05T09:00:00.000Z", updatedAt: "2024-07-16T10:00:00.000Z" },
];

// ── Seed: Report Types ───────────────────────────────────────────────
const SEED_REPORT_TYPES = [
  { id: "rt-001", name: "Noise Pollution", description: "Excessive noise from construction, events, or commercial activities in residential or quiet zones.", isActive: true, residentialDecibelThreshold: 55, commercialDecibelThreshold: 70, requiresDecibel: true, requiresMedia: false },
  { id: "rt-002", name: "Littering", description: "Illegal dumping or littering in public spaces.", isActive: true, requiresDecibel: false, requiresMedia: true },
  { id: "rt-003", name: "Vandalism", description: "Destruction or damage to public or private property.", isActive: true, requiresDecibel: false, requiresMedia: true },
  { id: "rt-004", name: "Air Pollution", description: "Smoke, dust, or emissions contaminating the air.", isActive: true, requiresDecibel: false, requiresMedia: true },
  { id: "rt-005", name: "Water Pollution", description: "Contamination of water sources or drainage systems.", isActive: true, requiresDecibel: false, requiresMedia: true },
  { id: "rt-006", name: "Soil Contamination", description: "Hazardous substances contaminating soil.", isActive: true, requiresDecibel: false, requiresMedia: true },
  { id: "rt-007", name: "Illegal Dumping", description: "Unauthorized disposal of waste in non-designated areas.", isActive: true, requiresDecibel: false, requiresMedia: true },
  { id: "rt-008", name: "Deforestation", description: "Unauthorized cutting or burning of trees.", isActive: true, requiresDecibel: false, requiresMedia: true },
  { id: "rt-009", name: "Hazardous Waste", description: "Improper handling or disposal of hazardous materials.", isActive: true, requiresDecibel: false, requiresMedia: true },
  { id: "rt-010", name: "Wildlife Poaching", description: "Illegal hunting or capturing of wildlife.", isActive: true, requiresDecibel: false, requiresMedia: true },
  { id: "rt-011", name: "Others", description: "General environmental or peace concerns not covered above.", isActive: true, requiresDecibel: false, requiresMedia: false },
];

// ── Seed: Cameras ────────────────────────────────────────────────────
const SEED_CAMERAS = [
  { id: "cam-001", cameraId: "CAM-BLE-001", locationName: "Bole Road Junction", latitude: 9.0054, longitude: 38.7636, isActive: true, lastMaintenanceDate: "2024-05-20" },
  { id: "cam-002", cameraId: "CAM-ARA-002", locationName: "Arat Kilo Square", latitude: 9.0340, longitude: 38.7510, isActive: true, lastMaintenanceDate: "2024-06-01" },
  { id: "cam-003", cameraId: "CAM-MER-003", locationName: "Merkato Main Gate", latitude: 9.0185, longitude: 38.7450, isActive: false, lastMaintenanceDate: "2024-04-10" },
  { id: "cam-004", cameraId: "CAM-PIA-004", locationName: "Piazza Area", latitude: 9.0350, longitude: 38.7570, isActive: true, lastMaintenanceDate: "2024-06-05" },
  { id: "cam-005", cameraId: "CAM-YEK-005", locationName: "Yeka Sub-City Office", latitude: 9.0420, longitude: 38.7800, isActive: true, lastMaintenanceDate: "2024-06-10" },
  { id: "cam-006", cameraId: "CAM-KIR-006", locationName: "Kirkos Health Center", latitude: 9.0185, longitude: 38.7625, isActive: true, lastMaintenanceDate: "2024-06-15" },
  { id: "cam-007", cameraId: "CAM-LID-007", locationName: "Lideta Market Area", latitude: 9.0130, longitude: 38.7450, isActive: false, lastMaintenanceDate: "2024-03-20" },
  { id: "cam-008", cameraId: "CAM-AKK-008", locationName: "Akaki Industrial Zone", latitude: 8.9850, longitude: 38.7950, isActive: true, lastMaintenanceDate: "2024-06-20" },
  { id: "cam-009", cameraId: "CAM-GUL-009", locationName: "Gulele Bole Road", latitude: 9.0430, longitude: 38.7400, isActive: true, lastMaintenanceDate: "2024-06-25" },
  { id: "cam-010", cameraId: "CAM-KOL-010", locationName: "Kolfe Keranio Junction", latitude: 9.0250, longitude: 38.7200, isActive: true, lastMaintenanceDate: "2024-07-01" },
  { id: "cam-011", cameraId: "CAM-NIF-011", locationName: "Nifas Silk Lafto Roundabout", latitude: 9.0050, longitude: 38.7800, isActive: true, lastMaintenanceDate: "2024-07-05" },
  { id: "cam-012", cameraId: "CAM-ADD-012", locationName: "Addis Ketema Stadium", latitude: 9.0380, longitude: 38.7480, isActive: false, lastMaintenanceDate: "2024-04-15" },
];

// ── Seed: Reports ────────────────────────────────────────────────────
const REPORT_STATUSES = ["SUBMITTED", "UNDER_REVIEW", "ASSIGNED", "IN_PROGRESS", "RESOLVED", "CLOSED", "REJECTED"] as const;
const VIOLATION_TYPES = ["Noise Pollution", "Littering", "Vandalism", "Air Pollution", "Water Pollution", "Illegal Dumping", "Deforestation", "Hazardous Waste", "Others"];
const AREAS = ["Bole", "Arada", "Kirkos", "Yeka", "Addis Ketema", "Lideta", "Nifas Silk Lafto", "Kolfe Keranio", "Gulele", "Akaki Kality", "Lemi Kura"];
const PRIORITIES = ["High", "Medium", "Low"];

function d(daysAgo: number, hour = 10, minute = 0): string {
  const dt = new Date();
  dt.setDate(dt.getDate() - daysAgo);
  dt.setHours(hour, minute, 0, 0);
  return dt.toISOString();
}

const SEED_REPORTS = [
  { id: "rpt-001", caseId: "CASE-2024-0001", reportTypeId: "rt-001", violationType: "Noise Pollution", reportDescription: "Loud music from a nightclub on Bole Road disturbing residents past midnight.", address: "Bole Road, near Atlas Hotel", area: "Bole", latitude: 9.0054, longitude: 38.7636, status: "ASSIGNED", severity: "High", decibelLevel: 72, noiseAreaType: "Residential", noisePollutionStatus: "Pollution", isAnonymous: false, reporterPhoneNumber: "+251981112233", reporter: { id: "ctz-001", fullName: "Meron Girma", phoneNumber: "+251981112233" }, assignedPatrol: { id: "ptr-001", fullName: "Yamlak Fantahun", assignedArea: "Bole" }, createdAt: d(0, 14, 32), updatedAt: d(0, 14, 45), imageUrls: [], videoUrls: [], audioUrls: [], evidenceUrls: [], patrolImageUrls: [], patrolVideoUrls: [], patrolAudioUrls: [], patrolEvidenceUrls: [] },
  { id: "rpt-002", caseId: "CASE-2024-0002", reportTypeId: "rt-003", violationType: "Vandalism", reportDescription: "Graffiti on the walls of Arat Kilo public library.", address: "Arat Kilo Square, Arada Sub-City", area: "Arada", latitude: 9.0340, longitude: 38.7510, status: "IN_PROGRESS", severity: "Medium", isAnonymous: false, reporterPhoneNumber: "+251982223344", reporter: { id: "ctz-002", fullName: "Berhan Tesfaye", phoneNumber: "+251982223344" }, assignedPatrol: { id: "ptr-002", fullName: "Daniel Tadesse", assignedArea: "Arada" }, createdAt: d(0, 13, 15), updatedAt: d(0, 13, 30), imageUrls: [], videoUrls: [], audioUrls: [], evidenceUrls: [], patrolImageUrls: [], patrolVideoUrls: [], patrolAudioUrls: [], patrolEvidenceUrls: [] },
  { id: "rpt-003", caseId: "CASE-2024-0003", reportTypeId: "rt-002", violationType: "Littering", reportDescription: "Large pile of garbage left on Meskel Square after an event.", address: "Meskel Square", area: "Kirkos", latitude: 9.0185, longitude: 38.7625, status: "SUBMITTED", severity: "Medium", isAnonymous: true, reporter: null, assignedPatrol: null, createdAt: d(0, 11, 40), updatedAt: d(0, 11, 40), imageUrls: [], videoUrls: [], audioUrls: [], evidenceUrls: [], patrolImageUrls: [], patrolVideoUrls: [], patrolAudioUrls: [], patrolEvidenceUrls: [] },
  { id: "rpt-004", caseId: "CASE-2024-0004", reportTypeId: "rt-004", violationType: "Air Pollution", reportDescription: "Factory emitting thick black smoke in industrial area.", address: "CMC Road, Jemo", area: "Yeka", latitude: 9.0420, longitude: 38.7800, status: "RESOLVED", severity: "Low", isAnonymous: false, reporterPhoneNumber: "+251983334455", reporter: { id: "ctz-003", fullName: "Kidist Alemayehu", phoneNumber: "+251983334455" }, assignedPatrol: { id: "ptr-004", fullName: "Dawit Tesfaye", assignedArea: "Yeka" }, createdAt: d(0, 10, 22), updatedAt: d(1, 15, 0), imageUrls: [], videoUrls: [], audioUrls: [], evidenceUrls: [], patrolImageUrls: [], patrolVideoUrls: [], patrolAudioUrls: [], patrolEvidenceUrls: [] },
  { id: "rpt-005", caseId: "CASE-2024-0005", reportTypeId: "rt-005", violationType: "Water Pollution", reportDescription: "Chemical waste being dumped into the Little Akaki River.", address: "Mexico Square, Kirkos", area: "Kirkos", latitude: 9.0150, longitude: 38.7580, status: "UNDER_REVIEW", severity: "High", isAnonymous: false, reporterPhoneNumber: "+251984445566", reporter: { id: "ctz-004", fullName: "Abebech Worku", phoneNumber: "+251984445566" }, assignedPatrol: null, createdAt: d(0, 9, 5), updatedAt: d(0, 9, 15), imageUrls: [], videoUrls: [], audioUrls: [], evidenceUrls: [], patrolImageUrls: [], patrolVideoUrls: [], patrolAudioUrls: [], patrolEvidenceUrls: [] },
  { id: "rpt-006", caseId: "CASE-2024-0006", reportTypeId: "rt-001", violationType: "Noise Pollution", reportDescription: "Construction work starting before 6AM on weekdays.", address: "Bole Atlas Area", area: "Bole", latitude: 9.0080, longitude: 38.7700, status: "ASSIGNED", severity: "High", decibelLevel: 68, noiseAreaType: "Residential", noisePollutionStatus: "Pollution", isAnonymous: false, reporterPhoneNumber: "+251985556677", reporter: { id: "ctz-005", fullName: "Dawit Mulugeta", phoneNumber: "+251985556677" }, assignedPatrol: { id: "ptr-012", fullName: "Rahel Zewde", assignedArea: "Bole" }, createdAt: d(1, 8, 17), updatedAt: d(1, 8, 30), imageUrls: [], videoUrls: [], audioUrls: [], evidenceUrls: [], patrolImageUrls: [], patrolVideoUrls: [], patrolAudioUrls: [], patrolEvidenceUrls: [] },
  { id: "rpt-007", caseId: "CASE-2024-0007", reportTypeId: "rt-007", violationType: "Illegal Dumping", reportDescription: "Household waste dumped in an empty lot near Merkato.", address: "Merkato, Addis Ketema", area: "Addis Ketema", latitude: 9.0380, longitude: 38.7480, status: "IN_PROGRESS", severity: "Medium", isAnonymous: true, reporter: null, assignedPatrol: { id: "ptr-006", fullName: "Hanna Tadesse", assignedArea: "Addis Ketema" }, createdAt: d(1, 18, 45), updatedAt: d(1, 19, 0), imageUrls: [], videoUrls: [], audioUrls: [], evidenceUrls: [], patrolImageUrls: [], patrolVideoUrls: [], patrolAudioUrls: [], patrolEvidenceUrls: [] },
  { id: "rpt-008", caseId: "CASE-2024-0008", reportTypeId: "rt-009", violationType: "Hazardous Waste", reportDescription: "Medical waste found in a residential neighborhood.", address: "6 Kilo, near University", area: "Addis Ketema", latitude: 9.0350, longitude: 38.7460, status: "ASSIGNED", severity: "High", isAnonymous: false, reporterPhoneNumber: "+251986667788", reporter: { id: "ctz-006", fullName: "Tigist Haile", phoneNumber: "+251986667788" }, assignedPatrol: { id: "ptr-006", fullName: "Hanna Tadesse", assignedArea: "Addis Ketema" }, createdAt: d(1, 16, 30), updatedAt: d(1, 17, 0), imageUrls: [], videoUrls: [], audioUrls: [], evidenceUrls: [], patrolImageUrls: [], patrolVideoUrls: [], patrolAudioUrls: [], patrolEvidenceUrls: [] },
  { id: "rpt-009", caseId: "CASE-2024-0009", reportTypeId: "rt-001", violationType: "Noise Pollution", reportDescription: "Loud event at Meskel Square continuing past allowed hours.", address: "Meskel Square", area: "Kirkos", latitude: 9.0185, longitude: 38.7625, status: "CLOSED", severity: "Low", decibelLevel: 62, noiseAreaType: "Commercial", noisePollutionStatus: "Pollution", isAnonymous: false, reporterPhoneNumber: "+251987778899", reporter: { id: "ctz-007", fullName: "Yonas Desta", phoneNumber: "+251987778899" }, assignedPatrol: { id: "ptr-003", fullName: "Sara Mulugeta", assignedArea: "Kirkos" }, createdAt: d(1, 14, 12), updatedAt: d(3, 10, 0), imageUrls: [], videoUrls: [], audioUrls: [], evidenceUrls: [], patrolImageUrls: [], patrolVideoUrls: [], patrolAudioUrls: [], patrolEvidenceUrls: [] },
  { id: "rpt-010", caseId: "CASE-2024-0010", reportTypeId: "rt-006", violationType: "Soil Contamination", reportDescription: "Industrial chemicals leaking into soil near Kazanchis.", address: "Kazanchis Business District", area: "Kirkos", latitude: 9.0200, longitude: 38.7650, status: "CLOSED", severity: "Low", isAnonymous: false, reporterPhoneNumber: "+251988889900", reporter: { id: "ctz-008", fullName: "Hana Mekonnen", phoneNumber: "+251988889900" }, assignedPatrol: { id: "ptr-015", fullName: "Meron Girma", assignedArea: "Kirkos" }, createdAt: d(2, 11, 5), updatedAt: d(4, 14, 0), imageUrls: [], videoUrls: [], audioUrls: [], evidenceUrls: [], patrolImageUrls: [], patrolVideoUrls: [], patrolAudioUrls: [], patrolEvidenceUrls: [] },
  { id: "rpt-011", caseId: "CASE-2024-0011", reportTypeId: "rt-002", violationType: "Littering", reportDescription: "Trash accumulating around Kality station area.", address: "Kality, near Station", area: "Akaki Kality", latitude: 8.9850, longitude: 38.7950, status: "SUBMITTED", severity: "High", isAnonymous: false, reporterPhoneNumber: "+251989990011", reporter: { id: "ctz-009", fullName: "Solomon Bekele", phoneNumber: "+251989990011" }, assignedPatrol: null, createdAt: d(2, 10, 15), updatedAt: d(2, 10, 15), imageUrls: [], videoUrls: [], audioUrls: [], evidenceUrls: [], patrolImageUrls: [], patrolVideoUrls: [], patrolAudioUrls: [], patrolEvidenceUrls: [] },
  { id: "rpt-012", caseId: "CASE-2024-0012", reportTypeId: "rt-003", violationType: "Vandalism", reportDescription: "Bus stop signs vandalized across Mexico Square.", address: "Mexico Square", area: "Kirkos", latitude: 9.0150, longitude: 38.7580, status: "RESOLVED", severity: "Medium", isAnonymous: true, reporter: null, assignedPatrol: { id: "ptr-003", fullName: "Sara Mulugeta", assignedArea: "Kirkos" }, createdAt: d(2, 9, 30), updatedAt: d(4, 12, 0), imageUrls: [], videoUrls: [], audioUrls: [], evidenceUrls: [], patrolImageUrls: [], patrolVideoUrls: [], patrolAudioUrls: [], patrolEvidenceUrls: [] },
  { id: "rpt-013", caseId: "CASE-2024-0013", reportTypeId: "rt-004", violationType: "Air Pollution", reportDescription: "Open burning of trash near residential area causing smoke.", address: "Arat Kilo", area: "Arada", latitude: 9.0340, longitude: 38.7510, status: "IN_PROGRESS", severity: "Medium", isAnonymous: false, reporterPhoneNumber: "+251990001122", reporter: { id: "ctz-010", fullName: "Rahel Tadesse", phoneNumber: "+251990001122" }, assignedPatrol: { id: "ptr-002", fullName: "Daniel Tadesse", assignedArea: "Arada" }, createdAt: d(3, 15, 45), updatedAt: d(3, 16, 0), imageUrls: [], videoUrls: [], audioUrls: [], evidenceUrls: [], patrolImageUrls: [], patrolVideoUrls: [], patrolAudioUrls: [], patrolEvidenceUrls: [] },
  { id: "rpt-014", caseId: "CASE-2024-0014", reportTypeId: "rt-007", violationType: "Illegal Dumping", reportDescription: "Electronics waste dumped on the side of the road.", address: "Gulele Bole Road", area: "Gulele", latitude: 9.0430, longitude: 38.7400, status: "ASSIGNED", severity: "Medium", isAnonymous: false, reporterPhoneNumber: "+251991112233", reporter: { id: "ctz-011", fullName: "Samuel Teshome", phoneNumber: "+251991112233" }, assignedPatrol: { id: "ptr-009", fullName: "Alemayehu Bekele", assignedArea: "Gulele" }, createdAt: d(3, 13, 20), updatedAt: d(3, 14, 0), imageUrls: [], videoUrls: [], audioUrls: [], evidenceUrls: [], patrolImageUrls: [], patrolVideoUrls: [], patrolAudioUrls: [], patrolEvidenceUrls: [] },
  { id: "rpt-015", caseId: "CASE-2024-0015", reportTypeId: "rt-008", violationType: "Deforestation", reportDescription: "Unauthorized tree cutting in public park.", address: "Entoto Park, Yeka", area: "Yeka", latitude: 9.0600, longitude: 38.7700, status: "SUBMITTED", severity: "High", isAnonymous: true, reporter: null, assignedPatrol: null, createdAt: d(3, 11, 0), updatedAt: d(3, 11, 0), imageUrls: [], videoUrls: [], audioUrls: [], evidenceUrls: [], patrolImageUrls: [], patrolVideoUrls: [], patrolAudioUrls: [], patrolEvidenceUrls: [] },
  { id: "rpt-016", caseId: "CASE-2024-0016", reportTypeId: "rt-001", violationType: "Noise Pollution", reportDescription: "Church bells amplified beyond acceptable levels early morning.", address: "Piazza, Arada Sub-City", area: "Arada", latitude: 9.0350, longitude: 38.7570, status: "REJECTED", severity: "Low", decibelLevel: 42, noiseAreaType: "Residential", noisePollutionStatus: "Not Pollution", isAnonymous: false, reporterPhoneNumber: "+251992223344", reporter: { id: "ctz-012", fullName: "Meron Alemayehu", phoneNumber: "+251992223344" }, assignedPatrol: { id: "ptr-002", fullName: "Daniel Tadesse", assignedArea: "Arada" }, createdAt: d(4, 10, 0), updatedAt: d(5, 14, 0), imageUrls: [], videoUrls: [], audioUrls: [], evidenceUrls: [], patrolImageUrls: [], patrolVideoUrls: [], patrolAudioUrls: [], patrolEvidenceUrls: [] },
  { id: "rpt-017", caseId: "CASE-2024-0017", reportTypeId: "rt-005", violationType: "Water Pollution", reportDescription: "Sewage overflow into a residential area drainage.", address: "Nifas Silk Lafto", area: "Nifas Silk Lafto", latitude: 9.0050, longitude: 38.7800, status: "IN_PROGRESS", severity: "High", isAnonymous: false, reporterPhoneNumber: "+251993334455", reporter: { id: "ctz-013", fullName: "Daniel Gebremedhin", phoneNumber: "+251993334455" }, assignedPatrol: { id: "ptr-007", fullName: "Bereket Alemayehu", assignedArea: "Nifas Silk Lafto" }, createdAt: d(4, 8, 30), updatedAt: d(4, 9, 0), imageUrls: [], videoUrls: [], audioUrls: [], evidenceUrls: [], patrolImageUrls: [], patrolVideoUrls: [], patrolAudioUrls: [], patrolEvidenceUrls: [] },
  { id: "rpt-018", caseId: "CASE-2024-0018", reportTypeId: "rt-011", violationType: "Others", reportDescription: "Suspicious gathering near a government building.", address: "Kazanchis, Kirkos", area: "Kirkos", latitude: 9.0200, longitude: 38.7650, status: "ASSIGNED", severity: "High", isAnonymous: true, reporter: null, assignedPatrol: { id: "ptr-003", fullName: "Sara Mulugeta", assignedArea: "Kirkos" }, createdAt: d(4, 17, 0), updatedAt: d(4, 17, 30), imageUrls: [], videoUrls: [], audioUrls: [], evidenceUrls: [], patrolImageUrls: [], patrolVideoUrls: [], patrolAudioUrls: [], patrolEvidenceUrls: [] },
  { id: "rpt-019", caseId: "CASE-2024-0019", reportTypeId: "rt-002", violationType: "Littering", reportDescription: "Food waste scattered in Kolfe market area.", address: "Kolfe Keranio Market", area: "Kolfe Keranio", latitude: 9.0250, longitude: 38.7200, status: "SUBMITTED", severity: "Low", isAnonymous: false, reporterPhoneNumber: "+251994445566", reporter: { id: "ctz-014", fullName: "Fatima Yussuf", phoneNumber: "+251994445566" }, assignedPatrol: null, createdAt: d(5, 10, 0), updatedAt: d(5, 10, 0), imageUrls: [], videoUrls: [], audioUrls: [], evidenceUrls: [], patrolImageUrls: [], patrolVideoUrls: [], patrolAudioUrls: [], patrolEvidenceUrls: [] },
  { id: "rpt-020", caseId: "CASE-2024-0020", reportTypeId: "rt-003", violationType: "Vandalism", reportDescription: "Public property damaged after protest.", address: "Sidist Kilo, Arada", area: "Arada", latitude: 9.0370, longitude: 38.7540, status: "CLOSED", severity: "Low", isAnonymous: false, reporterPhoneNumber: "+251995556677", reporter: { id: "ctz-015", fullName: "Abebe Kebede", phoneNumber: "+251995556677" }, assignedPatrol: { id: "ptr-013", fullName: "Kidist Alemayehu", assignedArea: "Arada" }, createdAt: d(5, 8, 0), updatedAt: d(8, 10, 0), imageUrls: [], videoUrls: [], audioUrls: [], evidenceUrls: [], patrolImageUrls: [], patrolVideoUrls: [], patrolAudioUrls: [], patrolEvidenceUrls: [] },
  { id: "rpt-021", caseId: "CASE-2024-0021", reportTypeId: "rt-004", violationType: "Air Pollution", reportDescription: "Heavy vehicle exhaust near school zone.", address: "Bole Mikael, Bole", area: "Bole", latitude: 9.0100, longitude: 38.7680, status: "SUBMITTED", severity: "Medium", isAnonymous: true, reporter: null, assignedPatrol: null, createdAt: d(5, 14, 30), updatedAt: d(5, 14, 30), imageUrls: [], videoUrls: [], audioUrls: [], evidenceUrls: [], patrolImageUrls: [], patrolVideoUrls: [], patrolAudioUrls: [], patrolEvidenceUrls: [] },
  { id: "rpt-022", caseId: "CASE-2024-0022", reportTypeId: "rt-007", violationType: "Illegal Dumping", reportDescription: "Construction debris dumped in an empty lot.", address: "Lideta, near old stadium", area: "Lideta", latitude: 9.0130, longitude: 38.7450, status: "IN_PROGRESS", severity: "Medium", isAnonymous: false, reporterPhoneNumber: "+251996667788", reporter: { id: "ctz-016", fullName: "Sara Tesfaye", phoneNumber: "+251996667788" }, assignedPatrol: { id: "ptr-005", fullName: "Getachew Kebede", assignedArea: "Lideta" }, createdAt: d(6, 12, 0), updatedAt: d(6, 12, 30), imageUrls: [], videoUrls: [], audioUrls: [], evidenceUrls: [], patrolImageUrls: [], patrolVideoUrls: [], patrolAudioUrls: [], patrolEvidenceUrls: [] },
  { id: "rpt-023", caseId: "CASE-2024-0023", reportTypeId: "rt-009", violationType: "Hazardous Waste", reportDescription: "Chemical drums found abandoned near industrial zone.", address: "Akaki Industrial Zone", area: "Akaki Kality", latitude: 8.9900, longitude: 38.7900, status: "ASSIGNED", severity: "High", isAnonymous: false, reporterPhoneNumber: "+251997778899", reporter: { id: "ctz-017", fullName: "Getachew Anwar", phoneNumber: "+251997778899" }, assignedPatrol: { id: "ptr-010", fullName: "Meseret Worku", assignedArea: "Akaki Kality" }, createdAt: d(6, 9, 0), updatedAt: d(6, 9, 30), imageUrls: [], videoUrls: [], audioUrls: [], evidenceUrls: [], patrolImageUrls: [], patrolVideoUrls: [], patrolAudioUrls: [], patrolEvidenceUrls: [] },
  { id: "rpt-024", caseId: "CASE-2024-0024", reportTypeId: "rt-001", violationType: "Noise Pollution", reportDescription: "Night club extending operating hours, noise disturbing nearby residents.", address: "Bole Road, Edna Mall area", area: "Bole", latitude: 9.0070, longitude: 38.7650, status: "RESOLVED", severity: "Medium", decibelLevel: 58, noiseAreaType: "Commercial", noisePollutionStatus: "Pollution", isAnonymous: false, reporterPhoneNumber: "+251998889900", reporter: { id: "ctz-018", fullName: "Almaz Zewde", phoneNumber: "+251998889900" }, assignedPatrol: { id: "ptr-001", fullName: "Yamlak Fantahun", assignedArea: "Bole" }, createdAt: d(7, 22, 0), updatedAt: d(9, 10, 0), imageUrls: [], videoUrls: [], audioUrls: [], evidenceUrls: [], patrolImageUrls: [], patrolVideoUrls: [], patrolAudioUrls: [], patrolEvidenceUrls: [] },
  { id: "rpt-025", caseId: "CASE-2024-0025", reportTypeId: "rt-008", violationType: "Deforestation", reportDescription: "Unauthorized logging activity spotted near Entoto area.", address: "Entoto Natural Park", area: "Yeka", latitude: 9.0650, longitude: 38.7600, status: "UNDER_REVIEW", severity: "High", isAnonymous: true, reporter: null, assignedPatrol: null, createdAt: d(7, 8, 0), updatedAt: d(7, 8, 30), imageUrls: [], videoUrls: [], audioUrls: [], evidenceUrls: [], patrolImageUrls: [], patrolVideoUrls: [], patrolAudioUrls: [], patrolEvidenceUrls: [] },
  { id: "rpt-026", caseId: "CASE-2024-0026", reportTypeId: "rt-002", violationType: "Littering", reportDescription: "Overflowing public trash bins near school.", address: "Addis Ketema, near Tegla Primary", area: "Addis Ketema", latitude: 9.0360, longitude: 38.7500, status: "IN_PROGRESS", severity: "Low", isAnonymous: false, reporterPhoneNumber: "+251999990011", reporter: { id: "ctz-019", fullName: "Bereket Hailu", phoneNumber: "+251999990011" }, assignedPatrol: { id: "ptr-006", fullName: "Hanna Tadesse", assignedArea: "Addis Ketema" }, createdAt: d(8, 10, 0), updatedAt: d(8, 10, 30), imageUrls: [], videoUrls: [], audioUrls: [], evidenceUrls: [], patrolImageUrls: [], patrolVideoUrls: [], patrolAudioUrls: [], patrolEvidenceUrls: [] },
  { id: "rpt-027", caseId: "CASE-2024-0027", reportTypeId: "rt-005", violationType: "Water Pollution", reportDescription: "Oil spill near a gas station affecting drainage.", address: "CMC Road, Yeka", area: "Yeka", latitude: 9.0400, longitude: 38.7850, status: "CLOSED", severity: "Medium", isAnonymous: false, reporterPhoneNumber: "+251910001122", reporter: { id: "ctz-020", fullName: "Hawaa Ibrahim", phoneNumber: "+251910001122" }, assignedPatrol: { id: "ptr-004", fullName: "Dawit Tesfaye", assignedArea: "Yeka" }, createdAt: d(8, 15, 0), updatedAt: d(11, 10, 0), imageUrls: [], videoUrls: [], audioUrls: [], evidenceUrls: [], patrolImageUrls: [], patrolVideoUrls: [], patrolAudioUrls: [], patrolEvidenceUrls: [] },
  { id: "rpt-028", caseId: "CASE-2024-0028", reportTypeId: "rt-003", violationType: "Vandalism", reportDescription: "Public phone booths damaged on multiple streets.", address: "Piazza area, Arada", area: "Arada", latitude: 9.0350, longitude: 38.7570, status: "SUBMITTED", severity: "Low", isAnonymous: true, reporter: null, assignedPatrol: null, createdAt: d(9, 11, 0), updatedAt: d(9, 11, 0), imageUrls: [], videoUrls: [], audioUrls: [], evidenceUrls: [], patrolImageUrls: [], patrolVideoUrls: [], patrolAudioUrls: [], patrolEvidenceUrls: [] },
  { id: "rpt-029", caseId: "CASE-2024-0029", reportTypeId: "rt-011", violationType: "Others", reportDescription: "Unauthorized street vending creating traffic obstruction.", address: "Mexico Square, Kirkos", area: "Kirkos", latitude: 9.0150, longitude: 38.7580, status: "ASSIGNED", severity: "Low", isAnonymous: false, reporterPhoneNumber: "+251981112233", reporter: { id: "ctz-001", fullName: "Meron Girma", phoneNumber: "+251981112233" }, assignedPatrol: { id: "ptr-003", fullName: "Sara Mulugeta", assignedArea: "Kirkos" }, createdAt: d(9, 16, 0), updatedAt: d(9, 16, 30), imageUrls: [], videoUrls: [], audioUrls: [], evidenceUrls: [], patrolImageUrls: [], patrolVideoUrls: [], patrolAudioUrls: [], patrolEvidenceUrls: [] },
  { id: "rpt-030", caseId: "CASE-2024-0030", reportTypeId: "rt-004", violationType: "Air Pollution", reportDescription: "Dust from construction site affecting nearby homes.", address: "Bole Area, near Gebeta Lebash", area: "Bole", latitude: 9.0060, longitude: 38.7640, status: "IN_PROGRESS", severity: "Medium", isAnonymous: false, reporterPhoneNumber: "+251982223344", reporter: { id: "ctz-002", fullName: "Berhan Tesfaye", phoneNumber: "+251982223344" }, assignedPatrol: { id: "ptr-001", fullName: "Yamlak Fantahun", assignedArea: "Bole" }, createdAt: d(10, 9, 0), updatedAt: d(10, 9, 30), imageUrls: [], videoUrls: [], audioUrls: [], evidenceUrls: [], patrolImageUrls: [], patrolVideoUrls: [], patrolAudioUrls: [], patrolEvidenceUrls: [] },
  { id: "rpt-031", caseId: "CASE-2024-0031", reportTypeId: "rt-007", violationType: "Illegal Dumping", reportDescription: "Dead animal carcass dumped near river bank.", address: "Little Akaki River, Akaki", area: "Akaki Kality", latitude: 8.9880, longitude: 38.7930, status: "CLOSED", severity: "High", isAnonymous: false, reporterPhoneNumber: "+251983334455", reporter: { id: "ctz-003", fullName: "Kidist Alemayehu", phoneNumber: "+251983334455" }, assignedPatrol: { id: "ptr-010", fullName: "Meseret Worku", assignedArea: "Akaki Kality" }, createdAt: d(10, 8, 0), updatedAt: d(13, 10, 0), imageUrls: [], videoUrls: [], audioUrls: [], evidenceUrls: [], patrolImageUrls: [], patrolVideoUrls: [], patrolAudioUrls: [], patrolEvidenceUrls: [] },
  { id: "rpt-032", caseId: "CASE-2024-0032", reportTypeId: "rt-009", violationType: "Hazardous Waste", reportDescription: "Expired pharmaceutical products found discarded in open area.", address: "Lideta Health Post Area", area: "Lideta", latitude: 9.0140, longitude: 38.7460, status: "REJECTED", severity: "Medium", isAnonymous: true, reporter: null, assignedPatrol: { id: "ptr-005", fullName: "Getachew Kebede", assignedArea: "Lideta" }, createdAt: d(11, 10, 0), updatedAt: d(12, 14, 0), imageUrls: [], videoUrls: [], audioUrls: [], evidenceUrls: [], patrolImageUrls: [], patrolVideoUrls: [], patrolAudioUrls: [], patrolEvidenceUrls: [] },
  { id: "rpt-033", caseId: "CASE-2024-0033", reportTypeId: "rt-001", violationType: "Noise Pollution", reportDescription: "Factory machinery operating at excessive volume during night shift.", address: "Akaki Industrial Zone", area: "Akaki Kality", latitude: 8.9870, longitude: 38.7960, status: "SUBMITTED", severity: "High", decibelLevel: 75, noiseAreaType: "Residential", noisePollutionStatus: "Pollution", isAnonymous: false, reporterPhoneNumber: "+251984445566", reporter: { id: "ctz-004", fullName: "Abebech Worku", phoneNumber: "+251984445566" }, assignedPatrol: null, createdAt: d(11, 23, 0), updatedAt: d(11, 23, 0), imageUrls: [], videoUrls: [], audioUrls: [], evidenceUrls: [], patrolImageUrls: [], patrolVideoUrls: [], patrolAudioUrls: [], patrolEvidenceUrls: [] },
  { id: "rpt-034", caseId: "CASE-2024-0034", reportTypeId: "rt-002", violationType: "Littering", reportDescription: "Plastic waste scattered across park grounds.", address: "Unity Park, Arada", area: "Arada", latitude: 9.0360, longitude: 38.7530, status: "RESOLVED", severity: "Low", isAnonymous: false, reporterPhoneNumber: "+251985556677", reporter: { id: "ctz-005", fullName: "Dawit Mulugeta", phoneNumber: "+251985556677" }, assignedPatrol: { id: "ptr-013", fullName: "Kidist Alemayehu", assignedArea: "Arada" }, createdAt: d(12, 10, 0), updatedAt: d(14, 10, 0), imageUrls: [], videoUrls: [], audioUrls: [], evidenceUrls: [], patrolImageUrls: [], patrolVideoUrls: [], patrolAudioUrls: [], patrolEvidenceUrls: [] },
  { id: "rpt-035", caseId: "CASE-2024-0035", reportTypeId: "rt-005", violationType: "Water Pollution", reportDescription: "Illegal pipe connection dumping waste water into public drain.", address: "Nifas Silk Lafto, Behind Mall", area: "Nifas Silk Lafto", latitude: 9.0060, longitude: 38.7790, status: "ASSIGNED", severity: "Medium", isAnonymous: true, reporter: null, assignedPatrol: { id: "ptr-007", fullName: "Bereket Alemayehu", assignedArea: "Nifas Silk Lafto" }, createdAt: d(13, 8, 0), updatedAt: d(13, 8, 30), imageUrls: [], videoUrls: [], audioUrls: [], evidenceUrls: [], patrolImageUrls: [], patrolVideoUrls: [], patrolAudioUrls: [], patrolEvidenceUrls: [] },
  { id: "rpt-036", caseId: "CASE-2024-0036", reportTypeId: "rt-003", violationType: "Vandalism", reportDescription: "Damaged traffic lights at major intersection.", address: "Bole Road, Edna Mall Junction", area: "Bole", latitude: 9.0075, longitude: 38.7660, status: "IN_PROGRESS", severity: "High", isAnonymous: false, reporterPhoneNumber: "+251986667788", reporter: { id: "ctz-006", fullName: "Tigist Haile", phoneNumber: "+251986667788" }, assignedPatrol: { id: "ptr-012", fullName: "Rahel Zewde", assignedArea: "Bole" }, createdAt: d(14, 15, 0), updatedAt: d(14, 15, 30), imageUrls: [], videoUrls: [], audioUrls: [], evidenceUrls: [], patrolImageUrls: [], patrolVideoUrls: [], patrolAudioUrls: [], patrolEvidenceUrls: [] },
  { id: "rpt-037", caseId: "CASE-2024-0037", reportTypeId: "rt-004", violationType: "Air Pollution", reportDescription: "Heavy smoke from open burning of rubber waste.", address: "Kolfe Keranio, Industrial Area", area: "Kolfe Keranio", latitude: 9.0240, longitude: 38.7210, status: "CLOSED", severity: "Medium", isAnonymous: true, reporter: null, assignedPatrol: { id: "ptr-008", fullName: "Tigist Gebremedhin", assignedArea: "Kolfe Keranio" }, createdAt: d(15, 10, 0), updatedAt: d(18, 10, 0), imageUrls: [], videoUrls: [], audioUrls: [], evidenceUrls: [], patrolImageUrls: [], patrolVideoUrls: [], patrolAudioUrls: [], patrolEvidenceUrls: [] },
  { id: "rpt-038", caseId: "CASE-2024-0038", reportTypeId: "rt-008", violationType: "Deforestation", reportDescription: "Illegal clearing of green space for construction.", address: "Gulele area, near Entoto Road", area: "Gulele", latitude: 9.0440, longitude: 38.7390, status: "ASSIGNED", severity: "High", isAnonymous: false, reporterPhoneNumber: "+251987778899", reporter: { id: "ctz-007", fullName: "Yonas Desta", phoneNumber: "+251987778899" }, assignedPatrol: { id: "ptr-009", fullName: "Alemayehu Bekele", assignedArea: "Gulele" }, createdAt: d(15, 9, 0), updatedAt: d(15, 9, 30), imageUrls: [], videoUrls: [], audioUrls: [], evidenceUrls: [], patrolImageUrls: [], patrolVideoUrls: [], patrolAudioUrls: [], patrolEvidenceUrls: [] },
  { id: "rpt-039", caseId: "CASE-2024-0039", reportTypeId: "rt-011", violationType: "Others", reportDescription: "Abandoned vehicle blocking pedestrian walkway.", address: "Arat Kilo, Arada", area: "Arada", latitude: 9.0345, longitude: 38.7515, status: "SUBMITTED", severity: "Low", isAnonymous: false, reporterPhoneNumber: "+251988889900", reporter: { id: "ctz-008", fullName: "Hana Mekonnen", phoneNumber: "+251988889900" }, assignedPatrol: null, createdAt: d(16, 12, 0), updatedAt: d(16, 12, 0), imageUrls: [], videoUrls: [], audioUrls: [], evidenceUrls: [], patrolImageUrls: [], patrolVideoUrls: [], patrolAudioUrls: [], patrolEvidenceUrls: [] },
  { id: "rpt-040", caseId: "CASE-2024-0040", reportTypeId: "rt-006", violationType: "Soil Contamination", reportDescription: "Pesticide spill from agricultural facility affecting nearby homes.", address: "Lemi Kura, Farm Area", area: "Lemi Kura", latitude: 9.0500, longitude: 38.7850, status: "IN_PROGRESS", severity: "High", isAnonymous: false, reporterPhoneNumber: "+251989990011", reporter: { id: "ctz-009", fullName: "Solomon Bekele", phoneNumber: "+251989990011" }, assignedPatrol: { id: "ptr-011", fullName: "Solomon Teshome", assignedArea: "Lemi Kura" }, createdAt: d(17, 8, 0), updatedAt: d(17, 8, 30), imageUrls: [], videoUrls: [], audioUrls: [], evidenceUrls: [], patrolImageUrls: [], patrolVideoUrls: [], patrolAudioUrls: [], patrolEvidenceUrls: [] },
  { id: "rpt-041", caseId: "CASE-2024-0041", reportTypeId: "rt-002", violationType: "Littering", reportDescription: "Construction waste dumped on public road.", address: "Bole Road Extension", area: "Bole", latitude: 9.0040, longitude: 38.7750, status: "SUBMITTED", severity: "Medium", isAnonymous: true, reporter: null, assignedPatrol: null, createdAt: d(18, 10, 0), updatedAt: d(18, 10, 0), imageUrls: [], videoUrls: [], audioUrls: [], evidenceUrls: [], patrolImageUrls: [], patrolVideoUrls: [], patrolAudioUrls: [], patrolEvidenceUrls: [] },
  { id: "rpt-042", caseId: "CASE-2024-0042", reportTypeId: "rt-001", violationType: "Noise Pollution", reportDescription: "Mosque loudspeaker volume excessive during early morning call.", address: "Merkato, Addis Ketema", area: "Addis Ketema", latitude: 9.0375, longitude: 38.7475, status: "RESOLVED", severity: "Low", decibelLevel: 48, noiseAreaType: "Residential", noisePollutionStatus: "Pollution", isAnonymous: false, reporterPhoneNumber: "+251990001122", reporter: { id: "ctz-010", fullName: "Rahel Tadesse", phoneNumber: "+251990001122" }, assignedPatrol: { id: "ptr-006", fullName: "Hanna Tadesse", assignedArea: "Addis Ketema" }, createdAt: d(19, 5, 30), updatedAt: d(21, 10, 0), imageUrls: [], videoUrls: [], audioUrls: [], evidenceUrls: [], patrolImageUrls: [], patrolVideoUrls: [], patrolAudioUrls: [], patrolEvidenceUrls: [] },
  { id: "rpt-043", caseId: "CASE-2024-0043", reportTypeId: "rt-007", violationType: "Illegal Dumping", reportDescription: "Tire waste piled up in vacant lot.", address: "Lideta, near Shiro Meda", area: "Lideta", latitude: 9.0135, longitude: 38.7455, status: "CLOSED", severity: "Medium", isAnonymous: true, reporter: null, assignedPatrol: { id: "ptr-005", fullName: "Getachew Kebede", assignedArea: "Lideta" }, createdAt: d(20, 10, 0), updatedAt: d(23, 10, 0), imageUrls: [], videoUrls: [], audioUrls: [], evidenceUrls: [], patrolImageUrls: [], patrolVideoUrls: [], patrolAudioUrls: [], patrolEvidenceUrls: [] },
  { id: "rpt-044", caseId: "CASE-2024-0044", reportTypeId: "rt-005", violationType: "Water Pollution", reportDescription: "Dye waste from textile factory discharged into stream.", address: "Akaki River, Akaki", area: "Akaki Kality", latitude: 8.9860, longitude: 38.7940, status: "ASSIGNED", severity: "High", isAnonymous: false, reporterPhoneNumber: "+251991112233", reporter: { id: "ctz-011", fullName: "Samuel Teshome", phoneNumber: "+251991112233" }, assignedPatrol: { id: "ptr-010", fullName: "Meseret Worku", assignedArea: "Akaki Kality" }, createdAt: d(21, 8, 0), updatedAt: d(21, 8, 30), imageUrls: [], videoUrls: [], audioUrls: [], evidenceUrls: [], patrolImageUrls: [], patrolVideoUrls: [], patrolAudioUrls: [], patrolEvidenceUrls: [] },
  { id: "rpt-045", caseId: "CASE-2024-0045", reportTypeId: "rt-003", violationType: "Vandalism", reportDescription: "Public bench and park amenities destroyed.", address: "Bole Community Park", area: "Bole", latitude: 9.0090, longitude: 38.7670, status: "CLOSED", severity: "Low", isAnonymous: false, reporterPhoneNumber: "+251992223344", reporter: { id: "ctz-012", fullName: "Meron Alemayehu", phoneNumber: "+251992223344" }, assignedPatrol: { id: "ptr-001", fullName: "Yamlak Fantahun", assignedArea: "Bole" }, createdAt: d(22, 14, 0), updatedAt: d(25, 10, 0), imageUrls: [], videoUrls: [], audioUrls: [], evidenceUrls: [], patrolImageUrls: [], patrolVideoUrls: [], patrolAudioUrls: [], patrolEvidenceUrls: [] },
  { id: "rpt-046", caseId: "CASE-2024-0046", reportTypeId: "rt-004", violationType: "Air Pollution", reportDescription: "Cement factory producing excessive dust without filtration.", address: "Akaki Kality, Industrial Zone", area: "Akaki Kality", latitude: 8.9890, longitude: 38.7920, status: "IN_PROGRESS", severity: "High", isAnonymous: false, reporterPhoneNumber: "+251993334455", reporter: { id: "ctz-013", fullName: "Daniel Gebremedhin", phoneNumber: "+251993334455" }, assignedPatrol: { id: "ptr-010", fullName: "Meseret Worku", assignedArea: "Akaki Kality" }, createdAt: d(23, 9, 0), updatedAt: d(23, 9, 30), imageUrls: [], videoUrls: [], audioUrls: [], evidenceUrls: [], patrolImageUrls: [], patrolVideoUrls: [], patrolAudioUrls: [], patrolEvidenceUrls: [] },
  { id: "rpt-047", caseId: "CASE-2024-0047", reportTypeId: "rt-009", violationType: "Hazardous Waste", reportDescription: "Battery acid containers found leaking near school.", address: "Kolfe Keranio, Near School", area: "Kolfe Keranio", latitude: 9.0260, longitude: 38.7190, status: "SUBMITTED", severity: "High", isAnonymous: true, reporter: null, assignedPatrol: null, createdAt: d(24, 11, 0), updatedAt: d(24, 11, 0), imageUrls: [], videoUrls: [], audioUrls: [], evidenceUrls: [], patrolImageUrls: [], patrolVideoUrls: [], patrolAudioUrls: [], patrolEvidenceUrls: [] },
  { id: "rpt-048", caseId: "CASE-2024-0048", reportTypeId: "rt-011", violationType: "Others", reportDescription: "Stray animals causing disturbance in residential area.", address: "Gulele, residential area", area: "Gulele", latitude: 9.0425, longitude: 38.7405, status: "CLOSED", severity: "Low", isAnonymous: false, reporterPhoneNumber: "+251994445566", reporter: { id: "ctz-014", fullName: "Fatima Yussuf", phoneNumber: "+251994445566" }, assignedPatrol: { id: "ptr-009", fullName: "Alemayehu Bekele", assignedArea: "Gulele" }, createdAt: d(25, 10, 0), updatedAt: d(28, 10, 0), imageUrls: [], videoUrls: [], audioUrls: [], evidenceUrls: [], patrolImageUrls: [], patrolVideoUrls: [], patrolAudioUrls: [], patrolEvidenceUrls: [] },
  { id: "rpt-049", caseId: "CASE-2024-0049", reportTypeId: "rt-006", violationType: "Soil Contamination", reportDescription: "Heavy metals found in soil near factory waste area.", address: "Kirkos, Industrial Sub-area", area: "Kirkos", latitude: 9.0195, longitude: 38.7635, status: "RESOLVED", severity: "High", isAnonymous: false, reporterPhoneNumber: "+251995556677", reporter: { id: "ctz-015", fullName: "Abebe Kebede", phoneNumber: "+251995556677" }, assignedPatrol: { id: "ptr-015", fullName: "Meron Girma", assignedArea: "Kirkos" }, createdAt: d(26, 8, 0), updatedAt: d(30, 10, 0), imageUrls: [], videoUrls: [], audioUrls: [], evidenceUrls: [], patrolImageUrls: [], patrolVideoUrls: [], patrolAudioUrls: [], patrolEvidenceUrls: [] },
  { id: "rpt-050", caseId: "CASE-2024-0050", reportTypeId: "rt-002", violationType: "Littering", reportDescription: "Event organizers left massive amounts of trash after concert.", address: "Meskel Square, Kirkos", area: "Kirkos", latitude: 9.0185, longitude: 38.7625, status: "UNDER_REVIEW", severity: "Medium", isAnonymous: false, reporterPhoneNumber: "+251996667788", reporter: { id: "ctz-016", fullName: "Sara Tesfaye", phoneNumber: "+251996667788" }, assignedPatrol: null, createdAt: d(27, 8, 0), updatedAt: d(27, 8, 30), imageUrls: [], videoUrls: [], audioUrls: [], evidenceUrls: [], patrolImageUrls: [], patrolVideoUrls: [], patrolAudioUrls: [], patrolEvidenceUrls: [] },
];

// ── Seed: Notifications ──────────────────────────────────────────────
const SEED_NOTIFICATIONS = [
  { id: "ntf-001", title: "New Report Submitted", message: "Noise Pollution report filed in Bole area.", type: "REPORT_SUBMITTED", createdAt: new Date(Date.now() - 300000).toISOString(), read: false },
  { id: "ntf-002", title: "Report Assigned", message: "Report RPT-2024-1247 assigned to Officer Yamlak.", type: "REPORT_ASSIGNED", createdAt: new Date(Date.now() - 600000).toISOString(), read: false },
  { id: "ntf-003", title: "Report Resolved", message: "CMC Road air pollution case has been resolved.", type: "REPORT_RESOLVED", createdAt: new Date(Date.now() - 900000).toISOString(), read: true },
  { id: "ntf-004", title: "New Citizen Registration", message: "Hawaa Ibrahim registered as a new citizen.", type: "SYSTEM", createdAt: new Date(Date.now() - 1200000).toISOString(), read: false },
  { id: "ntf-005", title: "Alert: High Priority", message: "Hazardous waste detected near Kazanchis.", type: "REPORT_SUBMITTED", createdAt: new Date(Date.now() - 1800000).toISOString(), read: true },
  { id: "ntf-006", title: "Patrol Update", message: "Officer Sara completed follow-up at Meskel Square.", type: "REPORT_ASSIGNED", createdAt: new Date(Date.now() - 3600000).toISOString(), read: true },
  { id: "ntf-007", title: "Camera Offline", message: "CAM-MER-003 at Merkato Main Gate is offline.", type: "SYSTEM", createdAt: new Date(Date.now() - 7200000).toISOString(), read: false },
  { id: "ntf-008", title: "Report Escalated", message: "Water pollution case escalated to investigation unit.", type: "REPORT_ASSIGNED", createdAt: new Date(Date.now() - 10800000).toISOString(), read: true },
  { id: "ntf-009", title: "New Report Submitted", message: "Littering report in Kolfe Keranio market area.", type: "REPORT_SUBMITTED", createdAt: new Date(Date.now() - 14400000).toISOString(), read: false },
  { id: "ntf-010", title: "Status Updated", message: "Vandalism report in Piazza moved to Under Review.", type: "REPORT_ASSIGNED", createdAt: new Date(Date.now() - 18000000).toISOString(), read: true },
  { id: "ntf-011", title: "Officer Duty Change", message: "Officer Daniel Tadesse is now on night shift.", type: "SYSTEM", createdAt: new Date(Date.now() - 21600000).toISOString(), read: true },
  { id: "ntf-012", title: "Report Closed", message: "Noise pollution case in Bole Road closed successfully.", type: "REPORT_RESOLVED", createdAt: new Date(Date.now() - 43200000).toISOString(), read: true },
  { id: "ntf-013", title: "Weekly Summary", message: "34 reports submitted this week. 12 resolved.", type: "SYSTEM", createdAt: new Date(Date.now() - 86400000).toISOString(), read: true },
  { id: "ntf-014", title: "Camera Maintenance", message: "Scheduled maintenance for CAM-PIA-004 completed.", type: "SYSTEM", createdAt: new Date(Date.now() - 172800000).toISOString(), read: true },
  { id: "ntf-015", title: "Alert: Illegal Dumping", message: "Large-scale illegal dumping reported near Akaki river.", type: "REPORT_SUBMITTED", createdAt: new Date(Date.now() - 259200000).toISOString(), read: true },
];

// ── Keys ─────────────────────────────────────────────────────────────
const KEYS = {
  users: "pas_mock_users",
  patrols: "pas_mock_patrols",
  citizens: "pas_mock_citizens",
  reportTypes: "pas_mock_report_types",
  cameras: "pas_mock_cameras",
  reports: "pas_mock_reports",
  notifications: "pas_mock_notifications",
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

// ── Public API: Users ───────────────────────────────────────────────
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
  findByCredentials: (identifier: string, password: string) => {
    const items = getAll<any>(KEYS.users, SEED_USERS);
    return items.find((u) => {
      const idMatch = (u.email === identifier || u.phoneNumber === identifier);
      const passMatch = u.password === password;
      return idMatch && passMatch;
    });
  },
};

// ── Public API: Patrols ─────────────────────────────────────────────
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

// ── Public API: Citizens ────────────────────────────────────────────
export const mockCitizens = {
  getAll: () => getAll<any>(KEYS.citizens, SEED_CITIZENS),
  getById: (id: string) => getById<any>(KEYS.citizens, id),
  create: (data: any) => create<any>(KEYS.citizens, SEED_CITIZENS, data),
  update: (id: string, patch: any) => update<any>(KEYS.citizens, SEED_CITIZENS, id, patch),
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

// ── Public API: Report Types ────────────────────────────────────────
export const mockReportTypes = {
  getAll: (searchTerm?: string) => {
    let items = getAll<any>(KEYS.reportTypes, SEED_REPORT_TYPES);
    if (searchTerm) items = search(items, searchTerm, ["name", "description"]);
    return { data: items, total: items.length };
  },
  getById: (id: string) => getById<any>(KEYS.reportTypes, id),
  create: (data: any) => create<any>(KEYS.reportTypes, SEED_REPORT_TYPES, data),
  update: (id: string, patch: any) => update<any>(KEYS.reportTypes, SEED_REPORT_TYPES, id, patch),
  delete: (id: string) => remove<any>(KEYS.reportTypes, SEED_REPORT_TYPES, id),
};

// ── Public API: Cameras ─────────────────────────────────────────────
export const mockCameras = {
  getAll: () => ({ data: getAll<any>(KEYS.cameras, SEED_CAMERAS), total: getAll<any>(KEYS.cameras, SEED_CAMERAS).length }),
  getById: (id: string) => getById<any>(KEYS.cameras, id),
  create: (data: any) => create<any>(KEYS.cameras, SEED_CAMERAS, data),
  update: (id: string, patch: any) => update<any>(KEYS.cameras, SEED_CAMERAS, id, patch),
  delete: (id: string) => remove<any>(KEYS.cameras, SEED_CAMERAS, id),
};

// ── Public API: Reports ─────────────────────────────────────────────
export const mockReports = {
  getAll: () => getAll<any>(KEYS.reports, SEED_REPORTS),
  getById: (id: string) => getById<any>(KEYS.reports, id),
  create: (data: any) => create<any>(KEYS.reports, SEED_REPORTS, data),
  update: (id: string, patch: any) => update<any>(KEYS.reports, SEED_REPORTS, id, patch),
  delete: (id: string) => remove<any>(KEYS.reports, SEED_REPORTS, id),
  getHistory: (id: string) => {
    const report = getById<any>(KEYS.reports, id);
    if (!report) return [];
    return [
      { status: "SUBMITTED", notes: "Report filed by citizen", createdAt: report.createdAt },
      ...(report.status !== "SUBMITTED" ? [{ status: report.status, notes: `Status updated to ${report.status}`, createdAt: report.updatedAt }] : []),
    ];
  },
  query: (params: { page?: number; limit?: number; search?: string; status?: string; severity?: string }) => {
    let items = getAll<any>(KEYS.reports, SEED_REPORTS);
    if (params.search) items = search(items, params.search, ["violationType", "address", "area", "caseId"]);
    if (params.status) items = items.filter((r) => r.status === params.status);
    if (params.severity) items = items.filter((r) => r.severity === params.severity);
    items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return paginate(items, params.page || 1, params.limit || 10);
  },
};

// ── Public API: Notifications ───────────────────────────────────────
export const mockNotifications = {
  getAll: () => getAll<any>(KEYS.notifications, SEED_NOTIFICATIONS),
  create: (data: any) => create<any>(KEYS.notifications, SEED_NOTIFICATIONS, data),
  markAsRead: (id: string) => {
    const items = getAll<any>(KEYS.notifications, SEED_NOTIFICATIONS);
    const idx = items.findIndex((i) => i.id === id);
    if (idx === -1) return;
    items[idx].read = true;
    save(KEYS.notifications, items);
  },
  markAllRead: () => {
    const items = getAll<any>(KEYS.notifications, SEED_NOTIFICATIONS);
    items.forEach((i) => { i.read = true; });
    save(KEYS.notifications, items);
  },
  clearAll: () => {
    save(KEYS.notifications, []);
  },
};

// ── Public API: Dashboard ───────────────────────────────────────────
export const mockDashboard = {
  getStats: () => {
    const reports = getAll<any>(KEYS.reports, SEED_REPORTS);
    const patrols = getAll<any>(KEYS.patrols, SEED_PATROLS);
    const citizens = getAll<any>(KEYS.citizens, SEED_CITIZENS);
    const admins = getAll<any>(KEYS.users, SEED_USERS);
    const cameras = getAll<any>(KEYS.cameras, SEED_CAMERAS);

    const byType: Record<string, number> = {};
    const byStatus: Record<string, number> = {};
    reports.forEach((r) => {
      byType[r.violationType || "Unknown"] = (byType[r.violationType || "Unknown"] || 0) + 1;
      byStatus[r.status || "Unknown"] = (byStatus[r.status || "Unknown"] || 0) + 1;
    });

    return {
      reports: {
        total: reports.length,
        resolved: reports.filter((r) => r.status === "RESOLVED" || r.status === "CLOSED").length,
        pending: reports.filter((r) => r.status === "SUBMITTED" || r.status === "UNDER_REVIEW").length,
        byType: Object.entries(byType).map(([name, count]) => ({ name, count })),
        byStatus: Object.entries(byStatus).map(([status, count]) => ({ status, count })),
        trend: Array.from({ length: 30 }, (_, i) => ({
          date: new Date(Date.now() - (29 - i) * 86400000).toISOString().split("T")[0],
          count: Math.floor(Math.random() * 5) + 1,
        })),
      },
      users: {
        citizens: citizens.length,
        patrols: patrols.length,
        admins: admins.filter((u) => u.isStaffUser).length,
      },
      cameras: {
        total: cameras.length,
        active: cameras.filter((c) => c.isActive).length,
      },
      reportTypes: getAll<any>(KEYS.reportTypes, SEED_REPORT_TYPES).length,
    };
  },
  getFleetLocations: () => {
    const patrols = getAll<any>(KEYS.patrols, SEED_PATROLS).filter((p) => p.latitude && p.longitude && p.status === UserStatus.ACTIVE);
    const citizens = getAll<any>(KEYS.citizens, SEED_CITIZENS).slice(0, 5).map((c, i) => ({
      ...c,
      latitude: 9.005 + (i * 0.008),
      longitude: 38.75 + (i * 0.005),
    }));
    const reports = getAll<any>(KEYS.reports, SEED_REPORTS).filter((r) => r.latitude && r.longitude && r.status !== "CLOSED" && r.status !== "RESOLVED").slice(0, 10);
    return { data: { patrols, citizens, reports }, success: true };
  },
};

// ── Reset (for dev) ─────────────────────────────────────────────────
export function resetMockStore() {
  Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
}
