import { Injectable, OnApplicationBootstrap } from "@nestjs/common";
import { DataSource, Repository } from "typeorm";
import { Conversation } from "../../modules/chat/entities/conversation.entity";
import { Message } from "../../modules/chat/entities/message.entity";
import { Report } from "../../modules/reports/entities/report.entity";
import { User } from "../../modules/user/entities/user.entity";

@Injectable()
export class ChatSeederService implements OnApplicationBootstrap {
  constructor(private dataSource: DataSource) {}

  async onApplicationBootstrap() {
    await this.seedConversations();
  }

  async seedConversations() {
    if (!this.dataSource.isInitialized) {
      await this.dataSource.initialize();
    }

    const convRepo: Repository<Conversation> = this.dataSource.getRepository(Conversation);
    const msgRepo: Repository<Message> = this.dataSource.getRepository(Message);
    const reportRepo: Repository<Report> = this.dataSource.getRepository(Report);
    const userRepo: Repository<User> = this.dataSource.getRepository(User);

    const existing = await convRepo.count();
    if (existing > 0) {
      console.log("• Chat conversations already exist — skipping");
      return;
    }

    const reports = await reportRepo.find({ take: 5 });
    if (reports.length === 0) {
      console.log("• No reports found — skipping chat seed");
      return;
    }

    const admin = await userRepo.findOne({ where: { email: "admin@example.com" } });
    const adminId = admin?.id || "system";
    const adminName = admin?.fullName || "System Admin";

    const participants = [
      { id: "citizen-001", name: "Abebe Kebede", type: "citizen" },
      { id: "citizen-002", name: "Hiwot Tesfaye", type: "citizen" },
      { id: "citizen-003", name: "Dawit Mekonnen", type: "citizen" },
      { id: "patrol-001", name: "Sgt. Tadesse Worku", type: "patrol" },
      { id: "patrol-002", name: "Officer Fatuma Ali", type: "patrol" },
    ];

    const conversationsData = [
      {
        report: reports[0],
        messages: [
          { sender: participants[0], content: "Hello, I want to report a noise disturbance in my neighborhood.", minutesAgo: 120 },
          { sender: participants[3], content: "Thank you for your report. Can you provide the exact location?", minutesAgo: 115 },
          { sender: participants[0], content: "It is near Bole Road, next to the pharmacy.", minutesAgo: 110 },
          { sender: participants[3], content: "Understood. We are dispatching a patrol unit to your location.", minutesAgo: 105 },
          { sender: { id: adminId, name: adminName, type: "admin" }, content: "Patrol unit has been dispatched. Case ID: CASE-2026-001", minutesAgo: 100 },
          { sender: participants[3], content: "We have arrived at the location. Investigating now.", minutesAgo: 60 },
          { sender: participants[3], content: "Issue resolved. Noise source identified and addressed.", minutesAgo: 30 },
        ],
        readByPattern: [0, 1, 2, 3, 4, 5, 6],
      },
      {
        report: reports[Math.min(1, reports.length - 1)],
        messages: [
          { sender: participants[1], content: "There is littering along the main road near my house.", minutesAgo: 240 },
          { sender: participants[4], content: "Thank you Hiwot. How long has this been going on?", minutesAgo: 235 },
          { sender: participants[1], content: "About 3 days now. It is getting worse.", minutesAgo: 230 },
          { sender: participants[4], content: "We will send a team to assess and clean up the area.", minutesAgo: 225 },
          { sender: { id: adminId, name: adminName, type: "admin" }, content: "Cleanup team assigned. Expected arrival in 2 hours.", minutesAgo: 220 },
          { sender: participants[1], content: "Thank you very much for the quick response!", minutesAgo: 215 },
        ],
        readByPattern: [0, 1, 2, 3, 4, 5],
      },
      {
        report: reports[Math.min(2, reports.length - 1)],
        messages: [
          { sender: participants[2], content: "I found an abandoned vehicle on Woreda Road.", minutesAgo: 480 },
          { sender: participants[3], content: "Can you describe the vehicle? Make, model, color?", minutesAgo: 475 },
          { sender: participants[2], content: "It is a white Toyota Corolla, old model, no license plates.", minutesAgo: 470 },
          { sender: participants[3], content: "Noted. We will send someone to investigate.", minutesAgo: 465 },
          { sender: { id: adminId, name: adminName, type: "admin" }, content: "Report logged. Patrol unit dispatched to Woreda Road.", minutesAgo: 460 },
          { sender: participants[3], content: "Vehicle has been located. It appears to have been stolen.", minutesAgo: 400 },
          { sender: { id: adminId, name: adminName, type: "admin" }, content: "Escalating to investigation team. Thank you for reporting.", minutesAgo: 395 },
          { sender: participants[2], content: "Glad I could help. Is there anything else you need from me?", minutesAgo: 390 },
          { sender: participants[3], content: "We may need your statement later. We will contact you.", minutesAgo: 385 },
        ],
        readByPattern: [0, 1, 2, 3, 4, 5, 6, 7, 8],
      },
      {
        report: reports[Math.min(3, reports.length - 1)],
        messages: [
          { sender: participants[0], content: "The streetlights on my road have been out for a week.", minutesAgo: 600 },
          { sender: participants[4], content: "Thank you for letting us know. Which road specifically?", minutesAgo: 595 },
          { sender: participants[0], content: "Arat Kilo area, near the school.", minutesAgo: 590 },
          { sender: participants[4], content: "We have reported this to the city maintenance department.", minutesAgo: 585 },
        ],
        readByPattern: [0, 1, 2, 3],
      },
      {
        report: reports[Math.min(4, reports.length - 1)],
        messages: [
          { sender: participants[1], content: "I see someone dumping waste in the river.", minutesAgo: 30 },
          { sender: participants[3], content: "This is serious. Can you take a photo if it is safe?", minutesAgo: 28 },
          { sender: participants[1], content: "Yes, I took a photo. Sending it now.", minutesAgo: 25 },
          { sender: participants[3], content: "Stay safe. We are on our way.", minutesAgo: 22 },
          { sender: { id: adminId, name: adminName, type: "admin" }, content: "Emergency dispatch activated. Patrol ETA: 5 minutes.", minutesAgo: 20 },
        ],
        readByPattern: [0, 1, 2, 3, 4],
      },
    ];

    for (const convData of conversationsData) {
      const conv = convRepo.create({ reportId: convData.report.id });
      const savedConv = await convRepo.save(conv);

      for (let i = 0; i < convData.messages.length; i++) {
        const msgData = convData.messages[i];
        const createdAt = new Date(Date.now() - msgData.minutesAgo * 60000);

        const readByEntries: Array<{ userId: string; userName: string; readAt: Date }> = [];
        const readPatternIndex = i < convData.readByPattern.length ? convData.readByPattern[i] : convData.messages.length - 1;

        for (let r = 0; r <= readPatternIndex && r < convData.messages.length; r++) {
          if (r !== i) {
            const reader = convData.messages[r].sender;
            readByEntries.push({
              userId: reader.id,
              userName: reader.name,
              readAt: new Date(createdAt.getTime() + (readPatternIndex - r) * 60000),
            });
          }
        }

        const msg = msgRepo.create({
          conversationId: savedConv.id,
          senderId: msgData.sender.id,
          senderType: msgData.sender.type,
          senderName: msgData.sender.name,
          content: msgData.content,
          isRead: readByEntries.length > 0,
          readAt: readByEntries.length > 0 ? readByEntries[readByEntries.length - 1].readAt : null,
          readBy: readByEntries,
          createdAt,
        });
        await msgRepo.save(msg);
      }

      console.log(`✔ Seeded conversation for report ${convData.report.id}`);
    }

    console.log("✔ Chat seed data complete");
  }
}
