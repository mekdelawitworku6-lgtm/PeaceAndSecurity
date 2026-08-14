import {
  Injectable,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { PatrolTeam } from "./entities/patrol-team.entity";
import { Patrol } from "./entities/patrol.entity";
import { Woreda } from "../geo/entities/woreda.entity";
import { CreatePatrolTeamDto, UpdatePatrolTeamDto } from "./dto/patrol-team.dto";
import { successResponse, ServiceResponse } from "../../common/types/service-response";
import { generateRandomCode } from "../../common/utils/generator";

@Injectable()
export class PatrolTeamService {
  constructor(
    @InjectRepository(PatrolTeam)
    private readonly teamRepo: Repository<PatrolTeam>,
    @InjectRepository(Patrol)
    private readonly patrolRepo: Repository<Patrol>,
    @InjectRepository(Woreda)
    private readonly woredaRepo: Repository<Woreda>,
  ) {}

  async create(dto: CreatePatrolTeamDto): Promise<ServiceResponse> {
    const existing = await this.teamRepo.findOne({
      where: { name: dto.name, woredaId: dto.woredaId },
    });
    if (existing) {
      throw new ConflictException("Team with this name already exists in this woreda");
    }

    const team = this.teamRepo.create({
      ...dto,
      code: generateRandomCode(6),
    });
    const saved = await this.teamRepo.save(team);
    return successResponse("Patrol team created successfully", saved);
  }

  async findAll(query: { woredaId?: string; page?: number; limit?: number }): Promise<ServiceResponse> {
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 20);
    const skip = (page - 1) * limit;

    const qb = this.teamRepo.createQueryBuilder("team");

    if (query.woredaId) {
      qb.andWhere("team.woredaId = :woredaId", { woredaId: query.woredaId });
    }

    qb.leftJoinAndSelect("team.members", "members");
    qb.leftJoinAndSelect("team.leader", "leader");

    const [data, total] = await qb
      .orderBy("team.name", "ASC")
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return successResponse("Patrol teams retrieved successfully", {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  }

  async findMyTeam(patrolId: string): Promise<ServiceResponse> {
    const patrol = await this.patrolRepo.findOne({ where: { id: patrolId } });
    if (!patrol) throw new NotFoundException("Patrol officer not found");
    if (!patrol.teamId) {
      return successResponse("Patrol officer has no team assigned", null);
    }

    const team = await this.teamRepo.findOne({
      where: { id: patrol.teamId },
      relations: ["members", "leader"],
    });
    if (!team) throw new NotFoundException("Patrol team not found");

    const woreda = team.woredaId
      ? await this.woredaRepo.findOne({ where: { id: team.woredaId } })
      : null;

    return successResponse("Patrol team retrieved successfully", {
      ...team,
      woredaName: woreda?.name ?? null,
    });
  }

  async findOne(id: string): Promise<ServiceResponse> {
    const team = await this.teamRepo.findOne({
      where: { id },
      relations: ["members", "leader"],
    });
    if (!team) throw new NotFoundException("Patrol team not found");
    return successResponse("Patrol team retrieved successfully", team);
  }

  async update(id: string, dto: UpdatePatrolTeamDto): Promise<ServiceResponse> {
    const team = await this.teamRepo.findOne({ where: { id } });
    if (!team) throw new NotFoundException("Patrol team not found");

    Object.assign(team, dto);
    const updated = await this.teamRepo.save(team);
    return successResponse("Patrol team updated successfully", updated);
  }

  async remove(id: string): Promise<ServiceResponse> {
    const team = await this.teamRepo.findOne({ where: { id } });
    if (!team) throw new NotFoundException("Patrol team not found");

    // Unassign all members before deleting
    const members = await this.patrolRepo.find({ where: { teamId: id } });
    for (const member of members) {
      member.teamId = null;
      await this.patrolRepo.save(member);
    }
    await this.teamRepo.save({ ...team, deletedAt: new Date() });
    return successResponse("Patrol team deleted successfully");
  }

  async addMember(teamId: string, patrolId: string): Promise<ServiceResponse> {
    const team = await this.teamRepo.findOne({
      where: { id: teamId },
      relations: ["members"],
    });
    if (!team) throw new NotFoundException("Patrol team not found");

    const patrol = await this.patrolRepo.findOne({ where: { id: patrolId } });
    if (!patrol) throw new NotFoundException("Patrol officer not found");

    if (team.members.some((m) => m.id === patrolId)) {
      throw new ConflictException("Patrol officer is already in this team");
    }

    team.members.push(patrol);
    patrol.teamId = teamId;
    await this.patrolRepo.save(patrol);
    await this.teamRepo.save(team);

    return successResponse("Patrol officer added to team", team);
  }

  async removeMember(teamId: string, patrolId: string): Promise<ServiceResponse> {
    const team = await this.teamRepo.findOne({
      where: { id: teamId },
      relations: ["members"],
    });
    if (!team) throw new NotFoundException("Patrol team not found");

    const patrol = await this.patrolRepo.findOne({ where: { id: patrolId } });
    if (!patrol) throw new NotFoundException("Patrol officer not found");

    team.members = team.members.filter((m) => m.id !== patrolId);
    patrol.teamId = null;
    await this.patrolRepo.save(patrol);
    await this.teamRepo.save(team);

    return successResponse("Patrol officer removed from team", team);
  }
}
