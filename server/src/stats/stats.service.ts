import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StatsService {
  constructor(private readonly prisma: PrismaService) {}

  async getOverview() {
    const [campaigns, leads, sentEmails] = await this.prisma.$transaction([
      this.prisma.campaign.count(),
      this.prisma.lead.count(),
      this.prisma.sentEmail.count(),
    ]);

    return {
      campaigns,
      leads,
      sentEmails,
      generatedAt: new Date().toISOString(),
    };
  }
}
