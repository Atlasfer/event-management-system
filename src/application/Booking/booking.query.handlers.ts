import { IBookingRepository } from '../../domain/booking/booking.repository';
import { ITicketRepository } from '../../domain/ticket/ticket.repository';
import { BookingDetailDto, BookingDto } from '../dto/booking.dto';
import { BookingStatus } from '../../domain/booking/value-objects';
import { GetBookingDetailQuery, GetCustomerBookingsQuery } from './booking.queries';

export class GetBookingDetailQueryHandler {
  constructor(
    private readonly bookingRepository: IBookingRepository,
    private readonly ticketRepository: ITicketRepository,
  ) {}
 
  async execute(query: GetBookingDetailQuery): Promise<BookingDetailDto | null> {
    const booking = await this.bookingRepository.findById(query.bookingId);
    if (!booking) return null;
 
    const tickets = await this.ticketRepository.findByBookingId(booking.id);
 
    return {
      id: booking.id,
      customerId: booking.customerId,
      eventId: booking.eventId,
      categoryId: booking.categoryId,
      quantity: booking.quantity,
      totalAmount: booking.totalPrice.amount,
      currency: booking.totalPrice.currency,
      status: booking.status,
      paymentDeadline: booking.paymentDeadline.value,
      tickets: tickets.map((t) => ({
        id: t.id,
        code: t.code.value,
        status: t.status,
        checkedInAt: t.checkedInAt,
      })),
    };
  }
}

export class GetCustomerBookingsQueryHandler {
  constructor(private readonly bookingRepository: IBookingRepository) {}
 
  async execute(query: GetCustomerBookingsQuery): Promise<BookingDto[]> {
    const bookings = await this.bookingRepository.findByStatus(
      BookingStatus.Paid,
    );
 
    return bookings
      .filter((b) => b.customerId === query.customerId)
      .map((b) => ({
        id: b.id,
        customerId: b.customerId,
        eventId: b.eventId,
        categoryId: b.categoryId,
        quantity: b.quantity,
        totalAmount: b.totalPrice.amount,
        currency: b.totalPrice.currency,
        status: b.status,
        paymentDeadline: b.paymentDeadline.value,
      }));
  }
}