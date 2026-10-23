import {
    Module,
  } from '@nestjs/common';
  
  import {
    AuthModule,
  } from '../auth/auth.module';
  
  import {
    OrganizationsController,
  } from './organizations.controller';
  
  import {
    OrganizationsService,
  } from './organizations.service';
  import {
    OrganizationInvitationsController,
  } from './organization-invitations.controller';
  
  import {
    OrganizationInvitationsService,
  } from './organization-invitations.service';
  import {
    OrganizationRepresentativeTransfersController,
  } from './organization-representative-transfers.controller';
  
  import {
    OrganizationRepresentativeTransfersService,
  } from './organization-representative-transfers.service';

  import {
    OrganizationMembersService,
  } from './organization-members.service';
  
  import {
    OrganizationAuthorizationService,
  } from './organization-authorization.service';
  @Module({
    imports: [
      AuthModule,
    ],
  
    controllers: [
      OrganizationsController,
      OrganizationInvitationsController,
      OrganizationRepresentativeTransfersController,
    ],
  
    providers: [
      OrganizationsService,
      OrganizationInvitationsService,
      OrganizationRepresentativeTransfersService,
      OrganizationMembersService,
      OrganizationAuthorizationService,
    ],
  
    exports: [
      OrganizationsService,
      OrganizationInvitationsService,
      OrganizationRepresentativeTransfersService,
      OrganizationMembersService,
      OrganizationAuthorizationService,
    ],
  })
  export class OrganizationsModule {}