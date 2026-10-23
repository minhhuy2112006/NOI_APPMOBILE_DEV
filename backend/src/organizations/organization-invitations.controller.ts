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
    OrganizationInvitationsService,
  } from './organization-invitations.service';
  
  @Controller('organization-invitations')
  @UseGuards(AccessTokenGuard)
  export class OrganizationInvitationsController {
    constructor(
      private readonly invitationsService:
        OrganizationInvitationsService,
    ) {}
  
    @Get('mine')
    async mine(
      @Req()
      request: AuthenticatedRequest,
    ) {
      return {
        data:
          await this.invitationsService
            .getMine(
              request.auth.sub,
            ),
      };
    }
  
    @Post(':invitationId/accept')
    async accept(
      @Req()
      request: AuthenticatedRequest,
  
      @Param(
        'invitationId',
        ParseUUIDPipe,
      )
      invitationId: string,
    ) {
      return {
        data:
          await this.invitationsService
            .accept(
              request.auth.sub,
              invitationId,
            ),
      };
    }
  
    @Post(':invitationId/decline')
    async decline(
      @Req()
      request: AuthenticatedRequest,
  
      @Param(
        'invitationId',
        ParseUUIDPipe,
      )
      invitationId: string,
    ) {
      return {
        data:
          await this.invitationsService
            .decline(
              request.auth.sub,
              invitationId,
            ),
      };
    }
  }