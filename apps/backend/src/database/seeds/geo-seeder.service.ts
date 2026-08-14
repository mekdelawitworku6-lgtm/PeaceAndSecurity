import { Injectable, OnApplicationBootstrap } from "@nestjs/common";
import { DataSource, Repository } from "typeorm";
import { City } from "../../modules/geo/entities/city.entity";

@Injectable()
export class GeoSeederService implements OnApplicationBootstrap {
  constructor(private dataSource: DataSource) {}

  async onApplicationBootstrap() {
    await this.seedAddisAbaba();
  }

  async seedAddisAbaba() {
    if (!this.dataSource.isInitialized) {
      await this.dataSource.initialize();
    }

    const cityRepo: Repository<City> = this.dataSource.getRepository(City);
    const existing = await cityRepo.findOne({ where: { code: "AA" } });

    if (existing) {
      console.log("• Addis Ababa city already exists — skipping");
      return;
    }

    const city = cityRepo.create({
      name: "Addis Ababa",
      code: "AA",
      description: "Capital city of Ethiopia",
      latitude: 9.02497,
      longitude: 38.74689,
      isActive: true,
    });
    await cityRepo.save(city);
    console.log("✔ Seeded Addis Ababa city");
  }
}
