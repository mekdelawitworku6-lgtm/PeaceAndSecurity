import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { GeoController } from "./geo.controller";
import { GeoService } from "./geo.service";
import { City } from "./entities/city.entity";
import { Subcity } from "./entities/subcity.entity";
import { Woreda } from "./entities/woreda.entity";

@Module({
  imports: [TypeOrmModule.forFeature([City, Subcity, Woreda])],
  controllers: [GeoController],
  providers: [GeoService],
  exports: [GeoService],
})
export class GeoModule {}
