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
    CreateOrganizationDto,
  } from './dto/create-organization.dto';
  
  import {
    UpdateOrganizationDto,
  } from './dto/update-organization.dto';
  
  import {
    OrganizationsService,
  } from './organizations.service';
  
  import {
    CreateOrganizationInvitationDto,
  } from './dto/create-organization-invitation.dto';
  
  import {
    OrganizationInvitationsService,
  } from './organization-invitations.service';

  import {
    CreateRepresentativeTransferDto,
  } from './dto/create-representative-transfer.dto';
  
  import {
    OrganizationRepresentativeTransfersService,
  } from './organization-representative-transfers.service';
  import {
    UpdateOrganizationMemberRoleDto,
  } from './dto/update-organization-member-role.dto';
  
  import {
    OrganizationMembersService,
  } from './organization-members.service';
  @Controller('organizations')
  export class OrganizationsController {
    constructor(

      private readonly organizationsService:
        OrganizationsService,

      private readonly invitationsService:
        OrganizationInvitationsService,

      private readonly transfersService:
        OrganizationRepresentativeTransfersService,
      
    private readonly membersService:
        OrganizationMembersService,
    ) {}
  
    @Post()
    @UseGuards(AccessTokenGuard)
    async create(
      @Req()
      request: AuthenticatedRequest,
  
      @Body()
      dto: CreateOrganizationDto,
    ) {
      return {
        data:
          await this.organizationsService
            .create(
              request.auth.sub,
              dto,
            ),
      };
    }
    @Post(':organizationId/invitations')
    @UseGuards(AccessTokenGuard)
    async inviteMember(
    @Req()
    request: AuthenticatedRequest,

    @Param(
        'organizationId',
        ParseUUIDPipe,
    )
    organizationId: string,

    @Body()
    dto:
        CreateOrganizationInvitationDto,
    ) {
    return {
        data:
        await this.invitationsService
            .invite(
            request.auth.sub,
            organizationId,
            dto,
            ),
    };
    }
    @Post(
        ':organizationId/representative-transfers',
      )
      @UseGuards(AccessTokenGuard)
      async createRepresentativeTransfer(
        @Req()
        request: AuthenticatedRequest,
      
        @Param(
          'organizationId',
          ParseUUIDPipe,
        )
        organizationId: string,
      
        @Body()
        dto:
          CreateRepresentativeTransferDto,
      ) {
        return {
          data:
            await this.transfersService
              .create(
                request.auth.sub,
                organizationId,
                dto,
              ),
        };
      }
    @Get('mine')
    @UseGuards(AccessTokenGuard)
    async mine(
      @Req()
      request: AuthenticatedRequest,
    ) {
      return {
        data:
          await this.organizationsService
            .findMine(
              request.auth.sub,
            ),
      };
    }
  
    @Get(':organizationId')
    async findOne(
      @Param(
        'organizationId',
        ParseUUIDPipe,
      )
      organizationId: string,
    ) {
      return {
        data:
          await this.organizationsService
            .findById(
              organizationId,
            ),
      };
    }
  
    @Patch(':organizationId')
    @UseGuards(AccessTokenGuard)
    async update(
      @Req()
      request: AuthenticatedRequest,
  
      @Param(
        'organizationId',
        ParseUUIDPipe,
      )
      organizationId: string,
  
      @Body()
      dto: UpdateOrganizationDto,
    ) {
      return {
        data:
          await this.organizationsService
            .update(
              request.auth.sub,
              organizationId,
              dto,
            ),
      };
    }
    @Get(':organizationId/members')
    @UseGuards(AccessTokenGuard)
    async getMembers(
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
        await this.membersService
            .getMembers(
            request.auth.sub,
            organizationId,
            ),
    };
    }
    @Patch(
        ':organizationId/members/:userId/role',
      )
      @UseGuards(AccessTokenGuard)
      async updateMemberRole(
        @Req()
        request: AuthenticatedRequest,
      
        @Param(
          'organizationId',
          ParseUUIDPipe,
        )
        organizationId: string,
      
        @Param(
          'userId',
          ParseUUIDPipe,
        )
        userId: string,
      
        @Body()
        dto:
          UpdateOrganizationMemberRoleDto,
      ) {
        return {
          data:
            await this.membersService
              .updateRole(
                request.auth.sub,
                organizationId,
                userId,
                dto,
              ),
        };
      }
      @Delete(
        ':organizationId/members/:userId',
      )
      @UseGuards(AccessTokenGuard)
      async removeMember(
        @Req()
        request: AuthenticatedRequest,
      
        @Param(
          'organizationId',
          ParseUUIDPipe,
        )
        organizationId: string,
      
        @Param(
          'userId',
          ParseUUIDPipe,
        )
        userId: string,
      ) {
        return {
          data:
            await this.membersService
              .removeMember(
                request.auth.sub,
                organizationId,
                userId,
              ),
        };
      }
  }