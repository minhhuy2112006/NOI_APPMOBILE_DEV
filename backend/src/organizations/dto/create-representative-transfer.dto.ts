import {
    IsUUID,
  } from 'class-validator';
  
  export class CreateRepresentativeTransferDto {
    @IsUUID()
    toUserId!: string;
  }