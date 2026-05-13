import { BookingAggregate } from '../../../src/domain/booking/booking.aggregate';
import { BookingStatus, PaymentDeadline } from '../../../src/domain/booking/value-objects';
import { TicketEntity } from '../../../src/domain/ticket/ticket.entity';
import { TicketCode, TicketStatus } from '../../../src/domain/ticket/value-objects';
import { RefundAggregate } from '../../../src/domain/refund/refund.aggregate';
import { RefundStatus } from '../../../src/domain/refund/value-objects';
import { Money } from '../../../src/domain/shared/money.vo';
import { DomainError } from '../../../src/domain/shared/domain-error';

function makeBooking(overrides: {
  status?: BookingStatus;
  totalPrice?: Money;
  paymentDeadline?: PaymentDeadline;
} = {}): BookingAggregate {
  return BookingAggregate.reconstitute({
    id: 'booking-1',
    customerId: 'customer-1',
    eventId: 'event-1',
    categoryId: 'category-1',
    quantity: 2,
    totalPrice: overrides.totalPrice ?? Money.create(200_000, 'IDR'),
    status: overrides.status ?? BookingStatus.PendingPayment,
    paymentDeadline: overrides.paymentDeadline ?? new PaymentDeadline(new Date(Date.now() + 15 * 60 * 1000)),
    tickets: [],
  });
}

// ================================================================
// TEST 1: Booking cannot be created with zero quantity (BR16)
// ================================================================
describe('BookingAggregate.create', () => {
  it('should throw DomainError when quantity is zero', () => {
    expect(() => {
      BookingAggregate.create({
        id: 'booking-1',
        customerId: 'customer-1',
        eventId: 'event-1',
        categoryId: 'category-1',
        quantity: 0,
        unitPrice: Money.create(100_000, 'IDR'),
      });
    }).toThrow(DomainError);
  });
 
  it('should throw DomainError when quantity is negative', () => {
    expect(() => {
      BookingAggregate.create({
        id: 'booking-1',
        customerId: 'customer-1',
        eventId: 'event-1',
        categoryId: 'category-1',
        quantity: -5,
        unitPrice: Money.create(100_000, 'IDR'),
      });
    }).toThrow(DomainError);
  });
 
  it('should succeed when quantity is positive', () => {
    expect(() => {
      BookingAggregate.create({
        id: 'booking-1',
        customerId: 'customer-1',
        eventId: 'event-1',
        categoryId: 'category-1',
        quantity: 2,
        unitPrice: Money.create(100_000, 'IDR'),
      });
    }).not.toThrow();
  });
});
 
// ================================================================
// TEST 2: Booking cannot be paid after deadline (BR20)
// ================================================================
describe('BookingAggregate.pay - deadline', () => {
  it('should throw DomainError when paying after payment deadline', () => {
    const expiredDeadline = new PaymentDeadline(new Date(Date.now() - 1000));
    const booking = makeBooking({ paymentDeadline: expiredDeadline });
 
    expect(() => {
      booking.pay(Money.create(200_000, 'IDR'));
    }).toThrow(DomainError);
  });
 
  it('should throw error with message about deadline', () => {
    const expiredDeadline = new PaymentDeadline(new Date(Date.now() - 1000));
    const booking = makeBooking({ paymentDeadline: expiredDeadline });
 
    expect(() => {
      booking.pay(Money.create(200_000, 'IDR'));
    }).toThrow('payment deadline has passed');
  });
});
 
// ================================================================
// TEST 3: Booking cannot be paid with incorrect amount (BR19)
// ================================================================
describe('BookingAggregate.pay - amount', () => {
  it('should throw DomainError when payment amount is less than total price', () => {
    const booking = makeBooking({ totalPrice: Money.create(200_000, 'IDR') });
 
    expect(() => {
      booking.pay(Money.create(100_000, 'IDR'));
    }).toThrow(DomainError);
  });
 
  it('should throw DomainError when payment amount is more than total price', () => {
    const booking = makeBooking({ totalPrice: Money.create(200_000, 'IDR') });
 
    expect(() => {
      booking.pay(Money.create(999_999, 'IDR'));
    }).toThrow(DomainError);
  });
 
  it('should succeed when payment amount equals total price', () => {
    const booking = makeBooking({ totalPrice: Money.create(200_000, 'IDR') });
 
    expect(() => {
      booking.pay(Money.create(200_000, 'IDR'));
    }).not.toThrow();
  });
});
 
// ================================================================
// TEST 4: Paid booking cannot expire (BR21)
// ================================================================
describe('BookingAggregate.expire', () => {
  it('should throw DomainError when trying to expire a Paid booking', () => {
    const booking = makeBooking({ status: BookingStatus.Paid });
 
    expect(() => {
      booking.expire();
    }).toThrow(DomainError);
  });
 
  it('should throw error with message about paid booking', () => {
    const booking = makeBooking({ status: BookingStatus.Paid });
 
    expect(() => {
      booking.expire();
    }).toThrow('paid booking cannot be marked as expired');
  });
 
  it('should succeed when expiring a PendingPayment booking', () => {
    const booking = makeBooking({ status: BookingStatus.PendingPayment });
 
    expect(() => {
      booking.expire();
    }).not.toThrow();
  });
});

