import { Module } from '@nestjs/common';
import { AiModule } from '../ai/ai.module';
import { EmailModule } from '../email/email.module';
import { AutomationController } from './automation.controller';
import { AutomationService } from './automation.service';
import { EmailQueueProcessor } from './email-queue.processor';
import { SchedulerService } from './scheduler.service';

@Module({
  imports: [AiModule, EmailModule],
  controllers: [AutomationController],
  providers: [SchedulerService, EmailQueueProcessor, AutomationService],
  exports: [SchedulerService, AutomationService],
})
export class AutomationModule {}
