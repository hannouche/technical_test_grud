import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { GenerateCampaignEmailDto } from './dto/generate-campaign-email.dto';
import { AiService } from './ai.service';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Get('models')
  getSupportedModels() {
    return this.aiService.listProviderModels();
  }

  @Post('campaigns/:campaignId/draft')
  generateDraft(
    @Param('campaignId') campaignId: string,
    @Body() body: GenerateCampaignEmailDto,
  ) {
    const slot = body.scheduledSlot ?? 0;
    return this.aiService.generateCampaignEmail(
      campaignId,
      slot,
      body.campaignLeadId,
    );
  }
}
