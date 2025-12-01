import { IsInt, IsOptional, IsUUID, Min } from 'class-validator';

export class GenerateCampaignEmailDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  scheduledSlot?: number;

  @IsOptional()
  @IsUUID()
  campaignLeadId?: string;
}
