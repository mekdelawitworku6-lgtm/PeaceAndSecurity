const baseTime = Date.now();
const ago = (days: number, hours = 0) =>
    new Date(baseTime - days * 86400000 - hours * 3600000).toISOString();
const avatar = (name: string) =>
    `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`;
const photo = (seed: string) => `https://picsum.photos/seed/${seed}/640/480`;
const audio = (n: number) =>
    `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-${((n - 1) % 17) + 1}.mp3`;
const video = (n: number) => {
    const names = [
        "BigBuckBunny",
        "ElephantsDream",
        "ForBiggerBlazes",
        "ForBiggerEscapes",
        "ForBiggerFun",
        "ForBiggerJoyrides",
        "ForBiggerMeltdowns",
        "Sintel",
    ];
    return `https://storage.googleapis.com/gtv-videos-bucket/sample/${names[(n - 1) % names.length]}.mp4`;
};

export const demoSettings = {
    bureauName: "Addis Ababa Peace and Security Bureau",
    bureauCode: "AAPS-AA",
    timezone: "EAT",
    system: {
        appName: "Peace & Security",
        maintenanceMode: false,
        defaultLanguage: "AMHARIC",
        reportNoiseResidentialThreshold: 45,
        reportNoiseCommercialThreshold: 55,
        reportAutoAssignEnabled: true,
        reportAutoAssignMaxRadiusKm: 5,
        notificationPushEnabled: true,
        notificationSmsEnabled: true,
        securityOtpExpiryMinutes: 5,
        securityMaxLoginAttempts: 5,
        securityLockoutMinutes: 15,
        cameraAlertConfidenceThreshold: 0.8,
    },
};

export const demoUsers: any[] = [
    ["System Super Admin", "admin@example.com", "+251900000000", "SYSTEM_SUPER_ADMIN"],
    ["System Admin", "sysadmin@peace.gov.et", "+251911000001", "SYSTEM_ADMIN"],
    ["Peace Super Admin", "peace.admin@peace.gov.et", "+251911000002", "PEACE_SUPER_ADMIN"],
    ["Peace Officer Subcity", "peace.subcity@peace.gov.et", "+251911000003", "PEACE_OFFICER_SUBCITY"],
    ["Peace Officer Woreda", "peace.woreda@peace.gov.et", "+251911000004", "PEACE_OFFICER_WOREDA"],
    ["Police Commander City", "police.city@peace.gov.et", "+251911000005", "POLICE_COMMANDER_CITY"],
    ["Police Commander Subcity", "police.subcity@peace.gov.et", "+251911000006", "POLICE_COMMANDER_SUBCITY"],
    ["Police Commander Woreda", "police.woreda@peace.gov.et", "+251911000007", "POLICE_COMMANDER_WOREDA"],
    ["Super Admin Viewer", "viewer.super@peace.gov.et", "+251911000020", "SYSTEM_SUPER_ADMIN_VIEWER"],
    ["Admin Viewer", "viewer.admin@peace.gov.et", "+251911000021", "SYSTEM_ADMIN_VIEWER"],
    ["Peace Super Admin Viewer", "viewer.peace@peace.gov.et", "+251911000022", "PEACE_SUPER_ADMIN_VIEWER"],
    ["Peace Subcity Viewer", "viewer.peace.sub@peace.gov.et", "+251911000023", "PEACE_OFFICER_SUBCITY_VIEWER"],
    ["Peace Woreda Viewer", "viewer.peace.wor@peace.gov.et", "+251911000024", "PEACE_OFFICER_WOREDA_VIEWER"],
    ["Police City Viewer", "viewer.police.city@peace.gov.et", "+251911000025", "POLICE_COMMANDER_CITY_VIEWER"],
    ["Police Subcity Viewer", "viewer.police.sub@peace.gov.et", "+251911000026", "POLICE_COMMANDER_SUBCITY_VIEWER"],
    ["Police Woreda Viewer", "viewer.police.wor@peace.gov.et", "+251911000027", "POLICE_COMMANDER_WOREDA_VIEWER"],
].map(([fullName, email, phoneNumber, role], i) => ({
    id: `usr-${String(i + 1).padStart(3, "0")}`,
    userCode: `STF-${String(i + 1).padStart(4, "0")}`,
    fullName,
    email,
    phoneNumber,
    role,
    password: "admin123",
    isStaffUser: true,
    status: "ACTIVE",
    isPasswordSet: true,
    isEmailVerified: true,
    isPhoneVerified: true,
    permissions: [],
    profileImage: avatar(fullName),
    address: "Addis Ababa, Ethiopia",
    assignedArea: "Addis Ababa",
    createdAt: ago(120 - i * 3),
    updatedAt: ago(2, i),
}));

export const demoPatrols: any[] = [
    {
        id: "pat-001",
        fullName: "Patrol Officer 1",
        email: "officer1@peace.gov.et",
        phoneNumber: "+251911000011",
        role: "PATROL",
        status: "ACTIVE",
        isPasswordSet: true,
        profileImage: avatar("Patrol Officer 1"),
        officeAddress: "Bole Subcity Office",
        assignedArea: "Bole",
        officeLatitude: 8.9904,
        officeLongitude: 38.7839,
        latitude: 8.9912,
        longitude: 38.7847,
        lastLocationUpdate: ago(0, 1),
        createdAt: ago(90),
    },
    {
        id: "pat-002",
        fullName: "Patrol Officer 2",
        email: "officer2@peace.gov.et",
        phoneNumber: "+251911000012",
        role: "PATROL",
        status: "ACTIVE",
        isPasswordSet: true,
        profileImage: avatar("Patrol Officer 2"),
        officeAddress: "Yeka Subcity Office",
        assignedArea: "Yeka",
        officeLatitude: 9.0031,
        officeLongitude: 38.7844,
        latitude: 9.0042,
        longitude: 38.7836,
        lastLocationUpdate: ago(0, 2),
        createdAt: ago(80),
    },
    {
        id: "pat-003",
        fullName: "Patrol Officer 3",
        email: "officer3@peace.gov.et",
        phoneNumber: "+251911000013",
        role: "PATROL",
        status: "ACTIVE",
        isPasswordSet: true,
        profileImage: avatar("Patrol Officer 3"),
        officeAddress: "Arada Subcity Office",
        assignedArea: "Arada",
        officeLatitude: 9.0168,
        officeLongitude: 38.7615,
        latitude: 9.0175,
        longitude: 38.7623,
        lastLocationUpdate: ago(0, 3),
        createdAt: ago(70),
    },
];

export const demoCitizens: any[] = [
    {
        id: "cit-001",
        userCode: "CIT-0001",
        fullName: "Abebe Kebede",
        phoneNumber: "+251911000031",
        email: "abebe.kebede@gmail.com",
        role: "CITIZEN",
        status: "ACTIVE",
        verificationStatus: "VERIFIED",
        preferredLanguage: "AMHARIC",
        profileImage: avatar("Abebe Kebede"),
        latitude: 8.9918,
        longitude: 38.7812,
        createdAt: ago(60),
    },
    {
        id: "cit-002",
        userCode: "CIT-0002",
        fullName: "Hiwot Tesfaye",
        phoneNumber: "+251911000032",
        email: "hiwot.tesfaye@gmail.com",
        role: "CITIZEN",
        status: "ACTIVE",
        verificationStatus: "VERIFIED",
        preferredLanguage: "AMHARIC",
        profileImage: avatar("Hiwot Tesfaye"),
        latitude: 9.0048,
        longitude: 38.7821,
        createdAt: ago(50),
    },
    {
        id: "cit-003",
        userCode: "CIT-0003",
        fullName: "Dawit Mekonnen",
        phoneNumber: "+251911000033",
        email: "dawit.mekonnen@gmail.com",
        role: "CITIZEN",
        status: "ACTIVE",
        verificationStatus: "VERIFIED",
        preferredLanguage: "AMHARIC",
        profileImage: avatar("Dawit Mekonnen"),
        latitude: 9.0162,
        longitude: 38.7598,
        createdAt: ago(40),
    },
];

export const demoReportTypes: any[] = [
    ["NOISE", "Excessive noise and disturbance", 45, 55],
    ["LITTERING", "Improper disposal of litter in public spaces", null, null],
    ["VANDALISM", "Damage or defacement of public property", null, null],
    ["AIR_POLLUTION", "Harmful emissions and smoke", null, null],
    ["WATER_POLLUTION", "Contamination of water bodies", null, null],
    ["SOIL_CONTAMINATION", "Pollution of soil and farmland", null, null],
    ["ILLEGAL_DUMPING", "Unauthorized dumping of waste", null, null],
    ["DEFORESTATION", "Unlawful cutting of trees", null, null],
    ["HAZARDOUS_WASTE", "Improper handling of dangerous waste", null, null],
    ["WILDLIFE_POACHING", "Illegal hunting of wildlife", null, null],
    ["OTHERS", "Other environmental concerns", null, null],
].map(([name, description, residential, commercial], i) => ({
    id: `rt-${String(i + 1).padStart(3, "0")}`,
    name,
    description,
    isActive: true,
    residentialDecibelThreshold: residential,
    commercialDecibelThreshold: commercial,
    createdAt: ago(160),
    updatedAt: ago(10),
}));

const reportTypeByName = (name: string) => demoReportTypes.find((t) => t.name === name);
const citizenByPhone = (phone: string) => demoCitizens.find((c) => c.phoneNumber === phone);
const patrolByEmail = (email: string) => demoPatrols.find((p) => p.email === email);

const statusSteps = [
    "SUBMITTED",
    "UNDER_REVIEW",
    "ASSIGNED",
    "IN_PROGRESS",
    "RESOLVED",
    "CLOSED",
    "ESCALATED",
    "REJECTED",
];

function makeReport(
    index: number,
    config: {
        caseId: string;
        name: string;
        reporterPhone: string;
        description: string;
        lat: number;
        lng: number;
        address: string;
        area: string;
        images: string[];
        status: string;
        patrolEmail?: string;
        audio?: number[];
        videos?: number[];
        patrolImages?: string[];
        patrolAudio?: number[];
        notes?: string;
        patrolNotes?: string;
        decibelLevel?: number;
        noiseAreaType?: string;
        noisePollutionStatus?: string;
        isEmergency?: boolean;
        rejectionReason?: string;
        incidentDays: number;
        incidentHours?: number;
        resolvedDays?: number;
    }
) {
    const type = reportTypeByName(config.name);
    const reporter = citizenByPhone(config.reporterPhone);
    const patrol = config.patrolEmail ? patrolByEmail(config.patrolEmail) : null;
    const images = config.images.map(photo);
    const audios = (config.audio || []).map(audio);
    const videos = (config.videos || []).map(video);
    const patrolImages = (config.patrolImages || []).map(photo);
    const patrolAudios = (config.patrolAudio || []).map(audio);
    const stepIndex = statusSteps.indexOf(config.status);
    const steps = stepIndex < 0
        ? ["SUBMITTED", config.status]
        : statusSteps.slice(0, stepIndex + 1);
    const createdAt = ago(config.incidentDays, config.incidentHours || 0);
    const severity = config.isEmergency ? "High" : ["NOISE", "ILLEGAL_DUMPING", "HAZARDOUS_WASTE"].includes(config.name) ? "High" : "Medium";

    return {
        id: `rep-${String(index + 1).padStart(3, "0")}`,
        caseId: config.caseId,
        violationType: config.name,
        type: config.name,
        reportTypeId: type?.id,
        reportType: type,
        reportDescription: config.description,
        description: config.description,
        latitude: config.lat,
        longitude: config.lng,
        address: config.address,
        location: config.address,
        area: config.area,
        city: "Addis Ababa",
        imageUrls: images,
        videoUrls: videos,
        audioUrls: audios,
        evidenceUrls: [...images, ...audios, ...videos],
        patrolImageUrls: patrolImages,
        patrolVideoUrls: [],
        patrolAudioUrls: patrolAudios,
        patrolEvidenceUrls: [...patrolImages, ...patrolAudios],
        decibelLevel: config.decibelLevel ?? null,
        noiseAreaType: config.noiseAreaType ?? null,
        noisePollutionStatus: config.noisePollutionStatus ?? null,
        isAnonymous: false,
        isEmergency: !!config.isEmergency,
        status: config.status,
        priority: severity,
        severity,
        assignedPatrolId: patrol?.id ?? null,
        assignedPatrol: patrol,
        assignedTo: patrol?.fullName ?? null,
        assignedAt: patrol ? ago(Math.max(0, config.incidentDays - 1)) : null,
        reporter,
        reporterId: reporter?.id ?? null,
        reporterPhoneNumber: config.reporterPhone,
        notes: config.notes ?? null,
        patrolNotes: config.patrolNotes ?? null,
        rejectionReason: config.rejectionReason ?? null,
        incidentDateTime: createdAt,
        createdAt,
        updatedAt: ago(Math.max(0, config.incidentDays - 1)),
        resolvedAt: config.resolvedDays !== undefined ? ago(config.resolvedDays) : null,
        isOngoing: ["SUBMITTED", "ASSIGNED", "IN_PROGRESS"].includes(config.status),
        history: steps.map((status, i) => ({
            id: `log-${index + 1}-${i + 1}`,
            status,
            notes: `Status changed to ${status}`,
            createdAt: ago(Math.max(0, config.incidentDays - (steps.length - 1 - i))),
        })),
    };
}

export const demoReports: any[] = [
    makeReport(0, {
        caseId: "REP-120394",
        name: "NOISE",
        reporterPhone: "+251911000031",
        description: "Loud construction noise from a nearby site continues past midnight every day. It is disturbing the whole neighbourhood and preventing residents from sleeping.",
        lat: 8.9904,
        lng: 38.7839,
        address: "Bole Road, near Bambis Supermarket",
        area: "Bole",
        images: ["noise-site", "noise-site-2"],
        audio: [1, 3],
        decibelLevel: 68.4,
        noiseAreaType: "RESIDENTIAL",
        noisePollutionStatus: "Pollution",
        status: "ASSIGNED",
        patrolEmail: "officer1@peace.gov.et",
        patrolImages: ["noise-patrol-1"],
        notes: "Patrol unit dispatched to measure decibel levels and warn the site manager.",
        incidentDays: 5,
    }),
    makeReport(1, {
        caseId: "REP-205871",
        name: "LITTERING",
        reporterPhone: "+251911000032",
        description: "There is littering along the main road near my house. Trash has been accumulating for about 3 days and is getting worse.",
        lat: 9.0031,
        lng: 38.7844,
        address: "Gurd Shola, near Alem Cinema",
        area: "Yeka",
        images: ["litter-road", "litter-dump", "litter-closeup"],
        status: "IN_PROGRESS",
        patrolEmail: "officer2@peace.gov.et",
        patrolImages: ["litter-patrol"],
        patrolAudio: [5],
        notes: "Cleanup team assigned and dispatched to the area.",
        incidentDays: 3,
    }),
    makeReport(2, {
        caseId: "REP-318556",
        name: "VANDALISM",
        reporterPhone: "+251911000033",
        description: "Graffiti and broken street lights on Woreda Road. A bus shelter has been damaged and public property defaced.",
        lat: 9.0168,
        lng: 38.7615,
        address: "Arat Kilo, near the school",
        area: "Arada",
        images: ["vandal-shelter", "vandal-graffiti", "vandal-light"],
        videos: [1],
        status: "UNDER_REVIEW",
        patrolEmail: "officer3@peace.gov.et",
        incidentDays: 2,
    }),
    makeReport(3, {
        caseId: "REP-429715",
        name: "ILLEGAL_DUMPING",
        reporterPhone: "+251911000032",
        description: "Someone is dumping waste into the river. This is serious and urgent — it is contaminating the water.",
        lat: 8.9979,
        lng: 38.7931,
        address: "Riverbank, Akaki near old bridge",
        area: "Akaki Kaliti",
        images: ["river-dump", "river-dump-wide", "river-closeup"],
        audio: [2],
        videos: [2],
        isEmergency: true,
        status: "RESOLVED",
        patrolEmail: "officer1@peace.gov.et",
        patrolImages: ["river-patrol-1", "river-patrol-2"],
        patrolNotes: "Dumping site identified and cleaned. Violator warned with written citation.",
        incidentDays: 2,
        incidentHours: 5,
        resolvedDays: 1,
    }),
    makeReport(4, {
        caseId: "REP-530248",
        name: "AIR_POLLUTION",
        reporterPhone: "+251911000031",
        description: "Thick smoke from burning plastic waste near the market is covering the area. Breathing is difficult.",
        lat: 9.0301,
        lng: 38.7402,
        address: "Merkato, near bus terminal",
        area: "Addis Ketema",
        images: ["smoke-market", "smoke-sky"],
        status: "SUBMITTED",
        incidentDays: 0,
        incidentHours: 6,
    }),
    makeReport(5, {
        caseId: "REP-612493",
        name: "HAZARDOUS_WASTE",
        reporterPhone: "+251911000033",
        description: "Used oil and chemicals are being dumped in an open drain next to a mechanic shop. High risk for the community.",
        lat: 9.0093,
        lng: 38.7698,
        address: "Kazanchis, behind car repair shops",
        area: "Kirkos",
        images: ["oil-drain", "oil-drain-2", "oil-barrels"],
        status: "CLOSED",
        patrolEmail: "officer2@peace.gov.et",
        patrolNotes: "Hazardous material contained and removed by the city environmental team.",
        incidentDays: 6,
        resolvedDays: 4,
    }),
    makeReport(6, {
        caseId: "REP-735608",
        name: "WATER_POLLUTION",
        reporterPhone: "+251911000031",
        description: "Untreated sewage is flowing into the drainage channel that feeds the reservoir.",
        lat: 8.9684,
        lng: 38.7702,
        address: "Kality industrial area",
        area: "Akaki Kaliti",
        images: ["sewage-channel", "sewage-outlet"],
        status: "REJECTED",
        rejectionReason: "Duplicate of an already reported issue. Merged into case REP-429715.",
        incidentDays: 7,
    }),
    makeReport(7, {
        caseId: "REP-842017",
        name: "SOIL_CONTAMINATION",
        reporterPhone: "+251911000032",
        description: "A fertilizer factory is leaking chemicals into the surrounding farmland, ruining crops.",
        lat: 8.9056,
        lng: 38.7957,
        address: "Lebu, farmland near factory",
        area: "Bole",
        images: ["soil-contam", "soil-contam-2", "soil-crops"],
        status: "ESCALATED",
        patrolEmail: "officer3@peace.gov.et",
        patrolNotes: "Escalated to the federal environmental protection authority.",
        incidentDays: 1,
        incidentHours: 4,
    }),
];

const conversationScripts = [
    {
        report: demoReports[0],
        messages: [
            ["citizen", "Abebe Kebede", "Hello, I want to report a noise disturbance in my neighborhood.", 120],
            ["patrol", "Patrol Officer 1", "Thank you for your report. Can you provide the exact location?", 115],
            ["citizen", "Abebe Kebede", "It is near Bole Road, next to the pharmacy.", 110],
            ["patrol", "Patrol Officer 1", "Understood. We are dispatching a patrol unit to your location.", 105],
            ["admin", "System Super Admin", "Patrol unit has been dispatched. Case ID: REP-120394", 100],
            ["patrol", "Patrol Officer 1", "We have arrived at the location and are measuring noise levels now.", 60],
            ["patrol", "Patrol Officer 1", "Noise levels confirmed above the threshold. Warning issued to the site manager.", 30],
        ],
    },
    {
        report: demoReports[1],
        messages: [
            ["citizen", "Hiwot Tesfaye", "There is littering along the main road near my house.", 240],
            ["patrol", "Patrol Officer 2", "Thank you Hiwot. How long has this been going on?", 235],
            ["citizen", "Hiwot Tesfaye", "About 3 days now. It is getting worse.", 230],
            ["patrol", "Patrol Officer 2", "We will send a team to assess and clean up the area.", 225],
            ["admin", "System Super Admin", "Cleanup team assigned. Expected arrival in 2 hours.", 220],
            ["citizen", "Hiwot Tesfaye", "Thank you very much for the quick response!", 215],
        ],
    },
    {
        report: demoReports[2],
        messages: [
            ["citizen", "Dawit Mekonnen", "I found an abandoned vehicle on Woreda Road.", 480],
            ["patrol", "Patrol Officer 3", "Can you describe the vehicle? Make, model, color?", 475],
            ["citizen", "Dawit Mekonnen", "It is a white Toyota Corolla, old model, no license plates.", 470],
            ["patrol", "Patrol Officer 3", "Noted. We will send someone to investigate.", 465],
            ["admin", "System Super Admin", "Report logged. Patrol unit dispatched to Woreda Road.", 460],
            ["patrol", "Patrol Officer 3", "Vehicle has been located. It appears to have been stolen.", 400],
            ["admin", "System Super Admin", "Escalating to investigation team. Thank you for reporting.", 395],
            ["citizen", "Dawit Mekonnen", "Glad I could help. Is there anything else you need from me?", 390],
            ["patrol", "Patrol Officer 3", "We may need your statement later. We will contact you.", 385],
        ],
    },
];

export const demoConversations: any[] = conversationScripts.map((script, i) => {
    const messages = script.messages.map(([senderType, senderName, content, minutesAgo], j) => ({
        id: `msg-${i + 1}-${j + 1}`,
        conversationId: `conv-${String(i + 1).padStart(3, "0")}`,
        senderId: senderType === "citizen" ? `cit-00${i + 1}` : senderType === "patrol" ? `pat-00${i + 1}` : "usr-001",
        senderName,
        senderType,
        content,
        isRead: j < script.messages.length - 1,
        readBy: j < script.messages.length - 1 ? [senderType === "citizen" ? `pat-00${i + 1}` : `cit-00${i + 1}`] : [],
        createdAt: ago(0, Number(minutesAgo) / 60),
    }));
    const lastMessage = messages[messages.length - 1];
    return {
        id: `conv-${String(i + 1).padStart(3, "0")}`,
        reportId: script.report.id,
        report: {
            id: script.report.id,
            title: script.report.violationType.replaceAll("_", " ").toLowerCase().replace(/^./, (c: string) => c.toUpperCase()),
            type: script.report.violationType,
            caseId: script.report.caseId,
            status: script.report.status,
        },
        unreadCount: 1,
        lastMessage: {
            content: lastMessage.content,
            senderName: lastMessage.senderName,
            senderType: lastMessage.senderType,
            createdAt: lastMessage.createdAt,
        },
        createdAt: messages[0].createdAt,
        updatedAt: lastMessage.createdAt,
    };
});

export const demoMessages: Record<string, any[]> = Object.fromEntries(
    demoConversations.map((conversation, i) => [conversation.id, conversationScripts[i].messages.map(([, senderName, content, minutesAgo], j) => ({
        id: `msg-${i + 1}-${j + 1}`,
        conversationId: conversation.id,
        senderId: conversationScripts[i].messages[j][0] === "citizen" ? `cit-00${i + 1}` : conversationScripts[i].messages[j][0] === "patrol" ? `pat-00${i + 1}` : "usr-001",
        senderName,
        senderType: conversationScripts[i].messages[j][0],
        content,
        isRead: j < conversationScripts[i].messages.length - 1,
        readBy: j < conversationScripts[i].messages.length - 1 ? ["usr-001"] : [],
        createdAt: ago(0, Number(minutesAgo) / 60),
    }))])
);

export const demoCameras: any[] = [
    ["CAM-BOL-001", "Bole Road Junction", 8.9806, 38.8008],
    ["CAM-BOL-002", "Bole International Airport Entrance", 8.9779, 38.7993],
    ["CAM-MES-003", "Meskel Square", 9.0108, 38.7612],
    ["CAM-MER-004", "Merkato Bus Terminal", 9.0301, 38.7402],
    ["CAM-ARA-005", "Arat Kilo Roundabout", 9.0219, 38.7582],
    ["CAM-KAZ-006", "Kazanchis Tower", 9.0093, 38.7698],
].map(([cameraId, locationName, latitude, longitude], i) => ({
    id: `cam-${String(i + 1).padStart(3, "0")}`,
    cameraId,
    locationName,
    latitude,
    longitude,
    streamUrl: `rtsp://192.168.1.${21 + i}:554/stream1`,
    isActive: i !== 3,
    lastMaintenanceDate: ago(30 - i * 3),
    metadata: { resolution: "1080p", fps: 25, powerSource: "Solar", bandwithMbps: 4 },
    createdAt: ago(200),
}));

export const demoCameraAlerts: any[] = [
    [0, "ILLEGAL_DUMPING", "alert-dump-1", 0.94, "OPEN"],
    [0, "LITTERING", "alert-litter-1", 0.87, "ASSIGNED"],
    [1, "PARKING_VIOLATION", "alert-parking-1", 0.91, "OPEN"],
    [2, "NOISE", "alert-noise-1", 0.79, "OPEN"],
    [3, "ILLEGAL_VENDING", "alert-vending-1", 0.83, "CLOSED"],
    [4, "VANDALISM", "alert-vandal-1", 0.96, "OPEN"],
    [5, "HAZARDOUS_WASTE", "alert-hazard-1", 0.88, "ASSIGNED"],
    [2, "TRAFFIC_JAM", "alert-traffic-1", 0.92, "CLOSED"],
].map(([cameraIndex, violationType, seed, confidence, status], i) => ({
    id: `alert-${String(i + 1).padStart(3, "0")}`,
    cameraId: demoCameras[cameraIndex as number].id,
    camera: demoCameras[cameraIndex as number],
    violationType,
    evidenceUrl: photo(seed as string),
    confidenceScore: confidence,
    status,
    createdAt: ago(0, 3 + i),
}));

export const demoNotifications: any[] = [
    ["New Report Submitted", `A new NOISE report was submitted in Bole. Case: REP-120394`, "REPORT_SUBMITTED", false, 120],
    ["Report Assigned", "Case REP-120394 was assigned to a patrol unit.", "REPORT_ASSIGNED", false, 110],
    ["Patrol Follow-up", "Patrol Officer 1 submitted a follow-up with evidence on an active case.", "PATROL_FOLLOW_UP", true, 60],
    ["System Maintenance", "Scheduled system maintenance will occur on Sunday at 02:00 AM.", "GENERAL", true, 1440],
    ["New Camera Alert", "High-confidence ILLEGAL_DUMPING event detected at Bole Road Junction.", "GENERAL", false, 15],
    ["Case Resolved", "Your illegal dumping report has been resolved. Thank you for reporting.", "REPORT_STATUS_UPDATED", true, 180],
    ["High Priority Report", "Hazardous waste case REP-612493 in Kirkos has been closed.", "REPORT_STATUS_UPDATED", false, 300],
].map(([title, message, type, isRead, minutesAgo], i) => ({
    id: `not-${String(i + 1).padStart(3, "0")}`,
    title,
    message,
    type,
    data: i < 2 ? { reportId: demoReports[0].id, caseId: demoReports[0].caseId } : null,
    isRead,
    read: isRead,
    createdAt: ago(0, (minutesAgo as number) / 60),
}));

export const demoAuditLogs: any[] = [
    ["User", "usr-001", "LOGIN", "System Super Admin signed in", 2],
    ["Report", "rep-001", "UPDATE", "Report assigned to patrol", 8],
    ["Report", "rep-005", "CREATE", "Citizen submitted report: Air Pollution", 10],
    ["Setting", "set-001", "UPDATE", "Updated system settings", 15],
    ["Report", "rep-002", "UPDATE", "Report assigned to patrol", 20],
    ["PatrolTeam", "team-001", "UPDATE", "Added member to patrol team", 24],
    ["Camera", "cam-004", "UPDATE", "Camera marked inactive for maintenance", 30],
    ["Report", "rep-004", "UPDATE", "Report escalated to supervisor", 36],
    ["User", "usr-004", "CREATE", "Created Peace Officer Woreda account", 48],
    ["City", "city-del-001", "DELETE", "Deleted city (soft delete)", 60],
    ["Report", "rep-006", "UPDATE", "Report closed after cleanup", 72],
    ["ReportType", "rt-001", "UPDATE", "Updated noise thresholds", 96],
].map(([entity, entityId, action, description, hoursAgo], i) => ({
    id: `aud-${String(i + 1).padStart(3, "0")}`,
    entity,
    entityId,
    action,
    description,
    actorId: "usr-001",
    actorName: "System Super Admin",
    actorRole: "SYSTEM_SUPER_ADMIN",
    ipAddress: "196.188.120.10",
    oldValues: i % 3 === 0 ? { status: "PENDING" } : null,
    newValues: i % 3 === 0 ? { status: "ASSIGNED" } : null,
    timestamp: ago(0, hoursAgo as number),
    createdAt: ago(0, hoursAgo as number),
}));

export const demoSecurityEvents: any[] = [
    ["LOGIN_SUCCESS", "System Super Admin", true, "Successful sign in", 1],
    ["LOGIN_FAILED", "unknown", false, "Failed sign in attempt", 4],
    ["PIN_RESET_REQUEST", "Patrol Officer 2", true, "PIN reset requested", 9],
    ["PASSWORD_CHANGE", "System Admin", true, "Password changed", 18],
    ["LOGIN_SUCCESS", "Peace Officer Woreda", true, "Successful sign in", 22],
    ["TOKEN_REFRESH", "System Super Admin", true, "Access token refreshed", 30],
    ["LOGIN_FAILED", "unknown", false, "Unknown identifier", 42],
    ["ACCESS_DENIED", "Peace Subcity Viewer", false, "Blocked write operation", 55],
].map(([eventType, actorName, success, description, hoursAgo], i) => ({
    id: `sec-${String(i + 1).padStart(3, "0")}`,
    eventType,
    actorName,
    actorId: actorName === "unknown" ? null : `usr-${String(i + 1).padStart(3, "0")}`,
    actorRole: actorName === "unknown" ? null : "PEACE_OFFICER_WOREDA",
    success,
    description,
    ipAddress: "196.188.120.10",
    metadata: { source: "dashboard" },
    timestamp: ago(0, hoursAgo as number),
    createdAt: ago(0, hoursAgo as number),
}));

export const demoDataAccessEvents: any[] = [
    ["READ", "Report", "rep-001", "Report details viewed", 1],
    ["EXPORT", "Report", "reports", "Report list exported as CSV", 3],
    ["READ", "Citizen", "cit-001", "Citizen profile viewed", 6],
    ["READ", "Camera", "cam-001", "Camera details viewed", 12],
    ["EXPORT", "AuditLog", "audit-logs", "Audit logs exported", 20],
    ["READ", "User", "usr-001", "User profile viewed", 28],
    ["READ", "Conversation", "conv-001", "Chat conversation viewed", 34],
    ["READ", "Setting", "settings", "System settings viewed", 50],
].map(([accessType, targetEntity, targetId, description, hoursAgo], i) => ({
    id: `dac-${String(i + 1).padStart(3, "0")}`,
    accessType,
    targetEntity,
    targetId,
    description,
    actorId: "usr-001",
    actorName: "System Super Admin",
    actorRole: "SYSTEM_SUPER_ADMIN",
    accessPath: `/api/${targetEntity}/${targetId}`,
    timestamp: ago(0, hoursAgo as number),
    createdAt: ago(0, hoursAgo as number),
}));

export const demoCities: any[] = [
    { id: "city-001", name: "Addis Ababa", code: "AA", nameAm: "አዲስ አበባ", latitude: 9.0320, longitude: 38.7469, isActive: true, createdAt: ago(300) },
];

export const demoSubcities: any[] = [
    ["Bole", "BOL", 8.9850, 38.7900],
    ["Yeka", "YEK", 9.0050, 38.7900],
    ["Arada", "ARA", 9.0200, 38.7600],
    ["Kirkos", "KIR", 9.0080, 38.7700],
    ["Addis Ketema", "ADK", 9.0320, 38.7450],
    ["Akaki Kaliti", "AKK", 8.9600, 38.7800],
].map(([name, code, latitude, longitude], i) => ({
    id: `sub-${String(i + 1).padStart(3, "0")}`,
    name,
    code,
    cityId: "city-001",
    city: { id: "city-001", name: "Addis Ababa" },
    latitude,
    longitude,
    isActive: true,
    createdAt: ago(280),
}));

export const demoWoredas: any[] = [
    ["Woreda 01", "W01", 0],
    ["Woreda 02", "W02", 0],
    ["Woreda 03", "W03", 1],
    ["Woreda 04", "W04", 1],
    ["Woreda 05", "W05", 2],
    ["Woreda 06", "W06", 3],
    ["Woreda 07", "W07", 4],
    ["Woreda 08", "W08", 5],
].map(([name, code, subcityIndex], i) => ({
    id: `wor-${String(i + 1).padStart(3, "0")}`,
    name,
    code,
    subcityId: demoSubcities[subcityIndex as number].id,
    subcity: { id: demoSubcities[subcityIndex as number].id, name: demoSubcities[subcityIndex as number].name },
    cityId: "city-001",
    latitude: demoSubcities[subcityIndex as number].latitude,
    longitude: demoSubcities[subcityIndex as number].longitude,
    isActive: true,
    createdAt: ago(250),
}));

export const demoPatrolTeams: any[] = [
    { id: "team-001", name: "Bole Rapid Response", woredaId: "wor-001", members: [demoPatrols[0]], createdAt: ago(80) },
    { id: "team-002", name: "Yeka Cleanup Unit", woredaId: "wor-003", members: [demoPatrols[1]], createdAt: ago(70) },
    { id: "team-003", name: "Arada Investigation Team", woredaId: "wor-005", members: [demoPatrols[2]], createdAt: ago(60) },
];

export const demoWorkReports: any[] = [
    ["wr-001", "Weekly patrol summary", "Patrolled Bole and Yeka sub-cities. Noise complaint at Bole Road was verified and the site manager was warned.", "Patrol Officer 1", "PATROL", "APPROVED", 1],
    ["wr-002", "Merkato air quality inspection", "Inspected burning plastic waste near the bus terminal and coordinated with the city cleanup crew.", "Patrol Officer 2", "PATROL", "SUBMITTED", 2],
    ["wr-003", "Camera alert review", "Reviewed eight camera alerts; four require field follow-up.", "System Admin", "SYSTEM_ADMIN", "APPROVED", 3],
    ["wr-004", "Riverbank dumping cleanup", "Confirmed the illegal dumping site was cleaned and the violator cited.", "Patrol Officer 1", "PATROL", "REJECTED", 4],
    ["wr-005", "Community awareness visit", "Discussed waste disposal with residents in Akaki Kaliti.", "Peace Officer Woreda", "PEACE_OFFICER_WOREDA", "SUBMITTED", 5],
].map(([id, title, description, reporterName, reporterRole, status, daysAgo]) => ({
    id,
    title,
    description,
    reporterId: `usr-${String(daysAgo).padStart(3, "0")}`,
    reporterName,
    reporterRole,
    reportDate: ago(daysAgo as number),
    status,
    reviewNote: status === "REJECTED" ? "Needs photographic evidence." : status === "APPROVED" ? "Approved by supervisor." : null,
    reviewedAt: status === "SUBMITTED" ? null : ago(Math.max(0, (daysAgo as number) - 1)),
    createdAt: ago(daysAgo as number),
    updatedAt: ago(Math.max(0, (daysAgo as number) - 1)),
}));

export function buildDashboardStats() {
    const byType = demoReportTypes
        .map((type) => ({ name: type.name, count: demoReports.filter((r) => r.violationType === type.name).length }))
        .filter((item) => item.count > 0);
    const byStatus = ["SUBMITTED", "ASSIGNED", "IN_PROGRESS", "UNDER_REVIEW", "RESOLVED", "CLOSED", "REJECTED", "ESCALATED"]
        .map((status) => ({ status, count: demoReports.filter((r) => r.status === status).length }))
        .filter((item) => item.count > 0);
    return {
        reports: {
            total: demoReports.length,
            resolved: demoReports.filter((r) => ["RESOLVED", "CLOSED"].includes(r.status)).length,
            pending: demoReports.filter((r) => ["SUBMITTED", "UNDER_REVIEW", "ASSIGNED", "IN_PROGRESS"].includes(r.status)).length,
            byType,
            byStatus,
            trend: Array.from({ length: 14 }, (_, i) => ({
                date: ago(13 - i).slice(0, 10),
                count: 1 + ((i * 3) % 5),
            })),
        },
        users: {
            citizens: demoCitizens.length,
            patrols: demoPatrols.length,
            admins: demoUsers.length,
        },
        cameras: { total: demoCameras.length, active: demoCameras.filter((c) => c.isActive).length },
        reportTypes: demoReportTypes.length,
    };
}

export function buildFleetLocations() {
    return {
        patrols: demoPatrols.map((p) => ({
            id: p.id,
            fullName: p.fullName,
            latitude: p.latitude,
            longitude: p.longitude,
            officeLatitude: p.officeLatitude,
            officeLongitude: p.officeLongitude,
        })),
        citizens: demoCitizens.map((c) => ({
            id: c.id,
            fullName: c.fullName,
            latitude: c.latitude,
            longitude: c.longitude,
        })),
        reports: demoReports.map((r) => ({
            id: r.id,
            caseId: r.caseId,
            violationType: r.violationType,
            latitude: r.latitude,
            longitude: r.longitude,
            status: r.status,
        })),
    };
}

export function buildAnalytics(timeRange: string) {
    const ranges: Record<string, { periods: string[]; total: number; high: number; response: string; top: string }> = {
        week: {
            periods: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
            total: 18,
            high: 5,
            response: "2.4h",
            top: "Bole",
        },
        month: {
            periods: ["Week 1", "Week 2", "Week 3", "Week 4"],
            total: 72,
            high: 19,
            response: "2.7h",
            top: "Bole",
        },
        year: {
            periods: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
            total: 846,
            high: 211,
            response: "3.1h",
            top: "Addis Ketema",
        },
    };
    const config = ranges[timeRange] || ranges.week;
    const statuses = ["SUBMITTED", "ASSIGNED", "IN_PROGRESS", "RESOLVED"];
    const categories = ["NOISE", "LITTERING", "ILLEGAL_DUMPING", "HAZARDOUS_WASTE", "VANDALISM", "AIR_POLLUTION"];
    return {
        stats: {
            totalReports: config.total,
            highPriorityReports: config.high,
            avgResponseTime: config.response,
            topLocation: config.top,
        },
        statusChart: config.periods.flatMap((period) =>
            statuses.map((status, i) => ({
                period,
                status,
                count: String(2 + ((config.periods.indexOf(period) + i * 3) % 7)),
            }))
        ),
        trendChart: config.periods.map((period, i) => ({
            period,
            count: String(4 + ((i * 5) % 13)),
        })),
        categoryChart: categories.map((name, i) => ({
            name,
            value: String(14 - i * 2),
        })),
        timeRange,
    };
}

export const demoDatabase = {
    users: demoUsers,
    patrols: demoPatrols,
    citizens: demoCitizens,
    reports: demoReports,
    reportTypes: demoReportTypes,
    conversations: demoConversations,
    messages: demoMessages,
    cameras: demoCameras,
    cameraAlerts: demoCameraAlerts,
    notifications: demoNotifications,
    auditLogs: demoAuditLogs,
    securityEvents: demoSecurityEvents,
    dataAccessEvents: demoDataAccessEvents,
    cities: demoCities,
    subcities: demoSubcities,
    woredas: demoWoredas,
    patrolTeams: demoPatrolTeams,
    workReports: demoWorkReports,
    settings: demoSettings,
};
