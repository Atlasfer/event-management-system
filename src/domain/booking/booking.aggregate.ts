import { BaseAggregateRoot } from '../shared/base-aggregate-root';
import { DomainError } from '../shared/domain-error';
import { Money } from '../shared/money.vo';
import { TicketEntity } from '../ticket/ticket.entity';
import { BookingStatus, PaymentDeadline } from './value-objects';
import { BookingExpired, BookingPaid, TicketReserved } from './events';

export class BookingAggregate extends BaseAggregateRoot<string> {
  public customerId!: string;
  public eventId!: string;
  public categoryId!: string;
  public quantity!: number;
  public totalPrice!: Money;
  public status!: BookingStatus;
  public paymentDeadline!: PaymentDeadline;
  public tickets: TicketEntity[];
 
  private constructor(id: string) {
    super(id);
    this.tickets = [];
  }

  static create(props: {
    id: string;
    customerId: string;
    eventId: string;
    categoryId: string;
    quantity: number;
    unitPrice: Money;
    paymentDeadlineMinutes?: number;
  }): BookingAggregate {
    // The quantity must be greater than 0
    if (props.quantity <= 0) {
      throw new DomainError('Ticket quantity must be greater than zero.');
    }

    const booking = new BookingAggregate(props.id);
    booking.customerId = props.customerId;
    booking.eventId = props.eventId;
    booking.categoryId = props.categoryId;
    booking.quantity = props.quantity;

    // total price = unit price × quantity
    booking.totalPrice = props.unitPrice.multiply(props.quantity);
    booking.status = BookingStatus.PendingPayment;

    // payment deadline 15 minutes after creation
    booking.paymentDeadline = PaymentDeadline.fromMinutes(
      props.paymentDeadlineMinutes ?? 15,
    );
 
    booking.raiseDomainEvent(
      new TicketReserved(
        booking.id,
        booking.customerId,
        booking.eventId,
        booking.categoryId,
        booking.quantity,
      ),
    );
 
    return booking;
  }

  static reconstitute(props: {
    id: string;
    customerId: string;
    eventId: string;
    categoryId: string;
    quantity: number;
    totalPrice: Money;
    status: BookingStatus;
    paymentDeadline: PaymentDeadline;
    tickets: TicketEntity[];
  }): BookingAggregate {
    const booking = new BookingAggregate(props.id);
    booking.customerId = props.customerId;
    booking.eventId = props.eventId;
    booking.categoryId = props.categoryId;
    booking.quantity = props.quantity;
    booking.totalPrice = props.totalPrice;
    booking.status = props.status;
    booking.paymentDeadline = props.paymentDeadline;
    booking.tickets = props.tickets;
    return booking;
  }

  // Payment
  pay(amount: Money, now: Date = new Date()): void {
    // unable to pay after the deadline
    if (this.paymentDeadline.isExpired(now)) {
      throw new DomainError(
        'Booking cannot be paid because the payment deadline has passed.',
      );
    }
    if (this.status !== BookingStatus.PendingPayment) {
      throw new DomainError(
        `Booking cannot be paid because its status is ${this.status}.`,
      );
    }
    // The payment amount must equal the total price
    if (!amount.equals(this.totalPrice)) {
      throw new DomainError(
        `Payment amount ${amount.amount} ${amount.currency} does not match total price ${this.totalPrice.amount} ${this.totalPrice.currency}.`,
      );
    }
    this.status = BookingStatus.Paid;
 
    this.raiseDomainEvent(
      new BookingPaid(
        this.id,
        this.customerId,
        this.eventId,
        this.totalPrice.amount,
        this.totalPrice.currency,
      ),
    );
  }

  // Expire
  expire(): void {
    // Paid bookings cannot expire
    if (this.status === BookingStatus.Paid) {
      throw new DomainError('A paid booking cannot be marked as expired.');
    }
 
    if (this.status !== BookingStatus.PendingPayment) {
      throw new DomainError(
        `Only PendingPayment bookings can expire. Current status: ${this.status}.`,
      );
    }
 
    this.status = BookingStatus.Expired;
 
    this.raiseDomainEvent(
      new BookingExpired(this.id, this.categoryId, this.quantity),
    );
  }

  markAsRefunded(): void {
    if (this.status !== BookingStatus.Paid) {
      throw new DomainError('Only a Paid booking can be marked as Refunded.');
    }
    this.status = BookingStatus.Refunded;
  }
}