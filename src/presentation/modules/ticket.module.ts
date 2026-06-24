import { Module } from '@nestjs/common';
import { TicketController } from '../controllers/ticket.controller';
import { TicketApplicationService } from '../../infrastructure/services/ticket-application.service';

@Module({
  controllers: [TicketController],
  providers: [TicketApplicationService],
  exports: [TicketApplicationService],
})
export class TicketModule {}
