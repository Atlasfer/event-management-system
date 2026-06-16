import { PrismaService } from '../database/prisma.service';
import { PrismaBookingRepository } from '../database/repositories/prisma-booking.repository';
import { PrismaTicketRepository } from '../database/repositories/prisma-ticket.repository';
import { PrismaEventRepository } from '../database/repositories/prisma-event.repository';
import { MockPaymentGateway } from './payment-gateway.service';
import { IPaymentGateway } from '../../application/ports/payment-gateway.port';
 
import {
  CreateBookingCommandHandler,
  ExpireBookingCommandHandler,
  PayBookingCommandHandler,
} from '../../application/Booking/booking.command.handlers';
import {
  GetBookingDetailQueryHandler,
  GetCustomerBookingsQueryHandler,
} from '../../application/Booking/booking.query.handlers';
 
import {
  CreateBookingCommand,
  ExpireBookingCommand,
  PayBookingCommand,
} from '../../application/Booking/booking.commands';
import {
  GetBookingDetailQuery,
  GetCustomerBookingsQuery,
} from '../../application/Booking/booking.queries';
import { BookingDetailDto, BookingDto } from '../../application/dto/booking.dto';
 
export class BookingApplicationService {
  private readonly bookingRepository: PrismaBookingRepository;
  private readonly ticketRepository: PrismaTicketRepository;
  private readonly eventRepository: PrismaEventRepository;
  private readonly paymentGateway: IPaymentGateway;
 
  constructor(
    private readonly prisma: PrismaService,
    paymentGateway?: IPaymentGateway,
  ) {
    this.bookingRepository = new PrismaBookingRepository(prisma);
    this.ticketRepository = new PrismaTicketRepository(prisma);
    this.eventRepository = new PrismaEventRepository(prisma);
  
    this.paymentGateway = paymentGateway ?? new MockPaymentGateway();
  }

  async createBooking(command: CreateBookingCommand): Promise<void> {
    const handler = new CreateBookingCommandHandler(
      this.bookingRepository,
      this.eventRepository,
    );
    await handler.execute(command);
  }
 
  async payBooking(command: PayBookingCommand): Promise<void> {

    const handler = new PayBookingCommandHandler(
      this.bookingRepository,
      this.ticketRepository,
      this.paymentGateway,
    );
    await handler.execute(command);
  }
 
  async expireBooking(command: ExpireBookingCommand): Promise<void> {
    const handler = new ExpireBookingCommandHandler(
      this.bookingRepository,
      this.eventRepository,
    );
    await handler.execute(command);
  }

  async getBookingDetail(
    query: GetBookingDetailQuery,
  ): Promise<BookingDetailDto | null> {
    const handler = new GetBookingDetailQueryHandler(
      this.bookingRepository,
      this.ticketRepository,
    );
    return handler.execute(query);
  }
 
  async getCustomerBookings(
    query: GetCustomerBookingsQuery,
  ): Promise<BookingDto[]> {
    const handler = new GetCustomerBookingsQueryHandler(this.bookingRepository);
    return handler.execute(query);
  }
}