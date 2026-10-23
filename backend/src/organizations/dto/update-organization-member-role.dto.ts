import {
    IsIn,
  } from 'class-validator';
  
  export class UpdateOrganizationMemberRoleDto {
    @IsIn([
      'STAFF',
      'MANAGER',
      'CAMPAIGN_MANAGER',
    ])
    role!:
      | 'STAFF'
      | 'MANAGER'
      | 'CAMPAIGN_MANAGER';
  }