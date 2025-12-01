import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  CampaignStatus,
  GeneratedEmail,
  Prisma,
  ScheduleType,
} from '@prisma/client';
import { AiService } from '../ai/ai.service';
import { AutomationService } from '../automation/automation.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCampaignDto, UpdateCampaignDto } from './dto/campaign.dto';
import { ListCampaignsDto } from './dto/list-campaigns.dto';

const campaignInclude = {
  _count: {
    select: { leads: true, generatedEmails: true },
  },
};

@Injectable()
export class CampaignsService {
  private readonly logger = new Logger(CampaignsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly automationService: AutomationService,
    private readonly aiService: AiService,
  ) {}

  async createCampaign(dto: CreateCampaignDto) {
    const timeZone = dto.timeZone || dto.timezone;
    if (!timeZone) {
      throw new BadRequestException('timeZone is required');
    }

    const campaignData: any = {
      name: dto.name,
      model: dto.model,
      context: dto.context,
      scheduleType: dto.scheduleType,
      durationDays: dto.durationDays,
      startDateUtc: new Date(dto.startDateUtc),
      timeZone: timeZone,
      status: dto.status || CampaignStatus.ACTIVE,
    };

    if (dto.scheduleType === ScheduleType.DAILY) {
      if (!dto.dailyEmails) {
        throw new BadRequestException('dailyEmails is required for DAILY schedule');
      }
      campaignData.dailyEmails = dto.dailyEmails;
      campaignData.weeklyDays = [];
      campaignData.weeklyEmailsPerDay = null;
    } else {
      if (!dto.weeklyDays || dto.weeklyDays.length === 0) {
        throw new BadRequestException('weeklyDays required for WEEKLY schedule');
      }
      if (!dto.weeklyEmailsPerDay) {
        throw new BadRequestException('weeklyEmailsPerDay required for WEEKLY schedule');
      }
      const normalizedDays = dto.weeklyDays.map((day) => (day === 7 ? 0 : day));
      if (normalizedDays.some((day) => day < 0 || day > 6)) {
        throw new BadRequestException('weeklyDays must be between 0 (Sun) and 6 (Sat)');
      }
      campaignData.weeklyDays = normalizedDays;
      campaignData.weeklyEmailsPerDay = dto.weeklyEmailsPerDay;
      campaignData.dailyEmails = null;
    }

    const campaign = await this.prisma.campaign.create({
      data: campaignData,
      include: campaignInclude,
    });

    this.generateInitialDraft(campaign.id).catch((err) => {
      this.logger.warn(`Failed to generate initial draft: ${err.message}`);
    });

    return this.mapCampaignResponse(campaign);
  }

  async updateCampaign(id: string, dto: UpdateCampaignDto) {
    const existing = await this.prisma.campaign.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Campaign not found');
    }
    if (existing.status === CampaignStatus.CANCELLED) {
      throw new BadRequestException('Cannot update a canceled campaign');
    }

    const timeZone = dto.timeZone || dto.timezone || existing.timeZone;
    if (!timeZone) {
      throw new BadRequestException('timeZone is required');
    }

    const updateData: any = {};
    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.model !== undefined) updateData.model = dto.model;
    if (dto.context !== undefined) updateData.context = dto.context;
    if (dto.scheduleType !== undefined) updateData.scheduleType = dto.scheduleType;
    if (dto.durationDays !== undefined) updateData.durationDays = dto.durationDays;
    if (dto.startDateUtc !== undefined) updateData.startDateUtc = new Date(dto.startDateUtc);
    if (dto.status !== undefined) updateData.status = dto.status;
    updateData.timeZone = timeZone;

    const scheduleType = dto.scheduleType || existing.scheduleType;
    if (scheduleType === ScheduleType.DAILY) {
      const dailyEmails = dto.dailyEmails !== undefined ? dto.dailyEmails : existing.dailyEmails;
      if (!dailyEmails) {
        throw new BadRequestException('dailyEmails is required for DAILY schedule');
      }
      updateData.dailyEmails = dailyEmails;
      updateData.weeklyDays = [];
      updateData.weeklyEmailsPerDay = null;
    } else if (scheduleType === ScheduleType.WEEKLY) {
      const weeklyDays = dto.weeklyDays || existing.weeklyDays || [];
      if (weeklyDays.length === 0) {
        throw new BadRequestException('weeklyDays required for WEEKLY schedule');
      }
      const normalizedDays = weeklyDays.map((day) => (day === 7 ? 0 : day));
      if (normalizedDays.some((day) => day < 0 || day > 6)) {
        throw new BadRequestException('weeklyDays must be between 0 (Sun) and 6 (Sat)');
      }
      const weeklyEmailsPerDay = dto.weeklyEmailsPerDay !== undefined ? dto.weeklyEmailsPerDay : existing.weeklyEmailsPerDay;
      if (!weeklyEmailsPerDay) {
        throw new BadRequestException('weeklyEmailsPerDay required for WEEKLY schedule');
      }
      updateData.weeklyDays = normalizedDays;
      updateData.weeklyEmailsPerDay = weeklyEmailsPerDay;
      updateData.dailyEmails = null;
    }

    const campaign = await this.prisma.campaign.update({
      where: { id },
      data: updateData,
      include: campaignInclude,
    });

    return this.mapCampaignResponse(campaign);
  }

  async listCampaigns(query: ListCampaignsDto) {
    const where: Prisma.CampaignWhereInput = {};
    if (query.status) {
      where.status = query.status;
    }
    if (query.from || query.to) {
      where.createdAt = {};
      let fromValue: Date | undefined;
      let toValue: Date | undefined;
      if (query.from) {
        fromValue = new Date(query.from);
        if (Number.isNaN(fromValue.valueOf())) {
          throw new BadRequestException('Invalid from date');
        }
        where.createdAt.gte = fromValue;
      }
      if (query.to) {
        toValue = new Date(query.to);
        if (Number.isNaN(toValue.valueOf())) {
          throw new BadRequestException('Invalid to date');
        }
        where.createdAt.lte = toValue;
      }
      if (fromValue && toValue && fromValue > toValue) {
        throw new BadRequestException('from date must be before to date');
      }
    }

    const campaigns = await this.prisma.campaign.findMany({
      where,
      include: campaignInclude,
      orderBy: { createdAt: 'desc' },
    });

    return campaigns.map((campaign) => this.mapCampaignResponse(campaign));
  }

  async getCampaign(id: string) {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id },
      include: campaignInclude,
    });
    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }
    return this.mapCampaignResponse(campaign);
  }

  async listGeneratedEmails(campaignId: string) {
    await this.getCampaign(campaignId);
    const generated = await this.prisma.generatedEmail.findMany({
      where: { campaignId },
      orderBy: { createdAt: 'desc' },
    });
    return generated.map((email) => this.mapGeneratedEmail(email));
  }

  async approveGeneratedEmail(campaignId: string, emailId: string) {
    const existing = await this.prisma.generatedEmail.findFirst({
      where: { id: emailId, campaignId },
    });
    if (!existing) {
      throw new NotFoundException('Generated email not found');
    }

    return this.prisma.generatedEmail.update({
      where: { id: emailId },
      data: { approved: true },
    });
  }

  async triggerCampaignRun(id: string) {
    const campaign = await this.getCampaign(id);
    if (campaign.status !== CampaignStatus.ACTIVE) {
      throw new BadRequestException('Only active campaigns can be triggered');
    }

    await this.automationService.runOne(id);
    return { message: 'Campaign enqueued for delivery check' };
  }

  async updateStatus(id: string, status: CampaignStatus) {
    const campaign = await this.getCampaign(id);
    if (campaign.status === CampaignStatus.CANCELLED) {
      throw new BadRequestException('Cannot change a canceled campaign');
    }
    const updated = await this.prisma.campaign.update({
      where: { id },
      data: { status },
      include: campaignInclude,
    });
    return this.mapCampaignResponse(updated);
  }

  private mapCampaignResponse(campaign: any) {
    const result: any = {
      id: campaign.id,
      name: campaign.name,
      model: campaign.model,
      context: campaign.context,
      scheduleType: campaign.scheduleType,
      dailyEmails: campaign.dailyEmails,
      weeklyDays: campaign.weeklyDays,
      weeklyEmailsPerDay: campaign.weeklyEmailsPerDay,
      durationDays: campaign.durationDays,
      startDateUtc: campaign.startDateUtc,
      timeZone: campaign.timeZone,
      timezone: campaign.timeZone,
      status: campaign.status,
      createdAt: campaign.createdAt,
      updatedAt: campaign.updatedAt,
      leadsCount: campaign._count?.leads || 0,
      generatedEmailsCount: campaign._count?.generatedEmails || 0,
    };
    return result;
  }

  private mapGeneratedEmail(email: GeneratedEmail) {
    return {
      id: email.id,
      campaignId: email.campaignId,
      scheduledSlot: email.scheduledSlot,
      subject: email.subject,
      bodyHtml: email.bodyHtml,
      approved: email.approved,
      createdAt: email.createdAt,
    };
  }

  private async generateInitialDraft(campaignId: string) {
    try {
      await this.aiService.generateCampaignEmail(campaignId, 0);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      this.logger.warn(
        `Unable to generate initial draft for campaign ${campaignId}: ${errorMsg}`,
      );
    }
  }
}
