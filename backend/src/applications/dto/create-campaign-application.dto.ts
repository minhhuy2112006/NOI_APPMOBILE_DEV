import { Transform } from 'class-transformer';

import {
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateCampaignApplicationDto {
  // Vị trí mà TNV muốn ứng tuyển.
  @IsUUID()
  positionId!: string;

  // Lý do / lời giới thiệu của TNV.
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string'
      ? value.trim()
      : value,
  )
  @IsString()
  @MaxLength(2000)
  motivation?: string;
}