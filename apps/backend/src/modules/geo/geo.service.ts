import {
  Injectable,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { City } from "./entities/city.entity";
import { Subcity } from "./entities/subcity.entity";
import { Woreda } from "./entities/woreda.entity";
import { CreateCityDto, UpdateCityDto } from "./dto/city.dto";
import { CreateSubcityDto, UpdateSubcityDto } from "./dto/subcity.dto";
import { CreateWoredaDto, UpdateWoredaDto } from "./dto/woreda.dto";
import { successResponse, ServiceResponse } from "../../common/types/service-response";

@Injectable()
export class GeoService {
  constructor(
    @InjectRepository(City)
    private readonly cityRepo: Repository<City>,
    @InjectRepository(Subcity)
    private readonly subcityRepo: Repository<Subcity>,
    @InjectRepository(Woreda)
    private readonly woredaRepo: Repository<Woreda>,
  ) {}

  // ─── CITIES ──────────────────────────────────────────────

  async createCity(dto: CreateCityDto): Promise<ServiceResponse> {
    const existing = await this.cityRepo.findOne({
      where: [{ code: dto.code }, { name: dto.name }],
    });
    if (existing) {
      throw new ConflictException("City with this name or code already exists");
    }

    const city = this.cityRepo.create(dto);
    const saved = await this.cityRepo.save(city);
    return successResponse("City created successfully", saved);
  }

  async getAllCities(): Promise<ServiceResponse> {
    const cities = await this.cityRepo.find({
      order: { name: "ASC" },
    });
    return successResponse("Cities retrieved successfully", cities);
  }

  async getCityById(id: string): Promise<ServiceResponse> {
    const city = await this.cityRepo.findOne({ where: { id } });
    if (!city) throw new NotFoundException("City not found");
    return successResponse("City retrieved successfully", city);
  }

  async updateCity(id: string, dto: UpdateCityDto): Promise<ServiceResponse> {
    const city = await this.cityRepo.findOne({ where: { id } });
    if (!city) throw new NotFoundException("City not found");

    if (dto.code) {
      const existing = await this.cityRepo.findOne({
        where: { code: dto.code },
      });
      if (existing && existing.id !== id) {
        throw new ConflictException("City code already in use");
      }
    }

    Object.assign(city, dto);
    const updated = await this.cityRepo.save(city);
    return successResponse("City updated successfully", updated);
  }

  async deleteCity(id: string): Promise<ServiceResponse> {
    const city = await this.cityRepo.findOne({ where: { id } });
    if (!city) throw new NotFoundException("City not found");

    const subcityCount = await this.subcityRepo.count({ where: { cityId: id } });
    if (subcityCount > 0) {
      throw new ConflictException("Cannot delete city with existing subcities");
    }

    await this.cityRepo.save({ ...city, deletedAt: new Date() });
    return successResponse("City deleted successfully");
  }

  // ─── SUBCITIES ───────────────────────────────────────────

  async getAllSubcities(): Promise<ServiceResponse> {
    const subcities = await this.subcityRepo.find({
      order: { name: "ASC" },
      relations: ["city"],
    });
    return successResponse("Subcities retrieved successfully", subcities);
  }

  async createSubcity(dto: CreateSubcityDto): Promise<ServiceResponse> {
    const city = await this.cityRepo.findOne({ where: { id: dto.cityId } });
    if (!city) throw new NotFoundException("City not found");

    const existing = await this.subcityRepo.findOne({
      where: { code: dto.code, cityId: dto.cityId },
    });
    if (existing) {
      throw new ConflictException("Subcity with this code already exists in this city");
    }

    const subcity = this.subcityRepo.create(dto);
    const saved = await this.subcityRepo.save(subcity);
    return successResponse("Subcity created successfully", saved);
  }

  async getSubcitiesByCity(cityId: string): Promise<ServiceResponse> {
    const city = await this.cityRepo.findOne({ where: { id: cityId } });
    if (!city) throw new NotFoundException("City not found");

    const subcities = await this.subcityRepo.find({
      where: { cityId },
      order: { name: "ASC" },
    });
    return successResponse("Subcities retrieved successfully", subcities);
  }

  async getSubcityById(id: string): Promise<ServiceResponse> {
    const subcity = await this.subcityRepo.findOne({
      where: { id },
      relations: ["city"],
    });
    if (!subcity) throw new NotFoundException("Subcity not found");
    return successResponse("Subcity retrieved successfully", subcity);
  }

  async updateSubcity(id: string, dto: UpdateSubcityDto): Promise<ServiceResponse> {
    const subcity = await this.subcityRepo.findOne({ where: { id } });
    if (!subcity) throw new NotFoundException("Subcity not found");

    if (dto.code && dto.cityId) {
      const existing = await this.subcityRepo.findOne({
        where: { code: dto.code, cityId: dto.cityId },
      });
      if (existing && existing.id !== id) {
        throw new ConflictException("Subcity code already in use in this city");
      }
    }

    Object.assign(subcity, dto);
    const updated = await this.subcityRepo.save(subcity);
    return successResponse("Subcity updated successfully", updated);
  }

  async deleteSubcity(id: string): Promise<ServiceResponse> {
    const subcity = await this.subcityRepo.findOne({ where: { id } });
    if (!subcity) throw new NotFoundException("Subcity not found");

    const woredaCount = await this.woredaRepo.count({ where: { subcityId: id } });
    if (woredaCount > 0) {
      throw new ConflictException("Cannot delete subcity with existing woredas");
    }

    await this.subcityRepo.save({ ...subcity, deletedAt: new Date() });
    return successResponse("Subcity deleted successfully");
  }

  // ─── WOREDAS ─────────────────────────────────────────────

  async getAllWoredas(): Promise<ServiceResponse> {
    const woredas = await this.woredaRepo.find({
      order: { name: "ASC" },
      relations: ["subcity"],
    });
    return successResponse("Woredas retrieved successfully", woredas);
  }

  async createWoreda(dto: CreateWoredaDto): Promise<ServiceResponse> {
    const subcity = await this.subcityRepo.findOne({ where: { id: dto.subcityId } });
    if (!subcity) throw new NotFoundException("Subcity not found");

    const existing = await this.woredaRepo.findOne({
      where: { code: dto.code, subcityId: dto.subcityId },
    });
    if (existing) {
      throw new ConflictException("Woreda with this code already exists in this subcity");
    }

    const woreda = this.woredaRepo.create(dto);
    const saved = await this.woredaRepo.save(woreda);
    return successResponse("Woreda created successfully", saved);
  }

  async getWoredasBySubcity(subcityId: string): Promise<ServiceResponse> {
    const subcity = await this.subcityRepo.findOne({ where: { id: subcityId } });
    if (!subcity) throw new NotFoundException("Subcity not found");

    const woredas = await this.woredaRepo.find({
      where: { subcityId },
      order: { name: "ASC" },
    });
    return successResponse("Woredas retrieved successfully", woredas);
  }

  async getWoredaById(id: string): Promise<ServiceResponse> {
    const woreda = await this.woredaRepo.findOne({
      where: { id },
      relations: ["subcity", "subcity.city"],
    });
    if (!woreda) throw new NotFoundException("Woreda not found");
    return successResponse("Woreda retrieved successfully", woreda);
  }

  async updateWoreda(id: string, dto: UpdateWoredaDto): Promise<ServiceResponse> {
    const woreda = await this.woredaRepo.findOne({ where: { id } });
    if (!woreda) throw new NotFoundException("Woreda not found");

    if (dto.code && dto.subcityId) {
      const existing = await this.woredaRepo.findOne({
        where: { code: dto.code, subcityId: dto.subcityId },
      });
      if (existing && existing.id !== id) {
        throw new ConflictException("Woreda code already in use in this subcity");
      }
    }

    Object.assign(woreda, dto);
    const updated = await this.woredaRepo.save(woreda);
    return successResponse("Woreda updated successfully", updated);
  }

  async deleteWoreda(id: string): Promise<ServiceResponse> {
    const woreda = await this.woredaRepo.findOne({ where: { id } });
    if (!woreda) throw new NotFoundException("Woreda not found");
    await this.woredaRepo.save({ ...woreda, deletedAt: new Date() });
    return successResponse("Woreda deleted successfully");
  }

  // ─── HIERARCHY ───────────────────────────────────────────

  async getFullHierarchy(): Promise<ServiceResponse> {
    const cities = await this.cityRepo.find({
      order: { name: "ASC" },
      relations: [],
    });

    const hierarchy = [];
    for (const city of cities) {
      const subcities = await this.subcityRepo.find({
        where: { cityId: city.id },
        order: { name: "ASC" },
      });

      const subcityData = [];
      for (const subcity of subcities) {
        const woredas = await this.woredaRepo.find({
          where: { subcityId: subcity.id },
          order: { name: "ASC" },
        });
        subcityData.push({ ...subcity, woredas });
      }

      hierarchy.push({ ...city, subcities: subcityData });
    }

    return successResponse("Full hierarchy retrieved successfully", hierarchy);
  }
}
