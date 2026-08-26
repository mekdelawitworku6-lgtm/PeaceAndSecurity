import { Injectable, OnApplicationBootstrap } from "@nestjs/common";
import { DataSource, Repository } from "typeorm";
import { City } from "../../modules/geo/entities/city.entity";
import { Subcity } from "../../modules/geo/entities/subcity.entity";
import { Woreda } from "../../modules/geo/entities/woreda.entity";

@Injectable()
export class GeoSeederService implements OnApplicationBootstrap {
  constructor(private dataSource: DataSource) {}

  async onApplicationBootstrap() {
    await this.seedGeoHierarchy();
  }

  async seedGeoHierarchy() {
    if (!this.dataSource.isInitialized) {
      await this.dataSource.initialize();
    }

    const cityRepo: Repository<City> = this.dataSource.getRepository(City);
    const subcityRepo: Repository<Subcity> = this.dataSource.getRepository(Subcity);
    const woredaRepo: Repository<Woreda> = this.dataSource.getRepository(Woreda);

    let city = await cityRepo.findOne({ where: { code: "AA" } });
    if (!city) {
      city = cityRepo.create({
        name: "Addis Ababa",
        code: "AA",
        description: "Capital city of Ethiopia",
        latitude: 9.02497,
        longitude: 38.74689,
        isActive: true,
      });
      city = await cityRepo.save(city);
      console.log("✔ Seeded Addis Ababa city");
    }

    const subcitiesData = [
      { name: "Bole", code: "BOLE", description: "Bole Subcity", latitude: 8.9904, longitude: 38.7839 },
      { name: "Yeka", code: "YEKA", description: "Yeka Subcity", latitude: 9.0301, longitude: 38.7901 },
      { name: "Kirkos", code: "KIRKOS", description: "Kirkos Subcity", latitude: 9.0093, longitude: 38.7698 },
      { name: "Arada", code: "ARADA", description: "Arada Subcity", latitude: 9.0350, longitude: 38.7525 },
    ];

    for (const sc of subcitiesData) {
      let subcity = await subcityRepo.findOne({ where: { code: sc.code } });
      if (!subcity) {
        subcity = subcityRepo.create({
          ...sc,
          cityId: city.id,
          isActive: true,
        });
        subcity = await subcityRepo.save(subcity);
        console.log(`✔ Seeded subcity: ${sc.name}`);
      }

      if (sc.code === "BOLE") {
        const woredasData = [
          { name: "Woreda 01", code: "WRD-01", description: "Bole Woreda 01", latitude: 8.9904, longitude: 38.7839 },
          { name: "Woreda 02", code: "WRD-02", description: "Bole Woreda 02", latitude: 8.9980, longitude: 38.7920 },
        ];

        for (const wd of woredasData) {
          const existingWd = await woredaRepo.findOne({ where: { code: wd.code, subcityId: subcity.id } });
          if (!existingWd) {
            const woreda = woredaRepo.create({
              ...wd,
              subcityId: subcity.id,
              isActive: true,
            });
            await woredaRepo.save(woreda);
            console.log(`✔ Seeded woreda: ${wd.name}`);
          }
        }
      }
    }
  }
}

