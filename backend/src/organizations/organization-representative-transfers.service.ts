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
  } from 'drizzle-orm';
  
  import {
    DatabaseService,
  } from '../database/database.service';
  
  import {
    organizationMembers,
    organizationRepresentativeTransfers,
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
    CreateRepresentativeTransferDto,
  } from './dto/create-representative-transfer.dto';
  
  @Injectable()
  export class OrganizationRepresentativeTransfersService {
    constructor(
      private readonly database:
        DatabaseService,

      private readonly authorization:
        OrganizationAuthorizationService,
    ) {}
  
    async create(
      requestingUserId: string,
      organizationId: string,
      dto: CreateRepresentativeTransferDto,
    ) {
      await this.authorization
        .requirePermission(
            requestingUserId,
            organizationId,
            ORGANIZATION_PERMISSIONS
            .TRANSFER_REPRESENTATIVE,
        );
  
      if (
        requestingUserId === dto.toUserId
      ) {
        throw new ConflictException({
          code:
            'CANNOT_TRANSFER_TO_SELF',
  
          message:
            'Không thể chuyển quyền đại diện cho chính mình.',
        });
      }
  
      const [target] =
        await this.database.db
          .select({
            userId:
              organizationMembers.userId,
  
            role:
              organizationMembers.role,
  
            identityVerificationStatus:
              users
                .identityVerificationStatus,
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
            and(
              eq(
                organizationMembers
                  .organizationId,
                organizationId,
              ),
  
              eq(
                organizationMembers.userId,
                dto.toUserId,
              ),
            ),
          )
          .limit(1);
  
      if (!target) {
        throw new NotFoundException({
          code:
            'TARGET_NOT_ORGANIZATION_MEMBER',
  
          message:
            'Người nhận quyền không phải thành viên của tổ chức.',
        });
      }
  
      if (
        target.identityVerificationStatus
        !== 'VERIFIED'
      ) {
        throw new ConflictException({
          code:
            'TARGET_IDENTITY_NOT_VERIFIED',
  
          message:
            'Người nhận quyền phải hoàn tất xác minh danh tính.',
        });
      }
  
      const [existingTransfer] =
        await this.database.db
          .select({
            id:
              organizationRepresentativeTransfers.id,
  
            expiresAt:
              organizationRepresentativeTransfers
                .expiresAt,
          })
          .from(
            organizationRepresentativeTransfers,
          )
          .where(
            and(
              eq(
                organizationRepresentativeTransfers
                  .organizationId,
                organizationId,
              ),
  
              eq(
                organizationRepresentativeTransfers
                  .status,
                'PENDING',
              ),
            ),
          )
          .limit(1);
  
      if (existingTransfer) {
        if (
          existingTransfer.expiresAt.getTime()
          <= Date.now()
        ) {
          await this.database.db
            .update(
              organizationRepresentativeTransfers,
            )
            .set({
              status: 'EXPIRED',
              updatedAt: new Date(),
            })
            .where(
              eq(
                organizationRepresentativeTransfers.id,
                existingTransfer.id,
              ),
            );
        } else {
          throw new ConflictException({
            code:
              'REPRESENTATIVE_TRANSFER_ALREADY_PENDING',
  
            message:
              'Tổ chức đang có một yêu cầu chuyển quyền chưa được xử lý.',
          });
        }
      }
  
      const expiresAt =
        new Date(
          Date.now()
          + 7 * 24 * 60 * 60 * 1000,
        );
  
      const [transfer] =
        await this.database.db
          .insert(
            organizationRepresentativeTransfers,
          )
          .values({
            organizationId,
  
            fromUserId:
              requestingUserId,
  
            toUserId:
              dto.toUserId,
  
            status:
              'PENDING',
  
            expiresAt,
          })
          .returning();
  
      return transfer;
    }
  
    async getMine(
      userId: string,
    ) {
      return this.database.db
        .select({
          id:
            organizationRepresentativeTransfers.id,
  
          organizationId:
            organizationRepresentativeTransfers
              .organizationId,
  
          organizationName:
            organizations.name,
  
          fromUserId:
            organizationRepresentativeTransfers
              .fromUserId,
  
          toUserId:
            organizationRepresentativeTransfers
              .toUserId,
  
          status:
            organizationRepresentativeTransfers
              .status,
  
          expiresAt:
            organizationRepresentativeTransfers
              .expiresAt,
  
          acceptedAt:
            organizationRepresentativeTransfers
              .acceptedAt,
  
          declinedAt:
            organizationRepresentativeTransfers
              .declinedAt,
  
          createdAt:
            organizationRepresentativeTransfers
              .createdAt,
        })
        .from(
          organizationRepresentativeTransfers,
        )
        .innerJoin(
          organizations,
          eq(
            organizationRepresentativeTransfers
              .organizationId,
  
            organizations.id,
          ),
        )
        .where(
          eq(
            organizationRepresentativeTransfers
              .toUserId,
  
            userId,
          ),
        )
        .orderBy(
          desc(
            organizationRepresentativeTransfers
              .createdAt,
          ),
        );
    }
  
    async accept(
      userId: string,
      transferId: string,
    ) {
      const transfer =
        await this.getTransferForRecipient(
          userId,
          transferId,
        );
  
      if (
        transfer.status === 'ACCEPTED'
      ) {
        return {
          transferId,
          status: 'ACCEPTED',
        };
      }
  
      if (
        transfer.status !== 'PENDING'
      ) {
        throw new ConflictException({
          code:
            'REPRESENTATIVE_TRANSFER_NOT_ACTIONABLE',
  
          message:
            'Yêu cầu chuyển quyền không còn có thể chấp nhận.',
        });
      }
  
      if (
        transfer.expiresAt.getTime()
        <= Date.now()
      ) {
        await this.markExpired(
          transferId,
        );
  
        throw new ConflictException({
          code:
            'REPRESENTATIVE_TRANSFER_EXPIRED',
  
          message:
            'Yêu cầu chuyển quyền đã hết hạn.',
        });
      }
  
      const [targetUser] =
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
  
      if (!targetUser) {
        throw new NotFoundException({
          code: 'USER_NOT_FOUND',
          message:
            'Không tìm thấy người dùng.',
        });
      }
  
      if (
        targetUser.identityVerificationStatus
        !== 'VERIFIED'
      ) {
        throw new ConflictException({
          code:
            'IDENTITY_VERIFICATION_REQUIRED',
  
          message:
            'Bạn phải hoàn tất xác minh danh tính trước khi nhận quyền đại diện.',
        });
      }
  
      return this.database.db.transaction(
        async (tx) => {
          const [fromMembership] =
            await tx
              .select({
                id:
                  organizationMembers.id,
  
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
  
                    transfer.organizationId,
                  ),
  
                  eq(
                    organizationMembers.userId,
                    transfer.fromUserId,
                  ),
                ),
              )
              .limit(1);
  
          if (
            !fromMembership
            || fromMembership.role !==
              'PRIMARY_REPRESENTATIVE'
          ) {
            throw new ConflictException({
              code:
                'TRANSFER_SENDER_NO_LONGER_REPRESENTATIVE',
  
              message:
                'Người gửi không còn là người đại diện chính của tổ chức.',
            });
          }
  
          const [toMembership] =
            await tx
              .select({
                id:
                  organizationMembers.id,
  
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
  
                    transfer.organizationId,
                  ),
  
                  eq(
                    organizationMembers.userId,
                    userId,
                  ),
                ),
              )
              .limit(1);
  
          if (!toMembership) {
            throw new ConflictException({
              code:
                'TRANSFER_RECIPIENT_NOT_MEMBER',
  
              message:
                'Bạn không còn là thành viên của tổ chức.',
            });
          }
  
          const now =
            new Date();
  
          const [senderUpdated] =
            await tx
              .update(
                organizationMembers,
              )
              .set({
                role: 'STAFF',
                updatedAt: now,
              })
              .where(
                and(
                  eq(
                    organizationMembers.id,
                    fromMembership.id,
                  ),
  
                  eq(
                    organizationMembers.role,
                    'PRIMARY_REPRESENTATIVE',
                  ),
                ),
              )
              .returning({
                id:
                  organizationMembers.id,
              });
  
          if (!senderUpdated) {
            throw new ConflictException({
              code:
                'REPRESENTATIVE_TRANSFER_CONFLICT',
  
              message:
                'Quyền đại diện đã thay đổi. Vui lòng tải lại dữ liệu.',
            });
          }
  
          const [recipientUpdated] =
            await tx
              .update(
                organizationMembers,
              )
              .set({
                role:
                  'PRIMARY_REPRESENTATIVE',
  
                updatedAt:
                  now,
              })
              .where(
                eq(
                  organizationMembers.id,
                  toMembership.id,
                ),
              )
              .returning({
                id:
                  organizationMembers.id,
              });
  
          if (!recipientUpdated) {
            throw new ConflictException({
              code:
                'REPRESENTATIVE_TRANSFER_CONFLICT',
  
              message:
                'Không thể cập nhật người nhận quyền.',
            });
          }
  
          const [accepted] =
            await tx
              .update(
                organizationRepresentativeTransfers,
              )
              .set({
                status:
                  'ACCEPTED',
  
                acceptedAt:
                  now,
  
                updatedAt:
                  now,
              })
              .where(
                and(
                  eq(
                    organizationRepresentativeTransfers
                      .id,
  
                    transferId,
                  ),
  
                  eq(
                    organizationRepresentativeTransfers
                      .status,
  
                    'PENDING',
                  ),
  
                  eq(
                    organizationRepresentativeTransfers
                      .toUserId,
  
                    userId,
                  ),
                ),
              )
              .returning({
                id:
                  organizationRepresentativeTransfers.id,
              });
  
          if (!accepted) {
            throw new ConflictException({
              code:
                'REPRESENTATIVE_TRANSFER_CONFLICT',
  
              message:
                'Yêu cầu chuyển quyền đã được xử lý bởi một thao tác khác.',
            });
          }
  
          return {
            transferId,
  
            status:
              'ACCEPTED',
  
            organizationId:
              transfer.organizationId,
  
            previousRepresentativeUserId:
              transfer.fromUserId,
  
            newRepresentativeUserId:
              userId,
          };
        },
      );
    }
  
    async decline(
      userId: string,
      transferId: string,
    ) {
      const transfer =
        await this.getTransferForRecipient(
          userId,
          transferId,
        );
  
      if (
        transfer.status === 'DECLINED'
      ) {
        return {
          transferId,
          status: 'DECLINED',
        };
      }
  
      if (
        transfer.status !== 'PENDING'
      ) {
        throw new ConflictException({
          code:
            'REPRESENTATIVE_TRANSFER_NOT_ACTIONABLE',
  
          message:
            'Yêu cầu chuyển quyền không còn có thể từ chối.',
        });
      }
  
      if (
        transfer.expiresAt.getTime()
        <= Date.now()
      ) {
        await this.markExpired(
          transferId,
        );
  
        throw new ConflictException({
          code:
            'REPRESENTATIVE_TRANSFER_EXPIRED',
  
          message:
            'Yêu cầu chuyển quyền đã hết hạn.',
        });
      }
  
      const now =
        new Date();
  
      const [declined] =
        await this.database.db
          .update(
            organizationRepresentativeTransfers,
          )
          .set({
            status:
              'DECLINED',
  
            declinedAt:
              now,
  
            updatedAt:
              now,
          })
          .where(
            and(
              eq(
                organizationRepresentativeTransfers.id,
                transferId,
              ),
  
              eq(
                organizationRepresentativeTransfers
                  .toUserId,
  
                userId,
              ),
  
              eq(
                organizationRepresentativeTransfers.status,
                'PENDING',
              ),
            ),
          )
          .returning({
            id:
              organizationRepresentativeTransfers.id,
          });
  
      if (!declined) {
        throw new ConflictException({
          code:
            'REPRESENTATIVE_TRANSFER_CONFLICT',
  
          message:
            'Yêu cầu chuyển quyền đã được xử lý.',
        });
      }
  
      return {
        transferId,
        status: 'DECLINED',
      };
    }
  
    async cancel(
      userId: string,
      transferId: string,
    ) {
      const [transfer] =
        await this.database.db
          .select({
            id:
              organizationRepresentativeTransfers.id,
  
            fromUserId:
              organizationRepresentativeTransfers
                .fromUserId,
  
            status:
              organizationRepresentativeTransfers
                .status,
  
            expiresAt:
              organizationRepresentativeTransfers
                .expiresAt,
          })
          .from(
            organizationRepresentativeTransfers,
          )
          .where(
            eq(
              organizationRepresentativeTransfers.id,
              transferId,
            ),
          )
          .limit(1);
  
      if (!transfer) {
        throw new NotFoundException({
          code:
            'REPRESENTATIVE_TRANSFER_NOT_FOUND',
  
          message:
            'Không tìm thấy yêu cầu chuyển quyền.',
        });
      }
  
      if (
        transfer.fromUserId !== userId
      ) {
        throw new ForbiddenException({
          code:
            'REPRESENTATIVE_TRANSFER_ACCESS_DENIED',
  
          message:
            'Bạn không phải người tạo yêu cầu chuyển quyền này.',
        });
      }
  
      if (
        transfer.status !== 'PENDING'
      ) {
        throw new ConflictException({
          code:
            'REPRESENTATIVE_TRANSFER_NOT_ACTIONABLE',
  
          message:
            'Yêu cầu chuyển quyền không còn có thể hủy.',
        });
      }
  
      if (
        transfer.expiresAt.getTime()
        <= Date.now()
      ) {
        await this.markExpired(
          transferId,
        );
  
        throw new ConflictException({
          code:
            'REPRESENTATIVE_TRANSFER_EXPIRED',
  
          message:
            'Yêu cầu chuyển quyền đã hết hạn.',
        });
      }
  
      const now =
        new Date();
  
      const [cancelled] =
        await this.database.db
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
                organizationRepresentativeTransfers.id,
                transferId,
              ),
  
              eq(
                organizationRepresentativeTransfers
                  .fromUserId,
  
                userId,
              ),
  
              eq(
                organizationRepresentativeTransfers.status,
                'PENDING',
              ),
            ),
          )
          .returning({
            id:
              organizationRepresentativeTransfers.id,
          });
  
      if (!cancelled) {
        throw new ConflictException({
          code:
            'REPRESENTATIVE_TRANSFER_CONFLICT',
  
          message:
            'Yêu cầu chuyển quyền đã được xử lý.',
        });
      }
  
      return {
        transferId,
        status: 'CANCELLED',
      };
    }
  
    private async getTransferForRecipient(
      userId: string,
      transferId: string,
    ) {
      const [transfer] =
        await this.database.db
          .select({
            id:
              organizationRepresentativeTransfers.id,
  
            organizationId:
              organizationRepresentativeTransfers
                .organizationId,
  
            fromUserId:
              organizationRepresentativeTransfers
                .fromUserId,
  
            toUserId:
              organizationRepresentativeTransfers
                .toUserId,
  
            status:
              organizationRepresentativeTransfers
                .status,
  
            expiresAt:
              organizationRepresentativeTransfers
                .expiresAt,
          })
          .from(
            organizationRepresentativeTransfers,
          )
          .where(
            eq(
              organizationRepresentativeTransfers.id,
              transferId,
            ),
          )
          .limit(1);
  
      if (!transfer) {
        throw new NotFoundException({
          code:
            'REPRESENTATIVE_TRANSFER_NOT_FOUND',
  
          message:
            'Không tìm thấy yêu cầu chuyển quyền.',
        });
      }
  
      if (
        transfer.toUserId !== userId
      ) {
        throw new ForbiddenException({
          code:
            'REPRESENTATIVE_TRANSFER_ACCESS_DENIED',
  
          message:
            'Yêu cầu chuyển quyền này không dành cho bạn.',
        });
      }
  
      return transfer;
    }
  
    private async markExpired(
      transferId: string,
    ): Promise<void> {
      await this.database.db
        .update(
          organizationRepresentativeTransfers,
        )
        .set({
          status:
            'EXPIRED',
  
          updatedAt:
            new Date(),
        })
        .where(
          and(
            eq(
              organizationRepresentativeTransfers.id,
              transferId,
            ),
  
            eq(
              organizationRepresentativeTransfers.status,
              'PENDING',
            ),
          ),
        );
    }
  }