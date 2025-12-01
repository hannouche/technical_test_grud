import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Query,
} from '@nestjs/common';
import { CreateLeadDto } from './dto/create-lead.dto';
import { LeadsService } from './lead.service';

@Controller('leads')
export class LeadController {
  constructor(private readonly leadService: LeadsService) {}

  @Post()
  create(@Body() dto: CreateLeadDto) {
    return this.createInternal(dto);
  }

  @Post('create')
  legacyCreate(@Body() dto: CreateLeadDto) {
    return this.createInternal(dto);
  }

  @Get()
  list(@Query('campaignId') campaignId?: string) {
    return this.leadService.listLeads(campaignId);
  }

  private async createInternal(dto: CreateLeadDto) {
    const emails = this.extractEmails(dto);
    const leads = await this.leadService.createLeads(emails, dto.campaignId);
    return { leads };
  }

  private extractEmails(dto: CreateLeadDto) {
    const emailsInput = dto.emails ?? dto.email;
    if (!emailsInput) {
      throw new BadRequestException('Provide at least one lead email');
    }

    const emails = emailsInput
      .split(/[\n,;]/)
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean);

    const uniqueEmails = Array.from(new Set(emails));
    if (uniqueEmails.length === 0) {
      throw new BadRequestException('Provide at least one valid lead email');
    }
    return uniqueEmails;
  }
}
