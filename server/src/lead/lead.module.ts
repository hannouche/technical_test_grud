import { Module } from '@nestjs/common';
import { LeadController } from './lead.controller';
import { LeadsService } from './lead.service';

@Module({
  providers: [LeadsService],
  exports: [LeadsService],
  controllers: [LeadController],
})
export class LeadsModule {}
