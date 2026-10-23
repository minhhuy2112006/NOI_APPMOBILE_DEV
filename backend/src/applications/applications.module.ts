import {
    Module,
  } from '@nestjs/common';
  
  import {
    AuthModule,
  } from '../auth/auth.module';
  
  import {
    ApplicationsController,
  } from './applications.controller';
  
  import {
    ApplicationsService,
  } from './applications.service';
  
  import {
    OrganizationsModule,
  } from '../organizations/organizations.module';

  @Module({
    imports: [
      // AccessTokenGuard cần AuthTokenService từ AuthModule.
      AuthModule,
      OrganizationsModule,
    ],
  
    controllers: [
      ApplicationsController,
    ],
  
    providers: [
      ApplicationsService,
    ],
  
    exports: [
      ApplicationsService,
    ],
  })
  export class ApplicationsModule {}