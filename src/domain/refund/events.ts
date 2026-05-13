import { DomainEvent } from '../shared/domain-event';
 
export class RefundRequested implements DomainEvent {
  public readonly occurredAt: Date = new Date();
  public readonly eventName = 'RefundRequested';
 
  constructor(
    public readonly refundId: string,
    public readonly bookingId: string,
    public readonly customerId: string,
    public readonly amount: number,
    public readonly currency: string,
    public readonly reason: string | null,
  ) {}
}
 
export class RefundApproved implements DomainEvent {
  public readonly occurredAt: Date = new Date();
  public readonly eventName = 'RefundApproved';
 
  constructor(
    public readonly refundId: string,
    public readonly bookingId: string,
    public readonly customerId: string,
  ) {}
}
 
export class RefundRejected implements DomainEvent {
  public readonly occurredAt: Date = new Date();
  public readonly eventName = 'RefundRejected';
 
  constructor(
    public readonly refundId: string,
    public readonly bookingId: string,
    public readonly customerId: string,
    public readonly rejectionReason: string,
  ) {}
}
 
export class RefundPaidOut implements DomainEvent {
  public readonly occurredAt: Date = new Date();
  public readonly eventName = 'RefundPaidOut';
 
  constructor(
    public readonly refundId: string,
    public readonly bookingId: string,
    public readonly customerId: string,
    public readonly paymentReference: string,
  ) {}
}