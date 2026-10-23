import {
    ConflictException,
    ForbiddenException,
    Injectable,
    NotFoundException,
  } from '@nestjs/common';
  
  import {
    and,
    desc,
    eq,
    or,
  } from 'drizzle-orm';
  
  import {
    DatabaseService,
  } from '../database/database.service';
  
  import {
    organizationInvitations,
    organizationMembers,
    organizations,
    users,
  } from '../database/schema';

  import {
    ORGANIZATION_PERMISSIONS,
  } from './organization-permissions';
  
  import {
    OrganizationAuthorizationService,
  } from './organization-authorization.service';

  import type {
    CreateOrganizationInvitationDto,
  } from './dto/create-organization-invitation.dto';
  
  @Injectable()
  export class OrganizationInvitationsService {
    constructor(
      private readonly database:
        DatabaseService,
      private readonly authorization:
        OrganizationAuthorizationService,
    ) {}
  
    async invite(
      requestingUserId: string,
      organizationId: string,
      dto: CreateOrganizationInvitationDto,
    ) {
      await this.authorization
        .requirePermission(
          requestingUserId,
          organizationId,
          ORGANIZATION_PERMISSIONS
            .INVITE_MEMBER,
        );
  
      const email =
        dto.email.trim().toLowerCase();
  
      const [targetUser] =
        await this.database.db
          .select({
            id: users.id,
            name: users.name,
            email: users.email,
          })
          .from(users)
          .where(
            eq(
              users.email,
              email,
            ),
          )
          .limit(1);
  
      if (!targetUser) {
        throw new NotFoundException({
          code: 'USER_NOT_FOUND',
          message:
            'Không tìm thấy tài khoản NOI với email này.',
        });
      }
  
      const [existingMembership] =
        await this.database.db
          .select({
            id:
              organizationMembers.id,
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
                targetUser.id,
              ),
            ),
          )
          .limit(1);
  
      if (existingMembership) {
        throw new ConflictException({
          code:
            'ORGANIZATION_MEMBER_ALREADY_EXISTS',
          message:
            'Người dùng đã là thành viên của tổ chức.',
        });
      }
  
      const [existingInvitation] =
        await this.database.db
          .select({
            id:
              organizationInvitations.id,
            status:
              organizationInvitations.status,
          })
          .from(
            organizationInvitations,
          )
          .where(
            and(
              eq(
                organizationInvitations
                  .organizationId,
                organizationId,
              ),
              eq(
                organizationInvitations
                  .invitedUserId,
                targetUser.id,
              ),
              or(
                eq(
                  organizationInvitations.status,
                  'PENDING',
                ),
                eq(
                  organizationInvitations.status,
                  'PENDING_VERIFICATION',
                ),
              ),
            ),
          )
          .limit(1);
  
      if (existingInvitation) {
        throw new ConflictException({
          code:
            'ORGANIZATION_INVITATION_ALREADY_PENDING',
          message:
            'Người dùng đã có lời mời đang chờ xử lý.',
        });
      }
  
      const expiresAt =
        new Date(
          Date.now() +
            7 * 24 * 60 * 60 * 1000,
        );
  
      const [invitation] =
        await this.database.db
          .insert(
            organizationInvitations,
          )
          .values({
            organizationId,
            invitedUserId:
              targetUser.id,
            invitedByUserId:
              requestingUserId,
  
            role: 'STAFF',
            status: 'PENDING',
  
            expiresAt,
          })
          .returning();
  
      return {
        ...invitation,
  
        invitedUser: {
          id: targetUser.id,
          name: targetUser.name,
          email: targetUser.email,
        },
      };
    }
  
    async getMine(
      userId: string,
    ) {
      return this.database.db
        .select({
          id:
            organizationInvitations.id,
  
          organizationId:
            organizations.id,
  
          organizationName:
            organizations.name,
  
          role:
            organizationInvitations.role,
  
          status:
            organizationInvitations.status,
  
          invitedByUserId:
            organizationInvitations
              .invitedByUserId,
  
          expiresAt:
            organizationInvitations.expiresAt,
  
          acceptedAt:
            organizationInvitations.acceptedAt,
  
          declinedAt:
            organizationInvitations.declinedAt,
  
          createdAt:
            organizationInvitations.createdAt,
        })
        .from(
          organizationInvitations,
        )
        .innerJoin(
          organizations,
          eq(
            organizationInvitations
              .organizationId,
            organizations.id,
          ),
        )
        .where(
          eq(
            organizationInvitations
              .invitedUserId,
            userId,
          ),
        )
        .orderBy(
          desc(
            organizationInvitations.createdAt,
          ),
        );
    }
  
    async accept(
      userId: string,
      invitationId: string,
    ) {
      const invitation =
        await this.getInvitationForUser(
          userId,
          invitationId,
        );
  
      if (
        invitation.status ===
        'ACCEPTED'
      ) {
        return {
          invitationId,
          status: 'ACCEPTED' as const,
          requiresIdentityVerification:
            false,
        };
      }
  
      this.ensureActionable(
        invitation.status,
      );
  
      if (
        invitation.expiresAt.getTime()
        <= Date.now()
      ) {
        await this.database.db
          .update(
            organizationInvitations,
          )
          .set({
            status: 'EXPIRED',
            updatedAt: new Date(),
          })
          .where(
            eq(
              organizationInvitations.id,
              invitationId,
            ),
          );
  
        throw new ConflictException({
          code:
            'ORGANIZATION_INVITATION_EXPIRED',
          message:
            'Lời mời đã hết hạn.',
        });
      }
  
      const [user] =
        await this.database.db
          .select({
            identityVerificationStatus:
              users
                .identityVerificationStatus,
          })
          .from(users)
          .where(
            eq(
              users.id,
              userId,
            ),
          )
          .limit(1);
  
      if (!user) {
        throw new NotFoundException({
          code: 'USER_NOT_FOUND',
          message:
            'Không tìm thấy người dùng.',
        });
      }
  
      if (
        user.identityVerificationStatus
        !== 'VERIFIED'
      ) {
        await this.database.db
          .update(
            organizationInvitations,
          )
          .set({
            status:
              'PENDING_VERIFICATION',
            updatedAt: new Date(),
          })
          .where(
            and(
              eq(
                organizationInvitations.id,
                invitationId,
              ),
              eq(
                organizationInvitations
                  .status,
                'PENDING',
              ),
            ),
          );
  
        return {
          invitationId,
  
          status:
            'PENDING_VERIFICATION',
  
          requiresIdentityVerification:
            true,
        };
      }
  
      return this.database.db.transaction(
        async (tx) => {
          const now = new Date();
  
          const [accepted] =
            await tx
              .update(
                organizationInvitations,
              )
              .set({
                status: 'ACCEPTED',
                acceptedAt: now,
                updatedAt: now,
              })
              .where(
                and(
                  eq(
                    organizationInvitations.id,
                    invitationId,
                  ),
                  eq(
                    organizationInvitations
                      .invitedUserId,
                    userId,
                  ),
                  or(
                    eq(
                      organizationInvitations
                        .status,
                      'PENDING',
                    ),
                    eq(
                      organizationInvitations
                        .status,
                      'PENDING_VERIFICATION',
                    ),
                  ),
                ),
              )
              .returning({
                id:
                  organizationInvitations.id,
              });
  
          if (!accepted) {
            const [current] =
              await tx
                .select({
                  status:
                    organizationInvitations
                      .status,
                })
                .from(
                  organizationInvitations,
                )
                .where(
                  eq(
                    organizationInvitations.id,
                    invitationId,
                  ),
                )
                .limit(1);
  
            if (
              current?.status ===
              'ACCEPTED'
            ) {
              return {
                invitationId,
  
                status:
                  'ACCEPTED',
  
                requiresIdentityVerification:
                  false,
              };
            }
  
            throw new ConflictException({
              code:
                'ORGANIZATION_INVITATION_NOT_ACTIONABLE',
  
              message:
                'Lời mời không còn có thể chấp nhận.',
            });
          }
  
          await tx
            .insert(
              organizationMembers,
            )
            .values({
              organizationId:
                invitation.organizationId,
  
              userId,
  
              role: 'STAFF',
            })
            .onConflictDoNothing();
  
          return {
            invitationId,
  
            status:
              'ACCEPTED',
  
            organizationId:
              invitation.organizationId,
  
            membershipRole:
              'STAFF',
  
            requiresIdentityVerification:
              false,
          };
        },
      );
    }
  
    async decline(
      userId: string,
      invitationId: string,
    ) {
      const invitation =
        await this.getInvitationForUser(
          userId,
          invitationId,
        );
  
      if (
        invitation.status ===
        'DECLINED'
      ) {
        return {
          invitationId,
          status: 'DECLINED',
        };
      }
  
      this.ensureActionable(
        invitation.status,
      );
  
      if (
        invitation.expiresAt.getTime()
        <= Date.now()
      ) {
        await this.database.db
          .update(
            organizationInvitations,
          )
          .set({
            status: 'EXPIRED',
            updatedAt: new Date(),
          })
          .where(
            eq(
              organizationInvitations.id,
              invitationId,
            ),
          );
  
        throw new ConflictException({
          code:
            'ORGANIZATION_INVITATION_EXPIRED',
  
          message:
            'Lời mời đã hết hạn.',
        });
      }
  
      const [declined] =
        await this.database.db
          .update(
            organizationInvitations,
          )
          .set({
            status: 'DECLINED',
            declinedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(
            and(
              eq(
                organizationInvitations.id,
                invitationId,
              ),
              eq(
                organizationInvitations
                  .invitedUserId,
                userId,
              ),
              or(
                eq(
                  organizationInvitations.status,
                  'PENDING',
                ),
                eq(
                  organizationInvitations.status,
                  'PENDING_VERIFICATION',
                ),
              ),
            ),
          )
          .returning({
            id:
              organizationInvitations.id,
          });
  
      if (!declined) {
        throw new ConflictException({
          code:
            'ORGANIZATION_INVITATION_NOT_ACTIONABLE',
  
          message:
            'Lời mời không còn có thể từ chối.',
        });
      }
  
      return {
        invitationId,
        status: 'DECLINED' as const,
      };
    }
  
    private async getInvitationForUser(
      userId: string,
      invitationId: string,
    ) {
      const [invitation] =
        await this.database.db
          .select({
            id:
              organizationInvitations.id,
  
            organizationId:
              organizationInvitations
                .organizationId,
  
            invitedUserId:
              organizationInvitations
                .invitedUserId,
  
            status:
              organizationInvitations.status,
  
            expiresAt:
              organizationInvitations.expiresAt,
          })
          .from(
            organizationInvitations,
          )
          .where(
            eq(
              organizationInvitations.id,
              invitationId,
            ),
          )
          .limit(1);
  
      if (!invitation) {
        throw new NotFoundException({
          code:
            'ORGANIZATION_INVITATION_NOT_FOUND',
  
          message:
            'Không tìm thấy lời mời.',
        });
      }
  
      if (
        invitation.invitedUserId
        !== userId
      ) {
        throw new ForbiddenException({
          code:
            'ORGANIZATION_INVITATION_ACCESS_DENIED',
  
          message:
            'Lời mời này không thuộc về bạn.',
        });
      }
  
      return invitation;
    }
  
    private ensureActionable(
      status:
        | 'PENDING'
        | 'PENDING_VERIFICATION'
        | 'ACCEPTED'
        | 'DECLINED'
        | 'EXPIRED'
        | 'CANCELLED',
    ): void {
      if (
        status === 'EXPIRED'
        || status === 'CANCELLED'
      ) {
        throw new ConflictException({
          code:
            'ORGANIZATION_INVITATION_NOT_ACTIONABLE',
  
          message:
            'Lời mời không còn hiệu lực.',
        });
      }
  
      if (
        status === 'ACCEPTED'
        || status === 'DECLINED'
      ) {
        throw new ConflictException({
          code:
            'ORGANIZATION_INVITATION_ALREADY_RESOLVED',
  
          message:
            'Lời mời đã được xử lý.',
        });
      }
    }
  }