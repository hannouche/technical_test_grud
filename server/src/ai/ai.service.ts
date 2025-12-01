import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { GeneratedEmail } from '@prisma/client';
import OpenAI from 'openai';
import { PrismaService } from '../prisma/prisma.service';

interface CampaignInfo {
  id: string;
  name: string;
  context: string;
  model: string;
  timeZone: string;
}

@Injectable()
export class AiService {
  private readonly client: OpenAI | null;

  constructor(private readonly prisma: PrismaService) {
    this.client = process.env.OPENAI_API_KEY
      ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
      : null;
  }

  async listProviderModels() {
    const client = this.ensureClient();
    try {
      const response = await client.models.list();
      return response.data.map((model) => ({
        id: model.id,
        label: model.id,
        description: model.owned_by ? `Owned by ${model.owned_by}` : undefined,
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new BadRequestException(
        `Unable to fetch models from OpenAI: ${message}`,
      );
    }
  }

  async generateCampaignEmail(
    campaignId: string,
    scheduledSlot: number,
    campaignLeadId?: string,
  ): Promise<GeneratedEmail> {
    const [campaign, campaignLead] = await Promise.all([
      this.prisma.campaign.findUnique({ where: { id: campaignId } }),
      campaignLeadId
        ? this.prisma.campaignLead.findUnique({
            where: { id: campaignLeadId },
            include: { lead: true },
          })
        : Promise.resolve(null),
    ]);

    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    if (campaignLead && campaignLead.campaignId !== campaignId) {
      throw new BadRequestException('Lead does not belong to this campaign');
    }

    if (!campaign.model) {
      throw new BadRequestException('Campaign model is missing');
    }

    const leadEmail = campaignLead?.lead.email;
    const leadLine = leadEmail
      ? `Speak directly to ${leadEmail}.`
      : 'Write a generic draft.';
    
    const prompt = `You are an SDR crafting an outreach email for the campaign "${campaign.name}".
Time zone: ${campaign.timeZone}
Campaign context:
${campaign.context}

${leadLine}

Return the subject on the first line prefixed with "Subject:". Write a short HTML friendly body afterwards.`;

    const completion = await this.ensureClient().chat.completions.create({
      model: campaign.model,
      messages: [{ role: 'user', content: prompt }],
    });

    const content = completion.choices.at(0)?.message?.content?.trim();
    if (!content) {
      throw new BadRequestException('AI provider returned an empty response');
    }

    const lines = content.split('\n').map((line) => line.trim()).filter((line) => line.length > 0);
    const firstLine = lines[0] || '';
    const subject = firstLine.replace(/^Subject:\s*/i, '').trim() || 'Hello there';
    const bodyLines = lines.slice(1);
    const bodyHtml = bodyLines.length > 0
      ? `<p>${bodyLines.join('<br/>')}</p>`
      : '<p>Hi there,</p>';

    return this.prisma.generatedEmail.upsert({
      where: {
        campaignId_scheduledSlot: {
          campaignId,
          scheduledSlot,
        },
      },
      create: {
        campaignId,
        scheduledSlot,
        subject,
        bodyHtml,
        approved: false,
      },
      update: {
        subject,
        bodyHtml,
        approved: false,
      },
    });
  }

  private ensureClient() {
    if (!this.client) {
      throw new BadRequestException('OpenAI API key is not configured.');
    }
    return this.client;
  }

}
