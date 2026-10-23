import {
    IsBoolean,
    IsIn,
    IsOptional,
  } from 'class-validator';
  
  export class UpdateSettingsDto {
    @IsOptional()
    @IsIn(['vi', 'en'])
    language?: string;
  
    @IsOptional()
    @IsBoolean()
    notificationEnabled?: boolean;
  
    @IsOptional()
    @IsBoolean()
    campaignNotificationEnabled?: boolean;
  
    @IsOptional()
    @IsBoolean()
    attendanceNotificationEnabled?: boolean;
  }