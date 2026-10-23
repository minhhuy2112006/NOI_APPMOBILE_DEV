import {
    IsIn,
  } from 'class-validator';
  
  export class UpdateCampaignRecruitmentDto {
    @IsIn([
      'OPEN',
      'WAITLIST_ONLY',
      'CLOSED',
    ])
    recruitmentStatus!:
      | 'OPEN'
      | 'WAITLIST_ONLY'
      | 'CLOSED';
  }