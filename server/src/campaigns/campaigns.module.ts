import { Module } from '@nestjs/common';
import { AiModule } from '../ai/ai.module';
import { AutomationModule } from '../automation/automation.module';
import { CampaignsController } from './campaigns.controller';
import { CampaignsService } from './campaigns.service';

@Module({
  imports: [AutomationModule, AiModule],
  exports: [CampaignsService],
  providers: [CampaignsService],
  controllers: [CampaignsController],
})
export class CampaignsModule {}
