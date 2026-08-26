import { Injectable, OnApplicationBootstrap } from "@nestjs/common";
import { DataSource, Repository } from "typeorm";
import { Citizen } from "../../modules/citizen/entities/citizen.entity";
import { Report } from "../../modules/reports/entities/report.entity";
import { ReportLog } from "../../modules/reports/entities/report-log.entity";
import { Conversation } from "../../modules/chat/entities/conversation.entity";
import { Message } from "../../modules/chat/entities/message.entity";
import { Camera } from "../../modules/cameras/entities/camera.entity";
import { CameraAlert, CameraAlertStatus } from "../../modules/cameras/entities/camera-alert.entity";
import { Notification } from "../../modules/notifications/entities/notification.entity";
import { Setting } from "../../modules/settings/setting.entity";
import { ReportType } from "../../modules/report-types/entities/report-type.entity";
import { Patrol } from "../../modules/patrol/entities/patrol.entity";
import { User } from "../../modules/user/entities/user.entity";
import { City } from "../../modules/geo/entities/city.entity";
import { Subcity } from "../../modules/geo/entities/subcity.entity";
import { Woreda } from "../../modules/geo/entities/woreda.entity";
import {
  ReportStatus,
  NoiseAreaType,
  DevicePlatform,
  VerificationStatus,
  PreferredLanguage,
  UserStatus,
  NotificationType,
} from "../../common/enums/enums";
import { hashPassword } from "../../common/utils/password.util";

@Injectable()
export class DemoDataSeederService implements OnApplicationBootstrap {
  constructor(private dataSource: DataSource) {}

  async onApplicationBootstrap() {
    await this.seedSettings();
  }

  private ensure() {
    if (!this.dataSource.isInitialized) {
      return this.dataSource.initialize();
    }
    return Promise.resolve();
  }

  private image(seed: string): string {
    return `https://picsum.photos/seed/${seed}/640/480`;
  }

  private audio(n: number): string {
    const i = ((n - 1) % 17) + 1;
    return `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-${i}.mp3`;
  }

  private video(n: number): string {
    const vids = [
      "BigBuckBunny",
      "ElephantsDream",
      "ForBiggerBlazes",
      "ForBiggerEscapes",
      "ForBiggerFun",
      "ForBiggerJoyrides",
      "ForBiggerMeltdowns",
      "Sintel",
    ];
    const name = vids[(n - 1) % vids.length];
    return `https://storage.googleapis.com/gtv-videos-bucket/sample/${name}.mp4`;
  }

  async seedCitizens() {
    await this.ensure();
    const repo: Repository<Citizen> = this.dataSource.getRepository(Citizen);
    const existing = await repo.count();
    if (existing > 0) {
      console.log("• Citizens already exist — skipping");
      return;
    }

    const pin = await hashPassword("1234");
    const citizens = [
      {
        userCode: "CIT-0001",
        fullName: "Abebe Kebede",
        phoneNumber: "+251911000031",
        email: "abebe.kebede@gmail.com",
        preferredLanguage: PreferredLanguage.AMHARIC,
      },
      {
        userCode: "CIT-0002",
        fullName: "Hiwot Tesfaye",
        phoneNumber: "+251911000032",
        email: "hiwot.tesfaye@gmail.com",
        preferredLanguage: PreferredLanguage.AMHARIC,
      },
      {
        userCode: "CIT-0003",
        fullName: "Dawit Mekonnen",
        phoneNumber: "+251911000033",
        email: "dawit.mekonnen@gmail.com",
        preferredLanguage: PreferredLanguage.AMHARIC,
      },
    ];

    for (const c of citizens) {
      const citizen = repo.create({
        ...c,
        pin,
        isPinSet: true,
        status: UserStatus.ACTIVE,
        verificationStatus: VerificationStatus.VERIFIED,
        devicePlatform: DevicePlatform.ANDROID,
        appVersion: "1.0.0",
      });
      await repo.save(citizen);
      console.log(`✔ Seeded citizen: ${c.fullName}`);
    }
  }

  async seedReports() {
    await this.ensure();
    const repo: Repository<Report> = this.dataSource.getRepository(Report);
    const existing = await repo.count();
    if (existing > 0) {
      console.log("• Reports already exist — skipping");
      return;
    }

    const reportTypeRepo: Repository<ReportType> = this.dataSource.getRepository(ReportType);
    const citizenRepo: Repository<Citizen> = this.dataSource.getRepository(Citizen);
    const patrolRepo: Repository<Patrol> = this.dataSource.getRepository(Patrol);
    const cityRepo: Repository<City> = this.dataSource.getRepository(City);
    const subcityRepo: Repository<Subcity> = this.dataSource.getRepository(Subcity);
    const woredaRepo: Repository<Woreda> = this.dataSource.getRepository(Woreda);

    const types = await reportTypeRepo.find();
    const typeByName = new Map(types.map((t) => [t.name, t]));

    const citizens = await citizenRepo.find();
    const citizensByPhone = new Map(citizens.map((c) => [c.phoneNumber, c]));

    const patrols = await patrolRepo.find();
    const officer1 = patrols.find((p) => p.email === "officer1@peace.gov.et");
    const officer2 = patrols.find((p) => p.email === "officer2@peace.gov.et");
    const officer3 = patrols.find((p) => p.email === "officer3@peace.gov.et");

    const city = (await cityRepo.findOne({ where: { code: "AA" } })) || (await cityRepo.find())[0];
    const subcity = subcityRepo ? (await subcityRepo.find())[0] : null;
    const woreda = woredaRepo ? (await woredaRepo.find())[0] : null;

    const abebe = citizensByPhone.get("+251911000031");
    const hiwot = citizensByPhone.get("+251911000032");
    const dawit = citizensByPhone.get("+251911000033");

    const daysAgo = (d: number, h = 0) => new Date(Date.now() - d * 86400000 - h * 3600000);

    const reports = [
      {
        caseId: "REP-120394",
        violationType: "NOISE",
        reportTypeName: "NOISE",
        reporter: abebe,
        description:
          "Loud construction noise from a nearby site continues past midnight every day. It is disturbing the whole neighbourhood and preventing residents from sleeping.",
        lat: 8.9904,
        lng: 38.7839,
        address: "Bole Road, near Bambis Supermarket",
        area: "Bole",
        imageSeeds: ["noise-site", "noise-site-2"],
        audioN: [1, 3],
        decibelLevel: 68.4,
        noiseAreaType: NoiseAreaType.RESIDENTIAL,
        noisePollutionStatus: "Pollution",
        status: ReportStatus.ASSIGNED,
        assignedPatrol: officer1,
        patrolImages: ["noise-patrol-1"],
        notes: "Patrol unit dispatched to measure decibel levels and warn the site manager.",
        incidentDate: daysAgo(5),
      },
      {
        caseId: "REP-205871",
        violationType: "LITTERING",
        reportTypeName: "LITTERING",
        reporter: hiwot,
        description:
          "There is littering along the main road near my house. Trash has been accumulating for about 3 days and is getting worse.",
        lat: 9.0031,
        lng: 38.7844,
        address: "Gurd Shola, near Alem Cinema",
        area: "Yeka",
        imageSeeds: ["litter-road", "litter-dump", "litter-closeup"],
        status: ReportStatus.IN_PROGRESS,
        assignedPatrol: officer2,
        patrolImages: ["litter-patrol"],
        patrolAudioN: [5],
        notes: "Cleanup team assigned and dispatched to the area.",
        incidentDate: daysAgo(3),
      },
      {
        caseId: "REP-318556",
        violationType: "VANDALISM",
        reportTypeName: "VANDALISM",
        reporter: dawit,
        description:
          "Graffiti and broken street lights on Woreda Road. A bus shelter has been damaged and public property defaced.",
        lat: 9.0168,
        lng: 38.7615,
        address: "Arat Kilo, near the school",
        area: "Arada",
        imageSeeds: ["vandal-shelter", "vandal-graffiti", "vandal-light"],
        videoN: [1],
        status: ReportStatus.UNDER_REVIEW,
        assignedPatrol: officer3,
        incidentDate: daysAgo(2),
      },
      {
        caseId: "REP-429715",
        violationType: "ILLEGAL_DUMPING",
        reportTypeName: "ILLEGAL_DUMPING",
        reporter: hiwot,
        description:
          "Someone is dumping waste into the river. This is serious and urgent — it is contaminating the water.",
        lat: 8.9979,
        lng: 38.7931,
        address: "Riverbank, Akaki near old bridge",
        area: "Akaki Kaliti",
        imageSeeds: ["river-dump", "river-dump-wide", "river-closeup"],
        audioN: [2],
        videoN: [2],
        isEmergency: true,
        status: ReportStatus.RESOLVED,
        assignedPatrol: officer1,
        patrolImages: ["river-patrol-1", "river-patrol-2"],
        patrolNotes: "Dumping site identified and cleaned. Violator warned with written citation.",
        resolvedAt: daysAgo(1),
        incidentDate: daysAgo(2, 5),
      },
      {
        caseId: "REP-530248",
        violationType: "AIR_POLLUTION",
        reportTypeName: "AIR_POLLUTION",
        reporter: abebe,
        description:
          "Thick smoke from burning plastic waste near the market is covering the area. Breathing is difficult.",
        lat: 9.0301,
        lng: 38.7402,
        address: "Merkato, near bus terminal",
        area: "Addis Ketema",
        imageSeeds: ["smoke-market", "smoke-sky"],
        status: ReportStatus.SUBMITTED,
        incidentDate: daysAgo(0, 6),
      },
      {
        caseId: "REP-612493",
        violationType: "HAZARDOUS_WASTE",
        reportTypeName: "HAZARDOUS_WASTE",
        reporter: dawit,
        description:
          "Used oil and chemicals are being dumped in an open drain next to a mechanic shop. High risk for the community.",
        lat: 9.0093,
        lng: 38.7698,
        address: "Kazanchis, behind car repair shops",
        area: "Kirkos",
        imageSeeds: ["oil-drain", "oil-drain-2", "oil-barrels"],
        status: ReportStatus.CLOSED,
        assignedPatrol: officer2,
        patrolNotes: "Hazardous material contained and removed by the city environmental team.",
        resolvedAt: daysAgo(4),
        incidentDate: daysAgo(6),
      },
      {
        caseId: "REP-735608",
        violationType: "WATER_POLLUTION",
        reportTypeName: "WATER_POLLUTION",
        reporter: abebe,
        description:
          "Untreated sewage is flowing into the drainage channel that feeds the reservoir.",
        lat: 8.9684,
        lng: 38.7702,
        address: "Kality industrial area",
        area: "Akaki Kaliti",
        imageSeeds: ["sewage-channel", "sewage-outlet"],
        status: ReportStatus.REJECTED,
        rejectionReason: "Duplicate of an already reported issue. Merged into case REP-429715.",
        incidentDate: daysAgo(7),
      },
      {
        caseId: "REP-842017",
        violationType: "SOIL_CONTAMINATION",
        reportTypeName: "SOIL_CONTAMINATION",
        reporter: hiwot,
        description:
          "A fertilizer factory is leaking chemicals into the surrounding farmland, ruining crops.",
        lat: 8.9056,
        lng: 38.7957,
        address: "Lebu, farmland near factory",
        area: "Bole",
        imageSeeds: ["soil-contam", "soil-contam-2", "soil-crops"],
        status: ReportStatus.ESCALATED,
        assignedPatrol: officer3,
        patrolNotes: "Escalated to the federal environmental protection authority.",
        incidentDate: daysAgo(1, 4),
      },
    ];

    const reportRows: Report[] = [];
    for (let i = 0; i < reports.length; i++) {
      const r = reports[i];
      const reportType = typeByName.get(r.reportTypeName) || null;

      const row = repo.create({
        caseId: r.caseId,
        reporterId: r.reporter?.id || null,
        reporterPhoneNumber: r.reporter?.phoneNumber || null,
        reportTypeId: reportType?.id || null,
        violationType: r.violationType,
        reportDescription: r.description,
        latitude: r.lat,
        longitude: r.lng,
        address: r.address,
        area: r.area,
        cityId: city?.id || null,
        subcityId: subcity?.id || null,
        woredaId: woreda?.id || null,
        imageUrls: r.imageSeeds.map((s) => this.image(s)),
        videoUrls: r.videoN ? r.videoN.map((n) => this.video(n)) : [],
        audioUrls: r.audioN ? r.audioN.map((n) => this.audio(n)) : [],
        evidenceUrls: [
          ...r.imageSeeds.map((s) => this.image(s)),
          ...(r.audioN ? r.audioN.map((n) => this.audio(n)) : []),
          ...(r.videoN ? r.videoN.map((n) => this.video(n)) : []),
        ],
        decibelLevel: r.decibelLevel ?? null,
        noiseAreaType: r.noiseAreaType ?? null,
        noisePollutionStatus: r.noisePollutionStatus ?? null,
        isAnonymous: false,
        status: r.status,
        assignedPatrolId: r.assignedPatrol?.id || null,
        assignedAt: r.assignedPatrol ? daysAgo(1) : null,
        patrolImageUrls: r.patrolImages ? r.patrolImages.map((s) => this.image(s)) : [],
        patrolAudioUrls: r.patrolAudioN ? r.patrolAudioN.map((n) => this.audio(n)) : [],
        patrolEvidenceUrls: [
          ...(r.patrolImages ? r.patrolImages.map((s) => this.image(s)) : []),
          ...(r.patrolAudioN ? r.patrolAudioN.map((n) => this.audio(n)) : []),
        ],
        patrolNotes: r.notes ?? r.patrolNotes ?? null,
        rejectionReason: r.rejectionReason ?? null,
        incidentDateTime: r.incidentDate ?? daysAgo(1),
        isOngoing: r.status === ReportStatus.SUBMITTED || r.status === ReportStatus.ASSIGNED,
        isEmergency: !!r.isEmergency,
        devicePlatform: DevicePlatform.ANDROID,
        appVersion: "1.0.0",
        deviceId: `dev-${(i + 1).toString().padStart(4, "0")}`,
        ipAddress: "196.188.120.10",
        resolvedAt: r.resolvedAt ?? null,
      });

      const saved = await repo.save(row);
      reportRows.push(saved);
      console.log(`✔ Seeded report: ${saved.caseId} (${saved.violationType})`);
    }

    await this.seedReportLogs(reportRows);
  }

  private async seedReportLogs(reports: Report[]) {
    const repo: Repository<ReportLog> = this.dataSource.getRepository(ReportLog);
    const existing = await repo.count();
    if (existing > 0) {
      console.log("• Report logs already exist — skipping");
      return;
    }

    const statusOrder: ReportStatus[] = [
      ReportStatus.SUBMITTED,
      ReportStatus.UNDER_REVIEW,
      ReportStatus.ASSIGNED,
      ReportStatus.IN_PROGRESS,
      ReportStatus.RESOLVED,
      ReportStatus.CLOSED,
      ReportStatus.ESCALATED,
      ReportStatus.REJECTED,
    ];

    for (const report of reports) {
      const idx = statusOrder.indexOf(report.status);
      const steps = idx < 0 ? [ReportStatus.SUBMITTED, report.status] : statusOrder.slice(0, idx + 1);

      for (let s = 0; s < steps.length; s++) {
        const log = repo.create({
          reportId: report.id,
          citizenId: report.reporterId || null,
          patrolId: report.assignedPatrolId || null,
          latitude: report.latitude,
          longitude: report.longitude,
          status: steps[s],
          notes: `Status changed to ${steps[s]}`,
          createdAt: new Date(Date.now() - (steps.length - s) * 86400000),
        });
        await repo.save(log);
      }
    }
    console.log(`✔ Seeded report logs for ${reports.length} reports`);
  }

  async seedConversations() {
    await this.ensure();
    const convRepo: Repository<Conversation> = this.dataSource.getRepository(Conversation);
    const existing = await convRepo.count();
    if (existing > 0) {
      console.log("• Chat conversations already exist — skipping");
      return;
    }

    const reportRepo: Repository<Report> = this.dataSource.getRepository(Report);
    const citizenRepo: Repository<Citizen> = this.dataSource.getRepository(Citizen);
    const patrolRepo: Repository<Patrol> = this.dataSource.getRepository(Patrol);
    const userRepo: Repository<User> = this.dataSource.getRepository(User);

    const reports = await reportRepo.find({ take: 6 });
    if (reports.length === 0) {
      console.log("• No reports found — skipping chat seed");
      return;
    }

    const citizens = await citizenRepo.find();
    const patrols = await patrolRepo.find();
    const admin =
      (await userRepo.findOne({ where: { email: "admin@possibletechplc.com" } })) ||
      (await userRepo.findOne({ where: { role: "SYSTEM_SUPER_ADMIN" } as any }));

    const citizenById = (id: string | undefined) => citizens.find((c) => c.id === id);
    const patrolByEmail = (email: string) => patrols.find((p) => p.email === email);
    const officer1 = patrolByEmail("officer1@peace.gov.et");
    const officer2 = patrolByEmail("officer2@peace.gov.et");

    const adminSender = admin
      ? { id: admin.id, name: admin.fullName, type: "admin" }
      : { id: "system", name: "System Admin", type: "admin" };

    const scripts: Array<{
      report: Report;
      messages: Array<{
        sender: { id: string; name: string; type: string };
        content: string;
        minutesAgo: number;
      }>;
    }> = [];

    const citizenFor = (report: Report) => citizenById(report.reporterId);
    const patrolFor = (report: Report) =>
      report.assignedPatrolId === officer1?.id ? officer1 : officer2;

    const c1 = citizenFor(reports[0]);
    const c2 = citizenFor(reports[1]);
    const c3 = citizenFor(reports[2]);
    const p1 = patrolFor(reports[0]);
    const p2 = patrolFor(reports[1]);
    const p3 = patrolFor(reports[2]) || officer3();

    function officer3() {
      return patrols.find((p) => p.email === "officer3@peace.gov.et");
    }

    const senderOf = (c?: Citizen, p?: Patrol) => ({
      citizen: c ? { id: c.id, name: c.fullName, type: "citizen" } : null,
      patrol: p ? { id: p.id, name: p.fullName, type: "patrol" } : null,
    });

    if (reports[0]) {
      const s = senderOf(c1, p1);
      scripts.push({
        report: reports[0],
        messages: [
          { sender: s.citizen!, content: "Hello, I want to report a noise disturbance in my neighborhood.", minutesAgo: 120 },
          { sender: s.patrol!, content: "Thank you for your report. Can you provide the exact location?", minutesAgo: 115 },
          { sender: s.citizen!, content: "It is near Bole Road, next to the pharmacy.", minutesAgo: 110 },
          { sender: s.patrol!, content: "Understood. We are dispatching a patrol unit to your location.", minutesAgo: 105 },
          { sender: adminSender, content: "Patrol unit has been dispatched. Case ID: REP-120394", minutesAgo: 100 },
          { sender: s.patrol!, content: "We have arrived at the location and are measuring noise levels now.", minutesAgo: 60 },
          { sender: s.patrol!, content: "Noise levels confirmed above the threshold. Warning issued to the site manager.", minutesAgo: 30 },
        ],
      });
    }

    if (reports[1]) {
      const s = senderOf(c2, p2);
      scripts.push({
        report: reports[1],
        messages: [
          { sender: s.citizen!, content: "There is littering along the main road near my house.", minutesAgo: 240 },
          { sender: s.patrol!, content: "Thank you Hiwot. How long has this been going on?", minutesAgo: 235 },
          { sender: s.citizen!, content: "About 3 days now. It is getting worse.", minutesAgo: 230 },
          { sender: s.patrol!, content: "We will send a team to assess and clean up the area.", minutesAgo: 225 },
          { sender: adminSender, content: "Cleanup team assigned. Expected arrival in 2 hours.", minutesAgo: 220 },
          { sender: s.citizen!, content: "Thank you very much for the quick response!", minutesAgo: 215 },
        ],
      });
    }

    if (reports[2]) {
      const s = senderOf(c3, p3);
      scripts.push({
        report: reports[2],
        messages: [
          { sender: s.citizen!, content: "I found an abandoned vehicle on Woreda Road.", minutesAgo: 480 },
          { sender: s.patrol!, content: "Can you describe the vehicle? Make, model, color?", minutesAgo: 475 },
          { sender: s.citizen!, content: "It is a white Toyota Corolla, old model, no license plates.", minutesAgo: 470 },
          { sender: s.patrol!, content: "Noted. We will send someone to investigate.", minutesAgo: 465 },
          { sender: adminSender, content: "Report logged. Patrol unit dispatched to Woreda Road.", minutesAgo: 460 },
          { sender: s.patrol!, content: "Vehicle has been located. It appears to have been stolen.", minutesAgo: 400 },
          { sender: adminSender, content: "Escalating to investigation team. Thank you for reporting.", minutesAgo: 395 },
          { sender: s.citizen!, content: "Glad I could help. Is there anything else you need from me?", minutesAgo: 390 },
          { sender: s.patrol!, content: "We may need your statement later. We will contact you.", minutesAgo: 385 },
        ],
      });
    }

    const msgRepo: Repository<Message> = this.dataSource.getRepository(Message);

    for (const script of scripts) {
      const conv = convRepo.create({ reportId: script.report.id });
      const savedConv = await convRepo.save(conv);

      for (let i = 0; i < script.messages.length; i++) {
        const m = script.messages[i];
        const createdAt = new Date(Date.now() - m.minutesAgo * 60000);
        const msg = msgRepo.create({
          conversationId: savedConv.id,
          senderId: m.sender.id,
          senderType: m.sender.type,
          senderName: m.sender.name,
          content: m.content,
          isRead: i < script.messages.length - 1,
          readAt: i < script.messages.length - 1 ? createdAt : null,
          readBy: [],
          createdAt,
        });
        await msgRepo.save(msg);
      }
      console.log(`✔ Seeded conversation for report ${script.report.caseId}`);
    }

    console.log("✔ Chat seed data complete");
  }

  async seedCameras() {
    await this.ensure();
    const camRepo: Repository<Camera> = this.dataSource.getRepository(Camera);
    const alertRepo: Repository<CameraAlert> = this.dataSource.getRepository(CameraAlert);

    const existingCams = await camRepo.count();
    if (existingCams === 0) {
      const cameras = [
        { cameraId: "CAM-BOL-001", locationName: "Bole Road Junction", latitude: 8.9806, longitude: 38.8008, streamUrl: "rtsp://192.168.1.21:554/stream1" },
        { cameraId: "CAM-BOL-002", locationName: "Bole International Airport Entrance", latitude: 8.9779, longitude: 38.7993, streamUrl: "rtsp://192.168.1.22:554/stream1" },
        { cameraId: "CAM-MES-003", locationName: "Meskel Square", latitude: 9.0108, longitude: 38.7612, streamUrl: "rtsp://192.168.1.23:554/stream1" },
        { cameraId: "CAM-MER-004", locationName: "Merkato Bus Terminal", latitude: 9.0301, longitude: 38.7402, streamUrl: "rtsp://192.168.1.24:554/stream1" },
        { cameraId: "CAM-ARA-005", locationName: "Arat Kilo Roundabout", latitude: 9.0219, longitude: 38.7582, streamUrl: "rtsp://192.168.1.25:554/stream1" },
        { cameraId: "CAM-KAZ-006", locationName: "Kazanchis Tower", latitude: 9.0093, longitude: 38.7698, streamUrl: "rtsp://192.168.1.26:554/stream1" },
      ];

      for (let i = 0; i < cameras.length; i++) {
        const cam = camRepo.create({
          cameraId: cameras[i].cameraId,
          locationName: cameras[i].locationName,
          latitude: cameras[i].latitude,
          longitude: cameras[i].longitude,
          streamUrl: cameras[i].streamUrl,
          isActive: true,
          lastMaintenanceDate: new Date(Date.now() - 30 * 86400000),
          metadata: {
            resolution: "1080p",
            fps: 25,
            powerSource: "Solar",
            bandwithMbps: 4,
          },
        });
        await camRepo.save(cam);
        console.log(`✔ Seeded camera: ${cam.cameraId}`);
      }
    } else {
      console.log("• Cameras already exist — skipping");
    }

    const existingAlerts = await alertRepo.count();
    if (existingAlerts > 0) {
      console.log("• Camera alerts already exist — skipping");
      return;
    }

    const cameras = await camRepo.find();
    if (cameras.length === 0) return;

    const alerts = [
      { cam: 0, violationType: "ILLEGAL_DUMPING", evidence: this.image("alert-dump-1"), confidence: 0.94, status: CameraAlertStatus.OPEN },
      { cam: 0, violationType: "LITTERING", evidence: this.image("alert-litter-1"), confidence: 0.87, status: CameraAlertStatus.ASSIGNED },
      { cam: 1, violationType: "PARKING_VIOLATION", evidence: this.image("alert-parking-1"), confidence: 0.91, status: CameraAlertStatus.OPEN },
      { cam: 2, violationType: "NOISE", evidence: this.image("alert-noise-1"), confidence: 0.79, status: CameraAlertStatus.OPEN },
      { cam: 3, violationType: "ILLEGAL_VENDING", evidence: this.image("alert-vending-1"), confidence: 0.83, status: CameraAlertStatus.CLOSED },
      { cam: 4, violationType: "VANDALISM", evidence: this.image("alert-vandal-1"), confidence: 0.96, status: CameraAlertStatus.OPEN },
      { cam: 5, violationType: "HAZARDOUS_WASTE", evidence: this.image("alert-hazard-1"), confidence: 0.88, status: CameraAlertStatus.ASSIGNED },
      { cam: 2, violationType: "TRAFFIC_JAM", evidence: this.image("alert-traffic-1"), confidence: 0.92, status: CameraAlertStatus.CLOSED },
    ];

    for (const a of alerts) {
      const alert = alertRepo.create({
        cameraId: cameras[a.cam].id,
        violationType: a.violationType,
        evidenceUrl: a.evidence,
        confidenceScore: a.confidence,
        status: a.status,
      });
      await alertRepo.save(alert);
      console.log(`✔ Seeded camera alert: ${a.violationType} @ ${cameras[a.cam].cameraId}`);
    }
  }

  async seedNotifications() {
    await this.ensure();
    const repo: Repository<Notification> = this.dataSource.getRepository(Notification);
    const existing = await repo.count();
    if (existing > 0) {
      console.log("• Notifications already exist — skipping");
      return;
    }

    const userRepo: Repository<User> = this.dataSource.getRepository(User);
    const citizenRepo: Repository<Citizen> = this.dataSource.getRepository(Citizen);
    const reportRepo: Repository<Report> = this.dataSource.getRepository(Report);

    const admin =
      (await userRepo.findOne({ where: { email: "admin@possibletechplc.com" } })) ||
      (await userRepo.findOne({ where: { role: "SYSTEM_SUPER_ADMIN" } as any }));

    const citizens = await citizenRepo.find();
    const reports = await reportRepo.find({ take: 5 });

    const notifications = [
      {
        userId: admin?.id || null,
        title: "New Report Submitted",
        message: `A new NOISE report was submitted in Bole. Case: ${reports[0]?.caseId || "REP-120394"}`,
        type: NotificationType.REPORT_SUBMITTED,
        data: { reportId: reports[0]?.id, caseId: reports[0]?.caseId },
        isRead: false,
        minutesAgo: 120,
      },
      {
        userId: admin?.id || null,
        title: "Report Assigned",
        message: `Case ${reports[0]?.caseId || "REP-120394"} was assigned to a patrol unit.`,
        type: NotificationType.REPORT_ASSIGNED,
        data: { reportId: reports[0]?.id, caseId: reports[0]?.caseId },
        isRead: false,
        minutesAgo: 110,
      },
      {
        citizenId: citizens[0]?.id || null,
        title: "Report Received",
        message: `Your report has been received. Case: ${reports[0]?.caseId || "REP-120394"}. A patrol officer has been dispatched.`,
        type: NotificationType.REPORT_STATUS_UPDATED,
        data: { reportId: reports[0]?.id, status: "ASSIGNED" },
        isRead: false,
        minutesAgo: 100,
      },
      {
        userId: admin?.id || null,
        title: "Patrol Follow-up",
        message: "Patrol Officer 1 submitted a follow-up with evidence on an active case.",
        type: NotificationType.PATROL_FOLLOW_UP,
        data: { reportId: reports[0]?.id },
        isRead: true,
        minutesAgo: 60,
      },
      {
        userId: admin?.id || null,
        title: "System Maintenance",
        message: "Scheduled system maintenance will occur on Sunday at 02:00 AM.",
        type: NotificationType.GENERAL,
        data: null,
        isRead: true,
        minutesAgo: 1440,
      },
      {
        citizenId: citizens[1]?.id || null,
        title: "Case Resolved",
        message: `Your illegal dumping report has been resolved. Thank you for reporting.`,
        type: NotificationType.REPORT_STATUS_UPDATED,
        data: { reportId: reports[3]?.id, status: "RESOLVED" },
        isRead: true,
        minutesAgo: 180,
      },
      {
        userId: admin?.id || null,
        title: "New Camera Alert",
        message: "High-confidence ILLEGAL_DUMPING event detected at Bole Road Junction.",
        type: NotificationType.GENERAL,
        data: null,
        isRead: false,
        minutesAgo: 15,
      },
    ];

    for (const n of notifications) {
      const row = repo.create({
        userId: n.userId,
        citizenId: n.citizenId,
        title: n.title,
        message: n.message,
        type: n.type,
        data: n.data,
        isRead: n.isRead,
        createdAt: new Date(Date.now() - n.minutesAgo * 60000),
      });
      await repo.save(row);
      console.log(`✔ Seeded notification: ${n.title}`);
    }
  }

  async seedSettings() {
    await this.ensure();
    const repo: Repository<Setting> = this.dataSource.getRepository(Setting);
    const existing = await repo.count();
    if (existing > 0) {
      console.log("• Settings already exist — skipping");
      return;
    }

    const settings = [
      { key: "system.appName", value: "Peace & Security", description: "Display name of the system" },
      { key: "system.maintenanceMode", value: "false", description: "Enable maintenance mode for the whole system" },
      { key: "system.defaultLanguage", value: "AMHARIC", description: "Default UI language" },
      { key: "report.noise.residentialThreshold", value: "45", description: "Residential decibel threshold" },
      { key: "report.noise.commercialThreshold", value: "55", description: "Commercial decibel threshold" },
      { key: "report.autoAssign.enabled", value: "true", description: "Automatically assign reports to nearby patrols" },
      { key: "report.autoAssign.maxRadiusKm", value: "5", description: "Max radius for auto assignment" },
      { key: "notification.push.enabled", value: "true", description: "Enable push notifications" },
      { key: "notification.sms.enabled", value: "true", description: "Enable SMS notifications" },
      { key: "security.otp.expiryMinutes", value: "5", description: "OTP expiry duration in minutes" },
      { key: "security.maxLoginAttempts", value: "5", description: "Max failed login attempts before lockout" },
      { key: "security.lockoutMinutes", value: "15", description: "Account lockout duration in minutes" },
      { key: "camera.alertConfidenceThreshold", value: "0.8", description: "Minimum confidence to raise a camera alert" },
    ];

    for (const s of settings) {
      const row = repo.create({ ...s });
      await repo.save(row);
    }
    console.log(`✔ Seeded ${settings.length} settings`);
  }
}
