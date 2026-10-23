import {
    IsIn,
  } from 'class-validator';
  
  export class ReviewCampaignApplicationDto {
    /*
     * BTC chỉ được chọn một trong ba quyết định này.
     *
     * Client không được gửi trực tiếp status của application.
     */
    @IsIn([
      'SELECT',
      'WAITLIST',
      'REJECT',
    ])
    action!:
      | 'SELECT'
      | 'WAITLIST'
      | 'REJECT';
  }