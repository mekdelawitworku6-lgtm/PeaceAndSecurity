import { NestFactory } from "@nestjs/core";
// restart trigger 3
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import * as express from "express";
import { join } from "path";
import { ConfigService } from "@nestjs/config";
import helmet from "helmet";
import { AllExceptionsFilter } from "./common/filters/all-exceptions.filter";
import { TransformInterceptor } from "./common/interceptors/transform.interceptor";
import { RequestContext } from "./modules/audit/request-context";
import { AuditSource } from "./common/enums/enums";
import * as jwt from "jsonwebtoken";
import * as crypto from "crypto";
import { DataSource } from "typeorm";

function detectSource(req: any): AuditSource {
  const deviceId = req.headers["x-device-id"];
  if (deviceId) {
    const platform = (req.headers["x-device-platform"] || "").toUpperCase();
    if (platform === "ANDROID" || platform === "IOS") {
      return platform === "ANDROID" ? AuditSource.CITIZEN_APP : AuditSource.CITIZEN_APP;
    }
    return AuditSource.CITIZEN_APP;
  }
  const role = req.headers["x-user-role"] || "";
  if (role === "PATROL") return AuditSource.PATROL_APP;
  return AuditSource.WEB;
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalFilters(new AllExceptionsFilter());

  // RequestContext middleware for audit logging
  app.use((req: any, res: any, next: () => void) => {
    const requestId = crypto.randomUUID();
    const userAgent = req.headers["user-agent"] || "";
    const deviceId = req.headers["x-device-id"] || "";
    const devicePlatform = req.headers["x-device-platform"] || "";
    const appVersion = req.headers["x-app-version"] || "";
    const sessionId = req.headers["x-session-id"] || "";
    const source = detectSource(req);

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      try {
        const token = authHeader.substring(7);
        const decoded = jwt.decode(token) as any;
        if (decoded) {
          RequestContext.run(
            {
              userId: decoded.sub || decoded.id || "unknown",
              userName: decoded.fullName || decoded.name || decoded.email || "Unknown User",
              userRole: decoded.role || "SYSTEM_ADMIN",
              ipAddress: req.ip || req.connection?.remoteAddress || "unknown",
              requestId,
              userAgent,
              deviceId,
              devicePlatform,
              appVersion,
              source,
              requestMethod: req.method,
              requestPath: req.originalUrl,
              sessionId,
            },
            () => next(),
          );
          return;
        }
      } catch (e) {
        // Token decode failed, continue without context
      }
    }
    RequestContext.run(
      {
        userId: "anonymous",
        userName: "Anonymous",
        userRole: "CITIZEN" as any,
        ipAddress: req.ip || req.connection?.remoteAddress || "unknown",
        requestId,
        userAgent,
        deviceId,
        devicePlatform,
        appVersion,
        source,
        requestMethod: req.method,
        requestPath: req.originalUrl,
        sessionId,
      },
      () => next(),
    );
  });

  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" },
    }),
  );

  const configService = app.get<ConfigService>(ConfigService);
  const backendUrl =
    configService.get<string>("BASE_URL");
  const allowedOriginsRaw = configService.get<string>("ALLOWED_ORIGINS") || "";
  const extraOrigins = allowedOriginsRaw
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);

  const allowedOrigins = [
    ...extraOrigins
  ].filter(Boolean);

  console.log("allowed origins", allowedOrigins)

  app.enableCors({
    origin: (origin, callback) => {
      // Allow if no origin (e.g. mobile apps, curl) or if it's in the allowed list
      if (!origin || allowedOrigins.includes(origin) || configService.get("NODE_ENV") === "development") {
        callback(null, true);
      } else {
        console.warn(`CORS blocked for origin: ${origin}`);
        callback(new Error(`CORS blocked for ${origin}`));
      }
    },
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
    credentials: true,
  });

  app.setGlobalPrefix("api");

  // Setup Swagger
  const config = new DocumentBuilder()
    .setTitle("Peace and Security Backend API")
    .setDescription(
      "Complete API documentation for Peace and Security Backend\n\n" +
      `**Base URL**: ${backendUrl}\n`,
    )
    .setVersion("1.0")
    .addBearerAuth(
      {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        name: "JWT",
        description: "Enter JWT token",
        in: "header",
      },
      "JWT-auth",
    )
    .addServer(backendUrl, "Production Server")
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("docs", app, document);

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.use("/uploads", express.static(join(process.cwd(), "uploads")));

  const port = parseInt(configService.get<string>("PORT") || "1221", 10);

  // Apply append-only triggers for audit tables
  try {
    const dataSource = app.get(DataSource);
    if (dataSource) {
      await dataSource.query(`
        CREATE OR REPLACE FUNCTION prevent_audit_modification()
        RETURNS TRIGGER AS $$
        BEGIN
          -- Allow updates that ONLY touch the recordHash and entityId columns.
          -- This is needed because the audit subscriber computes the hash after insert
          -- (the entity ID is unknown at beforeInsert time).
          IF TG_TABLE_NAME = 'audit_logs'
            AND NEW."recordHash" IS DISTINCT FROM OLD."recordHash"
            AND NEW."entityId" IS DISTINCT FROM OLD."entityId"
            AND NEW."entity" = OLD."entity"
            AND NEW."action" = OLD."action"
            AND NEW."actorId" = OLD."actorId"
            AND NEW."previousHash" IS NOT DISTINCT FROM OLD."previousHash"
          THEN
            RETURN NEW;
          END IF;
          RAISE EXCEPTION 'Audit logs are append-only. UPDATE and DELETE are prohibited.';
          RETURN NULL;
        END;
        $$ LANGUAGE plpgsql;
      `);

      // Triggers for audit_logs
      await dataSource.query(`
        DROP TRIGGER IF EXISTS trg_audit_no_update ON audit_logs;
        CREATE TRIGGER trg_audit_no_update
          BEFORE UPDATE ON audit_logs
          FOR EACH ROW EXECUTE FUNCTION prevent_audit_modification();
      `);
      await dataSource.query(`
        DROP TRIGGER IF EXISTS trg_audit_no_delete ON audit_logs;
        CREATE TRIGGER trg_audit_no_delete
          BEFORE DELETE ON audit_logs
          FOR EACH ROW EXECUTE FUNCTION prevent_audit_modification();
      `);

      // Triggers for security_events
      await dataSource.query(`
        DROP TRIGGER IF EXISTS trg_security_event_no_update ON security_events;
        CREATE TRIGGER trg_security_event_no_update
          BEFORE UPDATE ON security_events
          FOR EACH ROW EXECUTE FUNCTION prevent_audit_modification();
      `);
      await dataSource.query(`
        DROP TRIGGER IF EXISTS trg_security_event_no_delete ON security_events;
        CREATE TRIGGER trg_security_event_no_delete
          BEFORE DELETE ON security_events
          FOR EACH ROW EXECUTE FUNCTION prevent_audit_modification();
      `);

      // Triggers for data_access_events
      await dataSource.query(`
        DROP TRIGGER IF EXISTS trg_data_access_no_update ON data_access_events;
        CREATE TRIGGER trg_data_access_no_update
          BEFORE UPDATE ON data_access_events
          FOR EACH ROW EXECUTE FUNCTION prevent_audit_modification();
      `);
      await dataSource.query(`
        DROP TRIGGER IF EXISTS trg_data_access_no_delete ON data_access_events;
        CREATE TRIGGER trg_data_access_no_delete
          BEFORE DELETE ON data_access_events
          FOR EACH ROW EXECUTE FUNCTION prevent_audit_modification();
      `);

      console.log("Append-only triggers applied to audit_logs, security_events, data_access_events");
    }
  } catch (err) {
    console.warn("Could not apply append-only triggers (non-critical):", err.message);
  }

  await app.listen(port);
  console.log(`Server running on port ${port}`);
  console.log(`Swagger documentation available at ${backendUrl}/docs`);
}
bootstrap();
