import { DomainEvent } from '../shared/domain-event';
 
export class TicketReserved implements DomainEvent {
  public readonly occurredAt: Date = new Date();
  public readonly eventName = 'TicketReserved';
 
  constructor(
    public readonly bookingId: string,
    public readonly customerId: string,
    public readonly eventId: string,
    public readonly categoryId: string,
    public readonly quantity: number,
  ) {}
}
 
export class BookingPaid implements DomainEvent {
  public readonly occurredAt: Date = new Date();
  public readonly eventName = 'BookingPaid';
 
  constructor(
    public readonly bookingId: string,
    public readonly customerId: string,
    public readonly eventId: string,
    public readonly totalAmount: number,
    public readonly currency: string,
  ) {}
}
 
export class BookingExpired implements DomainEvent {
  public readonly occurredAt: Date = new Date();
  public readonly eventName = 'BookingExpired';
 
  constructor(
    public readonly bookingId: string,
    public readonly categoryId: string,
    public readonly quantity: number,
  ) {}
}