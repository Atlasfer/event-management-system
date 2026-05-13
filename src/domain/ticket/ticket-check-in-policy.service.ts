import { DomainError } from '../shared/domain-error';
import { EventStatus } from '../event/event-status';
import { TicketEntity } from '../ticket/ticket.entity';
import { TicketStatus } from '../ticket/value-objects';
 
export class TicketCheckInPolicyService {
  assertCanCheckIn(
    ticket: TicketEntity,
    targetEventId: string,
    eventStatus: EventStatus,
    eventDate: Date,
    checkInWindowMinutes: number = 60,
    now: Date = new Date(),
  ): void {
    if (eventStatus === EventStatus.Cancelled) {
      throw new DomainError('Check-in failed: the event has been cancelled.');
    }
 
    if (ticket.eventId !== targetEventId) {
      throw new DomainError('Check-in failed: this ticket does not belong to this event.');
    }
 
    if (ticket.status === TicketStatus.CheckedIn) {
      throw new DomainError('Check-in failed: this ticket has already been used.');
    }
 
    if (ticket.status !== TicketStatus.Active) {
      throw new DomainError('Check-in failed: ticket is not in Active status.');
    }
 
    const windowStart = new Date(eventDate.getTime() - checkInWindowMinutes * 60 * 1000);
    const eventDayEnd = new Date(eventDate);
    eventDayEnd.setHours(23, 59, 59, 999);
 
    if (now < windowStart || now > eventDayEnd) {
      throw new DomainError(
        `Check-in failed: check-in is only allowed within ${checkInWindowMinutes} minutes before the event and on the event day.`,
      );
    }
  }
 
  canCheckIn(
    ticket: TicketEntity,
    targetEventId: string,
    eventStatus: EventStatus,
    eventDate: Date,
    checkInWindowMinutes: number = 60,
    now: Date = new Date(),
  ): boolean {
    try {
      this.assertCanCheckIn(ticket, targetEventId, eventStatus, eventDate, checkInWindowMinutes, now);
      return true;
    } catch {
      return false;
    }
  }
}