import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Between } from "typeorm";
import { Report } from "../reports/entities/report.entity";
import { User } from "../user/entities/user.entity";
import { Camera } from "../cameras/entities/camera.entity";
import { ReportType } from "../report-types/entities/report-type.entity";
import { ReportStatus, UserRole, UserStatus } from "../../common/enums/enums";
import { Citizen } from "../citizen/entities/citizen.entity";
import { Patrol } from "../patrol/entities/patrol.entity";
import * as dayjs from "dayjs";

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Report)
    private readonly reportRepo: Repository<Report>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Camera)
    private readonly cameraRepo: Repository<Camera>,
    @InjectRepository(ReportType)
    private readonly reportTypeRepo: Repository<ReportType>,
    @InjectRepository(Citizen)
    private readonly citizenRepo: Repository<Citizen>,
    @InjectRepository(Patrol)
    private readonly patrolRepo: Repository<Patrol>,
  ) { }

  async getStats(user: any) {
    // 1. Report Counts
    const totalReports = await this.reportRepo.count();
    const resolvedReports = await this.reportRepo.count({
      where: [
        { status: ReportStatus.RESOLVED },
        { status: ReportStatus.CLOSED },
      ],
    });
    const pendingReports = await this.reportRepo.count({
      where: [
        { status: ReportStatus.SUBMITTED },
        { status: ReportStatus.UNDER_REVIEW },
        { status: ReportStatus.ASSIGNED },
        { status: ReportStatus.IN_PROGRESS },
      ],
    });

    const totalCitizens = await this.citizenRepo.count();
    const totalPatrols = await this.patrolRepo.count();
    const totalAdmins = await this.userRepo.count({
      where: [
        { role: UserRole.SYSTEM_ADMIN },
        { role: UserRole.SYSTEM_SUPER_ADMIN },
      ],
    });

    // 3. Camera Counts
    let totalCameras = 0;
    let activeCameras = 0;
    try {
      totalCameras = await this.cameraRepo.count();
      activeCameras = await this.cameraRepo.count({
        where: { isActive: true },
      });
    } catch {
      // Camera table may not exist if module was removed
    }

    // 4. Report Types Count
    let totalReportTypes = 0;
    try {
      totalReportTypes = await this.reportTypeRepo.count();
    } catch {
      // ReportType table may not exist
    }

    // 5. Reports by Type (violationType is a plain string column on Report)
    const reportsByType = await this.reportRepo
      .createQueryBuilder("report")
      .select("report.violationType", "name")
      .addSelect("COUNT(report.id)", "count")
      .where("report.violationType IS NOT NULL")
      .groupBy("report.violationType")
      .getRawMany();

    // 6. Reports by Status (Chart data)
    const reportsByStatus = await this.reportRepo
      .createQueryBuilder("report")
      .select("report.status", "status")
      .addSelect("COUNT(report.id)", "count")
      .groupBy("report.status")
      .getRawMany();

    // 7. Last 7 Days Trend
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = dayjs().subtract(i, "day").format("YYYY-MM-DD");
      const startOfDay = dayjs().subtract(i, "day").startOf("day").toDate();
      const endOfDay = dayjs().subtract(i, "day").endOf("day").toDate();

      const count = await this.reportRepo.count({
        where: {
          createdAt: Between(startOfDay, endOfDay),
        },
      });

      last7Days.push({ date, count });
    }

    return {
      reports: {
        total: totalReports,
        resolved: resolvedReports,
        pending: pendingReports,
        byType: reportsByType,
        byStatus: reportsByStatus,
        trend: last7Days,
      },
      users: {
        citizens: totalCitizens,
        patrols: totalPatrols,
        admins: totalAdmins,
      },
      cameras: {
        total: totalCameras,
        active: activeCameras,
      },
      reportTypes: totalReportTypes,
    };
  }

  async getFleetLocations() {
    // 1. All Active Patrols with location
    const patrols = await this.patrolRepo.find({
      where: { status: UserStatus.ACTIVE },
      select: ["id", "fullName", "latitude", "longitude", "phoneNumber", "lastLocationUpdate"]
    });

    // 2. Open Reports
    const openReports = await this.reportRepo.find({
      where: [
        { status: ReportStatus.SUBMITTED },
        { status: ReportStatus.UNDER_REVIEW },
        { status: ReportStatus.ASSIGNED },
        { status: ReportStatus.IN_PROGRESS },
      ],
      select: ["id", "violationType", "latitude", "longitude", "address", "createdAt"]
    });

    return {
      patrols,
      citizens: [], // Citizens no longer share real-time location
      reports: openReports
    };
  }

  async getRecentReports() {
    return this.reportRepo.find({
      order: { createdAt: "DESC" },
      take: 10,
      relations: ["assignedPatrol"],
    });
  }

  async getAnalytics(timeRange: string, user: any) {
    const now = dayjs();
    let startDate: dayjs.Dayjs;
    let dateFormat: string;
    let groupByExpr: string;

    if (timeRange === "week") {
      startDate = now.subtract(7, "day").startOf("day");
      dateFormat = "YYYY-MM-DD";
      groupByExpr = "DATE(report.createdAt)";
    } else if (timeRange === "month") {
      startDate = now.subtract(30, "day").startOf("day");
      dateFormat = "YYYY-MM-DD";
      groupByExpr = "DATE(report.createdAt)";
    } else {
      startDate = now.subtract(12, "month").startOf("month");
      dateFormat = "YYYY-MM";
      groupByExpr = "TO_CHAR(report.createdAt, 'YYYY-MM')";
    }

    const startDateStr = startDate.format("YYYY-MM-DD");

    // 1. Stats cards
    const totalReports = await this.reportRepo
      .createQueryBuilder("report")
      .where("report.createdAt >= :startDate", { startDate: startDateStr })
      .getCount();

    const highPriorityReports = await this.reportRepo
      .createQueryBuilder("report")
      .where("report.createdAt >= :startDate", { startDate: startDateStr })
      .andWhere("report.status = :status", { status: ReportStatus.SUBMITTED })
      .getCount();

    const resolvedReports = await this.reportRepo
      .createQueryBuilder("report")
      .where("report.createdAt >= :startDate", { startDate: startDateStr })
      .andWhere("report.status IN (:...statuses)", {
        statuses: [ReportStatus.RESOLVED, ReportStatus.CLOSED],
      })
      .getCount();

    const avgResponseTime = totalReports > 0 ? Math.round((resolvedReports / totalReports) * 100) : 0;

    // Top location
    const topLocationRaw = await this.reportRepo
      .createQueryBuilder("report")
      .select("report.address", "address")
      .addSelect("COUNT(report.id)", "count")
      .where("report.createdAt >= :startDate", { startDate: startDateStr })
      .andWhere("report.address IS NOT NULL")
      .andWhere("report.address != ''")
      .groupBy("report.address")
      .orderBy("count", "DESC")
      .limit(1)
      .getRawOne();

    // 2. Status bar chart — reports grouped by status per time bucket
    const statusData = await this.reportRepo
      .createQueryBuilder("report")
      .select(groupByExpr, "period")
      .addSelect("report.status", "status")
      .addSelect("COUNT(report.id)", "count")
      .where("report.createdAt >= :startDate", { startDate: startDateStr })
      .groupBy(groupByExpr)
      .addGroupBy("report.status")
      .orderBy("period", "ASC")
      .getRawMany();

    // 3. Monthly line chart — total reports per time bucket
    const trendData = await this.reportRepo
      .createQueryBuilder("report")
      .select(groupByExpr, "period")
      .addSelect("COUNT(report.id)", "count")
      .where("report.createdAt >= :startDate", { startDate: startDateStr })
      .groupBy(groupByExpr)
      .orderBy("period", "ASC")
      .getRawMany();

    // 4. Category donut chart — reports by violation type
    const categoryData = await this.reportRepo
      .createQueryBuilder("report")
      .select("report.violationType", "name")
      .addSelect("COUNT(report.id)", "value")
      .where("report.createdAt >= :startDate", { startDate: startDateStr })
      .andWhere("report.violationType IS NOT NULL")
      .andWhere("report.violationType != ''")
      .groupBy("report.violationType")
      .orderBy("value", "DESC")
      .getRawMany();

    return {
      stats: {
        totalReports,
        highPriorityReports,
        avgResponseTime: `${avgResponseTime}%`,
        topLocation: topLocationRaw?.address || "N/A",
      },
      statusChart: statusData,
      trendChart: trendData,
      categoryChart: categoryData,
      timeRange,
    };
  }
}
