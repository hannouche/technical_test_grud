import { Controller, Param, Post } from '@nestjs/common';
import { AutomationService } from './automation.service';

@Controller('automation')
export class AutomationController {
  constructor(private readonly automationService: AutomationService) {}

  @Post('run')
  runAllCampaigns() {
    return this.automationService.runAll();
  }

  @Post('campaigns/:id/run')
  runSingleCampaign(@Param('id') id: string) {
    return this.automationService.runOne(id);
  }
}
