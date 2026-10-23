import {
    BadRequestException,
    ConflictException,
    ForbiddenException,
    Injectable,
    NotFoundException,
  } from '@nestjs/common';
  
  import {
    and,
    desc,
    eq,
    inArray,
  } from 'drizzle-orm';
  
  import {
    DatabaseService,
  } from '../database/database.service';
  
  import {
    campaigns,
    organizations,
    users,
  } from '../database/schema';
  
  import {
    OrganizationAuthorizationService,
  } from '../organizations/organization-authorization.service';
  
  import {
    ORGANIZATION_PERMISSIONS,
  } from '../organizations/organization-permissions';
  
  
  import type {
    CreateCampaignDto,
  } from './dto/create-campaign.dto';
  
  import type {
    UpdateCampaignDto,
  } from './dto/update-campaign.dto';

  import type {
    UpdateCampaignRecruitmentDto,
  } from './dto/update-campaign-recruitment.dto';

  @Injectable()
  export class CampaignsService {

    constructor(
      private readonly database:
        DatabaseService,
  
      private readonly authorization:
        OrganizationAuthorizationService,
    ) {}
  
    async create(
      requestingUserId: string,
      organizationId: string,
      dto: CreateCampaignDto,
    ) {
      await this.authorization
        .requirePermission(
          requestingUserId,
          organizationId,
          ORGANIZATION_PERMISSIONS
            .CREATE_CAMPAIGN,
        );
  
      const startAt =
        dto.startAt
          ? new Date(dto.startAt)
          : null;
  
      const endAt =
        dto.endAt
          ? new Date(dto.endAt)
          : null;
  
      if (
        startAt
        && endAt
        && endAt.getTime()
          <= startAt.getTime()
      ) {
        throw new BadRequestException({
          code:
            'INVALID_CAMPAIGN_TIME_RANGE',
  
          message:
            'Thời gian kết thúc phải sau thời gian bắt đầu.',
        });
      }
  
      const [campaign] =
        await this.database.db
          .insert(campaigns)
          .values({
            organizationId,
  
            createdByUserId:
              requestingUserId,
  
            title:
              dto.title,
  
            summary:
              dto.summary ?? null,
  
            description:
              dto.description ?? null,
  
            coverImageUrl:
              dto.coverImageUrl ?? null,
  
            locationName:
              dto.locationName ?? null,
  
            startAt,
            endAt,
  
            capacity:
              dto.capacity ?? null,
  
            /*
             * Client tuyệt đối
             * không được quyết định
             * hai giá trị này.
             */
            status:
              'DRAFT',
  
            recruitmentStatus:
              'CLOSED',
          })
          .returning();
  
      return campaign;
    }

    async update(
        requestingUserId: string,
        campaignId: string,
        dto: UpdateCampaignDto,
      ) {
        const [campaign] =
          await this.database.db
            .select()
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
            code: 'CAMPAIGN_NOT_FOUND',
            message:
              'Không tìm thấy chiến dịch.',
          });
        }
      
        await this.authorization
          .requirePermission(
            requestingUserId,
            campaign.organizationId,
            ORGANIZATION_PERMISSIONS
              .MANAGE_CAMPAIGN,
          );
      
        if (
          campaign.status !== 'DRAFT'
        ) {
          throw new ConflictException({
            code: 'CAMPAIGN_NOT_EDITABLE',
            message:
              'Chỉ chiến dịch ở trạng thái nháp mới được chỉnh sửa.',
          });
        }
      
        const startAt =
          dto.startAt !== undefined
            ? new Date(dto.startAt)
            : campaign.startAt;
      
        const endAt =
          dto.endAt !== undefined
            ? new Date(dto.endAt)
            : campaign.endAt;
      
        if (
          startAt
          && endAt
          && endAt.getTime()
            <= startAt.getTime()
        ) {
          throw new BadRequestException({
            code:
              'INVALID_CAMPAIGN_TIME_RANGE',
      
            message:
              'Thời gian kết thúc phải sau thời gian bắt đầu.',
          });
        }
      
        const [updated] =
          await this.database.db
            .update(campaigns)
            .set({
              title:
                dto.title
                ?? campaign.title,
      
              summary:
                dto.summary
                ?? campaign.summary,
      
              description:
                dto.description
                ?? campaign.description,
      
              coverImageUrl:
                dto.coverImageUrl
                ?? campaign.coverImageUrl,
      
              locationName:
                dto.locationName
                ?? campaign.locationName,
      
              startAt,
              endAt,
      
              capacity:
                dto.capacity
                ?? campaign.capacity,
      
              updatedAt:
                new Date(),
            })
            .where(
              eq(
                campaigns.id,
                campaignId,
              ),
            )
            .returning();
      
        if (!updated) {
          throw new ConflictException({
            code:
              'CAMPAIGN_UPDATE_FAILED',
      
            message:
              'Không thể cập nhật chiến dịch.',
          });
        }
      
        return updated;
    }

    async getOrganizationCampaigns(
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
        .select()
        .from(campaigns)
        .where(
          eq(
            campaigns.organizationId,
            organizationId,
          ),
        )
        .orderBy(
          desc(
            campaigns.createdAt,
          ),
        );
    }
  
    async getById(
      requestingUserId: string,
      campaignId: string,
    ) {
      const [campaign] =
        await this.database.db
          .select()
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
  
      await this.authorization
        .requirePermission(
          requestingUserId,
          campaign.organizationId,
          ORGANIZATION_PERMISSIONS
            .VIEW_ORGANIZATION,
        );
  
      return campaign;
    }

    async submitForReview(
      requestingUserId: string,
      campaignId: string,
    ) {
      const [campaign] =
        await this.database.db
          .select()
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
          code: 'CAMPAIGN_NOT_FOUND',
          message:
            'Không tìm thấy chiến dịch.',
        });
      }
    
      await this.authorization
        .requirePermission(
          requestingUserId,
          campaign.organizationId,
          ORGANIZATION_PERMISSIONS
            .MANAGE_CAMPAIGN,
        );
    
      if (
        campaign.status !== 'DRAFT'
      ) {
        throw new ConflictException({
          code:
            'CAMPAIGN_NOT_SUBMITTABLE',
    
          message:
            'Chỉ chiến dịch ở trạng thái nháp mới được gửi duyệt.',
        });
      }
    
      const missingFields: string[] = [];
    
      if (
        !campaign.title.trim()
      ) {
        missingFields.push('title');
      }
    
      if (
        !campaign.description
          ?.trim()
      ) {
        missingFields.push(
          'description',
        );
      }
    
      if (
        !campaign.locationName
          ?.trim()
      ) {
        missingFields.push(
          'locationName',
        );
      }
    
      if (!campaign.startAt) {
        missingFields.push(
          'startAt',
        );
      }
    
      if (!campaign.endAt) {
        missingFields.push(
          'endAt',
        );
      }
    
      if (!campaign.capacity) {
        missingFields.push(
          'capacity',
        );
      }
    
      if (
        missingFields.length > 0
      ) {
        throw new BadRequestException({
          code:
            'CAMPAIGN_INCOMPLETE',
    
          message:
            'Chiến dịch chưa đủ thông tin để gửi duyệt.',
    
          missingFields,
        });
      }
    
      if (
        campaign.endAt!.getTime()
          <= campaign.startAt!.getTime()
      ) {
        throw new BadRequestException({
          code:
            'INVALID_CAMPAIGN_TIME_RANGE',
    
          message:
            'Thời gian kết thúc phải sau thời gian bắt đầu.',
        });
      }
    
      const now =
        new Date();
    
      const [submitted] =
        await this.database.db
          .update(campaigns)
          .set({
            status:
              'PENDING_REVIEW',
    
            submittedAt:
              now,
    
            recruitmentStatus:
              'CLOSED',
    
            updatedAt:
              now,
          })
          .where(
            and(
              eq(
                campaigns.id,
                campaignId,
              ),
    
              eq(
                campaigns.status,
                'DRAFT',
              ),
            ),
          )
          .returning();
    
      if (!submitted) {
        throw new ConflictException({
          code:
            'CAMPAIGN_STATE_CONFLICT',
    
          message:
            'Trạng thái chiến dịch đã thay đổi. Vui lòng tải lại dữ liệu.',
        });
      }
    
      return submitted;
    }

    private async ensureSystemAdmin(
      userId: string,
    ): Promise<void> {
      const [user] =
        await this.database.db
          .select({
            role: users.role,
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
    
      if (user.role !== 'ADMIN') {
        throw new ForbiddenException({
          code: 'ADMIN_REQUIRED',
          message:
            'Chỉ quản trị viên NOI mới được duyệt chiến dịch.',
        });
      }
    }

    async getPendingReviewCampaigns(
      requestingUserId: string,
    ) {
      await this.ensureSystemAdmin(
        requestingUserId,
      );
    
      return this.database.db
        .select({
          id:
            campaigns.id,
    
          organizationId:
            campaigns.organizationId,
    
          organizationName:
            organizations.name,
    
          title:
            campaigns.title,
    
          summary:
            campaigns.summary,
    
          description:
            campaigns.description,
    
          locationName:
            campaigns.locationName,
    
          startAt:
            campaigns.startAt,
    
          endAt:
            campaigns.endAt,
    
          capacity:
            campaigns.capacity,
    
          status:
            campaigns.status,
    
          recruitmentStatus:
            campaigns.recruitmentStatus,
    
          submittedAt:
            campaigns.submittedAt,
    
          createdByUserId:
            campaigns.createdByUserId,
        })
        .from(campaigns)
        .innerJoin(
          organizations,
          eq(
            campaigns.organizationId,
            organizations.id,
          ),
        )
        .where(
          eq(
            campaigns.status,
            'PENDING_REVIEW',
          ),
        )
        .orderBy(
          desc(
            campaigns.submittedAt,
          ),
        );
    }

    async publish(
      requestingUserId: string,
      campaignId: string,
    ) {
      await this.ensureSystemAdmin(
        requestingUserId,
      );
    
      const [campaign] =
        await this.database.db
          .select({
            id:
              campaigns.id,
    
            organizationId:
              campaigns.organizationId,
    
            status:
              campaigns.status,
    
            organizationStatus:
              organizations.status,
          })
          .from(campaigns)
          .innerJoin(
            organizations,
            eq(
              campaigns.organizationId,
              organizations.id,
            ),
          )
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
    
      if (
        campaign.organizationStatus
        !== 'ACTIVE'
      ) {
        throw new ConflictException({
          code:
            'ORGANIZATION_NOT_ACTIVE_FOR_PUBLISH',
    
          message:
            'Không thể publish chiến dịch của tổ chức không hoạt động.',
        });
      }
    
      if (
        campaign.status !==
        'PENDING_REVIEW'
      ) {
        throw new ConflictException({
          code:
            'CAMPAIGN_NOT_PUBLISHABLE',
    
          message:
            'Chỉ chiến dịch đang chờ duyệt mới được publish.',
        });
      }
    
      const now =
        new Date();
    
      const [published] =
        await this.database.db
          .update(campaigns)
          .set({
            status:
              'PUBLISHED',
    
            recruitmentStatus:
              'CLOSED',
    
            publishedAt:
              now,
    
            updatedAt:
              now,
          })
          .where(
            and(
              eq(
                campaigns.id,
                campaignId,
              ),
    
              eq(
                campaigns.status,
                'PENDING_REVIEW',
              ),
            ),
          )
          .returning();
    
      if (!published) {
        throw new ConflictException({
          code:
            'CAMPAIGN_STATE_CONFLICT',
    
          message:
            'Trạng thái chiến dịch đã thay đổi. Vui lòng tải lại dữ liệu.',
        });
      }
    
      return published;
    }

    async updateRecruitmentStatus(
      requestingUserId: string,
      campaignId: string,
      dto: UpdateCampaignRecruitmentDto,
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
    
      await this.authorization
        .requirePermission(
          requestingUserId,
          campaign.organizationId,
          ORGANIZATION_PERMISSIONS
            .MANAGE_CAMPAIGN,
        );
    
      if (
        campaign.status !==
        'PUBLISHED'
      ) {
        throw new ConflictException({
          code:
            'CAMPAIGN_RECRUITMENT_NOT_EDITABLE',
    
          message:
            'Chỉ chiến dịch đã publish mới được thay đổi trạng thái tuyển.',
        });
      }
    
      const current =
        campaign.recruitmentStatus;
    
      const next =
        dto.recruitmentStatus;
    
      if (current === next) {
        return campaign;
      }
    
      const allowedTransitions:
        Record<
          typeof current,
          readonly typeof next[]
        > = {
          CLOSED: [
            'OPEN',
          ],
    
          OPEN: [
            'WAITLIST_ONLY',
            'CLOSED',
          ],
    
          WAITLIST_ONLY: [
            'CLOSED',
          ],
        };
    
      if (
        !allowedTransitions[
          current
        ].includes(next)
      ) {
        throw new ConflictException({
          code:
            'INVALID_RECRUITMENT_TRANSITION',
    
          message:
            `Không thể chuyển trạng thái tuyển từ ${current} sang ${next}.`,
        });
      }
    
      const [updated] =
        await this.database.db
          .update(campaigns)
          .set({
            recruitmentStatus:
              next,
    
            updatedAt:
              new Date(),
          })
          .where(
            and(
              eq(
                campaigns.id,
                campaignId,
              ),
    
              eq(
                campaigns.status,
                'PUBLISHED',
              ),
    
              eq(
                campaigns.recruitmentStatus,
                current,
              ),
            ),
          )
          .returning();
    
      if (!updated) {
        throw new ConflictException({
          code:
            'CAMPAIGN_STATE_CONFLICT',
    
          message:
            'Trạng thái chiến dịch đã thay đổi. Vui lòng tải lại dữ liệu.',
        });
      }
    
      return updated;
    }

    async startCampaign(
      requestingUserId: string,
      campaignId: string,
    ) {
      const [campaign] =
        await this.database.db
          .select({
            id: campaigns.id,
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
          code: 'CAMPAIGN_NOT_FOUND',
          message:
            'Không tìm thấy chiến dịch.',
        });
      }
    
      await this.authorization
        .requirePermission(
          requestingUserId,
          campaign.organizationId,
          ORGANIZATION_PERMISSIONS
            .MANAGE_CAMPAIGN,
        );
    
      if (
        campaign.status !==
        'PUBLISHED'
      ) {
        throw new ConflictException({
          code:
            'CAMPAIGN_NOT_STARTABLE',
    
          message:
            'Chỉ chiến dịch đã publish mới được bắt đầu.',
        });
      }
    
      const now =
        new Date();
    
      const [updated] =
        await this.database.db
          .update(campaigns)
          .set({
            status:
              'ONGOING',
    
            recruitmentStatus:
              'CLOSED',
    
            updatedAt:
              now,
          })
          .where(
            and(
              eq(
                campaigns.id,
                campaignId,
              ),
    
              eq(
                campaigns.status,
                'PUBLISHED',
              ),
            ),
          )
          .returning();
    
      if (!updated) {
        throw new ConflictException({
          code:
            'CAMPAIGN_STATE_CONFLICT',
    
          message:
            'Trạng thái chiến dịch đã thay đổi. Vui lòng tải lại dữ liệu.',
        });
      }
    
      return updated;
    }

    async completeCampaign(
      requestingUserId: string,
      campaignId: string,
    ) {
      const [campaign] =
        await this.database.db
          .select({
            id: campaigns.id,
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
          code: 'CAMPAIGN_NOT_FOUND',
          message:
            'Không tìm thấy chiến dịch.',
        });
      }
    
      await this.authorization
        .requirePermission(
          requestingUserId,
          campaign.organizationId,
          ORGANIZATION_PERMISSIONS
            .MANAGE_CAMPAIGN,
        );
    
      if (
        campaign.status !==
        'ONGOING'
      ) {
        throw new ConflictException({
          code:
            'CAMPAIGN_NOT_COMPLETABLE',
    
          message:
            'Chỉ chiến dịch đang diễn ra mới được hoàn thành.',
        });
      }
    
      const now =
        new Date();
    
      const [updated] =
        await this.database.db
          .update(campaigns)
          .set({
            status:
              'COMPLETED',
    
            recruitmentStatus:
              'CLOSED',
    
            completedAt:
              now,
    
            updatedAt:
              now,
          })
          .where(
            and(
              eq(
                campaigns.id,
                campaignId,
              ),
    
              eq(
                campaigns.status,
                'ONGOING',
              ),
            ),
          )
          .returning();
    
      if (!updated) {
        throw new ConflictException({
          code:
            'CAMPAIGN_STATE_CONFLICT',
    
          message:
            'Trạng thái chiến dịch đã thay đổi. Vui lòng tải lại dữ liệu.',
        });
      }
    
      return updated;
    }

    async cancelCampaign(
      requestingUserId: string,
      campaignId: string,
    ) {
      const [campaign] =
        await this.database.db
          .select({
            id: campaigns.id,
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
    
      await this.authorization
        .requirePermission(
          requestingUserId,
          campaign.organizationId,
          ORGANIZATION_PERMISSIONS
            .MANAGE_CAMPAIGN,
        );
    
      if (
        campaign.status !==
          'PUBLISHED'
        &&
        campaign.status !==
          'ONGOING'
      ) {
        throw new ConflictException({
          code:
            'CAMPAIGN_NOT_CANCELLABLE',
    
          message:
            'Chỉ chiến dịch đã publish hoặc đang diễn ra mới được hủy.',
        });
      }
    
      const currentStatus =
        campaign.status;
    
      const now =
        new Date();
    
      const [updated] =
        await this.database.db
          .update(campaigns)
          .set({
            status:
              'CANCELLED',
    
            recruitmentStatus:
              'CLOSED',
    
            cancelledAt:
              now,
    
            updatedAt:
              now,
          })
          .where(
            and(
              eq(
                campaigns.id,
                campaignId,
              ),
    
              eq(
                campaigns.status,
                currentStatus,
              ),
            ),
          )
          .returning();
    
      if (!updated) {
        throw new ConflictException({
          code:
            'CAMPAIGN_STATE_CONFLICT',
    
          message:
            'Trạng thái chiến dịch đã thay đổi. Vui lòng tải lại dữ liệu.',
        });
      }
    
      return updated;
    }

    async getPublicCampaigns() {
      return this.database.db
        .select({
          id:
            campaigns.id,
    
          organizationId:
            campaigns.organizationId,
    
          organizationName:
            organizations.name,
    
          title:
            campaigns.title,
    
          summary:
            campaigns.summary,
    
          description:
            campaigns.description,
    
          coverImageUrl:
            campaigns.coverImageUrl,
    
          locationName:
            campaigns.locationName,
    
          startAt:
            campaigns.startAt,
    
          endAt:
            campaigns.endAt,
    
          capacity:
            campaigns.capacity,
    
          status:
            campaigns.status,
    
          recruitmentStatus:
            campaigns.recruitmentStatus,
    
          publishedAt:
            campaigns.publishedAt,
        })
        .from(campaigns)
        .innerJoin(
          organizations,
          eq(
            campaigns.organizationId,
            organizations.id,
          ),
        )
        .where(
          and(
            eq(
              organizations.status,
              'ACTIVE',
            ),
    
            inArray(
              campaigns.status,
              [
                'PUBLISHED',
                'ONGOING',
              ],
            ),
          ),
        )
        .orderBy(
          desc(
            campaigns.publishedAt,
          ),
        );
    }

    async getPublicCampaignById(
      campaignId: string,
    ) {
      const [campaign] =
        await this.database.db
          .select({
            id:
              campaigns.id,
    
            organizationId:
              campaigns.organizationId,
    
            organizationName:
              organizations.name,
    
            title:
              campaigns.title,
    
            summary:
              campaigns.summary,
    
            description:
              campaigns.description,
    
            coverImageUrl:
              campaigns.coverImageUrl,
    
            locationName:
              campaigns.locationName,
    
            startAt:
              campaigns.startAt,
    
            endAt:
              campaigns.endAt,
    
            capacity:
              campaigns.capacity,
    
            status:
              campaigns.status,
    
            recruitmentStatus:
              campaigns.recruitmentStatus,
    
            publishedAt:
              campaigns.publishedAt,
          })
          .from(campaigns)
          .innerJoin(
            organizations,
            eq(
              campaigns.organizationId,
              organizations.id,
            ),
          )
          .where(
            and(
              eq(
                campaigns.id,
                campaignId,
              ),
    
              eq(
                organizations.status,
                'ACTIVE',
              ),
    
              inArray(
                campaigns.status,
                [
                  'PUBLISHED',
                  'ONGOING',
                ],
              ),
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
  }