import { Transform } from 'class-transformer';

import {
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class UpdateCampaignPositionDto {
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string'
      ? value.trim()
      : value,
  )
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  name?: string;

  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string'
      ? value.trim()
      : value,
  )
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  capacity?: number;
}