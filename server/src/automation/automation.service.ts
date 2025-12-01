import { Injectable } from '@nestjs/common';
import { SchedulerService } from './scheduler.service';

@Injectable()
export class AutomationService {
  constructor(private readonly schedulerService: SchedulerService) {}

  runAll() {
    return this.schedulerService.checkAndEnqueue();
  }

  runOne(campaignId: string) {
    return this.schedulerService.checkAndEnqueue(campaignId);
  }
}
