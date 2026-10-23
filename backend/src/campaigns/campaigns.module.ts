import {
    Module,
  } from '@nestjs/common';
  
  import {
    AuthModule,
  } from '../auth/auth.module';
  
  import {
    OrganizationsModule,
  } from '../organizations/organizations.module';
  
  import {
    CampaignsController,
    OrganizationCampaignsController,
  } from './campaigns.controller';
  
  import {
    CampaignsService,
  } from './campaigns.service';
  
  import {
    AdminCampaignsController,
  } from './admin-campaigns.controller';

  import {
    PublicCampaignsController,
  } from './public-campaigns.controller';

  import {
    CampaignPositionsController,
  } from './campaign-positions.controller';
  
  import {
    CampaignPositionsService,
  } from './campaign-positions.service';

  @Module({
    imports: [
      AuthModule,
      OrganizationsModule,
    ],
  
    controllers: [
      CampaignsController,
      OrganizationCampaignsController,
      AdminCampaignsController,
      PublicCampaignsController,
      // API quản lý các vị trí tuyển của campaign
      CampaignPositionsController,
    ],
  
    providers: [
      CampaignsService,
      CampaignPositionsService,
    ],
  
    exports: [
      CampaignsService,
      CampaignPositionsService,
    ],
  })
  export class CampaignsModule {}