import { CampaignStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsDateString } from 'class-validator';

export class ListCampaignsDto {
  @IsOptional()
  @IsEnum(CampaignStatus)
  status?: CampaignStatus;

  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;
}
