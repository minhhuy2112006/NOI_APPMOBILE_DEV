import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseUUIDPipe,
    Patch,
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
    CampaignPositionsService,
  } from './campaign-positions.service';
  
  import {
    CreateCampaignPositionDto,
  } from './dto/create-campaign-position.dto';
  
  import {
    UpdateCampaignPositionDto,
  } from './dto/update-campaign-position.dto';
  
  @Controller(
    'campaigns/:campaignId/positions',
  )
  @UseGuards(AccessTokenGuard)
  export class CampaignPositionsController {
    constructor(
      private readonly positionsService:
        CampaignPositionsService,
    ) {}
  
    @Get()
    async getAll(
      @Req()
      request:
        AuthenticatedRequest,
  
      @Param(
        'campaignId',
        ParseUUIDPipe,
      )
      campaignId: string,
    ) {
      return {
        data:
          await this.positionsService
            .getAll(
              request.auth.sub,
              campaignId,
            ),
      };
    }
  
    @Post()
    async create(
      @Req()
      request:
        AuthenticatedRequest,
  
      @Param(
        'campaignId',
        ParseUUIDPipe,
      )
      campaignId: string,
  
      @Body()
      dto:
        CreateCampaignPositionDto,
    ) {
      return {
        data:
          await this.positionsService
            .create(
              request.auth.sub,
              campaignId,
              dto,
            ),
      };
    }
  
    @Patch(':positionId')
    async update(
      @Req()
      request:
        AuthenticatedRequest,
  
      @Param(
        'campaignId',
        ParseUUIDPipe,
      )
      campaignId: string,
  
      @Param(
        'positionId',
        ParseUUIDPipe,
      )
      positionId: string,
  
      @Body()
      dto:
        UpdateCampaignPositionDto,
    ) {
      return {
        data:
          await this.positionsService
            .update(
              request.auth.sub,
              campaignId,
              positionId,
              dto,
            ),
      };
    }
  
    @Delete(':positionId')
    async deactivate(
      @Req()
      request:
        AuthenticatedRequest,
  
      @Param(
        'campaignId',
        ParseUUIDPipe,
      )
      campaignId: string,
  
      @Param(
        'positionId',
        ParseUUIDPipe,
      )
      positionId: string,
    ) {
      return {
        data:
          await this.positionsService
            .deactivate(
              request.auth.sub,
              campaignId,
              positionId,
            ),
      };
    }
  }