import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTokenVersion1732000000000 implements MigrationInterface {
  name = "AddTokenVersion1732000000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "tokenVersion" integer NOT NULL DEFAULT 0`,
    );
    await queryRunner.query(
      `ALTER TABLE "patrols" ADD COLUMN IF NOT EXISTS "tokenVersion" integer NOT NULL DEFAULT 0`,
    );
    await queryRunner.query(
      `ALTER TABLE "citizens" ADD COLUMN IF NOT EXISTS "tokenVersion" integer NOT NULL DEFAULT 0`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "citizens" DROP COLUMN IF EXISTS "tokenVersion"`);
    await queryRunner.query(`ALTER TABLE "patrols" DROP COLUMN IF EXISTS "tokenVersion"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "tokenVersion"`);
  }
}
