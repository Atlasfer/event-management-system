import { DomainError } from '../shared/domain-error';
import { EventStatus } from '../event/event-status';
import { BookingAggregate } from '../booking/booking.aggregate';
import { BookingStatus } from '../booking/value-objects';
import { TicketEntity } from '../ticket/ticket.entity';
import { TicketStatus } from '../ticket/value-objects';
 
export class RefundEligibilityService {
  assertEligible(
    booking: BookingAggregate,
    tickets: TicketEntity[],
    eventStatus: EventStatus,
    refundDeadline: Date | null,
    now: Date = new Date(),
  ): void {
    if (booking.status !== BookingStatus.Paid) {
      throw new DomainError('Refund can only be requested for a booking with status Paid.');
    }
 
    if (eventStatus === EventStatus.Cancelled) {
      return;
    }
 
    if (refundDeadline !== null && now > refundDeadline) {
      throw new DomainError('Refund deadline has passed. Refund can no longer be requested.');
    }
 
    const hasCheckedInTicket = tickets.some((t) => t.status === TicketStatus.CheckedIn);
    if (hasCheckedInTicket) {
      throw new DomainError(
        'Refund cannot be requested because one or more tickets have already been checked in.',
      );
    }
  }
 
  isEligible(
    booking: BookingAggregate,
    tickets: TicketEntity[],
    eventStatus: EventStatus,
    refundDeadline: Date | null,
    now: Date = new Date(),
  ): boolean {
    try {
      this.assertEligible(booking, tickets, eventStatus, refundDeadline, now);
      return true;
    } catch {
      return false;
    }
  }
}