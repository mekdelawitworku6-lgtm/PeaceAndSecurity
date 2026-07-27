import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Setting } from "./setting.entity";

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(Setting)
    private readonly repo: Repository<Setting>
  ) {}

  async getAll(): Promise<Record<string, string>> {
    const rows = await this.repo.find();
    const map: Record<string, string> = {};
    for (const row of rows) {
      map[row.key] = row.value;
    }
    return map;
  }

  async get(key: string): Promise<string | null> {
    const row = await this.repo.findOne({ where: { key } });
    return row ? row.value : null;
  }

  async set(key: string, value: string, description?: string): Promise<Setting> {
    let row = await this.repo.findOne({ where: { key } });
    if (row) {
      row.value = value;
      if (description !== undefined) row.description = description;
    } else {
      row = this.repo.create({ key, value, description });
    }
    return this.repo.save(row);
  }

  async setMany(settings: Record<string, string>): Promise<void> {
    for (const [key, value] of Object.entries(settings)) {
      await this.set(key, value);
    }
  }
}
