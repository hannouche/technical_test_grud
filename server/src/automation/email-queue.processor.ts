import { Injectable, Logger } from '@nestjs/common';
import { Job, Worker } from 'bullmq';
import { AiService } from '../ai/ai.service';
import { EmailService } from '../email/email.service';
import { PrismaService } from '../prisma/prisma.service';

interface EmailJob {
  campaignId: string;
  campaignLeadId: string;
  scheduledSlot: number;
}

@Injectable()
export class EmailQueueProcessor {
  private readonly logger = new Logger(EmailQueueProcessor.name);
  private readonly worker: Worker<EmailJob>;

  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
    private readonly emailService: EmailService,
  ) {
    this.worker = new Worker<EmailJob>(
      'email-send',
      (job) => this.processJob(job),
      {
        connection: {
          host: process.env.REDIS_HOST ?? '127.0.0.1',
          port: Number(process.env.REDIS_PORT ?? 6379),
          password: process.env.REDIS_PASSWORD,
        },
      },
    );

    this.worker.on('error', (error) => {
      const errorMsg = error instanceof Error ? error.message : String(error);
      this.logger.error(`Email queue worker failed: ${errorMsg}`);
    });
  }

  private async processJob(job: Job<EmailJob>) {
    try {
      const { campaignLeadId, campaignId, scheduledSlot } = job.data;
      const campaignLead = await this.prisma.campaignLead.findUnique({
        where: { id: campaignLeadId },
        include: { lead: true, campaign: true },
      });

      if (!campaignLead) {
        this.logger.warn(`Campaign lead ${campaignLeadId} not found`);
        return;
      }

      const slotIndex = scheduledSlot ?? campaignLead.emailsSentCount;
      const alreadySent = await this.prisma.sentEmail.findUnique({
        where: {
          campaignLeadId_scheduledSlot: {
            campaignLeadId,
            scheduledSlot: slotIndex,
          },
        },
      });
      if (alreadySent) {
        this.logger.log(
          `Email already sent for slot ${slotIndex} on lead ${campaignLeadId}`,
        );
        return;
      }

      let draft = await this.prisma.generatedEmail.findFirst({
        where: { campaignId, scheduledSlot: slotIndex },
        orderBy: { createdAt: 'desc' },
      });

      if (!draft) {
        draft = await this.aiService.generateCampaignEmail(
          campaignId,
          slotIndex,
          campaignLeadId,
        );
      }

      if (!draft.approved) {
        this.logger.log(
          `Draft not approved for lead ${campaignLeadId}, skipping send.`,
        );
        return;
      }

      const { messageId } = await this.emailService.send(
        campaignLead.lead.email,
        draft.subject,
        draft.bodyHtml,
      );
      this.logger.log(`Email sent to ${campaignLead.lead.email}: ${messageId}`);

      await this.prisma.$transaction([
        this.prisma.sentEmail.create({
          data: {
            campaignLeadId,
            scheduledSlot: slotIndex,
          },
        }),
        this.prisma.campaignLead.update({
          where: { id: campaignLeadId },
          data: {
            emailsSentCount: { increment: 1 },
            lastSentAt: new Date(),
          },
        }),
      ]);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to process job ${job.id}: ${errorMsg}`);
      throw error;
    }
  }
}
