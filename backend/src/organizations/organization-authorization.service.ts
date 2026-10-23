import {
    ForbiddenException,
    Injectable,
    NotFoundException,
  } from '@nestjs/common';
  
  import {
    and,
    eq,
  } from 'drizzle-orm';
  
  import {
    DatabaseService,
  } from '../database/database.service';
  
  import {
    organizationMembers,
    organizations,
  } from '../database/schema';
  
  import {
    ORGANIZATION_ROLE_PERMISSIONS,
  } from './organization-permissions';
  
  import type {
    OrganizationMemberRole,
    OrganizationPermission,
  } from './organization-permissions';
  
  @Injectable()
  export class OrganizationAuthorizationService {
    constructor(
      private readonly database:
        DatabaseService,
    ) {}
  
    async requirePermission(
      userId: string,
      organizationId: string,
      permission: OrganizationPermission,
    ): Promise<OrganizationMemberRole> {
      const [organization] =
        await this.database.db
          .select({
            id: organizations.id,
            status: organizations.status,
          })
          .from(organizations)
          .where(
            eq(
              organizations.id,
              organizationId,
            ),
          )
          .limit(1);
  
      if (!organization) {
        throw new NotFoundException({
          code: 'ORGANIZATION_NOT_FOUND',
          message:
            'Không tìm thấy tổ chức.',
        });
      }
  
      if (
        organization.status ===
        'SUSPENDED'
      ) {
        throw new ForbiddenException({
          code:
            'ORGANIZATION_SUSPENDED',
  
          message:
            'Tổ chức đang bị tạm ngưng.',
        });
      }
  
      if (
        organization.status ===
        'ARCHIVED'
      ) {
        throw new ForbiddenException({
          code:
            'ORGANIZATION_ARCHIVED',
  
          message:
            'Tổ chức đã ngừng hoạt động.',
        });
      }
  
      const [membership] =
        await this.database.db
          .select({
            role:
              organizationMembers.role,
          })
          .from(
            organizationMembers,
          )
          .where(
            and(
              eq(
                organizationMembers
                  .organizationId,
                organizationId,
              ),
  
              eq(
                organizationMembers.userId,
                userId,
              ),
            ),
          )
          .limit(1);
  
      if (!membership) {
        throw new ForbiddenException({
          code:
            'ORGANIZATION_ACCESS_DENIED',
  
          message:
            'Bạn không thuộc tổ chức này.',
        });
      }
  
      const role =
        membership.role as
          OrganizationMemberRole;
  
      const permissions =
        ORGANIZATION_ROLE_PERMISSIONS[
          role
        ];
  
      if (
        !permissions.includes(
          permission,
        )
      ) {
        throw new ForbiddenException({
          code:
            'INSUFFICIENT_ORGANIZATION_PERMISSION',
  
          message:
            'Bạn không có quyền thực hiện thao tác này.',
        });
      }
  
      return role;
    }
  }