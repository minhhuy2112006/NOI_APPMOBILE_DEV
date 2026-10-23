import {
    Body,
    Controller,
    Get,
    Param,
    ParseUUIDPipe,
    Post,
    Req,
    UseGuards,
    Patch,
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
  
  import {
    CreateCampaignDto,
  } from './dto/create-campaign.dto';
  
  import {
    UpdateCampaignDto,
  } from './dto/update-campaign.dto';

  import {
    UpdateCampaignRecruitmentDto,
  } from './dto/update-campaign-recruitment.dto';

  @Controller(
    'organizations/:organizationId/campaigns',
  )
  @UseGuards(AccessTokenGuard)
  export class OrganizationCampaignsController {
    constructor(
      private readonly campaignsService:
        CampaignsService,
    ) {}
  
    @Post()
    async create(
      @Req()
      request: AuthenticatedRequest,
  
      @Param(
        'organizationId',
        ParseUUIDPipe,
      )
      organizationId: string,
  
      @Body()
      dto: CreateCampaignDto,
    ) {
      return {
        data:
          await this.campaignsService
            .create(
              request.auth.sub,
              organizationId,
              dto,
            ),
      };
    }
  
    @Get()
    async getOrganizationCampaigns(
      @Req()
      request: AuthenticatedRequest,
  
      @Param(
        'organizationId',
        ParseUUIDPipe,
      )
      organizationId: string,
    ) {
      return {
        data:
          await this.campaignsService
            .getOrganizationCampaigns(
              request.auth.sub,
              organizationId,
            ),
      };
    }
  }
  
  @Controller('campaigns')
  @UseGuards(AccessTokenGuard)
  export class CampaignsController {
    constructor(
      private readonly campaignsService:
        CampaignsService,
    ) {}
    @Post(':campaignId/submit')
    async submitForReview(
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
            .submitForReview(
              request.auth.sub,
              campaignId,
            ),
      };
    }

    @Post(':campaignId/start')
    async startCampaign(
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
            .startCampaign(
              request.auth.sub,
              campaignId,
            ),
      };
    }

    @Post(':campaignId/complete')
    async completeCampaign(
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
            .completeCampaign(
              request.auth.sub,
              campaignId,
            ),
      };
    }

    @Post(':campaignId/cancel')
    async cancelCampaign(
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
            .cancelCampaign(
              request.auth.sub,
              campaignId,
            ),
      };
    }

    @Get(':campaignId')
    async getById(
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
            .getById(
              request.auth.sub,
              campaignId,
            ),
      };
    }

    @Patch(':campaignId')
    async update(
    @Req()
    request: AuthenticatedRequest,

    @Param(
        'campaignId',
        ParseUUIDPipe,
    )
    campaignId: string,

    @Body()
    dto: UpdateCampaignDto,
    ) {
    return {
        data:
        await this.campaignsService
            .update(
            request.auth.sub,
            campaignId,
            dto,
            ),
    };
    }

    @Patch(
      ':campaignId/recruitment',
    )
    async updateRecruitmentStatus(
      @Req()
      request: AuthenticatedRequest,
    
      @Param(
        'campaignId',
        ParseUUIDPipe,
      )
      campaignId: string,
    
      @Body()
      dto:
        UpdateCampaignRecruitmentDto,
    ) {
      return {
        data:
          await this.campaignsService
            .updateRecruitmentStatus(
              request.auth.sub,
              campaignId,
              dto,
            ),
      };
    }
  }