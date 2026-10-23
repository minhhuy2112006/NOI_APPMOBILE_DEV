import {
    ConflictException,
    Injectable,
    NotFoundException,
  } from '@nestjs/common';
  
  import {
    and,
    desc,
    eq,
    sql,
    inArray,
    lte,
  } from 'drizzle-orm';
  
  import {
    DatabaseService,
  } from '../database/database.service';
  
  import {
    campaignApplications,
    campaignPositions,
    campaigns,
    users,
  } from '../database/schema';
  import {
    OrganizationAuthorizationService,
  } from '../organizations/organization-authorization.service';
  
  import {
    ORGANIZATION_PERMISSIONS,
  } from '../organizations/organization-permissions';

  import type {
    ReviewCampaignApplicationDto,
  } from './dto/review-campaign-application.dto';
  import type {
    CreateCampaignApplicationDto,
  } from './dto/create-campaign-application.dto';
  
  @Injectable()
  export class ApplicationsService {
    constructor(
      private readonly database:
        DatabaseService,
      private readonly authorization:
        OrganizationAuthorizationService,
    ) {}
  
    async apply(
      applicantUserId: string,
      campaignId: string,
      dto: CreateCampaignApplicationDto,
    ) {
      const [campaign] =
        await this.database.db
          .select({
            id:
              campaigns.id,
  
            status:
              campaigns.status,
  
            recruitmentStatus:
              campaigns.recruitmentStatus,
          })
          .from(campaigns)
          .where(
            eq(
              campaigns.id,
              campaignId,
            ),
          )
          .limit(1);
  
      if (!campaign) {
        throw new NotFoundException({
          code:
            'CAMPAIGN_NOT_FOUND',
  
          message:
            'Không tìm thấy chiến dịch.',
        });
      }
  
      /*
       * Chỉ campaign đã PUBLISHED mới nhận application.
       *
       * ONGOING dù còn dữ liệu recruitment cũ
       * cũng tuyệt đối không được nhận thêm người.
       */
      if (
        campaign.status !== 'PUBLISHED'
      ) {
        throw new ConflictException({
          code:
            'CAMPAIGN_NOT_ACCEPTING_APPLICATIONS',
  
          message:
            'Chiến dịch hiện không nhận đơn ứng tuyển.',
        });
      }
  
      // CLOSED = không nhận bất kỳ đơn mới nào.
      if (
        campaign.recruitmentStatus
        === 'CLOSED'
      ) {
        throw new ConflictException({
          code:
            'CAMPAIGN_RECRUITMENT_CLOSED',
  
          message:
            'Chiến dịch đã đóng tuyển.',
        });
      }
  
      const [position] =
        await this.database.db
          .select({
            id:
              campaignPositions.id,
  
            campaignId:
              campaignPositions.campaignId,
  
            isActive:
              campaignPositions.isActive,
          })
          .from(campaignPositions)
          .where(
            and(
              eq(
                campaignPositions.id,
                dto.positionId,
              ),
  
              /*
               * Không cho user gửi positionId
               * thuộc một campaign khác.
               */
              eq(
                campaignPositions.campaignId,
                campaignId,
              ),
  
              eq(
                campaignPositions.isActive,
                true,
              ),
            ),
          )
          .limit(1);
  
      if (!position) {
        throw new NotFoundException({
          code:
            'CAMPAIGN_POSITION_NOT_AVAILABLE',
  
          message:
            'Vị trí ứng tuyển không tồn tại hoặc không còn hoạt động.',
        });
      }
  
      /*
       * Một user chỉ được có một application
       * trong một campaign.
       */
      const [existingApplication] =
        await this.database.db
          .select({
            id:
              campaignApplications.id,
  
            status:
              campaignApplications.status,
          })
          .from(campaignApplications)
          .where(
            and(
              eq(
                campaignApplications.campaignId,
                campaignId,
              ),
  
              eq(
                campaignApplications.applicantUserId,
                applicantUserId,
              ),
            ),
          )
          .limit(1);
  
      if (existingApplication) {
        throw new ConflictException({
          code:
            'CAMPAIGN_APPLICATION_ALREADY_EXISTS',
  
          message:
            'Bạn đã có đơn ứng tuyển cho chiến dịch này.',
        });
      }
  
      /*
       * Không tự động waitlist vì hết capacity.
       *
       * OPEN:
       * user chủ động apply bình thường
       * → PENDING_REVIEW.
       *
       * WAITLIST_ONLY:
       * user biết chiến dịch chỉ nhận danh sách chờ
       * → WAITLISTED.
       */
      const initialStatus =
        campaign.recruitmentStatus
        === 'WAITLIST_ONLY'
          ? 'WAITLISTED'
          : 'PENDING_REVIEW';
  
      const now =
        new Date();
  
      try {
        const [application] =
          await this.database.db
            .insert(
              campaignApplications,
            )
            .values({
              campaignId,
  
              positionId:
                dto.positionId,
  
              applicantUserId,
  
              motivation:
                dto.motivation ?? null,
  
              status:
                initialStatus,
  
              waitlistedAt:
                initialStatus ===
                'WAITLISTED'
                  ? now
                  : null,
            })
            .returning();
  
        return application;
      } catch (error: unknown) {
        /*
         * Database unique constraint là lớp bảo vệ cuối
         * nếu 2 request Apply chạy gần như đồng thời.
         */
        if (
          typeof error === 'object'
          && error !== null
          && 'code' in error
          && (
            error as {
              code?: string;
            }
          ).code === '23505'
        ) {
          throw new ConflictException({
            code:
              'CAMPAIGN_APPLICATION_ALREADY_EXISTS',
  
            message:
              'Bạn đã có đơn ứng tuyển cho chiến dịch này.',
          });
        }
  
        throw error;
      }
    }
  
    async getMine(
      applicantUserId: string,
    ) {
      return this.database.db
        .select({
          id:
            campaignApplications.id,
  
          campaignId:
            campaignApplications.campaignId,
  
          campaignTitle:
            campaigns.title,
  
          positionId:
            campaignApplications.positionId,
  
          positionName:
            campaignPositions.name,
  
          motivation:
            campaignApplications.motivation,
  
          status:
            campaignApplications.status,
  
          confirmationExpiresAt:
            campaignApplications
              .confirmationExpiresAt,
  
          selectedAt:
            campaignApplications.selectedAt,
  
          confirmedAt:
            campaignApplications.confirmedAt,
  
          waitlistedAt:
            campaignApplications.waitlistedAt,
  
          createdAt:
            campaignApplications.createdAt,
  
          updatedAt:
            campaignApplications.updatedAt,
        })
        .from(
          campaignApplications,
        )
        .innerJoin(
          campaigns,
          eq(
            campaignApplications.campaignId,
            campaigns.id,
          ),
        )
        .innerJoin(
          campaignPositions,
          eq(
            campaignApplications.positionId,
            campaignPositions.id,
          ),
        )
        .where(
          eq(
            campaignApplications.applicantUserId,
            applicantUserId,
          ),
        )
        .orderBy(
          desc(
            campaignApplications.createdAt,
          ),
        );
    }

    async getCampaignApplications(
        requestingUserId: string,
        campaignId: string,
      ) {
        const campaign =
          await this.getCampaignForManagement(
            campaignId,
          );
      
        // Chỉ người có quyền quản lý campaign mới được xem đơn ứng tuyển.
        await this.authorization
          .requirePermission(
            requestingUserId,
            campaign.organizationId,
            ORGANIZATION_PERMISSIONS
              .MANAGE_CAMPAIGN,
          );
      
        return this.database.db
          .select({
            id:
              campaignApplications.id,
      
            campaignId:
              campaignApplications.campaignId,
      
            positionId:
              campaignApplications.positionId,
      
            positionName:
              campaignPositions.name,
      
            applicantUserId:
              campaignApplications
                .applicantUserId,
      
            applicantName:
              users.name,
      
            applicantEmail:
              users.email,
      
            motivation:
              campaignApplications.motivation,
      
            status:
              campaignApplications.status,
      
            confirmationExpiresAt:
              campaignApplications
                .confirmationExpiresAt,
      
            selectedAt:
              campaignApplications.selectedAt,
      
            confirmedAt:
              campaignApplications.confirmedAt,
      
            waitlistedAt:
              campaignApplications.waitlistedAt,
      
            rejectedAt:
              campaignApplications.rejectedAt,
      
            createdAt:
              campaignApplications.createdAt,
          })
          .from(
            campaignApplications,
          )
          .innerJoin(
            users,
            eq(
              campaignApplications
                .applicantUserId,
              users.id,
            ),
          )
          .innerJoin(
            campaignPositions,
            eq(
              campaignApplications.positionId,
              campaignPositions.id,
            ),
          )
          .where(
            eq(
              campaignApplications.campaignId,
              campaignId,
            ),
          )
          .orderBy(
            desc(
              campaignApplications.createdAt,
            ),
          );
    }

    async review(
        requestingUserId: string,
        campaignId: string,
        applicationId: string,
        dto: ReviewCampaignApplicationDto,
      ) {
        const campaign =
          await this.getCampaignForManagement(
            campaignId,
          );
      
        // Chỉ BTC có MANAGE_CAMPAIGN mới được xét đơn.
        await this.authorization
          .requirePermission(
            requestingUserId,
            campaign.organizationId,
            ORGANIZATION_PERMISSIONS
              .MANAGE_CAMPAIGN,
          );
      
        /*
         * Khi campaign đã bắt đầu hoặc kết thúc
         * thì không tiếp tục xét đơn mới.
         *
         * Recruitment có thể CLOSED nhưng campaign vẫn PUBLISHED:
         * trường hợp đó BTC vẫn được xử lý các đơn đã nộp trước đó.
         */
        if (
          campaign.status !== 'PUBLISHED'
        ) {
          throw new ConflictException({
            code:
              'CAMPAIGN_APPLICATION_REVIEW_CLOSED',
      
            message:
              'Chỉ chiến dịch đã publish và chưa bắt đầu mới được xét đơn ứng tuyển.',
          });
        }
      
        const [application] =
          await this.database.db
            .select({
              id:
                campaignApplications.id,
      
              campaignId:
                campaignApplications.campaignId,
      
              status:
                campaignApplications.status,
            })
            .from(
              campaignApplications,
            )
            .where(
              and(
                eq(
                  campaignApplications.id,
                  applicationId,
                ),
      
                // Không cho dùng application của campaign khác.
                eq(
                  campaignApplications.campaignId,
                  campaignId,
                ),
              ),
            )
            .limit(1);
      
        if (!application) {
          throw new NotFoundException({
            code:
              'CAMPAIGN_APPLICATION_NOT_FOUND',
      
            message:
              'Không tìm thấy đơn ứng tuyển.',
          });
        }
      
        /*
         * Review thông thường chỉ được áp dụng
         * cho đơn đang chờ BTC xét.
         */
        if (
          application.status !==
          'PENDING_REVIEW'
        ) {
          throw new ConflictException({
            code:
              'CAMPAIGN_APPLICATION_NOT_REVIEWABLE',
      
            message:
              'Đơn ứng tuyển không còn ở trạng thái chờ xét.',
          });
        }
      
        const now =
          new Date();
      
        if (
          dto.action === 'SELECT'
        ) {
          /*
           * Người được chọn có 48 giờ để xác nhận.
           *
           * Đây mới chỉ là "được chọn",
           * chưa phải CONFIRMED và chưa chiếm slot.
           */
          const confirmationExpiresAt =
            new Date(
              now.getTime()
              + 48 * 60 * 60 * 1000,
            );
      
          const [updated] =
            await this.database.db
              .update(
                campaignApplications,
              )
              .set({
                status:
                  'SELECTED_PENDING_CONFIRMATION',
      
                selectedAt:
                  now,
      
                confirmationExpiresAt,
      
                updatedAt:
                  now,
              })
              .where(
                and(
                  eq(
                    campaignApplications.id,
                    applicationId,
                  ),
      
                  /*
                   * Conditional update giúp tránh
                   * hai BTC cùng xét một đơn.
                   */
                  eq(
                    campaignApplications.status,
                    'PENDING_REVIEW',
                  ),
                ),
              )
              .returning();
      
          if (!updated) {
            throw new ConflictException({
              code:
                'CAMPAIGN_APPLICATION_STATE_CONFLICT',
      
              message:
                'Đơn ứng tuyển đã được xử lý bởi thao tác khác.',
            });
          }
      
          return updated;
        }
      
        if (
          dto.action === 'WAITLIST'
        ) {
          const [updated] =
            await this.database.db
              .update(
                campaignApplications,
              )
              .set({
                status:
                  'WAITLISTED',
      
                waitlistedAt:
                  now,
      
                updatedAt:
                  now,
              })
              .where(
                and(
                  eq(
                    campaignApplications.id,
                    applicationId,
                  ),
      
                  eq(
                    campaignApplications.status,
                    'PENDING_REVIEW',
                  ),
                ),
              )
              .returning();
      
          if (!updated) {
            throw new ConflictException({
              code:
                'CAMPAIGN_APPLICATION_STATE_CONFLICT',
      
              message:
                'Đơn ứng tuyển đã được xử lý bởi thao tác khác.',
            });
          }
      
          return updated;
        }
      
        /*
         * Trường hợp còn lại sau validation DTO là REJECT.
         */
        const [updated] =
          await this.database.db
            .update(
              campaignApplications,
            )
            .set({
              status:
                'REJECTED',
      
              rejectedAt:
                now,
      
              updatedAt:
                now,
            })
            .where(
              and(
                eq(
                  campaignApplications.id,
                  applicationId,
                ),
      
                eq(
                  campaignApplications.status,
                  'PENDING_REVIEW',
                ),
              ),
            )
            .returning();
      
        if (!updated) {
          throw new ConflictException({
            code:
              'CAMPAIGN_APPLICATION_STATE_CONFLICT',
      
            message:
              'Đơn ứng tuyển đã được xử lý bởi thao tác khác.',
          });
        }
      
        return updated;
    
    }

    private async getCampaignForManagement(
        campaignId: string,
      ) {
        const [campaign] =
          await this.database.db
            .select({
              id:
                campaigns.id,
      
              organizationId:
                campaigns.organizationId,
      
              status:
                campaigns.status,
            })
            .from(campaigns)
            .where(
              eq(
                campaigns.id,
                campaignId,
              ),
            )
            .limit(1);
      
        if (!campaign) {
          throw new NotFoundException({
            code:
              'CAMPAIGN_NOT_FOUND',
      
            message:
              'Không tìm thấy chiến dịch.',
          });
        }
      
        return campaign;
    }

    async confirm(
        applicantUserId: string,
        applicationId: string,
      ) {
        try {
          /*
           * SERIALIZABLE rất quan trọng ở đây.
           *
           * Nếu chỉ còn 1 slot mà 2 TNV bấm xác nhận cùng lúc,
           * PostgreSQL sẽ không cho cả hai transaction cùng thành công.
           */
          const result =
            await this.database.db.transaction(
              async (tx) => {
                const [application] =
                  await tx
                    .select({
                      id:
                        campaignApplications.id,
      
                      campaignId:
                        campaignApplications
                          .campaignId,
      
                      positionId:
                        campaignApplications
                          .positionId,
      
                      applicantUserId:
                        campaignApplications
                          .applicantUserId,
      
                      status:
                        campaignApplications.status,
      
                      confirmationExpiresAt:
                        campaignApplications
                          .confirmationExpiresAt,
      
                      campaignStatus:
                        campaigns.status,
      
                      campaignCapacity:
                        campaigns.capacity,
      
                      positionCapacity:
                        campaignPositions.capacity,
      
                      positionCampaignId:
                        campaignPositions
                          .campaignId,
                    })
                    .from(
                      campaignApplications,
                    )
                    .innerJoin(
                      campaigns,
                      eq(
                        campaignApplications
                          .campaignId,
                        campaigns.id,
                      ),
                    )
                    .innerJoin(
                      campaignPositions,
                      eq(
                        campaignApplications
                          .positionId,
                        campaignPositions.id,
                      ),
                    )
                    .where(
                      and(
                        eq(
                          campaignApplications.id,
                          applicationId,
                        ),
      
                        /*
                         * Chỉ chủ sở hữu application
                         * mới được xác nhận đơn của mình.
                         */
                        eq(
                          campaignApplications
                            .applicantUserId,
                          applicantUserId,
                        ),
                      ),
                    )
                    .limit(1);
      
                if (!application) {
                  throw new NotFoundException({
                    code:
                      'CAMPAIGN_APPLICATION_NOT_FOUND',
      
                    message:
                      'Không tìm thấy đơn ứng tuyển.',
                  });
                }
      
                /*
                 * Bảo vệ dữ liệu:
                 * position phải thật sự thuộc campaign
                 * của application.
                 */
                if (
                  application.positionCampaignId
                  !== application.campaignId
                ) {
                  throw new ConflictException({
                    code:
                      'CAMPAIGN_APPLICATION_POSITION_MISMATCH',
      
                    message:
                      'Dữ liệu vị trí ứng tuyển không hợp lệ.',
                  });
                }
      
                if (
                  application.status !==
                  'SELECTED_PENDING_CONFIRMATION'
                ) {
                  throw new ConflictException({
                    code:
                      'CAMPAIGN_APPLICATION_NOT_CONFIRMABLE',
      
                    message:
                      'Đơn ứng tuyển hiện không thể xác nhận.',
                  });
                }
      
                /*
                 * Không cho xác nhận sau khi campaign
                 * đã bắt đầu hoặc kết thúc.
                 */
                if (
                  application.campaignStatus
                  !== 'PUBLISHED'
                ) {
                  throw new ConflictException({
                    code:
                      'CAMPAIGN_NOT_CONFIRMABLE',
      
                    message:
                      'Chiến dịch hiện không còn nhận xác nhận tham gia.',
                  });
                }
      
                const now =
                  new Date();
      
                /*
                 * Application được SELECT phải có hạn xác nhận.
                 */
                if (
                  !application
                    .confirmationExpiresAt
                ) {
                  throw new ConflictException({
                    code:
                      'CONFIRMATION_DEADLINE_MISSING',
      
                    message:
                      'Đơn ứng tuyển không có thời hạn xác nhận hợp lệ.',
                  });
                }
      
                /*
                 * Nếu đã quá hạn:
                 * chuyển luôn sang CONFIRMATION_EXPIRED.
                 *
                 * Không throw ngay trong transaction,
                 * vì throw sẽ rollback cả việc cập nhật EXPIRED.
                 */
                if (
                  application
                    .confirmationExpiresAt
                    .getTime()
                  <= now.getTime()
                ) {
                  const [expired] =
                    await tx
                      .update(
                        campaignApplications,
                      )
                      .set({
                        status:
                          'CONFIRMATION_EXPIRED',
      
                        confirmationExpiredAt:
                          now,
      
                        updatedAt:
                          now,
                      })
                      .where(
                        and(
                          eq(
                            campaignApplications.id,
                            applicationId,
                          ),
      
                          eq(
                            campaignApplications.status,
                            'SELECTED_PENDING_CONFIRMATION',
                          ),
                        ),
                      )
                      .returning();
      
                  if (!expired) {
                    throw new ConflictException({
                      code:
                        'CAMPAIGN_APPLICATION_STATE_CONFLICT',
      
                      message:
                        'Trạng thái đơn ứng tuyển đã thay đổi.',
                    });
                  }
      
                  return {
                    type:
                      'EXPIRED' as const,
                  };
                }
      
                if (
                  application.campaignCapacity
                  === null
                ) {
                  throw new ConflictException({
                    code:
                      'CAMPAIGN_CAPACITY_NOT_CONFIGURED',
      
                    message:
                      'Chiến dịch chưa được cấu hình số lượng TNV.',
                  });
                }
      
                /*
                 * Chỉ CONFIRMED mới được tính là đã chiếm slot.
                 */
                const [campaignCount] =
                  await tx
                    .select({
                      count:
                        sql<number>`
                          count(*)::int
                        `,
                    })
                    .from(
                      campaignApplications,
                    )
                    .where(
                      and(
                        eq(
                          campaignApplications
                            .campaignId,
                          application.campaignId,
                        ),
      
                        eq(
                          campaignApplications.status,
                          'CONFIRMED',
                        ),
                      ),
                    );
      
                if (
                  campaignCount.count
                  >= application
                    .campaignCapacity
                ) {
                  return {
                    type:
                      'CAMPAIGN_FULL' as const,
                  };
                }
      
                /*
                 * Ngoài trần toàn campaign,
                 * còn phải kiểm tra capacity riêng của position.
                 */
                const [positionCount] =
                  await tx
                    .select({
                      count:
                        sql<number>`
                          count(*)::int
                        `,
                    })
                    .from(
                      campaignApplications,
                    )
                    .where(
                      and(
                        eq(
                          campaignApplications
                            .positionId,
                          application.positionId,
                        ),
      
                        eq(
                          campaignApplications.status,
                          'CONFIRMED',
                        ),
                      ),
                    );
      
                if (
                  positionCount.count
                  >= application
                    .positionCapacity
                ) {
                  return {
                    type:
                      'POSITION_FULL' as const,
                  };
                }
      
                /*
                 * Chỉ sau khi cả hai capacity đều còn chỗ
                 * mới chuyển application thành CONFIRMED.
                 */
                const [confirmed] =
                  await tx
                    .update(
                      campaignApplications,
                    )
                    .set({
                      status:
                        'CONFIRMED',
      
                      confirmedAt:
                        now,
                      
                    // Đã xác nhận xong thì deadline cũ không còn ý nghĩa.
                      confirmationExpiresAt:
                        null,

                      updatedAt:
                        now,
                    })
                    .where(
                      and(
                        eq(
                          campaignApplications.id,
                          applicationId,
                        ),
      
                        /*
                         * Conditional update:
                         * tránh cùng một application
                         * được xác nhận hai lần.
                         */
                        eq(
                          campaignApplications.status,
                          'SELECTED_PENDING_CONFIRMATION',
                        ),
                      ),
                    )
                    .returning();
      
                if (!confirmed) {
                  throw new ConflictException({
                    code:
                      'CAMPAIGN_APPLICATION_STATE_CONFLICT',
      
                    message:
                      'Đơn ứng tuyển đã được xử lý bởi thao tác khác.',
                  });
                }
      
                return {
                  type:
                    'CONFIRMED' as const,
      
                  application:
                    confirmed,
                };
              },
              {
                /*
                 * Mức cô lập cao để bảo vệ
                 * capacity khi có request đồng thời.
                 */
                isolationLevel:
                  'serializable',
      
                accessMode:
                  'read write',
              },
            );
      
          /*
           * Các lỗi business này được throw SAU transaction
           * để những thay đổi cần commit như EXPIRED không bị rollback.
           */
          if (
            result.type === 'EXPIRED'
          ) {
            throw new ConflictException({
              code:
                'APPLICATION_CONFIRMATION_EXPIRED',
      
              message:
                'Thời hạn xác nhận tham gia đã hết.',
            });
          }
      
          if (
            result.type ===
            'CAMPAIGN_FULL'
          ) {
            throw new ConflictException({
              code:
                'CAMPAIGN_CAPACITY_FULL',
      
              message:
                'Chiến dịch đã đủ số lượng tình nguyện viên.',
            });
          }
      
          if (
            result.type ===
            'POSITION_FULL'
          ) {
            throw new ConflictException({
              code:
                'CAMPAIGN_POSITION_CAPACITY_FULL',
      
              message:
                'Vị trí này đã đủ số lượng tình nguyện viên.',
            });
          }
      
          return result.application;
        } catch (error: unknown) {
          /*
           * PostgreSQL có thể hủy một transaction
           * khi phát hiện xung đột SERIALIZABLE.
           *
           * 40001 = serialization_failure.
           */
          if (
            typeof error === 'object'
            && error !== null
            && 'code' in error
            && (
              error as {
                code?: string;
              }
            ).code === '40001'
          ) {
            throw new ConflictException({
              code:
                'CAMPAIGN_CONFIRMATION_CONFLICT',
      
              message:
                'Có người khác vừa xác nhận suất cùng lúc. Vui lòng thử lại.',
            });
          }
      
          throw error;
        }
    }

    async decline(
        applicantUserId: string,
        applicationId: string,
      ) {
        const [application] =
          await this.database.db
            .select({
              id:
                campaignApplications.id,
      
              status:
                campaignApplications.status,
            })
            .from(campaignApplications)
            .where(
              and(
                eq(
                  campaignApplications.id,
                  applicationId,
                ),
      
                // Chỉ chủ application mới được từ chối.
                eq(
                  campaignApplications.applicantUserId,
                  applicantUserId,
                ),
              ),
            )
            .limit(1);
      
        if (!application) {
          throw new NotFoundException({
            code:
              'CAMPAIGN_APPLICATION_NOT_FOUND',
      
            message:
              'Không tìm thấy đơn ứng tuyển.',
          });
        }
      
        /*
         * User chỉ được decline khi đã được chọn
         * hoặc vừa được mời từ waitlist.
         */
        if (
          application.status !==
            'SELECTED_PENDING_CONFIRMATION'
          &&
          application.status !==
            'WAITLIST_INVITED'
        ) {
          throw new ConflictException({
            code:
              'CAMPAIGN_APPLICATION_NOT_DECLINABLE',
      
            message:
              'Đơn ứng tuyển hiện không thể từ chối.',
          });
        }
      
        const currentStatus =
          application.status;
      
        const now =
          new Date();
      
        const [updated] =
          await this.database.db
            .update(
              campaignApplications,
            )
            .set({
              status:
                'DECLINED',
      
              declinedAt:
                now,
      
              confirmationExpiresAt:
                null,
      
              updatedAt:
                now,
            })
            .where(
              and(
                eq(
                  campaignApplications.id,
                  applicationId,
                ),
      
                // Tránh 2 request cùng xử lý application.
                eq(
                  campaignApplications.status,
                  currentStatus,
                ),
              ),
            )
            .returning();
      
        if (!updated) {
          throw new ConflictException({
            code:
              'CAMPAIGN_APPLICATION_STATE_CONFLICT',
      
            message:
              'Trạng thái đơn ứng tuyển đã thay đổi.',
          });
        }
      
        return updated;
    }

    async inviteFromWaitlist(
        requestingUserId: string,
        campaignId: string,
        applicationId: string,
      ) {
        const campaign =
          await this.getCampaignForManagement(
            campaignId,
          );
      
        // Chỉ BTC có quyền quản lý campaign mới được mời waitlist.
        await this.authorization
          .requirePermission(
            requestingUserId,
            campaign.organizationId,
            ORGANIZATION_PERMISSIONS
              .MANAGE_CAMPAIGN,
          );
      
        if (
          campaign.status !== 'PUBLISHED'
        ) {
          throw new ConflictException({
            code:
              'CAMPAIGN_WAITLIST_INVITATION_CLOSED',
      
            message:
              'Chỉ chiến dịch đã publish và chưa bắt đầu mới được mời từ danh sách chờ.',
          });
        }
      
        const [application] =
          await this.database.db
            .select({
              id:
                campaignApplications.id,
      
              status:
                campaignApplications.status,
            })
            .from(campaignApplications)
            .where(
              and(
                eq(
                  campaignApplications.id,
                  applicationId,
                ),
      
                // Không cho dùng application của campaign khác.
                eq(
                  campaignApplications.campaignId,
                  campaignId,
                ),
              ),
            )
            .limit(1);
      
        if (!application) {
          throw new NotFoundException({
            code:
              'CAMPAIGN_APPLICATION_NOT_FOUND',
      
            message:
              'Không tìm thấy đơn ứng tuyển.',
          });
        }
      
        if (
          application.status !==
          'WAITLISTED'
        ) {
          throw new ConflictException({
            code:
              'CAMPAIGN_APPLICATION_NOT_WAITLISTED',
      
            message:
              'Chỉ application đang trong danh sách chờ mới được mời.',
          });
        }
      
        const now =
          new Date();
      
        /*
         * Cho user 24 giờ để phản hồi lời mời từ waitlist.
         *
         * Đây chưa phải thời hạn confirm cuối cùng.
         */
        const waitlistInviteExpiresAt =
          new Date(
            now.getTime()
            + 24 * 60 * 60 * 1000,
          );
      
        const [updated] =
          await this.database.db
            .update(
              campaignApplications,
            )
            .set({
              status:
                'WAITLIST_INVITED',
      
              waitlistInvitedAt:
                now,
      
              confirmationExpiresAt:
                waitlistInviteExpiresAt,
      
              updatedAt:
                now,
            })
            .where(
              and(
                eq(
                  campaignApplications.id,
                  applicationId,
                ),
      
                eq(
                  campaignApplications.status,
                  'WAITLISTED',
                ),
              ),
            )
            .returning();
      
        if (!updated) {
          throw new ConflictException({
            code:
              'CAMPAIGN_APPLICATION_STATE_CONFLICT',
      
            message:
              'Application đã được xử lý bởi thao tác khác.',
          });
        }
      
        return updated;
    }

    async acceptWaitlistInvite(
        applicantUserId: string,
        applicationId: string,
      ) {
        const [application] =
          await this.database.db
            .select({
              id:
                campaignApplications.id,
      
              status:
                campaignApplications.status,
      
              confirmationExpiresAt:
                campaignApplications
                  .confirmationExpiresAt,
            })
            .from(campaignApplications)
            .where(
              and(
                eq(
                  campaignApplications.id,
                  applicationId,
                ),
      
                // Chỉ đúng applicant mới được accept.
                eq(
                  campaignApplications.applicantUserId,
                  applicantUserId,
                ),
              ),
            )
            .limit(1);
      
        if (!application) {
          throw new NotFoundException({
            code:
              'CAMPAIGN_APPLICATION_NOT_FOUND',
      
            message:
              'Không tìm thấy đơn ứng tuyển.',
          });
        }
      
        if (
          application.status !==
          'WAITLIST_INVITED'
        ) {
          throw new ConflictException({
            code:
              'WAITLIST_INVITATION_NOT_ACCEPTABLE',
      
            message:
              'Lời mời từ danh sách chờ hiện không thể chấp nhận.',
          });
        }
      
        const now =
          new Date();
      
        /*
         * Nếu user phản hồi quá trễ,
         * đánh dấu lời mời đã hết hiệu lực.
         */
        if (
          !application.confirmationExpiresAt
          ||
          application.confirmationExpiresAt
            .getTime() <= now.getTime()
        ) {
          await this.database.db
            .update(
              campaignApplications,
            )
            .set({
              status:
                'CONFIRMATION_EXPIRED',
      
              confirmationExpiredAt:
                now,
      
              updatedAt:
                now,
            })
            .where(
              and(
                eq(
                  campaignApplications.id,
                  applicationId,
                ),
      
                eq(
                  campaignApplications.status,
                  'WAITLIST_INVITED',
                ),
              ),
            );
      
          throw new ConflictException({
            code:
              'WAITLIST_INVITATION_EXPIRED',
      
            message:
              'Lời mời từ danh sách chờ đã hết hạn.',
          });
        }
      
        /*
         * Sau khi accept waitlist invite,
         * user trở thành người đã được SELECT
         * và có thêm 48 giờ để xác nhận tham gia chính thức.
         *
         * Vẫn chưa chiếm slot ở bước này.
         */
        const finalConfirmationExpiresAt =
          new Date(
            now.getTime()
            + 48 * 60 * 60 * 1000,
          );
      
        const [updated] =
          await this.database.db
            .update(
              campaignApplications,
            )
            .set({
              status:
                'SELECTED_PENDING_CONFIRMATION',
      
              selectedAt:
                now,
      
              confirmationExpiresAt:
                finalConfirmationExpiresAt,
      
              updatedAt:
                now,
            })
            .where(
              and(
                eq(
                  campaignApplications.id,
                  applicationId,
                ),
      
                eq(
                  campaignApplications.status,
                  'WAITLIST_INVITED',
                ),
              ),
            )
            .returning();
      
        if (!updated) {
          throw new ConflictException({
            code:
              'CAMPAIGN_APPLICATION_STATE_CONFLICT',
      
            message:
              'Application đã được xử lý bởi thao tác khác.',
          });
        }
      
        return updated;
    }

    async expireDueConfirmations() {
        const now =
          new Date();
      
        /*
         * Sau này BullMQ / scheduled job chỉ cần gọi method này.
         *
         * Hiện tại chưa tự động hóa background.
         */
        return this.database.db
          .update(
            campaignApplications,
          )
          .set({
            status:
              'CONFIRMATION_EXPIRED',
      
            confirmationExpiredAt:
              now,
      
            updatedAt:
              now,
          })
          .where(
            and(
              inArray(
                campaignApplications.status,
                [
                  'SELECTED_PENDING_CONFIRMATION',
                  'WAITLIST_INVITED',
                ],
              ),
      
              lte(
                campaignApplications
                  .confirmationExpiresAt,
                now,
              ),
            ),
          )
          .returning({
            id:
              campaignApplications.id,
      
            status:
              campaignApplications.status,
          });
    }

    async requestWithdrawal(
        applicantUserId: string,
        applicationId: string,
      ) {
        const [application] =
          await this.database.db
            .select({
              id:
                campaignApplications.id,
      
              campaignId:
                campaignApplications.campaignId,
      
              status:
                campaignApplications.status,
      
              campaignStatus:
                campaigns.status,
            })
            .from(
              campaignApplications,
            )
            .innerJoin(
              campaigns,
              eq(
                campaignApplications.campaignId,
                campaigns.id,
              ),
            )
            .where(
              and(
                eq(
                  campaignApplications.id,
                  applicationId,
                ),
      
                // Chỉ chủ application mới được yêu cầu rút.
                eq(
                  campaignApplications.applicantUserId,
                  applicantUserId,
                ),
              ),
            )
            .limit(1);
      
        if (!application) {
          throw new NotFoundException({
            code:
              'CAMPAIGN_APPLICATION_NOT_FOUND',
      
            message:
              'Không tìm thấy đơn tham gia.',
          });
        }
      
        /*
         * Chỉ TNV đã CONFIRMED mới cần luồng withdrawal.
         *
         * Các trạng thái chưa confirm không chiếm slot,
         * nên sẽ dùng decline/cancel flow riêng.
         */
        if (
          application.status !==
          'CONFIRMED'
        ) {
          throw new ConflictException({
            code:
              'CAMPAIGN_APPLICATION_NOT_WITHDRAWABLE',
      
            message:
              'Chỉ tình nguyện viên đã xác nhận tham gia mới được gửi yêu cầu rút.',
          });
        }
      
        /*
         * Cho phép yêu cầu rút khi campaign:
         * - đã publish nhưng chưa bắt đầu
         * - hoặc đang diễn ra
         *
         * Campaign đã hoàn thành/hủy thì không còn dùng flow này.
         */
        if (
          application.campaignStatus !==
            'PUBLISHED'
          &&
          application.campaignStatus !==
            'ONGOING'
        ) {
          throw new ConflictException({
            code:
              'CAMPAIGN_WITHDRAWAL_CLOSED',
      
            message:
              'Chiến dịch hiện không còn nhận yêu cầu rút.',
          });
        }
      
        const now =
          new Date();
      
        const [updated] =
          await this.database.db
            .update(
              campaignApplications,
            )
            .set({
              status:
                'WITHDRAW_REQUESTED',
      
              withdrawRequestedAt:
                now,
      
              updatedAt:
                now,
            })
            .where(
              and(
                eq(
                  campaignApplications.id,
                  applicationId,
                ),
      
                // Conditional update chống xử lý đồng thời.
                eq(
                  campaignApplications.status,
                  'CONFIRMED',
                ),
              ),
            )
            .returning();
      
        if (!updated) {
          throw new ConflictException({
            code:
              'CAMPAIGN_APPLICATION_STATE_CONFLICT',
      
            message:
              'Trạng thái đơn tham gia đã thay đổi.',
          });
        }
      
        return updated;
    }

    async approveWithdrawal(
        requestingUserId: string,
        campaignId: string,
        applicationId: string,
      ) {
        const campaign =
          await this.getCampaignForManagement(
            campaignId,
          );
      
        // Chỉ BTC có MANAGE_CAMPAIGN mới được duyệt yêu cầu rút.
        await this.authorization
          .requirePermission(
            requestingUserId,
            campaign.organizationId,
            ORGANIZATION_PERMISSIONS
              .MANAGE_CAMPAIGN,
          );
      
        /*
         * Chỉ xử lý withdrawal khi campaign
         * chưa kết thúc nghiệp vụ.
         */
        if (
          campaign.status !== 'PUBLISHED'
          &&
          campaign.status !== 'ONGOING'
        ) {
          throw new ConflictException({
            code:
              'CAMPAIGN_WITHDRAWAL_REVIEW_CLOSED',
      
            message:
              'Chiến dịch hiện không còn xử lý yêu cầu rút.',
          });
        }
      
        const [application] =
          await this.database.db
            .select({
              id:
                campaignApplications.id,
      
              status:
                campaignApplications.status,
            })
            .from(
              campaignApplications,
            )
            .where(
              and(
                eq(
                  campaignApplications.id,
                  applicationId,
                ),
      
                // Application phải thuộc đúng campaign đang quản lý.
                eq(
                  campaignApplications.campaignId,
                  campaignId,
                ),
              ),
            )
            .limit(1);
      
        if (!application) {
          throw new NotFoundException({
            code:
              'CAMPAIGN_APPLICATION_NOT_FOUND',
      
            message:
              'Không tìm thấy đơn tham gia.',
          });
        }
      
        if (
          application.status !==
          'WITHDRAW_REQUESTED'
        ) {
          throw new ConflictException({
            code:
              'WITHDRAWAL_REQUEST_NOT_REVIEWABLE',
      
            message:
              'Đơn này không có yêu cầu rút đang chờ xử lý.',
          });
        }
      
        const now =
          new Date();
      
        const [updated] =
          await this.database.db
            .update(
              campaignApplications,
            )
            .set({
              status:
                'WITHDRAWN',
      
              withdrawnAt:
                now,
      
              updatedAt:
                now,
            })
            .where(
              and(
                eq(
                  campaignApplications.id,
                  applicationId,
                ),
      
                eq(
                  campaignApplications.status,
                  'WITHDRAW_REQUESTED',
                ),
              ),
            )
            .returning();
      
        if (!updated) {
          throw new ConflictException({
            code:
              'CAMPAIGN_APPLICATION_STATE_CONFLICT',
      
            message:
              'Yêu cầu rút đã được xử lý bởi thao tác khác.',
          });
        }
      
        return updated;
    }

    async completeParticipation(
        requestingUserId: string,
        campaignId: string,
        applicationId: string,
      ) {
        const campaign =
          await this.getCampaignForManagement(
            campaignId,
          );
      
        /*
         * Chỉ BTC có quyền quản lý campaign
         * mới được xác nhận TNV hoàn thành tham gia.
         */
        await this.authorization
          .requirePermission(
            requestingUserId,
            campaign.organizationId,
            ORGANIZATION_PERMISSIONS
              .MANAGE_CAMPAIGN,
          );
      
        /*
         * Chỉ xử lý completion sau khi
         * toàn campaign đã được đánh dấu COMPLETED.
         */
        if (
          campaign.status !==
          'COMPLETED'
        ) {
          throw new ConflictException({
            code:
              'CAMPAIGN_NOT_COMPLETED',
      
            message:
              'Chỉ được xác nhận hoàn thành tham gia sau khi chiến dịch đã kết thúc.',
          });
        }
      
        const [application] =
          await this.database.db
            .select({
              id:
                campaignApplications.id,
      
              campaignId:
                campaignApplications
                  .campaignId,
      
              status:
                campaignApplications.status,
            })
            .from(
              campaignApplications,
            )
            .where(
              and(
                eq(
                  campaignApplications.id,
                  applicationId,
                ),
      
                /*
                 * Application phải thuộc đúng campaign
                 * mà BTC đang quản lý.
                 */
                eq(
                  campaignApplications.campaignId,
                  campaignId,
                ),
              ),
            )
            .limit(1);
      
        if (!application) {
          throw new NotFoundException({
            code:
              'CAMPAIGN_APPLICATION_NOT_FOUND',
      
            message:
              'Không tìm thấy đơn tham gia.',
          });
        }
      
        /*
         * Chỉ TNV đã CONFIRMED mới có thể
         * được xác nhận hoàn thành tham gia.
         *
         * WAITLISTED / REJECTED / WITHDRAWN...
         * tuyệt đối không đi vào trạng thái này.
         */
        if (
          application.status !==
          'CONFIRMED'
        ) {
          throw new ConflictException({
            code:
              'PARTICIPATION_NOT_COMPLETABLE',
      
            message:
              'Chỉ tình nguyện viên đã xác nhận tham gia mới được đánh dấu hoàn thành.',
          });
        }
      
        const now =
          new Date();
      
        const [updated] =
          await this.database.db
            .update(
              campaignApplications,
            )
            .set({
              status:
                'PARTICIPATION_COMPLETED',
      
              participationCompletedAt:
                now,
      
              updatedAt:
                now,
            })
            .where(
              and(
                eq(
                  campaignApplications.id,
                  applicationId,
                ),
      
                /*
                 * Conditional update giúp tránh
                 * hai BTC cùng hoàn thành một application.
                 */
                eq(
                  campaignApplications.status,
                  'CONFIRMED',
                ),
              ),
            )
            .returning();
      
        if (!updated) {
          throw new ConflictException({
            code:
              'CAMPAIGN_APPLICATION_STATE_CONFLICT',
      
            message:
              'Trạng thái đơn tham gia đã thay đổi.',
          });
        }
      
        /*
         * Không cộng điểm tại đây.
         * Points sẽ được xử lý bằng ledger ở Phase 9.
         */
        return updated;
    }
  }