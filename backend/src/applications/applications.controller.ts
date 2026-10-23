import {
    Body,
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
    ApplicationsService,
  } from './applications.service';
  
  import {
    CreateCampaignApplicationDto,
  } from './dto/create-campaign-application.dto';
  
  import {
    ReviewCampaignApplicationDto,
  } from './dto/review-campaign-application.dto';

  @Controller()
  @UseGuards(AccessTokenGuard)
  export class ApplicationsController {
    constructor(
      private readonly applicationsService:
        ApplicationsService,
    ) {}
  
    /*
     * TNV nộp đơn vào một campaign.
     */
    @Post(
      'campaigns/:campaignId/applications',
    )
    async apply(
      @Req()
      request: AuthenticatedRequest,
  
      @Param(
        'campaignId',
        ParseUUIDPipe,
      )
      campaignId: string,
  
      @Body()
      dto:
        CreateCampaignApplicationDto,
    ) {
      return {
        data:
          await this.applicationsService
            .apply(
              request.auth.sub,
              campaignId,
              dto,
            ),
      };
    }
  
    /*
     * User xem toàn bộ application của chính mình.
     */
    @Get('applications/mine')
    async getMine(
      @Req()
      request: AuthenticatedRequest,
    ) {
      return {
        data:
          await this.applicationsService
            .getMine(
              request.auth.sub,
            ),
      };
    }

    /*
    * BTC xem toàn bộ đơn của campaign.
    */
    @Get(
    'campaigns/:campaignId/applications',
    )
    async getCampaignApplications(
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
        await this.applicationsService
            .getCampaignApplications(
            request.auth.sub,
            campaignId,
            ),
    };
    }

    /*
    * BTC chọn / waitlist / reject một application.
    */
    @Post(
    'campaigns/:campaignId/applications/:applicationId/review',
    )
    async review(
    @Req()
    request: AuthenticatedRequest,

    @Param(
        'campaignId',
        ParseUUIDPipe,
    )
    campaignId: string,

    @Param(
        'applicationId',
        ParseUUIDPipe,
    )
    applicationId: string,

    @Body()
    dto:
        ReviewCampaignApplicationDto,
    ) {
    return {
        data:
        await this.applicationsService
            .review(
            request.auth.sub,
            campaignId,
            applicationId,
            dto,
            ),
    };
    }

    /*
    * TNV tự xác nhận tham gia sau khi được BTC SELECT.
    */
    @Post(
    'applications/:applicationId/confirm',
    )
    async confirm(
    @Req()
    request: AuthenticatedRequest,

    @Param(
        'applicationId',
        ParseUUIDPipe,
    )
    applicationId: string,
    ) {
    return {
        data:
        await this.applicationsService
            .confirm(
            request.auth.sub,
            applicationId,
            ),
    };
    }

    /*
    * TNV chủ động từ chối sau khi được chọn/mời.
    */
    @Post(
    'applications/:applicationId/decline',
    )
    async decline(
    @Req()
    request: AuthenticatedRequest,

    @Param(
        'applicationId',
        ParseUUIDPipe,
    )
    applicationId: string,
    ) {
    return {
        data:
        await this.applicationsService
            .decline(
            request.auth.sub,
            applicationId,
            ),
    };
    }

    /*
    * BTC mời một TNV đang ở WAITLISTED.
    */
    @Post(
    'campaigns/:campaignId/applications/:applicationId/waitlist-invite',
    )
    async inviteFromWaitlist(
    @Req()
    request: AuthenticatedRequest,

    @Param(
        'campaignId',
        ParseUUIDPipe,
    )
    campaignId: string,

    @Param(
        'applicationId',
        ParseUUIDPipe,
    )
    applicationId: string,
    ) {
    return {
        data:
        await this.applicationsService
            .inviteFromWaitlist(
            request.auth.sub,
            campaignId,
            applicationId,
            ),
    };
    }

    /*
    * TNV chấp nhận lời mời từ danh sách chờ.
    */
    @Post(
    'applications/:applicationId/waitlist-invite/accept',
    )
    async acceptWaitlistInvite(
    @Req()
    request: AuthenticatedRequest,

    @Param(
        'applicationId',
        ParseUUIDPipe,
    )
    applicationId: string,
    ) {
    return {
        data:
        await this.applicationsService
            .acceptWaitlistInvite(
            request.auth.sub,
            applicationId,
            ),
    };
    }

    /*
    * TNV đã CONFIRMED gửi yêu cầu rút khỏi campaign.
    */
    @Post(
    'applications/:applicationId/withdraw',
    )
    async requestWithdrawal(
    @Req()
    request: AuthenticatedRequest,

    @Param(
        'applicationId',
        ParseUUIDPipe,
    )
    applicationId: string,
    ) {
    return {
        data:
        await this.applicationsService
            .requestWithdrawal(
            request.auth.sub,
            applicationId,
            ),
    };
    }

    /*
    * BTC chấp thuận yêu cầu rút của TNV.
    */
    @Post(
    'campaigns/:campaignId/applications/:applicationId/withdraw/approve',
    )
    async approveWithdrawal(
    @Req()
    request: AuthenticatedRequest,

    @Param(
        'campaignId',
        ParseUUIDPipe,
    )
    campaignId: string,

    @Param(
        'applicationId',
        ParseUUIDPipe,
    )
    applicationId: string,
    ) {
    return {
        data:
        await this.applicationsService
            .approveWithdrawal(
            request.auth.sub,
            campaignId,
            applicationId,
            ),
    };
    }

    /*
    * BTC xác nhận một TNV đã hoàn thành tham gia campaign.
    */
    @Post(
    'campaigns/:campaignId/applications/:applicationId/participation-complete',
    )
    async completeParticipation(
    @Req()
    request: AuthenticatedRequest,

    @Param(
        'campaignId',
        ParseUUIDPipe,
    )
    campaignId: string,

    @Param(
        'applicationId',
        ParseUUIDPipe,
    )
    applicationId: string,
    ) {
    return {
        data:
        await this.applicationsService
            .completeParticipation(
            request.auth.sub,
            campaignId,
            applicationId,
            ),
    };
    }
  }