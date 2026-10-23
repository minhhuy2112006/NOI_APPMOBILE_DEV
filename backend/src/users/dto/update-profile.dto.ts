import {
    ArrayMaxSize,
    IsArray,
    IsDateString,
    IsOptional,
    IsString,
    MaxLength,
  } from 'class-validator';
  
  export class UpdateProfileDto {
    @IsOptional()
    @IsString()
    @MaxLength(120)
    name?: string;
  
    @IsOptional()
    @IsDateString()
    birthday?: string;
  
    @IsOptional()
    @IsString()
    @MaxLength(32)
    gender?: string;
  
    @IsOptional()
    @IsString()
    @MaxLength(32)
    phone?: string;
  
    @IsOptional()
    @IsString()
    @MaxLength(120)
    city?: string;
  
    @IsOptional()
    @IsString()
    @MaxLength(120)
    emergencyName?: string;
  
    @IsOptional()
    @IsString()
    @MaxLength(80)
    emergencyRelationship?: string;
  
    @IsOptional()
    @IsString()
    @MaxLength(32)
    emergencyPhone?: string;
  
    @IsOptional()
    @IsArray()
    @ArrayMaxSize(30)
    @IsString({ each: true })
    skills?: string[];
  
    @IsOptional()
    @IsArray()
    @ArrayMaxSize(30)
    @IsString({ each: true })
    interests?: string[];
  }