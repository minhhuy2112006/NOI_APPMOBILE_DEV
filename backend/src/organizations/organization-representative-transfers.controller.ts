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
    OrganizationRepresentativeTransfersService,
  } from './organization-representative-transfers.service';
  
  @Controller(
    'organization-representative-transfers',
  )
  @UseGuards(AccessTokenGuard)
  export class OrganizationRepresentativeTransfersController {
    constructor(
      private readonly transfersService:
        OrganizationRepresentativeTransfersService,
    ) {}
  
    @Get('mine')
    async mine(
      @Req()
      request: AuthenticatedRequest,
    ) {
      return {
        data:
          await this.transfersService
            .getMine(
              request.auth.sub,
            ),
      };
    }
  
    @Post(':transferId/accept')
    async accept(
      @Req()
      request: AuthenticatedRequest,
  
      @Param(
        'transferId',
        ParseUUIDPipe,
      )
      transferId: string,
    ) {
      return {
        data:
          await this.transfersService
            .accept(
              request.auth.sub,
              transferId,
            ),
      };
    }
  
    @Post(':transferId/decline')
    async decline(
      @Req()
      request: AuthenticatedRequest,
  
      @Param(
        'transferId',
        ParseUUIDPipe,
      )
      transferId: string,
    ) {
      return {
        data:
          await this.transfersService
            .decline(
              request.auth.sub,
              transferId,
            ),
      };
    }
  
    @Post(':transferId/cancel')
    async cancel(
      @Req()
      request: AuthenticatedRequest,
  
      @Param(
        'transferId',
        ParseUUIDPipe,
      )
      transferId: string,
    ) {
      return {
        data:
          await this.transfersService
            .cancel(
              request.auth.sub,
              transferId,
            ),
      };
    }
  }