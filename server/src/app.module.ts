import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { CampaignsModule } from './campaigns/campaigns.module';
import { AiModule } from './ai/ai.module';
import { EmailModule } from './email/email.module';
import { AutomationModule } from './automation/automation.module';
import { LeadsModule } from './lead/lead.module';
import { StatsModule } from './stats/stats.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    PrismaModule,
    CampaignsModule,
    AiModule,
    EmailModule,
    AutomationModule,
    LeadsModule,
    StatsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
