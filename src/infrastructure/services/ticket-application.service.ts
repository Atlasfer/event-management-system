import { PrismaService } from '../database/prisma.service';
import { PrismaTicketRepository } from '../database/repositories/prisma-ticket.repository';
import { PrismaBookingRepository } from '../database/repositories/prisma-booking.repository';
import { PrismaEventRepository } from '../database/repositories/prisma-event.repository';
 
import { CheckInTicketCommandHandler } from '../../application/Ticket/ticket.command-handlers';
import { GetCustomerTicketsQueryHandler } from '../../application/Ticket/ticket.query-handlers';
 
import { CheckInTicketCommand } from '../../application/Ticket/ticket.commands';
import { GetCustomerTicketsQuery } from '../../application/Ticket/ticket.queries';
import { TicketDto } from '../../application/dto/ticket.dto';
 
export class TicketApplicationService {
  private readonly ticketRepository: PrismaTicketRepository;
  private readonly bookingRepository: PrismaBookingRepository;
  private readonly eventRepository: PrismaEventRepository;
 
  constructor(private readonly prisma: PrismaService) {
    this.ticketRepository = new PrismaTicketRepository(prisma);
    this.bookingRepository = new PrismaBookingRepository(prisma);
    this.eventRepository = new PrismaEventRepository(prisma);
  }

  async checkIn(command: CheckInTicketCommand): Promise<void> {
    const handler = new CheckInTicketCommandHandler(
      this.ticketRepository,
      this.eventRepository,
    );
    await handler.execute(command);
  }

  async getCustomerTickets(query: GetCustomerTicketsQuery): Promise<TicketDto[]> {
    const handler = new GetCustomerTicketsQueryHandler(
      this.bookingRepository,
      this.ticketRepository,
    );
    return handler.execute(query);
  }
}