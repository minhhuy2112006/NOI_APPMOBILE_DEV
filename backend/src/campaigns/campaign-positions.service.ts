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
    campaignPositions,
    campaigns,
  } from '../database/schema';
  
  import {
    OrganizationAuthorizationService,
  } from '../organizations/organization-authorization.service';
  
  import {
    ORGANIZATION_PERMISSIONS,
  } from '../organizations/organization-permissions';
  
  import type {
    CreateCampaignPositionDto,
  } from './dto/create-campaign-position.dto';
  
  import type {
    UpdateCampaignPositionDto,
  } from './dto/update-campaign-position.dto';
  
  @Injectable()
  export class CampaignPositionsService {
    constructor(
      private readonly database:
        DatabaseService,
  
      private readonly authorization:
        OrganizationAuthorizationService,
    ) {}
  
    async getAll(
      requestingUserId: string,
      campaignId: string,
    ) {
      const campaign =
        await this.getCampaign(
          campaignId,
        );
  
      // Thành viên của organization mới được xem dữ liệu quản trị.
      await this.authorization
        .requirePermission(
          requestingUserId,
          campaign.organizationId,
          ORGANIZATION_PERMISSIONS
            .VIEW_ORGANIZATION,
        );
  
      return this.database.db
        .select()
        .from(campaignPositions)
        .where(
          eq(
            campaignPositions.campaignId,
            campaignId,
          ),
        )
        .orderBy(
          asc(
            campaignPositions.createdAt,
          ),
        );
    }
  
    async create(
      requestingUserId: string,
      campaignId: string,
      dto: CreateCampaignPositionDto,
    ) {
      const campaign =
        await this.getCampaign(
          campaignId,
        );
  
      // Chỉ người có quyền quản lý campaign mới được tạo vị trí.
      await this.authorization
        .requirePermission(
          requestingUserId,
          campaign.organizationId,
          ORGANIZATION_PERMISSIONS
            .MANAGE_CAMPAIGN,
        );
  
      // Sau khi submit thì khóa cấu trúc vị trí tuyển.
      this.ensureDraft(
        campaign.status,
      );
  
      const [created] =
        await this.database.db
          .insert(
            campaignPositions,
          )
          .values({
            campaignId,
  
            name:
              dto.name,
  
            description:
              dto.description ?? null,
  
            capacity:
              dto.capacity,
  
            isActive:
              true,
          })
          .returning();
  
      return created;
    }
  
    async update(
      requestingUserId: string,
      campaignId: string,
      positionId: string,
      dto: UpdateCampaignPositionDto,
    ) {
      const campaign =
        await this.getCampaign(
          campaignId,
        );
  
      await this.authorization
        .requirePermission(
          requestingUserId,
          campaign.organizationId,
          ORGANIZATION_PERMISSIONS
            .MANAGE_CAMPAIGN,
        );
  
      // Không cho thay đổi vị trí khi campaign đã rời DRAFT.
      this.ensureDraft(
        campaign.status,
      );
  
      const position =
        await this.getPosition(
          campaignId,
          positionId,
        );
  
      const [updated] =
        await this.database.db
          .update(
            campaignPositions,
          )
          .set({
            name:
              dto.name
              ?? position.name,
  
            description:
              dto.description
              ?? position.description,
  
            capacity:
              dto.capacity
              ?? position.capacity,
  
            updatedAt:
              new Date(),
          })
          .where(
            and(
              eq(
                campaignPositions.id,
                positionId,
              ),
  
              // Không cho sửa nhầm position của campaign khác.
              eq(
                campaignPositions
                  .campaignId,
                campaignId,
              ),
            ),
          )
          .returning();
  
      if (!updated) {
        throw new ConflictException({
          code:
            'CAMPAIGN_POSITION_UPDATE_FAILED',
  
          message:
            'Không thể cập nhật vị trí tuyển.',
        });
      }
  
      return updated;
    }
  
    async deactivate(
      requestingUserId: string,
      campaignId: string,
      positionId: string,
    ) {
      const campaign =
        await this.getCampaign(
          campaignId,
        );
  
      await this.authorization
        .requirePermission(
          requestingUserId,
          campaign.organizationId,
          ORGANIZATION_PERMISSIONS
            .MANAGE_CAMPAIGN,
        );
  
      // Không xóa/tắt vị trí sau khi campaign đã submit.
      this.ensureDraft(
        campaign.status,
      );
  
      const position =
        await this.getPosition(
          campaignId,
          positionId,
        );
  
      // Gọi lại nhiều lần vẫn cho kết quả an toàn.
      if (!position.isActive) {
        return position;
      }
  
      const [updated] =
        await this.database.db
          .update(
            campaignPositions,
          )
          .set({
            isActive:
              false,
  
            updatedAt:
              new Date(),
          })
          .where(
            and(
              eq(
                campaignPositions.id,
                positionId,
              ),
  
              eq(
                campaignPositions
                  .campaignId,
                campaignId,
              ),
  
              eq(
                campaignPositions
                  .isActive,
                true,
              ),
            ),
          )
          .returning();
  
      if (!updated) {
        throw new ConflictException({
          code:
            'CAMPAIGN_POSITION_STATE_CONFLICT',
  
          message:
            'Trạng thái vị trí tuyển đã thay đổi.',
        });
      }
  
      return updated;
    }
  
    private async getCampaign(
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
  
    private async getPosition(
      campaignId: string,
      positionId: string,
    ) {
      const [position] =
        await this.database.db
          .select()
          .from(
            campaignPositions,
          )
          .where(
            and(
              eq(
                campaignPositions.id,
                positionId,
              ),
  
              eq(
                campaignPositions
                  .campaignId,
                campaignId,
              ),
            ),
          )
          .limit(1);
  
      if (!position) {
        throw new NotFoundException({
          code:
            'CAMPAIGN_POSITION_NOT_FOUND',
  
          message:
            'Không tìm thấy vị trí tuyển.',
        });
      }
  
      return position;
    }
  
    private ensureDraft(
      status:
        | 'DRAFT'
        | 'PENDING_REVIEW'
        | 'PUBLISHED'
        | 'ONGOING'
        | 'COMPLETED'
        | 'CANCELLED',
    ): void {
      if (status !== 'DRAFT') {
        throw new ConflictException({
          code:
            'CAMPAIGN_POSITIONS_LOCKED',
  
          message:
            'Chỉ được thay đổi vị trí tuyển khi chiến dịch còn ở trạng thái nháp.',
        });
      }
    }

    async getPublicActive(
        campaignId: string,
      ) {
        const campaign =
          await this.getCampaign(
            campaignId,
          );
      
        /*
         * Chỉ campaign public mới lộ danh sách vị trí.
         * COMPLETED/CANCELLED/DRAFT/PENDING_REVIEW không trả position.
         */
        if (
          campaign.status !== 'PUBLISHED'
          && campaign.status !== 'ONGOING'
        ) {
          throw new NotFoundException({
            code:
              'CAMPAIGN_NOT_FOUND',
      
            message:
              'Không tìm thấy chiến dịch.',
          });
        }
      
        return this.database.db
          .select({
            id:
              campaignPositions.id,
      
            name:
              campaignPositions.name,
      
            description:
              campaignPositions.description,
      
            capacity:
              campaignPositions.capacity,
          })
          .from(campaignPositions)
          .where(
            and(
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
          .orderBy(
            asc(
              campaignPositions.createdAt,
            ),
          );
    }
  }