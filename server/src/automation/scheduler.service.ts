import { CampaignStatus, ScheduleType } from '@prisma/client';
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Queue } from 'bullmq';
import { DateTime } from 'luxon';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);
  private readonly emailQueue: Queue;

  constructor(private readonly prisma: PrismaService) {
    const redisHost = process.env.REDIS_HOST || '127.0.0.1';
    const redisPort = Number(process.env.REDIS_PORT || 6379);
    const redisPassword = process.env.REDIS_PASSWORD;

    this.emailQueue = new Queue('email-send', {
      connection: {
        host: redisHost,
        port: redisPort,
        password: redisPassword,
      },
    });
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async checkAndEnqueue(campaignId?: string) {
    const now = DateTime.utc();
    
    const where: any = {
      status: CampaignStatus.ACTIVE,
      startDateUtc: { lte: now.toJSDate() },
    };
    if (campaignId) {
      where.id = campaignId;
    }

    const campaigns = await this.prisma.campaign.findMany({
      where,
      include: { leads: { include: { lead: true } } },
      orderBy: { createdAt: 'asc' },
    });

    let totalEnqueued = 0;

    for (const campaign of campaigns) {
      const localTime = now.setZone(campaign.timeZone);
      const startDate = DateTime.fromJSDate(campaign.startDateUtc).setZone(
        campaign.timeZone,
      );
      
      const daysSinceStart = localTime.diff(startDate, 'days').days;
      
      if (daysSinceStart < 0) {
        continue;
      }

      if (daysSinceStart > campaign.durationDays) {
        if (campaign.status !== CampaignStatus.COMPLETED) {
          await this.prisma.campaign.update({
            where: { id: campaign.id },
            data: { status: CampaignStatus.COMPLETED },
          });
        }
        continue;
      }

      let shouldSendToday = false;
      if (campaign.scheduleType === ScheduleType.DAILY) {
        shouldSendToday = true;
      } else if (campaign.scheduleType === ScheduleType.WEEKLY) {
        const currentWeekday = localTime.weekday % 7;
        if (campaign.weeklyDays && campaign.weeklyDays.includes(currentWeekday)) {
          shouldSendToday = true;
        }
      }

      if (!shouldSendToday) {
        continue;
      }

      const dayStart = localTime.startOf('day');
      const dayEnd = dayStart.plus({ days: 1 });
      
      let dailyLimit = 0;
      if (campaign.scheduleType === ScheduleType.DAILY) {
        dailyLimit = campaign.dailyEmails || 0;
      } else {
        dailyLimit = campaign.weeklyEmailsPerDay || 0;
      }

      if (dailyLimit <= 0) {
        continue;
      }

      const sentToday = await this.prisma.sentEmail.count({
        where: {
          campaignLead: { campaignId: campaign.id },
          sentAt: {
            gte: dayStart.toUTC().toJSDate(),
            lt: dayEnd.toUTC().toJSDate(),
          },
        },
      });

      const availableSlots = Math.max(dailyLimit - sentToday, 0);
      if (availableSlots <= 0) {
        continue;
      }

      const eligibleLeads = campaign.leads
        .filter((lead) => {
          return lead.emailsSentCount < campaign.durationDays;
        })
        .filter((lead) => {
          if (!lead.lastSentAt) {
            return true;
          }
          const lastSentDate = DateTime.fromJSDate(lead.lastSentAt).setZone(
            campaign.timeZone,
          );
          return !lastSentDate.hasSame(localTime, 'day');
        })
        .sort((a, b) => {
          const aTime = a.lastSentAt ? a.lastSentAt.getTime() : 0;
          const bTime = b.lastSentAt ? b.lastSentAt.getTime() : 0;
          return aTime - bTime;
        })
        .slice(0, availableSlots);

      let enqueued = 0;
      for (const lead of eligibleLeads) {
        const jobId = `${campaign.id}:${lead.id}:${lead.emailsSentCount}`;
        try {
          await this.emailQueue.add(
            'send-email',
            {
              campaignId: campaign.id,
              campaignLeadId: lead.id,
              scheduledSlot: lead.emailsSentCount,
            },
            { jobId, removeOnComplete: true },
          );
          enqueued++;
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : String(error);
          if (!errorMsg.includes('already exists')) {
            this.logger.error(`Failed to enqueue job ${jobId}: ${errorMsg}`);
          }
        }
      }

      totalEnqueued += enqueued;
    }

    return {
      processedCampaigns: campaigns.length,
      enqueuedJobs: totalEnqueued,
      checkedAt: now.toISO(),
    };
  }
}
