import {
    Controller,
    Get,
    Param,
    ParseUUIDPipe,
  } from '@nestjs/common';
  
  import {
    CampaignsService,
  } from './campaigns.service';
  
  import {
    CampaignPositionsService,
  } from './campaign-positions.service';

  @Controller('public/campaigns')
  export class PublicCampaignsController {
    constructor(
      private readonly campaignsService:
        CampaignsService,
      private readonly positionsService:
        CampaignPositionsService,
    ) {}
  
    @Get()
    async getAll() {
      return {
        data:
          await this.campaignsService
            .getPublicCampaigns(),
      };
    }
  
    @Get(':campaignId')
    async getById(
      @Param(
        'campaignId',
        ParseUUIDPipe,
      )
      campaignId: string,
    ) {
      return {
        data:
          await this.campaignsService
            .getPublicCampaignById(
              campaignId,
            ),
      };
    }

    /*
 * Public user xem các vị trí đang tuyển
 * mà không cần đăng nhập.
 */
    @Get(':campaignId/positions')
    async getPositions(
    @Param(
        'campaignId',
        ParseUUIDPipe,
    )
    campaignId: string,
    ) {
    return {
        data:
        await this.positionsService
            .getPublicActive(
            campaignId,
            ),
    };
    }
  }