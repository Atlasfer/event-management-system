import { ITicketRepository } from '../../domain/ticket/ticket.repository';
import { IBookingRepository } from '../../domain/booking/booking.repository';
import { TicketDto } from '../dto/ticket.dto';
import { BookingStatus } from '../../domain/booking/value-objects';
import { GetCustomerTicketsQuery } from './ticket.queries';
 
export class GetCustomerTicketsQueryHandler {
  constructor(
    private readonly bookingRepository: IBookingRepository,
    private readonly ticketRepository: ITicketRepository,
  ) {}
 
  // Customers can only view tickets from Paid bookings
  async execute(query: GetCustomerTicketsQuery): Promise<TicketDto[]> {
    const bookings = await this.bookingRepository.findByStatus(BookingStatus.Paid);
    const customerBookings = bookings.filter(
      (b) => b.customerId === query.customerId,
    );
 
    const allTickets: TicketDto[] = [];
    for (const booking of customerBookings) {
      const tickets = await this.ticketRepository.findByBookingId(booking.id);
      for (const ticket of tickets) {
        allTickets.push({
          id: ticket.id,
          bookingId: ticket.bookingId,
          eventId: ticket.eventId,
          code: ticket.code.value,
          status: ticket.status,
          checkedInAt: ticket.checkedInAt,
        });
      }
    }
 
    return allTickets;
  }
}