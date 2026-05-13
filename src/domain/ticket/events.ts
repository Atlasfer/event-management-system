import { DomainEvent } from '../shared/domain-event';
 
export class TicketCheckedIn implements DomainEvent {
  public readonly occurredAt: Date = new Date();
  public readonly eventName = 'TicketCheckedIn';
 
  constructor(
    public readonly ticketId: string,
    public readonly ticketCode: string,
    public readonly bookingId: string,
    public readonly eventId: string,
  ) {}
}