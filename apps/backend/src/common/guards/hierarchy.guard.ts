import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { UserRole } from "../enums/enums";

export const GEO_SCOPE_KEY = "geoScope";

/**
 * Hierarchy guard — validates that the requesting user has geographic authority
 * over the target resource based on their role and assigned geo unit.
 *
 * Usage: @UseGuards(HierarchyGuard) + @SetMetadata('geoScope', { cityId: true })
 */
@Injectable()
export class HierarchyGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException("Access denied: No user found");
    }

    // City-level and system-level roles have full access
    const fullAccessRoles = [
      UserRole.SYSTEM_SUPER_ADMIN,
      UserRole.SYSTEM_ADMIN,
      UserRole.PEACE_SUPER_ADMIN,
      UserRole.POLICE_COMMANDER_CITY,
    ];

    if (fullAccessRoles.includes(user.role)) {
      return true;
    }

    // For subcity-level roles, they can only access their subcity's data
    const subcityRoles = [
      UserRole.PEACE_OFFICER_SUBCITY,
      UserRole.POLICE_COMMANDER_SUBCITY,
    ];

    if (subcityRoles.includes(user.role)) {
      // Check if the target resource is within their subcity
      const targetSubcityId = this.extractTargetGeoId(request, "subcityId");
      if (targetSubcityId && targetSubcityId !== user.subcityId) {
        throw new ForbiddenException(
          "Access denied: You can only access resources in your subcity",
        );
      }
      return true;
    }

    // For woreda-level roles, they can only access their woreda's data
    const woredaRoles = [
      UserRole.PEACE_OFFICER_WOREDA,
      UserRole.POLICE_COMMANDER_WOREDA,
    ];

    if (woredaRoles.includes(user.role)) {
      const targetWoredaId = this.extractTargetGeoId(request, "woredaId");
      if (targetWoredaId && targetWoredaId !== user.woredaId) {
        throw new ForbiddenException(
          "Access denied: You can only access resources in your woreda",
        );
      }
      return true;
    }

    // Patrol officers can only access their own assigned reports
    if (user.role === UserRole.PATROL) {
      return true; // Patrol access is validated at the service level
    }

    return true;
  }

  private extractTargetGeoId(
    request: any,
    geoField: string,
  ): string | null {
    // Check params
    if (request.params && request.params[geoField]) {
      return request.params[geoField];
    }

    // Check body
    if (request.body && request.body[geoField]) {
      return request.body[geoField];
    }

    // Check query
    if (request.query && request.query[geoField]) {
      return request.query[geoField];
    }

    return null;
  }
}
