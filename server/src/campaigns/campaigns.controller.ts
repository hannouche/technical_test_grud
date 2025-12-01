import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CampaignStatus } from '@prisma/client';
import { CampaignsService } from './campaigns.service';
import { CreateCampaignDto, UpdateCampaignDto } from './dto/campaign.dto';
import { ListCampaignsDto } from './dto/list-campaigns.dto';

@Controller('campaigns')
export class CampaignsController {
  constructor(private readonly campaignsService: CampaignsService) {}

  @Post()
  createCampaign(@Body() dto: CreateCampaignDto) {
    return this.campaignsService.createCampaign(dto);
  }

  @Post('create')
  legacyCreate(@Body() dto: CreateCampaignDto) {
    return this.campaignsService.createCampaign(dto);
  }

  @Get()
  listCampaigns(@Query() query: ListCampaignsDto) {
    return this.campaignsService.listCampaigns(query);
  }

  @Get(':id')
  getCampaign(@Param('id') id: string) {
    return this.campaignsService.getCampaign(id);
  }

  @Patch(':id')
  updateCampaign(@Param('id') id: string, @Body() dto: UpdateCampaignDto) {
    return this.campaignsService.updateCampaign(id, dto);
  }

  @Patch(':id/pause')
  pauseCampaign(@Param('id') id: string) {
    return this.campaignsService.updateStatus(id, CampaignStatus.PAUSED);
  }

  @Patch(':id/resume')
  resumeCampaign(@Param('id') id: string) {
    return this.campaignsService.updateStatus(id, CampaignStatus.ACTIVE);
  }

  @Patch(':id/cancel')
  cancelCampaign(@Param('id') id: string) {
    return this.campaignsService.updateStatus(id, CampaignStatus.CANCELLED);
  }

  @Get(':id/generated-emails')
  listGeneratedEmails(@Param('id') id: string) {
    return this.campaignsService.listGeneratedEmails(id);
  }

  @Patch(':id/generated-emails/:emailId/approve')
  approveGeneratedEmail(
    @Param('id') id: string,
    @Param('emailId') emailId: string,
  ) {
    return this.campaignsService.approveGeneratedEmail(id, emailId);
  }

  @Post(':id/trigger')
  triggerCampaign(@Param('id') id: string) {
    return this.campaignsService.triggerCampaignRun(id);
  }
}
