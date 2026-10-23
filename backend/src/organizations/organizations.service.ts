import {
    ForbiddenException,
    Injectable,
    NotFoundException,
  } from '@nestjs/common';
  
  import {
    desc,
    eq,
  } from 'drizzle-orm';
  
  import { DatabaseService } from '../database/database.service';
  
  import {
    organizationMembers,
    organizations,
    users
  } from '../database/schema';
  import {
    ORGANIZATION_PERMISSIONS,
  } from './organization-permissions';
  
  import {
    OrganizationAuthorizationService,
  } from './organization-authorization.service';
  import type { CreateOrganizationDto } from './dto/create-organization.dto';
  import type { UpdateOrganizationDto } from './dto/update-organization.dto';
  
  @Injectable()
  export class OrganizationsService {
    constructor(
      private readonly database:
        DatabaseService,
      private readonly authorization:
        OrganizationAuthorizationService,
    ) {}
  
    async create(
      userId: string,
      dto: CreateOrganizationDto,
    ) {
        const [creator] =
        await this.database.db
          .select({
            identityVerificationStatus:
              users.identityVerificationStatus,
          })
          .from(users)
          .where(
            eq(
              users.id,
              userId,
            ),
          )
          .limit(1);
      
      if (!creator) {
        throw new NotFoundException({
          code: 'USER_NOT_FOUND',
          message:
            'Không tìm thấy người dùng.',
        });
      }
      
      if (
        creator.identityVerificationStatus
        !== 'VERIFIED'
      ) {
        throw new ForbiddenException({
          code:
            'IDENTITY_VERIFICATION_REQUIRED',
      
          message:
            'Bạn phải xác minh danh tính trước khi tạo tổ chức.',
        });
      }
      return this.database.db.transaction(
        async (tx) => {
          const [organization] =
            await tx
              .insert(organizations)
              .values({
                name: dto.name.trim(),
  
                description:
                  dto.description?.trim(),
  
                contactEmail:
                  dto.contactEmail
                    ?.trim()
                    .toLowerCase(),
  
                contactPhone:
                  dto.contactPhone?.trim(),
  
                verificationStatus:
                  'UNVERIFIED',
              })
              .returning();
  
          if (!organization) {
            throw new Error(
              'Failed to create organization',
            );
          }
  
          await tx
            .insert(organizationMembers)
            .values({
              organizationId:
                organization.id,
  
              userId,
  
              role: 'PRIMARY_REPRESENTATIVE',
            });
  
          return {
            ...organization,
            currentUserRole:
              'PRIMARY_REPRESENTATIVE' as const,
          };
        },
      );
    }
  
    async findById(
      organizationId: string,
    ) {
      const [organization] =
        await this.database.db
          .select()
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
          code:
            'ORGANIZATION_NOT_FOUND',
  
          message:
            'Không tìm thấy tổ chức.',
        });
      }
  
      return organization;
    }
  
    async findMine(
      userId: string,
    ) {
      return this.database.db
        .select({
          id:
            organizations.id,
  
          name:
            organizations.name,
  
          description:
            organizations.description,
  
          logoUrl:
            organizations.logoUrl,
  
          contactEmail:
            organizations.contactEmail,
  
          contactPhone:
            organizations.contactPhone,
  
          verificationStatus:
            organizations
              .verificationStatus,
  
          createdAt:
            organizations.createdAt,
  
          updatedAt:
            organizations.updatedAt,
  
          membershipRole:
            organizationMembers.role,
        })
        .from(organizationMembers)
        .innerJoin(
          organizations,
          eq(
            organizationMembers
              .organizationId,
  
            organizations.id,
          ),
        )
        .where(
          eq(
            organizationMembers.userId,
            userId,
          ),
        )
        .orderBy(
          desc(
            organizations.createdAt,
          ),
        );
    }
  
    async update(
      userId: string,
      organizationId: string,
      dto: UpdateOrganizationDto,
    ) {
      await this.authorization
        .requirePermission(
          userId,
          organizationId,
          ORGANIZATION_PERMISSIONS
            .UPDATE_ORGANIZATION,
        );
  
      const values: {
        name?: string;
        description?: string;
        contactEmail?: string;
        contactPhone?: string;
        updatedAt: Date;
      } = {
        updatedAt: new Date(),
      };
  
      if (dto.name !== undefined) {
        values.name =
          dto.name.trim();
      }
  
      if (
        dto.description !== undefined
      ) {
        values.description =
          dto.description.trim();
      }
  
      if (
        dto.contactEmail !== undefined
      ) {
        values.contactEmail =
          dto.contactEmail
            .trim()
            .toLowerCase();
      }
  
      if (
        dto.contactPhone !== undefined
      ) {
        values.contactPhone =
          dto.contactPhone.trim();
      }
  
      const [updated] =
        await this.database.db
          .update(organizations)
          .set(values)
          .where(
            eq(
              organizations.id,
              organizationId,
            ),
          )
          .returning();
  
      if (!updated) {
        throw new NotFoundException({
          code:
            'ORGANIZATION_NOT_FOUND',
  
          message:
            'Không tìm thấy tổ chức.',
        });
      }
  
      return updated;
    }
  }