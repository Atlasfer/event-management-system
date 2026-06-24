import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { TicketApplicationService } from '../../infrastructure/services/ticket-application.service';
import { CheckInTicketCommand } from '../../application/Ticket/ticket.commands';
import { GetCustomerTicketsQuery } from '../../application/Ticket/ticket.queries';
import { CheckInTicketRequest } from '../request/ticket.request';

@Controller('tickets')
export class TicketController {
  constructor(private readonly ticketService: TicketApplicationService) {}

  @Get('customer/:customerId')
  async getByCustomer(@Param('customerId', ParseUUIDPipe) customerId: string) {
    const query = new GetCustomerTicketsQuery(customerId);
    return this.ticketService.getCustomerTickets(query);
  }

  @Post('check-in')
  @HttpCode(HttpStatus.OK)
  async checkIn(
    @Body() request: CheckInTicketRequest,
  ): Promise<{ status: string }> {
    const command = new CheckInTicketCommand(
      request.ticketCode,
      request.targetEventId,
    );
    await this.ticketService.checkIn(command);
    return { status: 'checkedIn' };
  }
}
