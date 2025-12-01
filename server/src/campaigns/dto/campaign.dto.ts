import { CampaignStatus, ScheduleType } from '@prisma/client';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateCampaignDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(120)
  name: string;

  @IsNotEmpty()
  @IsString()
  model: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(4000)
  context: string;

  @IsNotEmpty()
  @IsEnum(ScheduleType)
  scheduleType: ScheduleType;

  @IsOptional()
  @IsInt()
  @Min(1)
  dailyEmails?: number;

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  weeklyDays?: number[];

  @IsOptional()
  @IsInt()
  @Min(1)
  weeklyEmailsPerDay?: number;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  durationDays: number;

  @IsNotEmpty()
  @IsDateString()
  startDateUtc: string;

  @IsOptional()
  @IsString()
  timezone?: string;

  @IsNotEmpty()
  @IsString()
  timeZone: string;

  @IsOptional()
  @IsEnum(CampaignStatus)
  status?: CampaignStatus;
}

export class UpdateCampaignDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  name?: string;

  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @IsString()
  @MaxLength(4000)
  context?: string;

  @IsOptional()
  @IsEnum(ScheduleType)
  scheduleType?: ScheduleType;

  @IsOptional()
  @IsInt()
  @Min(1)
  dailyEmails?: number;

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  weeklyDays?: number[];

  @IsOptional()
  @IsInt()
  @Min(1)
  weeklyEmailsPerDay?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  durationDays?: number;

  @IsOptional()
  @IsDateString()
  startDateUtc?: string;

  @IsOptional()
  @IsString()
  timezone?: string;

  @IsOptional()
  @IsString()
  timeZone?: string;

  @IsOptional()
  @IsEnum(CampaignStatus)
  status?: CampaignStatus;
}
