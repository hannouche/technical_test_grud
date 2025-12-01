import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CampaignLead, Lead } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

interface CampaignLeadWithRelations extends CampaignLead {
  lead: Lead;
  campaign: { id: string; name: string };
}

@Injectable()
export class LeadsService {
  constructor(private readonly prisma: PrismaService) {}

  async createLeads(emails: string[], campaignId: string) {
    if (!emails.length) {
      throw new BadRequestException('Provide at least one lead email');
    }

    const campaign = await this.prisma.campaign.findUnique({
      where: { id: campaignId },
      select: { id: true, name: true },
    });
    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    const uniqueEmails = Array.from(new Set(emails));
    const results = await this.prisma.$transaction(async (tx) => {
      const created: CampaignLeadWithRelations[] = [];
      for (const email of uniqueEmails) {
        const lead =
          (await tx.lead.findFirst({ where: { email } })) ??
          (await tx.lead.create({
            data: { email },
          }));

        const existingCampaignLead = await tx.campaignLead.findFirst({
          where: { campaignId, leadId: lead.id },
          include: {
            campaign: { select: { id: true, name: true } },
            lead: true,
          },
        });

        if (existingCampaignLead) {
          created.push(existingCampaignLead);
          continue;
        }

        const campaignLead = await tx.campaignLead.create({
          data: {
            campaignId,
            leadId: lead.id,
          },
          include: {
            campaign: { select: { id: true, name: true } },
            lead: true,
          },
        });
        created.push(campaignLead);
      }
      return created;
    });

    return results.map((cl) => this.mapLeadResponse(cl));
  }

  async createLead(email: string, campaignId: string) {
    const [lead] = await this.createLeads([email], campaignId);
    return lead;
  }

  async listLeads(campaignId?: string) {
    const campaignLeads = await this.prisma.campaignLead.findMany({
      where: campaignId ? { campaignId } : undefined,
      include: {
        lead: true,
        campaign: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return campaignLeads.map((cl) => this.mapLeadResponse(cl));
  }

  private mapLeadResponse(campaignLead: CampaignLeadWithRelations) {
    return {
      id: campaignLead.id,
      email: campaignLead.lead.email,
      firstName: campaignLead.lead.firstName,
      lastName: campaignLead.lead.lastName,
      campaignId: campaignLead.campaignId,
      createdAt: campaignLead.createdAt,
      campaign: campaignLead.campaign,
    };
  }
}
