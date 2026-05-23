import type { Request, Response, NextFunction } from 'express';
import { ForbiddenError, UnauthorizedError } from './errorHandler.js';

type UserRole = 'guest' | 'player' | 'org_admin' | 'super_admin';

const ROLE_HIERARCHY: Record<UserRole, number> = {
  guest: 0,
  player: 1,
  org_admin: 2,
  super_admin: 3,
};

export function requireRole(...allowedRoles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new UnauthorizedError('Authentication required'));
      return;
    }

    const userRole = req.user.role as UserRole;

    if (!allowedRoles.includes(userRole)) {
      next(
        new ForbiddenError(
          `Insufficient permissions. Required: ${allowedRoles.join(' or ')}`
        )
      );
      return;
    }

    next();
  };
}

export function requireMinRole(minRole: UserRole) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new UnauthorizedError('Authentication required'));
      return;
    }

    const userRole = req.user.role as UserRole;
    const userLevel = ROLE_HIERARCHY[userRole] ?? -1;
    const requiredLevel = ROLE_HIERARCHY[minRole];

    if (userLevel < requiredLevel) {
      next(
        new ForbiddenError(`Insufficient permissions. Minimum role required: ${minRole}`)
      );
      return;
    }

    next();
  };
}
