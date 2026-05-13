import { BookingAggregate } from '../../../src/domain/booking/booking.aggregate';
import { BookingStatus, PaymentDeadline } from '../../../src/domain/booking/value-objects';
import { TicketEntity } from '../../../src/domain/ticket/ticket.entity';
import { TicketCode, TicketStatus } from '../../../src/domain/ticket/value-objects';
import { RefundAggregate } from '../../../src/domain/refund/refund.aggregate';
import { RefundStatus } from '../../../src/domain/refund/value-objects';
import { Money } from '../../../src/domain/shared/money.vo';
import { DomainError } from '../../../src/domain/shared/domain-error';
import { EventStatus } from '../../../src/domain/event/event-status';
import { RefundEligibilityService } from '../../../src/domain/refund/refund-eligibility.service';

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
 
function makeTicket(overrides: {
  status?: TicketStatus;
  eventId?: string;
} = {}): TicketEntity {
  return TicketEntity.reconstitute({
    id: 'ticket-1',
    bookingId: 'booking-1',
    eventId: overrides.eventId ?? 'event-1',
    code: new TicketCode('TICKET-ABC123'),
    status: overrides.status ?? TicketStatus.Active,
    checkedInAt: null,
  });
}
 
function makeRefund(overrides: {
  status?: RefundStatus;
} = {}): RefundAggregate {
  return RefundAggregate.reconstitute({
    id: 'refund-1',
    bookingId: 'booking-1',
    customerId: 'customer-1',
    amount: Money.create(200_000, 'IDR'),
    status: overrides.status ?? RefundStatus.Requested,
    reason: 'Cannot attend',
    rejectionReason: null,
    paymentReference: null,
    requestedAt: new Date(),
  });
}

// ================================================================
// TEST 6: Refund cannot be requested if ticket has been checked in (BR28)
// ================================================================
describe('RefundEligibilityService - checked-in ticket', () => {
  let service: RefundEligibilityService;
 
  beforeEach(() => {
    service = new RefundEligibilityService();
  });
 
  it('should throw DomainError when any ticket is already CheckedIn', () => {
    const booking = makeBooking({ status: BookingStatus.Paid });
    const checkedInTicket = makeTicket({ status: TicketStatus.CheckedIn });
    const refundDeadline = new Date(Date.now() + 24 * 60 * 60 * 1000);
 
    expect(() => {
      service.assertEligible(booking, [checkedInTicket], EventStatus.Published, refundDeadline);
    }).toThrow(DomainError);
  });
 
  it('should throw error with message about checked-in ticket', () => {
    const booking = makeBooking({ status: BookingStatus.Paid });
    const checkedInTicket = makeTicket({ status: TicketStatus.CheckedIn });
    const refundDeadline = new Date(Date.now() + 24 * 60 * 60 * 1000);
 
    expect(() => {
      service.assertEligible(booking, [checkedInTicket], EventStatus.Published, refundDeadline);
    }).toThrow('checked in');
  });
 
  it('should succeed when all tickets are Active and booking is Paid', () => {
    const booking = makeBooking({ status: BookingStatus.Paid });
    const activeTicket = makeTicket({ status: TicketStatus.Active });
    const refundDeadline = new Date(Date.now() + 24 * 60 * 60 * 1000);
 
    expect(() => {
      service.assertEligible(booking, [activeTicket], EventStatus.Published, refundDeadline);
    }).not.toThrow();
  });
});
 
// ================================================================
// TEST 7: Refund cannot be approved if not Requested (BR30)
// ================================================================
describe('RefundAggregate.approve', () => {
  it('should throw DomainError when status is Approved', () => {
    const refund = makeRefund({ status: RefundStatus.Approved });
    expect(() => refund.approve()).toThrow(DomainError);
  });
 
  it('should throw DomainError when status is Rejected', () => {
    const refund = makeRefund({ status: RefundStatus.Rejected });
    expect(() => refund.approve()).toThrow(DomainError);
  });
 
  it('should throw DomainError when status is PaidOut', () => {
    const refund = makeRefund({ status: RefundStatus.PaidOut });
    expect(() => refund.approve()).toThrow(DomainError);
  });
 
  it('should succeed when status is Requested', () => {
    const refund = makeRefund({ status: RefundStatus.Requested });
    expect(() => refund.approve()).not.toThrow();
    expect(refund.status).toBe(RefundStatus.Approved);
  });
});
 
// ================================================================
// TEST 8: Rejected refund must have a rejection reason (BR31)
// ================================================================
describe('RefundAggregate.reject', () => {
  it('should throw DomainError when rejection reason is empty string', () => {
    const refund = makeRefund({ status: RefundStatus.Requested });
    expect(() => refund.reject('')).toThrow(DomainError);
  });
 
  it('should throw DomainError when rejection reason is only whitespace', () => {
    const refund = makeRefund({ status: RefundStatus.Requested });
    expect(() => refund.reject('   ')).toThrow(DomainError);
  });
 
  it('should throw DomainError when status is not Requested', () => {
    const refund = makeRefund({ status: RefundStatus.Approved });
    expect(() => refund.reject('Invalid request.')).toThrow(DomainError);
  });
 
  it('should succeed when reason is provided and status is Requested', () => {
    const refund = makeRefund({ status: RefundStatus.Requested });
    expect(() => refund.reject('Customer request is invalid.')).not.toThrow();
    expect(refund.status).toBe(RefundStatus.Rejected);
    expect(refund.rejectionReason).toBe('Customer request is invalid.');
  });
});
