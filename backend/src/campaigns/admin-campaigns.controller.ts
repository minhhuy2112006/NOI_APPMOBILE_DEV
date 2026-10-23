import {
    Controller,
    Get,
    Param,
    ParseUUIDPipe,
    Post,
    Req,
    UseGuards,
  } from '@nestjs/common';
  
  import type {
    AuthenticatedRequest,
  } from '../auth/auth.types';
  
  import {
    AccessTokenGuard,
  } from '../auth/guards/access-token.guard';
  
  import {
    CampaignsService,
  } from './campaigns.service';
  
  @Controller('admin/campaigns')
  @UseGuards(AccessTokenGuard)
  export class AdminCampaignsController {
    constructor(
      private readonly campaignsService:
        CampaignsService,
    ) {}
  
    @Get('pending-review')
    async getPendingReview(
      @Req()
      request: AuthenticatedRequest,
    ) {
      return {
        data:
          await this.campaignsService
            .getPendingReviewCampaigns(
              request.auth.sub,
            ),
      };
    }
  
    @Post(':campaignId/publish')
    async publish(
      @Req()
      request: AuthenticatedRequest,
  
      @Param(
        'campaignId',
        ParseUUIDPipe,
      )
      campaignId: string,
    ) {
      return {
        data:
          await this.campaignsService
            .publish(
              request.auth.sub,
              campaignId,
            ),
      };
    }
  }