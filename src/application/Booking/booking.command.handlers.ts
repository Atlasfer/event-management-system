import { IBookingRepository } from '../../domain/booking/booking.repository';
import { IEventRepository } from '../../domain/event/event.repository';
import { ITicketRepository } from '../../domain/ticket/ticket.repository';
import { BookingAggregate } from '../../domain/booking/booking.aggregate';
import { BookingStatus } from '../../domain/booking/value-objects';
import { TicketEntity } from '../../domain/ticket/ticket.entity';
import { TicketCode } from '../../domain/ticket/value-objects';
import { Money } from '../../domain/shared/money.vo';
import { DomainError } from '../../domain/shared/domain-error';
import { CreateBookingCommand, ExpireBookingCommand, PayBookingCommand } from './booking.commands';
import { randomUUID } from 'crypto';

export class CreateBookingCommandHandler {
  constructor(
    private readonly bookingRepository: IBookingRepository,
    private readonly eventRepository: IEventRepository,
  ) {}
 
  async execute(command: CreateBookingCommand): Promise<void> {
    // Event must be Published
    const event = await this.eventRepository.findById(command.eventId);
    if (!event) {
      throw new DomainError(`Event not found: ${command.eventId}`);
    }
 
    const { EventStatus } = await import('../../domain/event/event-status.js');
    if (event.status !== EventStatus.Published) {
      throw new DomainError('Booking can only be created for a Published event.');
    }
 
    // Category must be active and within sales period
    const category = event
      .getTicketCategories()
      .find((c) => c.id === command.categoryId);
    if (!category) {
      throw new DomainError(`Ticket category not found: ${command.categoryId}`);
    }
    if (!category.isActive) {
      throw new DomainError('Ticket category is not active.');
    }
 
    const now = new Date();
    if (now < category.salesStart || now > category.salesEnd) {
      throw new DomainError('Ticket category is not within the sales period.');
    }
 
    // Quantity must not exceed remaining quota
    if (command.quantity > category.remainingQuota) {
      throw new DomainError(
        `Requested quantity (${command.quantity}) exceeds remaining quota (${category.remainingQuota}).`,
      );
    }
 
    // Customer must not have an active booking for the same event
    const existingBookings = await this.bookingRepository.findByCustomerAndEvent(
      command.customerId,
      command.eventId,
    );
    const hasActiveBooking = existingBookings.some(
      (b) => b.status === BookingStatus.PendingPayment || b.status === BookingStatus.Paid,
    );
    if (hasActiveBooking) {
      throw new DomainError(
        'Customer already has an active booking for this event.',
      );
    }
 
    const booking = BookingAggregate.create({
      id: command.bookingId,
      customerId: command.customerId,
      eventId: command.eventId,
      categoryId: command.categoryId,
      quantity: command.quantity,
      unitPrice: category.price,
    });
 
    await this.bookingRepository.save(booking);
  }
}

export class PayBookingCommandHandler {
  constructor(
    private readonly bookingRepository: IBookingRepository,
    private readonly ticketRepository: ITicketRepository,
  ) {}
 
  async execute(command: PayBookingCommand): Promise<void> {
    const booking = await this.bookingRepository.findById(command.bookingId);
    if (!booking) {
      throw new DomainError(`Booking not found: ${command.bookingId}`);
    }
 
    const paymentAmount = Money.create(command.paymentAmount, command.currency);
 
    // pay() validates BR19 and BR20 internally
    booking.pay(paymentAmount);
 
    // BR24: Issue tickets with unique codes after payment
    const tickets: TicketEntity[] = [];
    for (let i = 0; i < booking.quantity; i++) {
      const ticket = TicketEntity.create({
        id: randomUUID(),
        bookingId: booking.id,
        eventId: booking.eventId,
        code: new TicketCode(randomUUID()),
      });
      tickets.push(ticket);
    }
 
    await this.ticketRepository.saveMany(tickets);
    await this.bookingRepository.save(booking);
  }
}

export class ExpireBookingCommandHandler {
  constructor(private readonly bookingRepository: IBookingRepository) {}
 
  async execute(command: ExpireBookingCommand): Promise<void> {
    const booking = await this.bookingRepository.findById(command.bookingId);
    if (!booking) {
      throw new DomainError(`Booking not found: ${command.bookingId}`);
    }
 
    if (!booking.paymentDeadline.isExpired()) {
      throw new DomainError(
        'Booking cannot be expired because the payment deadline has not passed yet.',
      );
    }
 
    // expire() validates BR21 internally
    booking.expire();
    await this.bookingRepository.save(booking);
  }
}