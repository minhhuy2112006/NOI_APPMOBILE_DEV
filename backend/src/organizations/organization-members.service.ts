import {
    ConflictException,
    Injectable,
    NotFoundException,
  } from '@nestjs/common';
  
  import {
    and,
    asc,
    eq,
  } from 'drizzle-orm';
  
  import {
    DatabaseService,
  } from '../database/database.service';
  
  import {
    organizationMembers,
    organizationRepresentativeTransfers,
    users,
  } from '../database/schema';

  import {
    ORGANIZATION_PERMISSIONS,
  } from './organization-permissions';
  
  import {
    OrganizationAuthorizationService,
  } from './organization-authorization.service';

  import type {
    UpdateOrganizationMemberRoleDto,
  } from './dto/update-organization-member-role.dto';
  
  @Injectable()
  export class OrganizationMembersService {
    constructor(
      private readonly database:
        DatabaseService,
      private readonly authorization:
        OrganizationAuthorizationService,
    ) {}
  
    async getMembers(
      requestingUserId: string,
      organizationId: string,
    ) {
      await this.authorization
        .requirePermission(
          requestingUserId,
          organizationId,
          ORGANIZATION_PERMISSIONS
            .VIEW_ORGANIZATION,
        );
  
      return this.database.db
        .select({
          userId:
            users.id,
  
          name:
            users.name,
  
          email:
            users.email,
  
          role:
            organizationMembers.role,
  
          identityVerificationStatus:
            users.identityVerificationStatus,
  
          joinedAt:
            organizationMembers.createdAt,
        })
        .from(
          organizationMembers,
        )
        .innerJoin(
          users,
          eq(
            organizationMembers.userId,
            users.id,
          ),
        )
        .where(
          eq(
            organizationMembers.organizationId,
            organizationId,
          ),
        )
        .orderBy(
          asc(
            organizationMembers.createdAt,
          ),
        );
    }
  
    async updateRole(
      requestingUserId: string,
      organizationId: string,
      targetUserId: string,
      dto: UpdateOrganizationMemberRoleDto,
    ) {
      await this.authorization
        .requirePermission(
          requestingUserId,
          organizationId,
          ORGANIZATION_PERMISSIONS
            .MANAGE_MEMBER,
        );
  
      const membership =
        await this.getMembership(
          organizationId,
          targetUserId,
        );
  
      if (
        membership.role ===
        'PRIMARY_REPRESENTATIVE'
      ) {
        throw new ConflictException({
          code:
            'USE_REPRESENTATIVE_TRANSFER_FLOW',
  
          message:
            'Không thể thay đổi quyền người đại diện chính bằng chức năng này.',
        });
      }
  
      if (
        membership.role === dto.role
      ) {
        return {
          organizationId,
          userId:
            targetUserId,
          role:
            membership.role,
          updatedAt:
            membership.updatedAt,
        };
      }
  
      const [updated] =
        await this.database.db
          .update(
            organizationMembers,
          )
          .set({
            role:
              dto.role,
  
            updatedAt:
              new Date(),
          })
          .where(
            eq(
              organizationMembers.id,
              membership.id,
            ),
          )
          .returning({
            organizationId:
              organizationMembers
                .organizationId,
  
            userId:
              organizationMembers.userId,
  
            role:
              organizationMembers.role,
  
            updatedAt:
              organizationMembers.updatedAt,
          });
  
      if (!updated) {
        throw new ConflictException({
          code:
            'ORGANIZATION_MEMBER_UPDATE_FAILED',
  
          message:
            'Không thể cập nhật quyền thành viên.',
        });
      }
  
      return updated;
    }
  
    async removeMember(
      requestingUserId: string,
      organizationId: string,
      targetUserId: string,
    ) {
      await this.authorization
        .requirePermission(
          requestingUserId,
          organizationId,
          ORGANIZATION_PERMISSIONS
            .MANAGE_MEMBER,
        );
  
      const membership =
        await this.getMembership(
          organizationId,
          targetUserId,
        );
  
      if (
        membership.role ===
        'PRIMARY_REPRESENTATIVE'
      ) {
        throw new ConflictException({
          code:
            'PRIMARY_REPRESENTATIVE_CANNOT_BE_REMOVED',
  
          message:
            'Phải chuyển quyền đại diện trước khi người đại diện chính rời tổ chức.',
        });
      }
  
      return this.database.db.transaction(
        async (tx) => {
          const now =
            new Date();
  
          /*
           * Nếu đang có yêu cầu chuyển quyền
           * cho người sắp bị xóa,
           * hủy yêu cầu đó luôn.
           */
          await tx
            .update(
              organizationRepresentativeTransfers,
            )
            .set({
              status:
                'CANCELLED',
  
              cancelledAt:
                now,
  
              updatedAt:
                now,
            })
            .where(
              and(
                eq(
                  organizationRepresentativeTransfers
                    .organizationId,
  
                  organizationId,
                ),
  
                eq(
                  organizationRepresentativeTransfers
                    .toUserId,
  
                  targetUserId,
                ),
  
                eq(
                  organizationRepresentativeTransfers
                    .status,
  
                  'PENDING',
                ),
              ),
            );
  
          const [removed] =
            await tx
              .delete(
                organizationMembers,
              )
              .where(
                and(
                  eq(
                    organizationMembers.id,
                    membership.id,
                  ),
  
                  eq(
                    organizationMembers
                      .organizationId,
  
                    organizationId,
                  ),
                ),
              )
              .returning({
                userId:
                  organizationMembers.userId,
              });
  
          if (!removed) {
            throw new ConflictException({
              code:
                'ORGANIZATION_MEMBER_REMOVE_FAILED',
  
              message:
                'Không thể xóa thành viên.',
            });
          }
  
          return {
            organizationId,
            userId:
              targetUserId,
            removed:
              true,
          };
        },
      );
    }
  
    private async getMembership(
      organizationId: string,
      userId: string,
    ) {
      const [membership] =
        await this.database.db
          .select({
            id:
              organizationMembers.id,
  
            role:
              organizationMembers.role,
  
            updatedAt:
              organizationMembers.updatedAt,
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
        throw new NotFoundException({
          code:
            'ORGANIZATION_MEMBER_NOT_FOUND',
  
          message:
            'Không tìm thấy thành viên trong tổ chức.',
        });
      }
  
      return membership;
    }
  }